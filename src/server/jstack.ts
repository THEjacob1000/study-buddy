import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "hono/adapter";
import { jstack } from "jstack";
import { HTTPException } from "hono/http-exception";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

interface Env {
	Bindings: { DATABASE_URL: string };
}

export const j = jstack.init<Env>();

/**
 * Type-safely injects database into all procedures
 * Verifies Clerk authentication
 *
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseAndAuthMiddleware = j.middleware(async ({ c, next }) => {
	const { DATABASE_URL } = env(c);

	const sql = neon(DATABASE_URL);
	const db = drizzle(sql);

	const clerkUser = await currentUser();

	if (!clerkUser) {
		throw new HTTPException(401, { message: "User not found" });
	}

	// Find or create user in our database
	let [dbUser] = await db
		.select()
		.from(users)
		.where(eq(users.email, clerkUser.emailAddresses[0]?.emailAddress || ""));

	if (!dbUser) {
		// Create a new user record
		const [newUser] = await db
			.insert(users)
			.values({
				email: clerkUser.emailAddresses[0]?.emailAddress || "",
				name:
					`${clerkUser.firstName} ${clerkUser.lastName}`.trim() ||
					clerkUser.username ||
					null,
			})
			.returning();

		dbUser = newUser;
	}
	if (!dbUser)
		throw new HTTPException(500, { message: "Failed to create user" });

	// Pass the database user ID to the route handlers
	return await next({ db, userId: dbUser.id });
});

/**
 * Public (unauthenticated) procedures
 */
export const publicProcedure = j.procedure.use(databaseAndAuthMiddleware);

/**
 * Authenticated procedures - requires a valid Clerk user
 */
export const authenticatedProcedure = publicProcedure.use(
	j.middleware(async ({ ctx, next }) => {
		const { userId } = ctx;

		if (!userId) {
			throw new HTTPException(401, { message: "Authentication required" });
		}

		return await next();
	}),
);
