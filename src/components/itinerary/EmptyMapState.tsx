import { Globe } from "lucide-react";

export function EmptyMapState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-primary/5 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute w-72 h-72 rounded-full border border-primary/10 animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full border border-primary/5" />
      <div className="absolute w-[28rem] h-[28rem] rounded-full border border-dashed border-accent/10" />

      <Globe className="h-16 w-16 text-primary/30 mb-4" strokeWidth={1} />
      <h3 className="font-display font-bold text-foreground text-lg mb-1">Where to next?</h3>
      <p className="text-sm text-muted-foreground max-w-[220px] text-center">
        Enter a destination and generate your itinerary to see it on the map.
      </p>
    </div>
  );
}
