import "server-only";
import { searchClient, CONTENT_INDEX, type ContentDoc } from "@/lib/search/client";

export type SearchFilters = {
  type?: ContentDoc["type"];
  boardSlug?: string;
  classNumber?: number;
  subjectSlug?: string;
};

export type SearchHit = ContentDoc & {
  _formatted?: Partial<Record<keyof ContentDoc, string>>;
};

export async function searchContent({
  q,
  page = 1,
  hitsPerPage = 20,
  filters,
}: {
  q: string;
  page?: number;
  hitsPerPage?: number;
  filters?: SearchFilters;
}) {
  if (!q.trim()) {
    return { hits: [] as SearchHit[], total: 0, page, hitsPerPage };
  }
  const filterParts: string[] = [];
  if (filters?.type) filterParts.push(`type = "${filters.type}"`);
  if (filters?.boardSlug) filterParts.push(`boardSlug = "${filters.boardSlug}"`);
  if (filters?.classNumber)
    filterParts.push(`classNumber = ${filters.classNumber}`);
  if (filters?.subjectSlug)
    filterParts.push(`subjectSlug = "${filters.subjectSlug}"`);

  try {
    const res = await searchClient()
      .index<ContentDoc>(CONTENT_INDEX)
      .search(q, {
        page,
        hitsPerPage,
        filter: filterParts.length ? filterParts.join(" AND ") : undefined,
        attributesToHighlight: ["title", "body"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      });
    return {
      hits: res.hits as SearchHit[],
      total: res.totalHits ?? res.hits.length,
      page,
      hitsPerPage,
    };
  } catch {
    return { hits: [] as SearchHit[], total: 0, page, hitsPerPage };
  }
}
