"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { OSM_ATTRIBUTION, OSM_TILES } from "../map/SearchMap";

/** Map where the host clicks (or drags the pin) to set the listing location. */
export function PinMap({
  lat,
  lng,
  onChange,
  center,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  /** When this changes, recentre (e.g. after choosing a quick-pick city). */
  center: [number, number, number] | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { zoomControl: false }).setView(lat != null && lng != null ? [lat, lng] : [25, 0], lat != null ? 13 : 2);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer(OSM_TILES, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      const icon = L.divIcon({
        className: "nestly-home-pin",
        iconSize: [0, 0],
        html: '<div><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5"/></svg></div>',
      });
      const place = (la: number, ln: number) => {
        if (!markerRef.current) {
          markerRef.current = L.marker([la, ln], { icon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const p = markerRef.current!.getLatLng();
            cb.current(p.lat, p.lng);
          });
        } else markerRef.current.setLatLng([la, ln]);
      };
      if (lat != null && lng != null) place(lat, lng);
      map.on("click", (e) => {
        place(e.latlng.lat, e.latlng.lng);
        cb.current(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (center && mapRef.current) mapRef.current.setView([center[0], center[1]], center[2]);
  }, [center]);

  useEffect(() => {
    if (lat != null && lng != null && markerRef.current) markerRef.current.setLatLng([lat, lng]);
  }, [lat, lng]);

  return <div ref={ref} className="h-full w-full [&_.leaflet-tile-pane]:saturate-[.75]" />;
}
