import { defineConfig } from "drizzle-kit";

// DATABASE_URL is only required for database migrations
// The app uses in-memory storage by default for demo purposes
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/voicetaskflow";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
