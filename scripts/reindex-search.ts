#!/usr/bin/env tsx
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { reindexAll } from "@/lib/search/indexer";

async function main() {
  console.log("Reindexing content into Meilisearch...");
  const start = Date.now();
  try {
    const { count } = await reindexAll();
    const ms = Date.now() - start;
    console.log(`Indexed ${count} documents in ${ms}ms.`);
  } catch (err) {
    console.error("Reindex failed:", err);
    process.exit(1);
  }
}

main();
