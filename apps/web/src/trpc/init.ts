import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { getSpotifyApi } from "@/lib/spotify";

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  const spotifyApi = userId ? await getSpotifyApi(userId) : null;
  return { userId, spotifyApi };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const authorizedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
