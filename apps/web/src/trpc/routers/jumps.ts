import { authorizedProcedure } from "../init";
import { createTRPCRouter } from "../init";
import { z } from "zod";
import db from "@/db/db";
import { and, eq } from "drizzle-orm";
import { userSongJumps } from "@/db/schema";

export const jumpsRouter = createTRPCRouter({
  getJumps: authorizedProcedure
    .input(z.object({ songId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const jumps = await db
        .select()
        .from(userSongJumps)
        .where(
          and(
            eq(userSongJumps.songId, input.songId),
            eq(userSongJumps.userId, userId)
          )
        );
      return jumps;
    }),
  addJump: authorizedProcedure
    .input(z.object({
      songId: z.string(),
      trigger: z.number(),
      target: z.number(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await db.insert(userSongJumps).values({
        userId,
        songId: input.songId,
        trigger: input.trigger,
        target: input.target,
        description: input.description,
      });
    }),
  updateJump: authorizedProcedure
    .input(z.object({
      id: z.string(),
      trigger: z.number(),
      target: z.number(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await db.update(userSongJumps)
        .set({
          trigger: input.trigger,
          target: input.target,
          description: input.description,
        })
        .where(
          and(
            eq(userSongJumps.id, input.id),
            eq(userSongJumps.userId, userId)
          )
        );
    }),
  deleteJump: authorizedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      await db.delete(userSongJumps)
        .where(
          and(
            eq(userSongJumps.id, input.id),
            eq(userSongJumps.userId, userId)
          )
        );
    }),
});
