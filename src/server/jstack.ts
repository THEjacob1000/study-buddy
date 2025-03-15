import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "hono/adapter";
import { jstack } from "jstack";
import { HTTPException } from "hono/http-exception";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

interface Env {
	Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

/**
 * Type-safely injects database into all procedures
 * Also handles basic authentication
 *
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseAndAuthMiddleware = j.middleware(async ({ c, next }) => {
	const { DATABASE_URL } = env(c);

	const sql = neon(DATABASE_URL);
	const db = drizzle(sql);

	// In a real application, this would verify a JWT or session token
	// For demo purposes, we're using a simplified approach with a header

	// Get user ID from request
	let userId = c.req.header("x-user-id");

	// For local development/demo, if no user ID is provided, we'll use a default
	if (!userId) {
		// In production, you'd want this to be more secure
		// Get user email from query param or header for demo purposes
		const email =
			c.req.query("email") ||
			c.req.header("x-user-email") ||
			"demo@example.com";

		// Try to find or create a user with this email
		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user) {
			// Create a demo user if none exists
			const [newUser] = await db
				.insert(users)
				.values({
					email,
					name: "Demo User",
				})
				.returning();

			userId = newUser?.id;
		} else {
			userId = user.id;
		}
	}
	if (!userId) throw new HTTPException(401, { message: "Unauthorized" });

	return await next({ db, userId });
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseAndAuthMiddleware);

/**
 * Authenticated procedures - requires a valid user
 * In a real app, this would verify the user properly
 */
export const authenticatedProcedure = publicProcedure.use(
	j.middleware(async ({ ctx, next }) => {
		const { db, userId } = ctx;

		if (!userId) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		// Verify the user exists in the database
		const [user] = await db.select().from(users).where(eq(users.id, userId));

		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		return await next({ user });
	}),
);
