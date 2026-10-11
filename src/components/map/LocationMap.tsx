"use client";

import { useEffect, useRef } from "react";
import { OSM_ATTRIBUTION, OSM_TILES } from "./SearchMap";

/** Small map with a soft circle marking the approximate location (exact address shared after booking). */
export function LocationMap({ lat, lng, zoom = 13 }: { lat: number; lng: number; zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: false }).setView([lat, lng], zoom);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer(OSM_TILES, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      L.marker([lat, lng], {
        interactive: false,
        icon: L.divIcon({
          className: "nestly-home-pin",
          iconSize: [0, 0],
          html: '<div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5"/></svg></div>',
        }),
      }).addTo(map);
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lng, zoom]);
  return <div ref={ref} className="h-full w-full [&_.leaflet-tile-pane]:saturate-[.75]" />;
}
