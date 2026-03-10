import { useMemo, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, Map, Globe, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecommendations } from "@/hooks/use-recommendations";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DetailDrawer } from "@/components/DetailDrawer";
import { SplitText } from "@/components/animations/SplitText";
import { TopDestinationsMap } from "@/components/TopDestinationsMap";
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
      <RecentlyAdded
        recommendations={recommendations}
        isLoading={isLoading}
        onCardClick={openDrawer}
        onDelete={handleDeleteOne}
      />

      {/* Top Destinations Map */}
      <TopDestinationsMap recommendations={recommendations} isLoading={isLoading} />

      <DetailDrawer
        recommendation={selectedRec}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDelete={handleDeleteOne}
      />
    </div>
  );
};

function RecentlyAdded({
  recommendations,
  isLoading,
  onCardClick,
  onDelete,
}: {
  recommendations: Recommendation[] | undefined;
  isLoading: boolean;
  onCardClick: (rec: Recommendation) => void;
  onDelete: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 280;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="grid grid-cols-1">
      <div className="flex items-center justify-between mb-4">
        <SplitText
          text="Recently Added"
          tag="h2"
          className="text-lg font-display font-bold text-foreground"
          splitType="chars"
          staggerDelay={0.025}
          duration={0.4}
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <a href="/library" className="text-sm text-primary hover:underline flex items-center gap-1 ml-1">
            View all <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-64 shrink-0 rounded-lg bg-secondary animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        >
          {recommendations?.slice(0, 10).map((rec) => (
            <div key={rec.id} className="w-64 shrink-0">
              <RecommendationCard
                recommendation={rec}
                onClick={() => onCardClick(rec)}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Index;
