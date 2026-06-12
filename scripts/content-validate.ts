 
import path from "node:path";
import { loadManifests, relManifestPath } from "@/lib/content/loader";

// Validates every manifest under content/ against the schema. Exits 1 on
// any failure. Use this in CI to gate merges.

async function main() {
  const args = new Set(process.argv.slice(2));
  const includeDrafts = args.has("--include-drafts");
  const root = path.resolve(process.cwd(), "content");

  console.log(`Validating manifests in ${root}${includeDrafts ? " (including drafts)" : ""}...`);
  const { manifests, errors } = await loadManifests(root, { includeDrafts });

  for (const m of manifests) {
    const exCount = m.manifest.chapters.reduce(
      (n, c) => n + c.exercises.length,
      0
    );
    const qCount = m.manifest.chapters.reduce(
      (n, c) => n + c.exercises.reduce((mm, e) => mm + e.questions.length, 0),
      0
    );
    console.log(
      `  OK  ${relManifestPath(m.filePath)} — ${m.manifest.chapters.length}ch / ${exCount}ex / ${qCount}q`
    );
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} validation error(s):`);
    for (const e of errors) {
      console.error(`  FAIL ${relManifestPath(e.filePath)}\n    ${e.error}`);
    }
    process.exit(1);
  }

  console.log(`\n${manifests.length} manifest(s) valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
