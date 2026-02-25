import { useQuery } from "@tanstack/react-query";
import { fetchRecommendations } from "@/lib/api";
import type { Recommendation } from "@/types/recommendation";

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async (): Promise<Recommendation[]> => {
      return fetchRecommendations();
    },
  });
}
