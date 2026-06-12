 
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { safeParseManifest, type Manifest } from "./manifest";

// Find all manifest JSON files under content/. Skips drafts (.draft.json).
//
// Layout convention:
//   content/<board>/<class-N>/<subject>.json
// but we don't enforce it — anything matching *.json (excluding *.draft.json
// and files in .gitignored dirs) is loaded. The board/class/subject in the
// JSON itself is authoritative.

const DRAFT_SUFFIX = ".draft.json";

export type LoadedManifest = {
  filePath: string;
  manifest: Manifest;
};

export type ManifestLoadError = {
  filePath: string;
  error: string;
};

export async function loadManifests(
  rootDir: string,
  options: { includeDrafts?: boolean } = {}
): Promise<{ manifests: LoadedManifest[]; errors: ManifestLoadError[] }> {
  const files = await walkJson(rootDir, options.includeDrafts ?? false);
  const manifests: LoadedManifest[] = [];
  const errors: ManifestLoadError[] = [];

  for (const filePath of files) {
    try {
      const raw = await readFile(filePath, "utf8");
      const json = JSON.parse(raw);
      const result = safeParseManifest(json);
      if (!result.success) {
        const issue = result.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        errors.push({ filePath, error: issue });
        continue;
      }
      manifests.push({ filePath, manifest: result.data });
    } catch (err) {
      errors.push({
        filePath,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { manifests, errors };
}

async function walkJson(
  dir: string,
  includeDrafts: boolean
): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const out: string[] = [];
  for (const name of entries) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const full = path.join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) {
      out.push(...(await walkJson(full, includeDrafts)));
    } else if (st.isFile() && name.endsWith(".json")) {
      if (!includeDrafts && name.endsWith(DRAFT_SUFFIX)) continue;
      out.push(full);
    }
  }
  return out.sort();
}

// Pretty path for log output: drop everything before "content/".
export function relManifestPath(filePath: string): string {
  const idx = filePath.lastIndexOf("/content/");
  if (idx === -1) return filePath;
  return filePath.slice(idx + 1);
}
