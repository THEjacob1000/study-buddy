import { j, publicProcedure } from "../jstack";

export const claudeRouter = j.router({
	recent: publicProcedure.query(async ({ c }) => {
		return c.json({ bob: "bob" });
	}),
});
