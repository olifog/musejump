import { env } from "@/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql", // 'mysql' | 'sqlite' | 'turso'
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
