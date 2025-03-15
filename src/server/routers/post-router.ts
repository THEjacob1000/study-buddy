import { j, publicProcedure } from "../jstack";

export const postRouter = j.router({
	recent: publicProcedure.query(async ({ c }) => {
		return c.json({ bob: "bob" });
	}),
});
