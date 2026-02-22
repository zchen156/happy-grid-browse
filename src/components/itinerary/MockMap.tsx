import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

interface MockMapProps {
  activities: Activity[];
  activityIndexMap: Record<string, number>;
  hoveredActivity: string | null;
}

export function MockMap({ activities, activityIndexMap, hoveredActivity }: MockMapProps) {
  // Map activities to relative positions within a bounding box
  if (activities.length === 0) {
    return (
      <div className="h-full w-full bg-secondary/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-display">No activities for this day</p>
      </div>
    );
  }

  const lats = activities.map((a) => a.lat);
  const lngs = activities.map((a) => a.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padLat = (maxLat - minLat) * 0.3 || 0.01;
  const padLng = (maxLng - minLng) * 0.3 || 0.01;

  const normalize = (a: Activity) => {
    const x = ((a.lng - (minLng - padLng)) / ((maxLng + padLng) - (minLng - padLng))) * 80 + 10;
    const y = (1 - (a.lat - (minLat - padLat)) / ((maxLat + padLat) - (minLat - padLat))) * 70 + 15;
    return { x, y };
  };

  const points = activities.map((a) => ({ ...normalize(a), id: a.id, title: a.title }));

  return (
    <div className="h-full w-full relative bg-[hsl(var(--secondary))]/20 overflow-hidden">
      {/* Grid pattern for map feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapgrid)" />
      </svg>

      {/* Road-like lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points={points.map((p) => `${p.x}%,${p.y}%`).join(" ")}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeLinecap="round"
          className="opacity-60"
        />
      </svg>

      {/* Markers */}
      {points.map((p) => {
        const isHovered = hoveredActivity === p.id;
        return (
          <div
            key={p.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -100%)",
              zIndex: isHovered ? 20 : 10,
            }}
          >
            {/* Tooltip */}
            <div
              className={cn(
                "px-2 py-1 rounded-md bg-card text-foreground text-[10px] font-display font-semibold shadow-md border border-border mb-1 whitespace-nowrap transition-all",
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
              )}
            >
              {p.title}
            </div>
            {/* Pin */}
            <div
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-card shadow-lg transition-transform duration-200 bg-accent text-accent-foreground",
                isHovered ? "scale-125 h-8 w-8 text-xs" : "h-6 w-6 text-[10px]"
              )}
            >
              <span className="font-bold">{activityIndexMap[p.id]}</span>
            </div>
            {/* Pin tail */}
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-accent -mt-[1px]" />
          </div>
        );
      })}

      {/* Map label */}
      <div className="absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-[10px] text-muted-foreground font-display border border-border">
        Mock Map · Styled placeholder
      </div>
    </div>
  );
}
