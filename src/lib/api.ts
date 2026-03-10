const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// -- Backend shapes --

interface BackendItineraryActivity {
  time_slot: string;
  activity: string;
  location: string;
  description: string;
  tips: string;
}

interface BackendItineraryDay {
  day_number: number;
  title: string;
  activities: BackendItineraryActivity[];
}

export interface BackendItinerary {
  destination: string;
  duration_days: number;
  overview: string;
  days: BackendItineraryDay[];
  general_tips: string[];
}

interface ScrapeResponse {
  added: number;
  posts_processed: number;
}

// -- Generic fetch helper --

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// -- Backend-only operations (require server-side processing) --

export async function scrapeUrls(
  urls: string[],
  onDuplicate: "replace" | "skip" = "skip",
): Promise<ScrapeResponse> {
  return apiFetch<ScrapeResponse>("/api/jobs/scrape", {
    method: "POST",
    body: JSON.stringify({ urls, on_duplicate: onDuplicate }),
  });
}

export async function generateItinerary(
  destination: string,
  durationDays: number,
  preferences: string,
  recommendationIds?: string[],
): Promise<BackendItinerary> {
  return apiFetch<BackendItinerary>("/api/itinerary", {
    method: "POST",
    body: JSON.stringify({
      destination,
      duration_days: durationDays,
      preferences,
      ...(recommendationIds?.length ? { recommendation_ids: recommendationIds } : {}),
    }),
  });
}
