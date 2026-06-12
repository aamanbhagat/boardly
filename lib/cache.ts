// Cache Components lifetime profiles. Names are passed to cacheLife().
// Profiles use the built-in Next.js identifiers (minutes/hours/days/weeks/months)
// chosen by content volatility.
//
// - taxonomy:  boards, standards, subjects, chapters list — change rarely
// - solutions: exercise + question solutions — content stable but corrections possible
// - aggregates: counts, popular lists — recomputed periodically
// - search:    search index entities — keep tight to keep results fresh

export const CACHE_PROFILE = {
  taxonomy: "weeks",
  solutions: "days",
  aggregates: "hours",
  search: "minutes",
} as const;

export type CacheProfile = keyof typeof CACHE_PROFILE;
