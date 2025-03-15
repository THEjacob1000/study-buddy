import { j, publicProcedure } from "../jstack";
import { HTTPException } from "hono/http-exception";
import { users } from "../db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const authRouter = j.router({
	// Login/register a user with email (simplified auth)
	login: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.mutation(async ({ c, ctx, input }) => {
			const { db } = ctx;
			const { email } = input;

			try {
				// Check if user exists
				let [user] = await db
					.select()
					.from(users)
					.where(eq(users.email, email));

				// If not, create a new user
				if (!user) {
					const [newUser] = await db
						.insert(users)
						.values({
							email,
							name: email.split("@")[0], // Simple default name from email
						})
						.returning();

					user = newUser;
				}

				// In a real app, you would generate a JWT or session token here
				// and handle proper authentication
				if (!user) throw new HTTPException(500, { message: "Login failed" });

				return c.json({
					success: true,
					user: {
						id: user.id,
						email: user.email,
						name: user.name,
					},
				});
			} catch (error) {
				console.error("Error during login:", error);
				throw new HTTPException(500, { message: "Login failed" });
			}
		}),

	// Get current user
	getCurrentUser: publicProcedure.query(async ({ c, ctx }) => {
		const { db, userId } = ctx;

		try {
			const [user] = await db
				.select({
					id: users.id,
					email: users.email,
					name: users.name,
				})
				.from(users)
				.where(eq(users.id, userId));

			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}

			return c.json({
				user,
			});
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			console.error("Error fetching user:", error);
			throw new HTTPException(500, { message: "Failed to fetch user" });
		}
	}),

	// Update user profile
	updateProfile: publicProcedure
		.input(
			z.object({
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ c, ctx, input }) => {
			const { db, userId } = ctx;
			const { name } = input;

			try {
				const [updatedUser] = await db
					.update(users)
					.set({
						name: name ?? null,
						updatedAt: new Date(),
					})
					.where(eq(users.id, userId))
					.returning();

				if (!updatedUser) {
					throw new HTTPException(404, { message: "User not found" });
				}

				return c.json({
					success: true,
					user: {
						id: updatedUser.id,
						email: updatedUser.email,
						name: updatedUser.name,
					},
				});
			} catch (error) {
				if (error instanceof HTTPException) throw error;
				console.error("Error updating profile:", error);
				throw new HTTPException(500, { message: "Failed to update profile" });
			}
		}),
});
