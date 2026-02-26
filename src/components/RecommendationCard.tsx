import { useState, useEffect } from "react";
import { MapPin, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types/recommendation";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick: () => void;
  onDelete?: (id: string) => void;
  selected?: boolean;
  onSelect?: () => void;
}

export function RecommendationCard({
  recommendation,
  onClick,
  onDelete,
  selected,
  onSelect,
}: RecommendationCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const images =
    recommendation.image_urls.length > 0
      ? recommendation.image_urls
      : recommendation.image_url
        ? [recommendation.image_url]
        : ["/placeholder.svg"];

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const hasDelete = onDelete != null;
  const hasSourceType = Boolean(recommendation.source_type);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(recommendation.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <Card
        className={`overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-border ${selected ? "ring-2 ring-primary" : ""}`}
        onClick={onClick}
      >
        <div className="relative h-40">
          <Carousel opts={{ loop: true }} setApi={setCarouselApi} className="h-full">
            <CarouselContent className="-ml-0 h-full">
              {images.map((url, i) => (
                <CarouselItem key={i} className="pl-0 h-full">
                  <img
                    src={url}
                    alt={`${recommendation.title} ${i + 1}`}
                    className="h-40 w-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <div onClick={(e) => e.stopPropagation()}>
                <CarouselPrevious className="left-2 h-7 w-7 bg-black/40 text-white border-0 hover:bg-black/60 disabled:opacity-0" />
                <CarouselNext className="right-2 h-7 w-7 bg-black/40 text-white border-0 hover:bg-black/60 disabled:opacity-0" />
              </div>
            )}
          </Carousel>
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    i === currentSlide ? "bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          )}
          {onSelect != null && (
            <div
              className="absolute top-3 left-3 flex items-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={() => onSelect()}
                aria-label="Select"
              />
            </div>
          )}
          <Badge
            className={`absolute top-3 bg-primary text-primary-foreground text-xs z-10 ${onSelect != null ? "left-10" : "left-3"}`}
          >
            {recommendation.category}
          </Badge>
          {hasSourceType && (
            <Badge
              variant="secondary"
              className={`absolute text-xs z-10 ${hasDelete ? `top-10 ${onSelect != null ? "left-10" : "left-3"}` : "top-3 right-3"}`}
            >
              {recommendation.source_type}
            </Badge>
          )}
          {hasDelete && (
            <div
              className="absolute top-3 right-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleDeleteClick}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          {recommendation.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-xs">{recommendation.location}</span>
            </div>
          )}
          <h3 className="font-display font-semibold text-foreground line-clamp-1">{recommendation.title}</h3>
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recommendation.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {recommendation.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{recommendation.description}</p>
          )}
          {recommendation.source_url && (
            <a
              href={recommendation.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              View Source
            </a>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this recommendation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove it from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
