export interface ScrapeJob {
  id: string;
  url: string;
  status: 'QUEUED' | 'SCRAPING' | 'TRANSCRIBING' | 'EXTRACTING' | 'COMPLETE' | 'FAILED';
  error_msg: string | null;
  recs_added: number;
  created_at: string;
  updated_at: string;
}
