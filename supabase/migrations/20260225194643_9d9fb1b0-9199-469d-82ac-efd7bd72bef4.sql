
-- Add PRD columns to recommendations
ALTER TABLE public.recommendations
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS tips TEXT,
  ADD COLUMN IF NOT EXISTS price_range TEXT,
  ADD COLUMN IF NOT EXISTS video_timestamp TEXT;

-- Backfill new columns from existing data
UPDATE public.recommendations SET destination = location WHERE destination IS NULL AND location IS NOT NULL;
UPDATE public.recommendations SET name = title WHERE name IS NULL;

-- Create scrape_jobs table
CREATE TABLE public.scrape_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  error_msg TEXT,
  recs_added INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scrape_jobs" ON public.scrape_jobs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scrape_jobs" ON public.scrape_jobs FOR INSERT WITH CHECK (true);
