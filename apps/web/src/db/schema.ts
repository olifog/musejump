import { randomUUID } from "node:crypto";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userSongJumps = pgTable("user_song_jumps", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	userId: text().notNull(),
	songId: text().notNull(),
	trigger: integer().notNull(),
	target: integer().notNull(),
	description: text(),
	createdAt: timestamp().notNull().defaultNow(),
});
