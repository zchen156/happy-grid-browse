import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

export interface Activity {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

interface ItineraryMapProps {
  activities: Activity[];
  activityIndexMap: Record<string, number>;
  hoveredActivity: string | null;
  /** When set, map flies to this activity and shows its name/location (geocodes if no coords) */
  selectedActivityId: string | null;
  /** Used to center the map when activities have no coordinates */
  destination?: string;
}

function hasValidCoords(a: Activity): boolean {
  return (a.lat !== 0 || a.lng !== 0) && Number.isFinite(a.lat) && Number.isFinite(a.lng);
}

async function geocodeDestination(
  query: string,
  token: string
): Promise<{ lng: number; lat: number } | null> {
  if (!query.trim() || !token) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?access_token=${token}&limit=1`;
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

export function ItineraryMap({
  activities,
  activityIndexMap,
  hoveredActivity,
  selectedActivityId,
  destination,
}: ItineraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [centerFromGeocode, setCenterFromGeocode] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  const activitiesWithCoords = activities.filter(hasValidCoords);
  const hasAnyCoords = activitiesWithCoords.length > 0;
  const selectedActivity = selectedActivityId
    ? activities.find((a) => a.id === selectedActivityId)
    : null;

  // Geocode destination when we have no activity coords
  useEffect(() => {
    if (hasAnyCoords || !destination?.trim() || !MAPBOX_TOKEN) {
      setCenterFromGeocode(null);
      return;
    }
    let cancelled = false;
    geocodeDestination(destination, MAPBOX_TOKEN).then((center) => {
      if (!cancelled && center) setCenterFromGeocode(center);
      else if (!cancelled) setCenterFromGeocode(null);
    });
    return () => {
      cancelled = true;
    };
  }, [destination, hasAnyCoords]);

  // Init map
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
        center: [0, 20],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 16,
        attributionControl: false,
      });
      newMap.on("load", () => setMapLoaded(true));
      newMap.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );
      map.current = newMap;
      return () => {
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

  // Center map when only destination is available (no activity coords)
  useEffect(() => {
    if (!map.current || !mapLoaded || hasAnyCoords) return;
    if (centerFromGeocode) {
      map.current.flyTo({
        center: [centerFromGeocode.lng, centerFromGeocode.lat],
        zoom: 10,
        duration: 800,
      });
    }
  }, [mapLoaded, centerFromGeocode, hasAnyCoords]);

  // Markers: either activity points or single destination marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const mapRef = map.current;

    if (activitiesWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let selectedMarker: mapboxgl.Marker | null = null;

      activitiesWithCoords.forEach((a) => {
        const index = activityIndexMap[a.id] ?? 0;
        const isHovered = hoveredActivity === a.id;
        const isSelected = selectedActivityId === a.id;

        const el = document.createElement("div");
        el.className = cn(
          "itinerary-marker flex items-center justify-center rounded-full border-2 border-[hsl(var(--card))] shadow-lg font-bold text-xs transition-transform duration-200",
          isSelected
            ? "scale-125 h-8 w-8 bg-primary text-primary-foreground ring-2 ring-primary"
            : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
          isHovered && !isSelected ? "scale-125 h-8 w-8" : "h-6 w-6"
        );
        el.textContent = String(index);

        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: false,
          className: "mapbox-itinerary-popup",
        }).setHTML(
          `<div class="popup-content"><p class="popup-title">${index}. ${escapeHtml(a.title)}</p><p class="popup-subtitle">${escapeHtml(formatCoords(a.lat, a.lng))}</p></div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([a.lng, a.lat])
          .setPopup(popup)
          .addTo(mapRef);

        markersRef.current.push(marker);
        bounds.extend([a.lng, a.lat]);
        if (isSelected) selectedMarker = marker;
      });

      mapRef.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });

      if (selectedMarker) {
        const a = activitiesWithCoords.find((x) => x.id === selectedActivityId);
        if (a) {
          mapRef.flyTo({ center: [a.lng, a.lat], zoom: 14, duration: 600 });
          selectedMarker.togglePopup();
        }
      }
    } else if (centerFromGeocode) {
      const el = document.createElement("div");
      el.className =
        "w-4 h-4 rounded-full bg-[hsl(var(--accent))] border-2 border-[hsl(var(--card))] shadow-lg";
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([centerFromGeocode.lng, centerFromGeocode.lat])
        .addTo(mapRef);
      markersRef.current.push(marker);
    }
  }, [activitiesWithCoords, activityIndexMap, hoveredActivity, selectedActivityId, mapLoaded, centerFromGeocode]);

  // When selected activity has no coords: geocode place name + destination and show marker + popup
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedActivityId) {
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      return;
    }
    if (!selectedActivity) {
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      return;
    }
    if (hasValidCoords(selectedActivity)) return;

    const query = [selectedActivity.title, destination].filter(Boolean).join(", ");
    if (!query.trim() || !MAPBOX_TOKEN) return;

    let cancelled = false;
    geocodeDestination(query, MAPBOX_TOKEN).then((center) => {
      if (!map.current || cancelled || !center) return;

      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;

      const el = document.createElement("div");
      el.className =
        "itinerary-marker flex items-center justify-center scale-125 h-8 w-8 rounded-full border-2 border-[hsl(var(--card))] shadow-lg bg-primary text-primary-foreground font-bold text-xs ring-2 ring-primary";
      el.textContent = String(activityIndexMap[selectedActivity.id] ?? "?");

      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: false,
        className: "mapbox-itinerary-popup",
      }).setHTML(
        `<div class="popup-content"><p class="popup-title">${escapeHtml(selectedActivity.title)}</p><p class="popup-subtitle">Approximate location</p></div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([center.lng, center.lat])
        .setPopup(popup)
        .addTo(map.current);

      selectedMarkerRef.current = marker;
      map.current.flyTo({ center: [center.lng, center.lat], zoom: 14, duration: 600 });
      marker.togglePopup();
    });

    return () => {
      cancelled = true;
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
    };
  }, [selectedActivityId, selectedActivity, destination, mapLoaded, activityIndexMap]);

  if (mapError) {
    return (
      <div className="h-full w-full bg-secondary/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-display">{mapError}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="h-full w-full bg-secondary/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-display">No activities for this day</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-display">Loading map…</p>
        </div>
      )}
      {mapLoaded && !hasAnyCoords && destination?.trim() && centerFromGeocode === null && (
        <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground font-display border border-border text-center">
          Geocoding destination…
        </div>
      )}
      {mapLoaded && !hasAnyCoords && (centerFromGeocode !== null || !destination?.trim()) && (
        <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground font-display border border-border text-center">
          Activity locations will appear when address data is available.
        </div>
      )}
    </div>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatCoords(lat: number, lng: number): string {
  const fmt = (n: number) => n.toFixed(5);
  return `${fmt(lat)}°, ${fmt(lng)}°`;
}
