 
import path from "node:path";
import { loadManifests, relManifestPath } from "@/lib/content/loader";
import { ingestManifest, summarizeStats } from "@/lib/content/ingest";

// Reads every manifest under content/ and upserts it into the database.
// Idempotent: re-run as often as you like. CLI flags:
//   --dry-run   Validate only, no DB writes.
//   --include-drafts  Also load *.draft.json (off by default).

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const includeDrafts = args.has("--include-drafts");

  const root = path.resolve(process.cwd(), "content");
  console.log(`Loading manifests from ${root}${includeDrafts ? " (including drafts)" : ""}...`);

  const { manifests, errors } = await loadManifests(root, { includeDrafts });

  if (errors.length > 0) {
    console.error(`\n${errors.length} manifest(s) failed validation:`);
    for (const e of errors) {
      console.error(`  ${relManifestPath(e.filePath)}\n    ${e.error}`);
    }
  }

  if (manifests.length === 0) {
    console.log("No valid manifests found.");
    process.exit(errors.length > 0 ? 1 : 0);
  }

  console.log(`Loaded ${manifests.length} manifest(s).`);

  if (dryRun) {
    console.log("Dry run — skipping database writes.");
    for (const m of manifests) {
      console.log(`  ${relManifestPath(m.filePath)}: ${m.manifest.board.slug}/class-${m.manifest.standard.classNumber}/${m.manifest.subject.slug} — ${countQuestions(m.manifest)} questions across ${m.manifest.chapters.length} chapter(s)`);
    }
    process.exit(errors.length > 0 ? 1 : 0);
  }

  let failed = 0;
  for (const m of manifests) {
    const rel = relManifestPath(m.filePath);
    console.log(`\nIngesting ${rel}...`);
    try {
      const stats = await ingestManifest(m.manifest);
      console.log(summarizeStats(stats));
    } catch (err) {
      failed++;
      console.error(
        `  FAILED: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  console.log("");
  if (failed > 0 || errors.length > 0) {
    console.error(
      `Done with ${failed} ingest failure(s) and ${errors.length} validation error(s).`
    );
    process.exit(1);
  }
  console.log(`Done. ${manifests.length} manifest(s) ingested cleanly.`);
}

function countQuestions(m: { chapters: Array<{ exercises: Array<{ questions: unknown[] }> }> }) {
  let n = 0;
  for (const c of m.chapters) for (const e of c.exercises) n += e.questions.length;
  return n;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
