import { j } from "./jstack";
import { claudeRouter } from "./routers/claude-router";
import { documentRouter } from "./routers/document-router";
import { evaluateRouter } from "./routers/evaluate-router";
import { authRouter } from "./routers/auth-router";

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
	.router()
	.basePath("/api")
	.use(j.defaults.cors)
	.onError(j.defaults.errorHandler);

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
	claude: claudeRouter,
	document: documentRouter,
	evaluate: evaluateRouter,
	auth: authRouter,
});

export type AppRouter = typeof appRouter;

export default appRouter;
