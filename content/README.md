# Content pipeline

The site reads content from the `boards`, `chapters`, `exercises`,
`questions`, `solutions`, etc. tables. **Nothing writes to those tables
except `pnpm content:ingest`.** The source of truth is the JSON
manifests in this directory.

## Layout

```
content/
├── README.md                              # this file
├── cbse/class-10/mathematics.json         # one manifest per (board, class, subject)
├── cbse/class-10/science.json
└── .cache/                                # gitignored — generation cache
```

A `*.draft.json` is gitignored — those are LLM outputs awaiting human
review. Once reviewed and corrected, rename to `*.json` to promote.

## Manifest shape

See [`lib/content/manifest.ts`](../lib/content/manifest.ts) for the full
schema. The shape mirrors the DB hierarchy:

```
board → standard (class) → subject → chapter[] → exercise[] → question[]
                                                                  ↳ solution
                                                                  ↳ mcq?
```

Order in the JSON arrays = sortOrder in the DB. Slugs are natural keys.

## Workflows

### A. Validate everything (CI gate)

```sh
pnpm content:validate
```

Reads every `*.json` under `content/`, validates against the schema,
exits non-zero on failure. Add to CI before merge.

### B. Ingest into the database

```sh
pnpm content:ingest             # apply all manifests
pnpm content:ingest --dry-run   # validate only, no DB writes
```

Idempotent. Safe to re-run. Adds new rows, updates changed rows, removes
rows that are no longer in the manifest. Wrapped in a transaction per
manifest, so a partial failure doesn't half-update.

### C. Generate content with xAI Grok

```sh
# 1. Make sure XAI_API_KEY is set in .env.local
pnpm content:generate --board cbse --class 10 --subject mathematics

# Optional flags
pnpm content:generate --board cbse --class 10 --subject mathematics --chapter 1
pnpm content:generate --board cbse --class 10 --subject mathematics --force
```

What happens:
1. Reads the curriculum spine (`lib/content/curriculum.ts`) — the
   definitive list of chapters for this subject.
2. For each chapter, asks Grok to plan exercises (how many, what type,
   how many questions each).
3. For each exercise, asks Grok to generate the questions and worked
   solutions in one shot, schema-validated as it lands.
4. Per-chapter results are cached under `content/.cache/` so re-runs
   resume from the last completed chapter.
5. Output is written to `content/<board>/class-<N>/<subject>.draft.json`.

**Drafts must be reviewed by a human before promoting to `.json`.** Even
state-of-the-art models hallucinate facts. Spot-check a sample, fix in
place, then rename to remove `.draft.`.

### D. End-to-end (after content is reviewed)

```sh
pnpm content:validate              # gate
pnpm content:ingest                # publish to DB
pnpm search:reindex                # update Meilisearch
```

## Adding a new (board, class, subject)

1. Add the entry to [`lib/content/curriculum.ts`](../lib/content/curriculum.ts)
   with the chapter list. (One-time hand work; chapter lists come from
   public board syllabi.)
2. Run `pnpm content:generate --board <slug> --class <N> --subject <slug>`.
3. Review the draft.
4. Rename to `<subject>.json`.
5. Run `pnpm content:ingest`.

## Authoring directly (no LLM)

You can write a manifest by hand — same shape, same validator. The
sample at `cbse/class-10/mathematics.json` is hand-authored.

## Cost estimate

Per subject (≈14 chapters, ≈3 exercises/chapter, ≈8 questions/exercise):
~336 questions × ~600 output tokens ≈ 200k completion tokens, plus ~50k
prompt tokens. At Grok-4 list pricing, roughly a few dollars per
(board × class × subject) pass.
