import { extractPdfText, generateQuestions } from "@/lib/claude-api";
import { j, publicProcedure } from "../jstack";
import { HTTPException } from "hono/http-exception";
import { documents, questionProgress, questions } from "../db/schema";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";

export const documentRouter = j.router({
	upload: publicProcedure
		.input(
			z.object({
				title: z.string(),
				file: z.any().nullable(),
				textContent: z.string().nullable(),
			}),
		)
		.mutation(async ({ c, ctx, input }) => {
			const placeholderUserId = "1";
			const { db } = ctx;
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
					userId: placeholderUserId,
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
	getQuestions: publicProcedure
		.input(
			z.object({
				documentId: z.string(),
			}),
		)
		.query(async ({ c, ctx, input }) => {
			const { db, userId } = ctx;
			const { documentId } = input;

			if (!documentId) {
				// Default placeholder user ID
				throw new HTTPException(400, { message: "Document ID is required" });
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
