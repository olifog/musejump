import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const userSongJumps = pgTable("user_song_jumps", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text().notNull(),
  songId: text().notNull(),
  trigger: integer().notNull(),
  target: integer().notNull(),
  description: text(),
  createdAt: timestamp().notNull().defaultNow(),
});
