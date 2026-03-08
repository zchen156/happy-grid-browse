import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Grid3X3, List, Loader2, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { useRecommendations } from "@/hooks/use-recommendations";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DetailDrawer } from "@/components/DetailDrawer";
import { deleteRecommendations } from "@/lib/supabase-api";
import type { Recommendation } from "@/types/recommendation";

const categories = ["All", "Restaurant", "Café", "Attraction", "Activity", "Experience", "Market"];

const LibraryPage = () => {
  const queryClient = useQueryClient();
  const { data: recommendations, isLoading } = useRecommendations();
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteDialogOpen(false);
    setIsDeleting(true);
    try {
      await deleteRecommendations(Array.from(selectedIds));
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setSelectedIds(new Set());
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await deleteRecommendations([id]);
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      if (selectedRec?.id === id) {
        setSelectedRec(null);
        setDrawerOpen(false);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      // leave list as-is on error
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Derive destination tags dynamically from data
  const destinationTags = Array.from(
    new Set(
      recommendations
        ?.map((r) => r.destination || r.location)
        .filter(Boolean) as string[]
    )
  ).sort();

  const filtered = recommendations?.filter((rec) => {
    const matchesSearch =
      !searchQuery ||
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.destination?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || rec.category === selectedCategory;
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => (rec.destination || rec.location)?.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filter panel */}
      <aside className="w-full lg:w-64 shrink-0 space-y-6">
        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Destinations</h3>
          <div className="flex flex-wrap gap-2">
            {destinationTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Category</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recommendations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  disabled={isDeleting}
                  className="gap-1"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete selected ({selectedIds.size})
                </Button>
                <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete selected?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {selectedIds.size} recommendation{selectedIds.size === 1 ? "" : "s"} from your library. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={handleDeleteSelected}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {filtered.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={() => {
                  setSelectedRec(rec);
                  setDrawerOpen(true);
                }}
                onDelete={handleDeleteOne}
                selected={selectedIds.has(rec.id)}
                onSelect={() => toggleSelect(rec.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <SlidersHorizontal className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No recommendations found</p>
            <p className="text-sm">Try adjusting your filters</p>
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

export default LibraryPage;
