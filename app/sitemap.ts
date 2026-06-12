import type { MetadataRoute } from "next";
import {
  getAllBoardSlugs,
  getAllStandardRoutes,
  getAllSubjectRoutes,
  getAllChapterRoutes,
  getAllExerciseRoutes,
  getAllQuestionRoutes,
} from "@/lib/db/queries";
import { absoluteUrl } from "@/lib/utils";
import {
  boardPath,
  standardPath,
  subjectPath,
  chapterPath,
  exercisePath,
  questionPath,
} from "@/lib/seo/slugs";

const PER_SHARD = 50_000;

// Each shard is a sitemap file. Exercise + question pages are sharded since
// they're the high-volume types — each shard stays under Google's 50k limit.
export async function generateSitemaps() {
  let exerciseShards = 1;
  let questionShards = 1;
  try {
    const [exercises, questions] = await Promise.all([
      getAllExerciseRoutes(),
      getAllQuestionRoutes(),
    ]);
    exerciseShards = Math.max(1, Math.ceil(exercises.length / PER_SHARD));
    questionShards = Math.max(1, Math.ceil(questions.length / PER_SHARD));
  } catch {
    // DB unavailable at build time — emit single empty shards so the index
    // is still valid.
  }
  return [
    { id: "static" },
    { id: "boards" },
    { id: "subjects" },
    { id: "chapters" },
    ...Array.from({ length: exerciseShards }, (_, i) => ({
      id: `exercises-${i}`,
    })),
    ...Array.from({ length: questionShards }, (_, i) => ({
      id: `questions-${i}`,
    })),
  ];
}

type Shard = Awaited<ReturnType<typeof generateSitemaps>>[number]["id"];

export default async function sitemap({
  id,
}: {
  id: Promise<Shard>;
}): Promise<MetadataRoute.Sitemap> {
  const shardId = await id;

  const now = new Date();
  const safe = async <T,>(fn: () => Promise<T[]>): Promise<T[]> => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };

  if (shardId === "static") {
    const staticPaths: Array<{
      path: string;
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }> = [
      { path: "/", changeFrequency: "daily", priority: 1.0 },
      { path: "/search", changeFrequency: "weekly", priority: 0.5 },
      { path: "/question-bank", changeFrequency: "weekly", priority: 0.6 },
      { path: "/past-papers", changeFrequency: "weekly", priority: 0.6 },
      { path: "/notes", changeFrequency: "weekly", priority: 0.6 },
      { path: "/mcq", changeFrequency: "weekly", priority: 0.6 },
    ];
    return staticPaths.map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }));
  }

  if (shardId === "boards") {
    const rows = await safe(getAllBoardSlugs);
    const standards = await safe(getAllStandardRoutes);
    return [
      ...rows.map((b) => ({
        url: absoluteUrl(boardPath({ slug: b.slug })),
        lastModified: b.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...standards.map((s) => ({
        url: absoluteUrl(
          standardPath({ slug: s.boardSlug }, { slug: `class-${s.classNumber}`, classNumber: s.classNumber })
        ),
        lastModified: s.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  }

  if (shardId === "subjects") {
    const rows = await safe(getAllSubjectRoutes);
    return rows.map((r) => ({
      url: absoluteUrl(
        subjectPath(
          { slug: r.boardSlug },
          { slug: `class-${r.classNumber}`, classNumber: r.classNumber },
          { slug: r.subjectSlug }
        )
      ),
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  if (shardId === "chapters") {
    const rows = await safe(getAllChapterRoutes);
    return rows.map((r) => ({
      url: absoluteUrl(
        chapterPath(
          { slug: r.boardSlug },
          { slug: `class-${r.classNumber}`, classNumber: r.classNumber },
          { slug: r.subjectSlug },
          { slug: r.chapterSlug, chapterNumber: r.chapterNumber }
        )
      ),
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // exercises-N shards
  const match = /^exercises-(\d+)$/.exec(shardId);
  if (match) {
    const idx = Number(match[1]);
    const rows = await safe(getAllExerciseRoutes);
    const slice = rows.slice(idx * PER_SHARD, (idx + 1) * PER_SHARD);
    return slice.map((r) => ({
      url: absoluteUrl(
        exercisePath(
          { slug: r.boardSlug },
          { slug: `class-${r.classNumber}`, classNumber: r.classNumber },
          { slug: r.subjectSlug },
          { slug: r.chapterSlug, chapterNumber: r.chapterNumber },
          { slug: r.exerciseSlug, exerciseNumber: r.exerciseNumber }
        )
      ),
      lastModified: r.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));
  }

  // questions-N shards
  const qMatch = /^questions-(\d+)$/.exec(shardId);
  if (qMatch) {
    const idx = Number(qMatch[1]);
    const rows = await safe(getAllQuestionRoutes);
    const slice = rows.slice(idx * PER_SHARD, (idx + 1) * PER_SHARD);
    return slice.map((r) => ({
      url: absoluteUrl(
        questionPath(
          { slug: r.boardSlug },
          { slug: `class-${r.classNumber}`, classNumber: r.classNumber },
          { slug: r.subjectSlug },
          { slug: r.chapterSlug, chapterNumber: r.chapterNumber },
          { slug: r.exerciseSlug, exerciseNumber: r.exerciseNumber },
          { questionNumber: r.questionNumber }
        )
      ),
      lastModified: r.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.95,
    }));
  }

  return [];
}
