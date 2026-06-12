import "server-only";
import { Meilisearch } from "meilisearch";

const host = process.env.MEILISEARCH_HOST ?? "http://localhost:7700";
const masterKey = process.env.MEILISEARCH_MASTER_KEY;
const searchKey = process.env.MEILISEARCH_SEARCH_KEY ?? masterKey;

export const CONTENT_INDEX = "content";

export type ContentDoc = {
  id: string;
  type: "exercise" | "chapter" | "question" | "subject";
  title: string;
  body: string;
  url: string;
  boardSlug: string;
  boardName: string;
  classNumber: number;
  subjectSlug: string;
  subjectName: string;
  chapterSlug?: string;
  chapterName?: string;
  popularity: number;
};

export function adminClient() {
  if (!masterKey) {
    throw new Error("MEILISEARCH_MASTER_KEY is required for admin operations");
  }
  return new Meilisearch({ host, apiKey: masterKey });
}

export function searchClient() {
  return new Meilisearch({ host, apiKey: searchKey });
}

export async function ensureContentIndex() {
  const client = adminClient();
  await client.createIndex(CONTENT_INDEX, { primaryKey: "id" }).catch(() => {});
  const index = client.index<ContentDoc>(CONTENT_INDEX);
  await index.updateSettings({
    searchableAttributes: ["title", "body", "chapterName", "subjectName"],
    filterableAttributes: [
      "type",
      "boardSlug",
      "classNumber",
      "subjectSlug",
      "chapterSlug",
    ],
    sortableAttributes: ["popularity"],
    rankingRules: [
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
      "popularity:desc",
    ],
    typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    pagination: { maxTotalHits: 5000 },
  });
  return index;
}
