import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const r = await db.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  );
  console.log(
    "Tables:",
    (r as unknown as Array<{ tablename: string }>).map((t) => t.tablename)
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
