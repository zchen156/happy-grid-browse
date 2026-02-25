import { MapPin, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-border ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <div className="relative h-40">
        <img
          src={recommendation.image_url || "/placeholder.svg"}
          alt={recommendation.title}
          className="h-full w-full object-cover"
        />
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
          {recommendation.category}
        </Badge>
        {recommendation.source_type && (
          <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
            {recommendation.source_type}
          </Badge>
        )}
        {onSelect != null && (
          <div
            className="absolute top-3 left-10 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect()}
              aria-label="Select"
            />
          </div>
        )}
        {onDelete != null && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recommendation.id);
            }}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
  );
}
