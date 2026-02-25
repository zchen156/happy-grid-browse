import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, Map, Globe, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendations } from "@/hooks/use-recommendations";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DetailDrawer } from "@/components/DetailDrawer";
import { deleteRecommendations } from "@/lib/api";
import type { Recommendation } from "@/types/recommendation";

const Index = () => {
  const queryClient = useQueryClient();
  const { data: recommendations, isLoading } = useRecommendations();
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (rec: Recommendation) => {
    setSelectedRec(rec);
    setDrawerOpen(true);
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteRecommendations([id]);
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      if (selectedRec?.id === id) {
        setSelectedRec(null);
        setDrawerOpen(false);
      }
    } catch {
      // leave list as-is on error
    }
  };

  const stats = useMemo(() => {
    const count = recommendations?.length ?? 0;
    const destinations = new Set(
      recommendations
        ?.map((r) => r.destination || r.location)
        .filter(Boolean),
    );
    return [
      { label: "Saved Spots", value: String(count), icon: Bookmark, color: "text-primary" },
      { label: "Active Itineraries", value: "0", icon: Map, color: "text-accent" },
      { label: "Destinations", value: String(destinations.size), icon: Globe, color: "text-primary" },
    ];
  }, [recommendations]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recently Added */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-foreground">Recently Added</h2>
          <a href="/library" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </a>
        </div>
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 w-64 shrink-0 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommendations?.slice(0, 5).map((rec) => (
              <div key={rec.id} className="w-64 shrink-0">
                <RecommendationCard
                  recommendation={rec}
                  onClick={() => openDrawer(rec)}
                  onDelete={handleDeleteOne}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discover */}
      <div>
        <h2 className="text-lg font-display font-bold text-foreground mb-4">Discover Your Library</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations?.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={() => openDrawer(rec)}
                onDelete={handleDeleteOne}
              />
            ))}
          </div>
        )}
      </div>

      <DetailDrawer
        recommendation={selectedRec}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDelete={handleDeleteOne}
      />
    </div>
  );
};

export default Index;
