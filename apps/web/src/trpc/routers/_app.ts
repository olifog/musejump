import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { jumpsRouter } from "./jumps";

export const appRouter = createTRPCRouter({
	hello: baseProcedure
		.input(
			z.object({
				text: z.string(),
			}),
		)
		.query((opts) => {
			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
	jumps: jumpsRouter,
});

export type AppRouter = typeof appRouter;
