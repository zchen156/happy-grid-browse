import { useEffect, useRef, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/types/recommendation";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface PlaceAgg {
  /** Normalized "City, Country", e.g. "Kyoto, Japan" */
  destination: string;
  /** City portion for the pin label */
  cityLabel: string;
  count: number;
  /** Sample saved spot names shown in the popup */
  spots: string[];
}

async function geocodePlace(
  query: string,
  token: string
): Promise<{ lng: number; lat: number } | null> {
  if (!query.trim() || !token) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query.trim()
  )}.json?access_token=${token}&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature?.geometry?.coordinates?.length) return null;
    const [lng, lat] = feature.geometry.coordinates;
    return { lng, lat };
  } catch {
    return null;
  }
}

function cityLabel(destination: string): string {
  const parts = destination.split(",").map((p) => p.trim());
  return parts[0] || destination;
}

interface TopDestinationsMapProps {
  recommendations: Recommendation[] | undefined;
  isLoading: boolean;
}

export function TopDestinationsMap({ recommendations, isLoading }: TopDestinationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coords, setCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [geocoding, setGeocoding] = useState(false);

  const topPlaces = useMemo<PlaceAgg[]>(() => {
    if (!recommendations || recommendations.length === 0) return [];

    const byKey = new Map<string, PlaceAgg>();

    for (const rec of recommendations) {
      const dest = (rec.destination || rec.location || "").trim();
      if (!dest) continue;

      const key = dest.toLowerCase();
      const existing = byKey.get(key);
      if (existing) {
        existing.count++;
        if (rec.title && !existing.spots.includes(rec.title)) {
          existing.spots.push(rec.title);
        }
      } else {
        byKey.set(key, {
          destination: dest,
          cityLabel: cityLabel(dest),
          count: 1,
          spots: rec.title ? [rec.title] : [],
        });
      }
    }

    return Array.from(byKey.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [recommendations]);

  const geocodeKey = useMemo(() => topPlaces.map((p) => p.destination).join("\0"), [topPlaces]);

  // Geocode the top places whenever the set of destinations changes
  useEffect(() => {
    if (!MAPBOX_TOKEN || topPlaces.length === 0) {
      setCoords({});
      setGeocoding(false);
      return;
    }

    let cancelled = false;
    setGeocoding(true);

    (async () => {
      const results = await Promise.all(
        topPlaces.map(async (p) => ({
          destination: p.destination,
          coords: await geocodePlace(p.destination, MAPBOX_TOKEN),
        }))
      );

      if (cancelled) return;

      const next: Record<string, { lat: number; lng: number }> = {};
      for (const { destination, coords: c } of results) {
        if (c) next[destination] = c;
      }
      setCoords(next);
      setGeocoding(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [geocodeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Mapbox once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox access token not configured");
      return;
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [10, 25],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 12,
        attributionControl: false,
        scrollZoom: false,
      });

      newMap.on("load", () => setMapLoaded(true));
      newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      const container = newMap.getContainer();
      const enableScroll = () => newMap.scrollZoom.enable();
      const disableScroll = () => newMap.scrollZoom.disable();
      container.addEventListener("click", enableScroll);
      container.addEventListener("mouseleave", disableScroll);

      map.current = newMap;

      return () => {
        container.removeEventListener("click", enableScroll);
        container.removeEventListener("mouseleave", disableScroll);
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        newMap.remove();
        map.current = null;
        setMapLoaded(false);
      };
    } catch (err) {
      setMapError("Failed to initialize map");
      console.error("Mapbox error:", err);
    }
  }, []);

  // Add / refresh pins whenever coords or map state changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const mapRef = map.current;
    const bounds = new mapboxgl.LngLatBounds();
    let anyPin = false;

    topPlaces.forEach((p, rank) => {
      const c = coords[p.destination];
      if (!c) return;

      const el = document.createElement("div");
      el.className = "destination-marker";
      el.innerHTML = `
        <span class="marker-rank">#${rank + 1}</span>
        <span class="marker-name">${p.cityLabel}</span>
        <span class="marker-count">${p.count}</span>
      `;

      const spotsPreview = p.spots.slice(0, 3).join(", ");
      const moreCount = p.spots.length > 3 ? ` +${p.spots.length - 3} more` : "";

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "mapbox-destination-popup",
      }).setHTML(`
        <div class="popup-content">
          <p class="popup-rank">#${rank + 1}</p>
          <p class="popup-title">${p.destination}</p>
          <p class="popup-stats">${p.count} saved spot${p.count > 1 ? "s" : ""}</p>
          ${spotsPreview ? `<p class="popup-spots">${spotsPreview}${moreCount}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([c.lng, c.lat])
        .setPopup(popup)
        .addTo(mapRef);

      markersRef.current.push(marker);
      bounds.extend([c.lng, c.lat]);
      anyPin = true;
    });

    if (anyPin) {
      mapRef.fitBounds(bounds, { padding: 80, maxZoom: 8 });
    }
  }, [topPlaces, coords, mapLoaded]);

  const busy = isLoading || !mapLoaded || geocoding;
  const empty = !busy && Object.keys(coords).length === 0;

  if (mapError) {
    return (
      <Card className="border-border/60 shadow-none overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Top Places</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[520px] flex items-center justify-center bg-secondary/30 rounded-lg">
            <p className="text-muted-foreground">{mapError}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-none overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg font-bold">Top Places</CardTitle>
          {topPlaces.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-accent/10 text-accent px-3 py-1 rounded-full">
              Top {topPlaces.length} {topPlaces.length === 1 ? "destination" : "destinations"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={mapContainer} className="h-[520px] rounded-b-lg overflow-hidden" />
        {busy && (
          <div className="absolute inset-0 h-[520px] bg-secondary animate-pulse rounded-b-lg" />
        )}
        {empty && (
          <div className="absolute inset-0 h-[520px] flex items-center justify-center bg-secondary/30 rounded-b-lg">
            <p className="text-muted-foreground text-center px-4">
              Save some spots to see your top places here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
