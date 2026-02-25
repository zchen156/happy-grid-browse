import { useState, useCallback } from "react";
import { MapPin, Clock, DollarSign, Sparkles, GripVertical, Search, Map, List, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { MockMap } from "@/components/itinerary/MockMap";
import { EmptyMapState } from "@/components/itinerary/EmptyMapState";
import { generateItinerary, type BackendItinerary } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const travelStyles = [
  { label: "Culture", emoji: "🏛️" },
  { label: "Foodie", emoji: "🍕" },
  { label: "Adventure", emoji: "🥾" },
  { label: "Nature", emoji: "🌿" },
  { label: "Luxury", emoji: "💎" },
  { label: "Budget", emoji: "💰" },
];

interface Activity {
  id: string;
  time: "Morning" | "Afternoon" | "Evening";
  title: string;
  desc: string;
  duration: string;
  cost: string;
  image: string;
  lat: number;
  lng: number;
}

interface DayPlan {
  day: number;
  activities: Activity[];
}

const TIME_SLOT_MAP: Record<string, "Morning" | "Afternoon" | "Evening"> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function parseTimeSlot(slot: string): "Morning" | "Afternoon" | "Evening" {
  const lower = slot.toLowerCase();
  for (const [key, val] of Object.entries(TIME_SLOT_MAP)) {
    if (lower.includes(key)) return val;
  }
  if (lower.includes("night") || lower.includes("dinner")) return "Evening";
  if (lower.includes("lunch") || lower.includes("midday")) return "Afternoon";
  return "Morning";
}

function mapBackendItinerary(data: BackendItinerary): DayPlan[] {
  return data.days.map((day) => ({
    day: day.day_number,
    activities: day.activities.map((a, i) => ({
      id: `${day.day_number}-${i}`,
      time: parseTimeSlot(a.time_slot),
      title: a.activity,
      desc: a.description || a.tips || "",
      duration: "",
      cost: "",
      image: "",
      lat: 0,
      lng: 0,
    })),
  }));
}

const ItineraryPage = () => {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState([5]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Culture", "Foodie"]);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("day-1");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const isMobile = useIsMobile();

  const hasItinerary = itinerary.length > 0;
  const hasDestination = destination.trim().length > 0;

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const prefs = selectedStyles.join(", ") || "balanced mix of activities";
      const data = await generateItinerary(destination, duration[0], prefs);
      setItinerary(mapBackendItinerary(data));
      setSelectedDay("day-1");
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Could not generate itinerary",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [destination, duration, selectedStyles, toast]);

  const activeDayIndex = parseInt(selectedDay.replace("day-", "")) - 1;
  const activeDayActivities = hasItinerary && itinerary[activeDayIndex]
    ? itinerary[activeDayIndex].activities
    : [];

  // Build global activity index for numbered markers
  let globalIndex = 0;
  const activityIndexMap: Record<string, number> = {};
  itinerary.forEach((day) => {
    day.activities.forEach((a) => {
      globalIndex++;
      activityIndexMap[a.id] = globalIndex;
    });
  });

  const PlanningPanel = (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className="p-4 space-y-5 border-b border-border">
        <div>
          <label className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Destination
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Search cities, countries…"
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
            Trip Duration: <span className="text-accent">{duration[0]} days</span>
          </label>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={1}
            max={14}
            step={1}
            className="[&_[role=slider]]:border-accent [&_[role=slider]]:bg-accent [&_span:first-child>span]:bg-accent"
          />
        </div>

        <div>
          <label className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Travel Style
          </label>
          <div className="flex flex-wrap gap-2">
            {travelStyles.map((style) => {
              const active = selectedStyles.includes(style.label);
              return (
                <button
                  key={style.label}
                  onClick={() => toggleStyle(style.label)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/40"
                  )}
                >
                  {style.emoji} {style.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !hasDestination}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display font-semibold"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Generate Itinerary</>
          )}
        </Button>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        {!hasItinerary ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-display">
              Enter a destination and generate your itinerary to see the timeline here.
            </p>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={selectedDay}
            onValueChange={(val) => val && setSelectedDay(val)}
            className="px-4 py-3"
          >
            {itinerary.map((day) => (
              <AccordionItem key={day.day} value={`day-${day.day}`} className="border-b-0 mb-2">
                <AccordionTrigger className="py-2.5 px-3 rounded-lg bg-secondary/60 hover:bg-secondary hover:no-underline">
                  <span className="font-display font-bold text-sm">
                    Day {day.day}
                    <span className="ml-2 text-muted-foreground font-normal text-xs">
                      {day.activities.length} activities
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="space-y-2 ml-1 border-l-2 border-accent/30 pl-3">
                    {(["Morning", "Afternoon", "Evening"] as const).map((slot) => {
                      const slotActivities = day.activities.filter((a) => a.time === slot);
                      return (
                        <div key={slot}>
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            {slot}
                          </span>
                          {slotActivities.length === 0 ? (
                            <div className="my-1 rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground/60">
                              Drop an activity here
                            </div>
                          ) : (
                            slotActivities.map((activity) => (
                              <Card
                                key={activity.id}
                                onMouseEnter={() => setHoveredActivity(activity.id)}
                                onMouseLeave={() => setHoveredActivity(null)}
                                className={cn(
                                  "border-border cursor-grab active:cursor-grabbing transition-shadow my-1",
                                  hoveredActivity === activity.id && "ring-2 ring-accent/50 shadow-md"
                                )}
                              >
                                <CardContent className="flex items-center gap-3 p-2.5">
                                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                  {activity.image ? (
                                    <img
                                      src={activity.image}
                                      alt={activity.title}
                                      className="h-10 w-10 rounded-md object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold shrink-0">
                                        {activityIndexMap[activity.id]}
                                      </span>
                                      <h4 className="font-display font-semibold text-foreground text-xs truncate">
                                        {activity.title}
                                      </h4>
                                    </div>
                                    <div className="flex gap-2 mt-0.5">
                                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                        <Clock className="h-2.5 w-2.5" /> {activity.duration}
                                      </span>
                                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                        <DollarSign className="h-2.5 w-2.5" /> {activity.cost}
                                      </span>
                                    </div>
                                  </div>
                                  <MapPin className="h-4 w-4 text-accent shrink-0" />
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </ScrollArea>
    </div>
  );

  const MapPanel = hasItinerary && hasDestination ? (
    <MockMap
      activities={activeDayActivities}
      activityIndexMap={activityIndexMap}
      hoveredActivity={hoveredActivity}
    />
  ) : (
    <EmptyMapState />
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Toggle */}
        <div className="flex border-b border-border bg-card">
          <button
            onClick={() => setMobileView("list")}
            className={cn(
              "flex-1 py-2.5 text-xs font-display font-semibold flex items-center justify-center gap-1.5 transition-colors",
              mobileView === "list" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" /> List View
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={cn(
              "flex-1 py-2.5 text-xs font-display font-semibold flex items-center justify-center gap-1.5 transition-colors",
              mobileView === "map" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
          >
            <Map className="h-3.5 w-3.5" /> Map View
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileView === "list" ? PlanningPanel : MapPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 md:-m-6">
      {/* Planning Sidebar 40% */}
      <div className="w-[40%] border-r border-border bg-card flex flex-col overflow-hidden">
        {PlanningPanel}
      </div>
      {/* Map 60% */}
      <div className="w-[60%] relative overflow-hidden">
        {MapPanel}
      </div>
    </div>
  );
};

export default ItineraryPage;
