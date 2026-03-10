import { useEffect, useRef, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/types/recommendation";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface CountryData {
  country: string;
  flag: string;
  count: number;
  spots: string[];
  destinations: string[];
  lat: number;
  lng: number;
}

const COUNTRY_DATA: Record<string, { flag: string; lat: number; lng: number }> = {
  "canada": { flag: "\u{1F1E8}\u{1F1E6}", lat: 56.1304, lng: -106.3468 },
  "united states": { flag: "\u{1F1FA}\u{1F1F8}", lat: 37.0902, lng: -95.7129 },
  "usa": { flag: "\u{1F1FA}\u{1F1F8}", lat: 37.0902, lng: -95.7129 },
  "us": { flag: "\u{1F1FA}\u{1F1F8}", lat: 37.0902, lng: -95.7129 },
  "mexico": { flag: "\u{1F1F2}\u{1F1FD}", lat: 23.6345, lng: -102.5528 },
  "brazil": { flag: "\u{1F1E7}\u{1F1F7}", lat: -14.235, lng: -51.9253 },
  "argentina": { flag: "\u{1F1E6}\u{1F1F7}", lat: -38.4161, lng: -63.6167 },
  "colombia": { flag: "\u{1F1E8}\u{1F1F4}", lat: 4.5709, lng: -74.2973 },
  "chile": { flag: "\u{1F1E8}\u{1F1F1}", lat: -35.6751, lng: -71.543 },
  "peru": { flag: "\u{1F1F5}\u{1F1EA}", lat: -9.19, lng: -75.0152 },
  "costa rica": { flag: "\u{1F1E8}\u{1F1F7}", lat: 9.7489, lng: -83.7534 },
  "cuba": { flag: "\u{1F1E8}\u{1F1FA}", lat: 21.5218, lng: -77.7812 },
  "united kingdom": { flag: "\u{1F1EC}\u{1F1E7}", lat: 55.3781, lng: -3.436 },
  "uk": { flag: "\u{1F1EC}\u{1F1E7}", lat: 55.3781, lng: -3.436 },
  "england": { flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", lat: 52.3555, lng: -1.1743 },
  "scotland": { flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", lat: 56.4907, lng: -4.2026 },
  "france": { flag: "\u{1F1EB}\u{1F1F7}", lat: 46.6034, lng: 1.8883 },
  "germany": { flag: "\u{1F1E9}\u{1F1EA}", lat: 51.1657, lng: 10.4515 },
  "italy": { flag: "\u{1F1EE}\u{1F1F9}", lat: 41.8719, lng: 12.5674 },
  "spain": { flag: "\u{1F1EA}\u{1F1F8}", lat: 40.4637, lng: -3.7492 },
  "portugal": { flag: "\u{1F1F5}\u{1F1F9}", lat: 39.3999, lng: -8.2245 },
  "netherlands": { flag: "\u{1F1F3}\u{1F1F1}", lat: 52.1326, lng: 5.2913 },
  "belgium": { flag: "\u{1F1E7}\u{1F1EA}", lat: 50.5039, lng: 4.4699 },
  "switzerland": { flag: "\u{1F1E8}\u{1F1ED}", lat: 46.8182, lng: 8.2275 },
  "austria": { flag: "\u{1F1E6}\u{1F1F9}", lat: 47.5162, lng: 14.5501 },
  "greece": { flag: "\u{1F1EC}\u{1F1F7}", lat: 39.0742, lng: 21.8243 },
  "turkey": { flag: "\u{1F1F9}\u{1F1F7}", lat: 38.9637, lng: 35.2433 },
  "ireland": { flag: "\u{1F1EE}\u{1F1EA}", lat: 53.1424, lng: -7.6921 },
  "denmark": { flag: "\u{1F1E9}\u{1F1F0}", lat: 56.2639, lng: 9.5018 },
  "sweden": { flag: "\u{1F1F8}\u{1F1EA}", lat: 60.1282, lng: 18.6435 },
  "norway": { flag: "\u{1F1F3}\u{1F1F4}", lat: 60.472, lng: 8.4689 },
  "finland": { flag: "\u{1F1EB}\u{1F1EE}", lat: 61.9241, lng: 25.7482 },
  "iceland": { flag: "\u{1F1EE}\u{1F1F8}", lat: 64.9631, lng: -19.0208 },
  "poland": { flag: "\u{1F1F5}\u{1F1F1}", lat: 51.9194, lng: 19.1451 },
  "czech republic": { flag: "\u{1F1E8}\u{1F1FF}", lat: 49.8175, lng: 15.473 },
  "czechia": { flag: "\u{1F1E8}\u{1F1FF}", lat: 49.8175, lng: 15.473 },
  "hungary": { flag: "\u{1F1ED}\u{1F1FA}", lat: 47.1625, lng: 19.5033 },
  "croatia": { flag: "\u{1F1ED}\u{1F1F7}", lat: 45.1, lng: 15.2 },
  "romania": { flag: "\u{1F1F7}\u{1F1F4}", lat: 45.9432, lng: 24.9668 },
  "monaco": { flag: "\u{1F1F2}\u{1F1E8}", lat: 43.7384, lng: 7.4246 },
  "luxembourg": { flag: "\u{1F1F1}\u{1F1FA}", lat: 49.8153, lng: 6.1296 },
  "estonia": { flag: "\u{1F1EA}\u{1F1EA}", lat: 58.5953, lng: 25.0136 },
  "latvia": { flag: "\u{1F1F1}\u{1F1FB}", lat: 56.8796, lng: 24.6032 },
  "lithuania": { flag: "\u{1F1F1}\u{1F1F9}", lat: 55.1694, lng: 23.8813 },
  "russia": { flag: "\u{1F1F7}\u{1F1FA}", lat: 61.524, lng: 105.3188 },
  "japan": { flag: "\u{1F1EF}\u{1F1F5}", lat: 36.2048, lng: 138.2529 },
  "south korea": { flag: "\u{1F1F0}\u{1F1F7}", lat: 35.9078, lng: 127.7669 },
  "korea": { flag: "\u{1F1F0}\u{1F1F7}", lat: 35.9078, lng: 127.7669 },
  "china": { flag: "\u{1F1E8}\u{1F1F3}", lat: 35.8617, lng: 104.1954 },
  "taiwan": { flag: "\u{1F1F9}\u{1F1FC}", lat: 23.6978, lng: 120.9605 },
  "hong kong": { flag: "\u{1F1ED}\u{1F1F0}", lat: 22.3193, lng: 114.1694 },
  "singapore": { flag: "\u{1F1F8}\u{1F1EC}", lat: 1.3521, lng: 103.8198 },
  "thailand": { flag: "\u{1F1F9}\u{1F1ED}", lat: 15.87, lng: 100.9925 },
  "vietnam": { flag: "\u{1F1FB}\u{1F1F3}", lat: 14.0583, lng: 108.2772 },
  "indonesia": { flag: "\u{1F1EE}\u{1F1E9}", lat: -0.7893, lng: 113.9213 },
  "malaysia": { flag: "\u{1F1F2}\u{1F1FE}", lat: 4.2105, lng: 101.9758 },
  "philippines": { flag: "\u{1F1F5}\u{1F1ED}", lat: 12.8797, lng: 121.774 },
  "india": { flag: "\u{1F1EE}\u{1F1F3}", lat: 20.5937, lng: 78.9629 },
  "sri lanka": { flag: "\u{1F1F1}\u{1F1F0}", lat: 7.8731, lng: 80.7718 },
  "nepal": { flag: "\u{1F1F3}\u{1F1F5}", lat: 28.3949, lng: 84.124 },
  "cambodia": { flag: "\u{1F1F0}\u{1F1ED}", lat: 12.5657, lng: 104.991 },
  "myanmar": { flag: "\u{1F1F2}\u{1F1F2}", lat: 21.9162, lng: 95.956 },
  "laos": { flag: "\u{1F1F1}\u{1F1E6}", lat: 19.8563, lng: 102.4955 },
  "uae": { flag: "\u{1F1E6}\u{1F1EA}", lat: 23.4241, lng: 53.8478 },
  "united arab emirates": { flag: "\u{1F1E6}\u{1F1EA}", lat: 23.4241, lng: 53.8478 },
  "saudi arabia": { flag: "\u{1F1F8}\u{1F1E6}", lat: 23.8859, lng: 45.0792 },
  "israel": { flag: "\u{1F1EE}\u{1F1F1}", lat: 31.0461, lng: 34.8516 },
  "jordan": { flag: "\u{1F1EF}\u{1F1F4}", lat: 30.5852, lng: 36.2384 },
  "egypt": { flag: "\u{1F1EA}\u{1F1EC}", lat: 26.8206, lng: 30.8025 },
  "morocco": { flag: "\u{1F1F2}\u{1F1E6}", lat: 31.7917, lng: -7.0926 },
  "south africa": { flag: "\u{1F1FF}\u{1F1E6}", lat: -30.5595, lng: 22.9375 },
  "kenya": { flag: "\u{1F1F0}\u{1F1EA}", lat: -0.0236, lng: 37.9062 },
  "tanzania": { flag: "\u{1F1F9}\u{1F1FF}", lat: -6.369, lng: 34.8888 },
  "ethiopia": { flag: "\u{1F1EA}\u{1F1F9}", lat: 9.145, lng: 40.4897 },
  "nigeria": { flag: "\u{1F1F3}\u{1F1EC}", lat: 9.082, lng: 8.6753 },
  "ghana": { flag: "\u{1F1EC}\u{1F1ED}", lat: 7.9465, lng: -1.0232 },
  "australia": { flag: "\u{1F1E6}\u{1F1FA}", lat: -25.2744, lng: 133.7751 },
  "new zealand": { flag: "\u{1F1F3}\u{1F1FF}", lat: -40.9006, lng: 174.886 },
  "fiji": { flag: "\u{1F1EB}\u{1F1EF}", lat: -17.7134, lng: 178.065 },
  "maldives": { flag: "\u{1F1F2}\u{1F1FB}", lat: 3.2028, lng: 73.2207 },
  "mauritius": { flag: "\u{1F1F2}\u{1F1FA}", lat: -20.3484, lng: 57.5522 },
  "seychelles": { flag: "\u{1F1F8}\u{1F1E8}", lat: -4.6796, lng: 55.492 },
  "portugal": { flag: "\u{1F1F5}\u{1F1F9}", lat: 39.3999, lng: -8.2245 },
  "montenegro": { flag: "\u{1F1F2}\u{1F1EA}", lat: 42.7087, lng: 19.3744 },
  "slovenia": { flag: "\u{1F1F8}\u{1F1EE}", lat: 46.1512, lng: 14.9955 },
  "serbia": { flag: "\u{1F1F7}\u{1F1F8}", lat: 44.0165, lng: 21.0059 },
  "bulgaria": { flag: "\u{1F1E7}\u{1F1EC}", lat: 42.7339, lng: 25.4858 },
  "albania": { flag: "\u{1F1E6}\u{1F1F1}", lat: 41.1533, lng: 20.1683 },
  "malta": { flag: "\u{1F1F2}\u{1F1F9}", lat: 35.9375, lng: 14.3754 },
  "cyprus": { flag: "\u{1F1E8}\u{1F1FE}", lat: 35.1264, lng: 33.4299 },
  "panama": { flag: "\u{1F1F5}\u{1F1E6}", lat: 8.538, lng: -80.7821 },
  "jamaica": { flag: "\u{1F1EF}\u{1F1F2}", lat: 18.1096, lng: -77.2975 },
  "dominican republic": { flag: "\u{1F1E9}\u{1F1F4}", lat: 18.7357, lng: -70.1627 },
  "puerto rico": { flag: "\u{1F1F5}\u{1F1F7}", lat: 18.2208, lng: -66.5901 },
  "ecuador": { flag: "\u{1F1EA}\u{1F1E8}", lat: -1.8312, lng: -78.1834 },
  "uruguay": { flag: "\u{1F1FA}\u{1F1FE}", lat: -32.5228, lng: -55.7658 },
  "bolivia": { flag: "\u{1F1E7}\u{1F1F4}", lat: -16.2902, lng: -63.5887 },
  "guatemala": { flag: "\u{1F1EC}\u{1F1F9}", lat: 15.7835, lng: -90.2308 },
  "belize": { flag: "\u{1F1E7}\u{1F1FF}", lat: 17.1899, lng: -88.4976 },
};

interface TopDestinationsMapProps {
  recommendations: Recommendation[] | undefined;
  isLoading: boolean;
}

function extractCountry(destination: string): string | null {
  const parts = destination.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 1];
  }
  return destination;
}

function lookupCountry(name: string): { flag: string; lat: number; lng: number } | null {
  const normalized = name.toLowerCase().trim();
  if (COUNTRY_DATA[normalized]) return COUNTRY_DATA[normalized];

  for (const [key, data] of Object.entries(COUNTRY_DATA)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return data;
    }
  }
  return null;
}

export function TopDestinationsMap({ recommendations, isLoading }: TopDestinationsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const topCountries = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return [];

    const countryMap = new Map<string, CountryData>();

    recommendations.forEach((rec) => {
      const dest = rec.destination || rec.location;
      if (!dest) return;

      const countryName = extractCountry(dest);
      if (!countryName) return;

      const normalizedCountry = countryName.toLowerCase().trim();
      const existing = countryMap.get(normalizedCountry);

      if (existing) {
        existing.count++;
        if (rec.title && !existing.spots.includes(rec.title)) {
          existing.spots.push(rec.title);
        }
        if (!existing.destinations.includes(dest)) {
          existing.destinations.push(dest);
        }
      } else {
        const data = lookupCountry(countryName);
        if (!data) return;

        countryMap.set(normalizedCountry, {
          country: countryName,
          flag: data.flag,
          count: 1,
          spots: rec.title ? [rec.title] : [],
          destinations: [dest],
          lat: data.lat,
          lng: data.lng,
        });
      }
    });

    return Array.from(countryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [recommendations]);

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
        maxZoom: 8,
        attributionControl: false,
        scrollZoom: false,
      });

      newMap.on("load", () => setMapLoaded(true));

      newMap.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right"
      );

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

  useEffect(() => {
    if (!map.current || !mapLoaded || topCountries.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const mapRef = map.current;

    topCountries.forEach((c) => {
      const el = document.createElement("div");
      el.className = "destination-marker";
      el.innerHTML = `
        <span class="marker-flag">${c.flag}</span>
        <span class="marker-name">${c.country}</span>
        <span class="marker-count">${c.count}</span>
      `;

      const spotsPreview = c.spots.slice(0, 3).join(", ");
      const moreCount = c.spots.length > 3 ? ` +${c.spots.length - 3} more` : "";

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "mapbox-destination-popup",
      }).setHTML(
        `<div class="popup-content">
          <p class="popup-title">${c.flag} ${c.country}</p>
          <p class="popup-stats">${c.count} saved spot${c.count > 1 ? "s" : ""}</p>
          <p class="popup-spots">${spotsPreview}${moreCount}</p>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([c.lng, c.lat])
        .setPopup(popup)
        .addTo(mapRef);

      markersRef.current.push(marker);
    });

    if (topCountries.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      topCountries.forEach((c) => bounds.extend([c.lng, c.lat]));
      mapRef.fitBounds(bounds, { padding: 60, maxZoom: 4 });
    }
  }, [topCountries, mapLoaded]);

  if (mapError) {
    return (
      <Card className="border-border/60 shadow-none overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Top Destinations</CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Top Destinations</CardTitle>
          <span className="text-xs font-medium text-muted-foreground bg-accent/10 text-accent px-3 py-1 rounded-full">
            {topCountries.length} {topCountries.length === 1 ? "country" : "countries"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={mapContainer} className="h-[520px] rounded-b-lg overflow-hidden" />
        {(isLoading || !mapLoaded) && (
          <div className="absolute inset-0 h-[520px] bg-secondary animate-pulse rounded-b-lg" />
        )}
        {!isLoading && mapLoaded && topCountries.length === 0 && (
          <div className="absolute inset-0 h-[520px] flex items-center justify-center bg-secondary/30 rounded-b-lg">
            <p className="text-muted-foreground">Save some spots to see your top countries</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
