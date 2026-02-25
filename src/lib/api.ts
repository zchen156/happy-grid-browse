import type { Recommendation } from "@/types/recommendation";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// -- Backend shapes (what the Tripost API returns) --

interface BackendRecommendation {
  id: string;
  source_url: string;
  destination: string;
  category: string;
  name: string;
  description: string;
  tips: string | null;
  price_range: string | null;
  address: string | null;
  tags: string[];
  video_timestamp: string | null;
}

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

// -- Field mapping: backend -> frontend Recommendation --

function mapRecommendation(r: BackendRecommendation): Recommendation {
  return {
    id: r.id,
    title: r.name,
    name: r.name,
    description: r.description || null,
    image_url: null,
    category: r.category,
    location: r.destination,
    destination: r.destination,
    tags: r.tags ?? [],
    source_url: r.source_url || null,
    source_type: null,
    rating: null,
    cost_range: r.price_range ?? null,
    price_range: r.price_range ?? null,
    opening_hours: null,
    crowd_level: null,
    address: r.address ?? null,
    tips: r.tips ?? null,
    video_timestamp: r.video_timestamp ?? null,
    created_at: new Date().toISOString(),
  };
}

// -- API wrappers --

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

export async function fetchRecommendations(
  destination?: string,
): Promise<Recommendation[]> {
  const params = destination ? `?destination=${encodeURIComponent(destination)}` : "";
  const data = await apiFetch<BackendRecommendation[]>(
    `/api/recommendations${params}`,
  );
  return data.map(mapRecommendation);
}

export async function fetchDestinations(): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>("/api/destinations");
}

export async function deleteRecommendations(ids: string[]): Promise<{ removed: number }> {
  return apiFetch<{ removed: number }>("/api/recommendations", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

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
): Promise<BackendItinerary> {
  return apiFetch<BackendItinerary>("/api/itinerary", {
    method: "POST",
    body: JSON.stringify({
      destination,
      duration_days: durationDays,
      preferences,
    }),
  });
}
