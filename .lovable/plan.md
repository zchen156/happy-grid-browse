

# Database Schema Update from PRD

## Overview
Align the existing `recommendations` table with the PRD schema, create a new `scrape_jobs` table, and update the TypeScript types and Library page accordingly.

## What Changes

### 1. Database Migration

**Update `recommendations` table** to add PRD columns:
- Add `destination` (TEXT) -- normalized "City, Country" (maps to current `location`)
- Add `name` (TEXT) -- the PRD's primary name field (maps to current `title`)
- Add `tips` (TEXT, nullable)
- Add `price_range` (TEXT, nullable) -- PRD equivalent of current `cost_range`
- Add `video_timestamp` (TEXT, nullable)
- Populate `destination` from existing `location` values and `name` from existing `title` values so no data is lost
- Keep existing columns (`title`, `location`, `cost_range`, etc.) to avoid breaking anything -- they can be deprecated later

**Create `scrape_jobs` table**:
- `id` UUID primary key
- `url` TEXT NOT NULL
- `status` TEXT NOT NULL DEFAULT 'QUEUED' (QUEUED, SCRAPING, TRANSCRIBING, EXTRACTING, COMPLETE, FAILED)
- `error_msg` TEXT nullable
- `recs_added` INT DEFAULT 0
- `created_at` TIMESTAMPTZ DEFAULT now()
- `updated_at` TIMESTAMPTZ DEFAULT now()
- RLS enabled with public read/insert policies (matching current pattern -- no auth yet)

Note: `user_id` columns from the PRD are omitted for now since the app has no authentication. They will be added when auth is implemented.

### 2. Update TypeScript Types

Update `src/types/recommendation.ts` to include the new fields (`destination`, `name`, `tips`, `price_range`, `video_timestamp`).

Create `src/types/scrape-job.ts` with the `ScrapeJob` interface.

### 3. Update Library Page

The Library page already fetches from the database via the `useRecommendations` hook -- no mock data is in use. The filter logic will be updated to also search the new `destination` and `name` fields, and the destination tags will be derived dynamically from the actual data instead of a hardcoded list.

### 4. Files Modified

| File | Change |
|---|---|
| New migration SQL | Add columns to `recommendations`, create `scrape_jobs` table |
| `src/types/recommendation.ts` | Add new optional fields |
| `src/types/scrape-job.ts` (new) | `ScrapeJob` interface |
| `src/hooks/use-recommendations.ts` | No change needed (already fetches `*`) |
| `src/pages/Library.tsx` | Derive destination tags from data, update filter logic |

