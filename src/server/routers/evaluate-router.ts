import { z } from "zod";
import { j, publicProcedure } from "../jstack";
import { questionProgress, questions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { evaluateAnswer } from "@/lib/claude-api";
import { HTTPException } from "hono/http-exception";

export const evaluateRouter = j.router({
	recent: publicProcedure
		.input(
			z.object({
				questionId: z.string(),
				answer: z.string(),
			}),
		)
		.query(async ({ c, ctx, input }) => {
			const { userId, db } = ctx;
			const { questionId, answer } = input;

			const [question] = await db
				.select()
				.from(questions)
				.where(eq(questions.id, questionId));

			if (!question)
				throw new HTTPException(404, { message: "Question not found" });

			// Evaluate the user's answer against the target answer
			const evaluation = await evaluateAnswer(
				question.question,
				question.answer,
				answer,
			);

			// Update the user's progress
			const [existingProgress] = await db
				.select()
				.from(questionProgress)
				.where(
					and(
						eq(questionProgress.userId, userId),
						eq(questionProgress.questionId, questionId),
					),
				);

			if (existingProgress) {
				// Update existing progress
				if (evaluation.correct) {
					await db
						.update(questionProgress)
						.set({
							timesCorrect: existingProgress.timesCorrect + 1,
							lastAttempted: new Date(),
							completed: existingProgress.timesCorrect + 1 >= 3,
						})
						.where(eq(questionProgress.id, existingProgress.id));
				} else {
					await db
						.update(questionProgress)
						.set({
							lastAttempted: new Date(),
						})
						.where(eq(questionProgress.id, existingProgress.id));
				}
			} else {
				// Create new progress record
				await db.insert(questionProgress).values({
					userId,
					questionId: questionId,
					timesCorrect: evaluation.correct ? 1 : 0,
					lastAttempted: new Date(),
					completed: false,
				});
			}
			return c.json({
				message: evaluation.message,
				correct: evaluation.correct,
			});
		}),
});
