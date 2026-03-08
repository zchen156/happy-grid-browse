import { supabase } from "@/integrations/supabase/client";
import type { Recommendation } from "@/types/recommendation";

function mapRow(r: Record<string, unknown>): Recommendation {
  return {
    id: r.id as string,
    title: (r.title ?? r.name ?? "") as string,
    name: (r.name ?? r.title ?? null) as string | null,
    description: (r.description ?? null) as string | null,
    image_url: (r.image_url ?? null) as string | null,
    image_urls: Array.isArray(r.image_urls)
      ? (r.image_urls as string[])
      : r.image_url
        ? [r.image_url as string]
        : [],
    category: (r.category ?? "Other") as string,
    location: (r.location ?? r.destination ?? null) as string | null,
    destination: (r.destination ?? r.location ?? null) as string | null,
    tags: (r.tags as string[]) ?? [],
    source_url: (r.source_url ?? null) as string | null,
    source_type: (r.source_type ?? null) as string | null,
    rating: (r.rating ?? null) as number | null,
    cost_range: (r.cost_range ?? r.price_range ?? null) as string | null,
    price_range: (r.price_range ?? r.cost_range ?? null) as string | null,
    opening_hours: (r.opening_hours ?? null) as string | null,
    crowd_level: (r.crowd_level ?? null) as string | null,
    address: (r.address ?? null) as string | null,
    tips: (r.tips ?? null) as string | null,
    video_timestamp: (r.video_timestamp ?? null) as string | null,
    created_at: (r.created_at as string) ?? new Date().toISOString(),
  };
}

export async function fetchRecommendations(
  destination?: string,
): Promise<Recommendation[]> {
  let query = supabase.from("recommendations").select("*");

  if (destination) {
    query = query.ilike("destination", `%${destination}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function fetchDestinations(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("recommendations")
    .select("destination");

  if (error) throw new Error(`Supabase: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const dest = (row.destination as string) || "Unknown";
    counts[dest] = (counts[dest] ?? 0) + 1;
  }
  return counts;
}

export async function deleteRecommendations(
  ids: string[],
): Promise<{ removed: number }> {
  const { data, error } = await supabase
    .from("recommendations")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) throw new Error(`Supabase: ${error.message}`);
  return { removed: data?.length ?? 0 };
}
