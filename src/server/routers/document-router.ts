import { extractPdfText, generateQuestions } from "@/lib/claude-api";
import { j, authenticatedProcedure } from "../jstack";
import { HTTPException } from "hono/http-exception";
import { documents, questionProgress, questions } from "../db/schema";
import { z } from "zod";
import { eq, and, inArray, sql } from "drizzle-orm";

// Use authenticatedProcedure instead of publicProcedure to ensure all routes are protected
export const documentRouter = j.router({
	// Get all documents for a user
	getDocuments: authenticatedProcedure.query(async ({ c, ctx }) => {
		const { db, userId } = ctx;

		try {
			// Get all documents for the user
			const userDocuments = await db
				.select({
					id: documents.id,
					title: documents.title,
					createdAt: documents.createdAt,
				})
				.from(documents)
				.where(eq(documents.userId, userId))
				.orderBy(sql`${documents.createdAt} DESC`);

			// For each document, get the question count and completed count
			const documentsWithStats = await Promise.all(
				userDocuments.map(async (doc) => {
					// Get all questions for this document
					const documentQuestions = await db
						.select({ id: questions.id })
						.from(questions)
						.where(eq(questions.documentId, doc.id));

					const questionIds = documentQuestions.map((q) => q.id);

					// Get progress records for these questions
					const progressRecords = await db
						.select()
						.from(questionProgress)
						.where(
							and(
								eq(questionProgress.userId, userId),
								inArray(questionProgress.questionId, questionIds),
							),
						);

					// Count completed questions
					const completedCount = progressRecords.filter(
						(p) => p.completed,
					).length;

					return {
						id: doc.id,
						title: doc.title,
						createdAt: doc.createdAt.toISOString(),
						questionsCount: documentQuestions.length,
						completedCount,
					};
				}),
			);

			return c.json({
				documents: documentsWithStats,
			});
		} catch (error) {
			console.error("Error fetching documents:", error);
			throw new HTTPException(500, { message: "Failed to fetch documents" });
		}
	}),

	// Delete a document
	deleteDocument: authenticatedProcedure
		.input(
			z.object({
				documentId: z.string(),
			}),
		)
		.mutation(async ({ c, ctx, input }) => {
			const { db, userId } = ctx;
			const { documentId } = input;

			try {
				// Verify document belongs to user
				const [userDocument] = await db
					.select()
					.from(documents)
					.where(
						and(eq(documents.id, documentId), eq(documents.userId, userId)),
					);

				if (!userDocument) {
					throw new HTTPException(404, { message: "Document not found" });
				}

				// Delete document (questions and progress will cascade)
				await db.delete(documents).where(eq(documents.id, documentId));

				return c.json({
					success: true,
					message: "Document deleted successfully",
				});
			} catch (error) {
				if (error instanceof HTTPException) throw error;
				console.error("Error deleting document:", error);
				throw new HTTPException(500, { message: "Failed to delete document" });
			}
		}),

	upload: authenticatedProcedure
		.input(
			z.object({
				title: z.string(),
				file: z.any().nullable(),
				textContent: z.string().nullable(),
			}),
		)
		.mutation(async ({ c, ctx, input }) => {
			const { db, userId } = ctx;
			const { title, file: fileRaw, textContent } = input;
			const file = fileRaw as File | null;

			let content = "";
			let fileType = "text";

			if (file) {
				// Process uploaded content
				const buffer = await file.arrayBuffer();
				const fileName = file.name;

				if (fileName.endsWith(".pdf")) {
					fileType = "pdf";
					// Convert buffer to base64
					const base64 = Buffer.from(buffer).toString("base64");
					// Extract text from PDF using Claude
					content = await extractPdfText(base64);
				} else if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
					fileType = "text";
					content = Buffer.from(buffer).toString("utf-8");
				} else {
					throw new HTTPException(400, {
						message:
							"Unsupported file type. Please upload PDF, TXT, or MD files.",
					});
				}
			} else if (textContent) {
				content = textContent;
			} else {
				throw new HTTPException(400, {
					message:
						"No content provided. Please upload a file or provide text content.",
				});
			}

			// Save document to database
			const [savedDocument] = await db
				.insert(documents)
				.values({
					userId,
					title: title || "Untitled Document",
					content: content,
					fileType: fileType,
				})
				.returning();

			if (!savedDocument) {
				throw new HTTPException(500, {
					message: "Failed to save document",
				});
			}

			// Generate questions from the content
			const generatedQuestions = await generateQuestions(content);

			// Save generated questions to database
			const questionInserts = generatedQuestions.map((q) => ({
				documentId: savedDocument.id,
				question: q.question,
				answer: q.answer,
			}));

			const savedQuestions = await db
				.insert(questions)
				.values(questionInserts)
				.returning();

			return c.superjson({
				success: true,
				document: savedDocument,
				questions: savedQuestions,
			});
		}),

	getQuestions: authenticatedProcedure
		.input(
			z.object({
				documentId: z.string(),
			}),
		)
		.query(async ({ c, ctx, input }) => {
			const { db, userId } = ctx;
			const { documentId } = input;

			if (!documentId) {
				throw new HTTPException(400, { message: "Document ID is required" });
			}

			// Verify document belongs to user
			const [userDocument] = await db
				.select()
				.from(documents)
				.where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

			if (!userDocument) {
				throw new HTTPException(404, { message: "Document not found" });
			}

			// Get questions for the document
			const documentQuestions = await db
				.select()
				.from(questions)
				.where(eq(questions.documentId, documentId));

			// Get user progress for these questions
			const questionIds = documentQuestions.map((q) => q.id);
			const userProgress = await db
				.select()
				.from(questionProgress)
				.where(
					and(
						eq(questionProgress.userId, userId),
						inArray(questionProgress.questionId, questionIds),
					),
				);

			// Combine questions with progress
			const questionsWithProgress = documentQuestions.map((question) => {
				const progress = userProgress.find(
					(p) => p.questionId === question.id,
				) || {
					timesCorrect: 0,
					completed: false,
				};

				return {
					...question,
					timesCorrect: progress.timesCorrect,
					completed: progress.completed,
				};
			});

			return c.json({
				questions: questionsWithProgress,
				totalQuestions: documentQuestions.length,
				completedQuestions: questionsWithProgress.filter((q) => q.completed)
					.length,
			});
		}),
});
