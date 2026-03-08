import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Map, Globe, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendations } from "@/hooks/use-recommendations";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DetailDrawer } from "@/components/DetailDrawer";
import { SplitText } from "@/components/animations/SplitText";
import { deleteRecommendations } from "@/lib/supabase-api";
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
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={{
              hidden: { opacity: 0, y: 16, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
            }}
          >
            <Card className="border-border">
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
          </motion.div>
        ))}
      </motion.div>

      {/* Recently Added */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SplitText
            text="Recently Added"
            tag="h2"
            className="text-lg font-display font-bold text-foreground"
            splitType="chars"
            staggerDelay={0.025}
            duration={0.4}
          />
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
        <SplitText
          text="Discover Your Library"
          tag="h2"
          className="text-lg font-display font-bold text-foreground mb-4"
          splitType="words"
          staggerDelay={0.08}
          duration={0.5}
        />
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
