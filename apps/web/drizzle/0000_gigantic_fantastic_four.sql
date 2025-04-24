CREATE TABLE "user_song_jumps" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"songId" text NOT NULL,
	"trigger" integer NOT NULL,
	"target" integer NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
