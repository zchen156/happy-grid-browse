import { useState } from "react";
import { MapPin, Clock, DollarSign, Star, Users, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import type { Recommendation } from "@/types/recommendation";

interface DetailDrawerProps {
  recommendation: Recommendation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void | Promise<void>;
}

export function DetailDrawer({ recommendation, open, onOpenChange, onDelete }: DetailDrawerProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  if (!recommendation) return null;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(recommendation.id);
      onOpenChange(false);
      setDeleteDialogOpen(false);
    }
  };

  const isOpen = (() => {
    if (!recommendation.opening_hours) return null;
    return true; // simplified for demo
  })();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Hero image */}
        <div className="relative h-56 w-full">
          <img
            src={recommendation.image_url || "/placeholder.svg"}
            alt={recommendation.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex gap-2 mb-2">
              <Badge className="bg-primary text-primary-foreground">{recommendation.category}</Badge>
              {recommendation.source_type && (
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {recommendation.source_type}
                </Badge>
              )}
            </div>
            <SheetHeader className="p-0 text-left">
              <SheetTitle className="text-2xl font-display font-bold text-white">
                {recommendation.title}
              </SheetTitle>
              <SheetDescription className="sr-only">Details for {recommendation.title}</SheetDescription>
            </SheetHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Location */}
          {recommendation.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">{recommendation.location}</span>
            </div>
          )}

          {/* Description */}
          {recommendation.description && (
            <div>
              <h4 className="font-display font-semibold text-sm text-foreground mb-2">About this destination</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.description}</p>
            </div>
          )}

          {/* Info chips */}
          <div className="grid grid-cols-2 gap-3">
            {recommendation.opening_hours && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="text-sm font-medium text-foreground">{recommendation.opening_hours}</p>
                </div>
              </div>
            )}
            {recommendation.cost_range && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <DollarSign className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Cost</p>
                  <p className="text-sm font-medium text-foreground">{recommendation.cost_range}</p>
                </div>
              </div>
            )}
            {recommendation.rating && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Star className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="text-sm font-medium text-foreground">{recommendation.rating}/5</p>
                </div>
              </div>
            )}
            {recommendation.crowd_level && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Crowd Level</p>
                  <p className="text-sm font-medium text-foreground">{recommendation.crowd_level}</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          {isOpen !== null && (
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm font-medium">{isOpen ? "Open Now" : "Closed"}</span>
            </div>
          )}

          {/* Map placeholder */}
          {recommendation.address && (
            <div className="rounded-lg bg-secondary p-4">
              <div className="h-32 rounded-md bg-muted flex items-center justify-center mb-3">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{recommendation.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(recommendation.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline mt-1 inline-block"
              >
                Open in Google Maps →
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {onDelete && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete recommendation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove it from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={handleDelete}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {recommendation.source_url && (
              <Button
                variant="outline"
                className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                asChild
              >
                <a href={recommendation.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Source
                </a>
              </Button>
            )}
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                onOpenChange(false);
                navigate("/itinerary");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Itinerary
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
