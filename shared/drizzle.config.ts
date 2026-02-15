import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env file if it exists (for local development)
config({ path: "../server/.env" });

const __dirname = import.meta.dirname;

export default defineConfig({
	dialect: "postgresql",
	out: path.resolve(__dirname, "./drizzle"),
	schema: path.resolve(__dirname, "./db/schema.ts"),
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
