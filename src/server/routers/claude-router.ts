import { eq, and, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { questionProgress, questions } from "../db/schema";
import { j, publicProcedure } from "../jstack";

export const claudeRouter = j.router({
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
