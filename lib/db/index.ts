import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: Database | undefined;

function getDb(): Database {
  if (cachedDb) return cachedDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and provide a Postgres connection string."
    );
  }

  // Pool sizing: small in dev, larger in serverless production deploys.
  // `prepare: false` is required when running through Supabase's transaction
  // pooler (port 6543); we default to false to be safe with both.
  const queryClient = postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 4,
    idle_timeout: 20,
    prepare: false,
  });

  cachedDb = drizzle(queryClient, { schema, casing: "snake_case" });
  return cachedDb;
}

// Lazy proxy: defers connection until the first query actually runs, so
// importing this module at build time (e.g. from sitemap route collection)
// doesn't throw when DATABASE_URL is unset.
export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
}) as Database;

export * as tables from "./schema";
