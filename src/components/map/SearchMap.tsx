"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { ListingCardData } from "@/lib/listings";
import { formatMoney } from "@/lib/pricing";
import { cn, formatRating } from "@/lib/utils";
import { Icon, StarSolid } from "../icons";
import { HeartButton, ImageCarousel } from "../listing/ListingCard";

export const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface SearchMapProps {
  listings: ListingCardData[];
  hoveredId: string | null;
  /** Called with [south, west, north, east] after the user pans/zooms. */
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  /** Keep current viewport instead of fitting to results (true after a map-driven search). */
  keepViewport?: boolean;
  nights?: number;
  className?: string;
}

function pinHtml(price: number) {
  return `<div>${formatMoney(price)}</div>`;
}

export function SearchMap({ listings, hoveredId, onBoundsChange, keepViewport, nights = 0, className }: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const userMoved = useRef(false);
  const programmatic = useRef(false);
  const lastFit = useRef<[number, number][] | null>(null);
  const boundsCb = useRef(onBoundsChange);
  boundsCb.current = onBoundsChange;
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [searchOnMove, setSearchOnMove] = useState(true);
  const searchOnMoveRef = useRef(searchOnMove);
  searchOnMoveRef.current = searchOnMove;

  // ---- Init map once ----
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: true,
        worldCopyJump: true,
      }).setView([30, 0], 2);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.tileLayer(OSM_TILES, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      map.on("dragstart", () => {
        programmatic.current = false;
        userMoved.current = true;
      });
      map.on("zoomstart", () => {
        // Only user gestures count as "moved"; fitBounds runs with `programmatic` set.
        if (!programmatic.current) userMoved.current = true;
      });
      map.on("click", () => setSelected(null));
      let t: ReturnType<typeof setTimeout>;
      map.on("moveend", () => {
        if (programmatic.current) {
          programmatic.current = false;
          return;
        }
        if (!userMoved.current || !searchOnMoveRef.current) return;
        clearTimeout(t);
        t = setTimeout(() => {
          const b = map.getBounds();
          boundsCb.current?.([b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]);
          userMoved.current = false;
        }, 350);
      });
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
    };
  }, []);

  // Re-measure when the container size changes (map toggles on mobile).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let wasEmpty = el.clientWidth === 0 || el.clientHeight === 0;
    const ro = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map) return;
      map.invalidateSize();
      const empty = el.clientWidth === 0 || el.clientHeight === 0;
      // A map that was hidden (mobile list view) fitted to a 0×0 box; refit once it becomes visible.
      if (wasEmpty && !empty && lastFit.current?.length) {
        programmatic.current = true;
        map.fitBounds(lastFit.current, { padding: [60, 60], maxZoom: 13, animate: false });
      }
      wasEmpty = empty;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- Sync markers with listings ----
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (cancelled || !map) return;
      const existing = markersRef.current;
      const ids = new Set(listings.map((l) => l.id));
      for (const [id, m] of existing) {
        if (!ids.has(id)) {
          m.remove();
          existing.delete(id);
        }
      }
      for (const l of listings) {
        const price = nights > 0 ? l.price * nights : l.price;
        let m = existing.get(l.id);
        const icon = L.divIcon({ className: "nestly-pin", html: pinHtml(price), iconSize: [0, 0] });
        if (!m) {
          m = L.marker([l.lat, l.lng], { icon, riseOnHover: true, keyboard: true, title: l.title });
          m.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            setSelected(l.id);
            setVisited((v) => new Set(v).add(l.id));
          });
          m.addTo(map);
          existing.set(l.id, m);
        } else {
          m.setIcon(icon);
        }
      }
      if (listings.length && !keepViewport) {
        const points = listings.map((l) => [l.lat, l.lng] as [number, number]);
        lastFit.current = points;
        const bounds = L.latLngBounds(points);
        userMoved.current = false;
        programmatic.current = true;
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13, animate: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listings, ready, keepViewport, nights]);

  // ---- Pin state classes ----
  useEffect(() => {
    for (const [id, m] of markersRef.current) {
      const el = m.getElement();
      if (!el) continue;
      el.classList.toggle("is-hover", id === hoveredId);
      el.classList.toggle("is-active", id === selected);
      el.classList.toggle("is-visited", visited.has(id));
      m.setZIndexOffset(id === hoveredId || id === selected ? 1000 : 0);
    }
  }, [hoveredId, selected, visited, listings]);

  // ---- Mini card positioning ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) {
      setPopupPos(null);
      return;
    }
    const l = listings.find((x) => x.id === selected);
    if (!l) return;
    const update = () => {
      const p = map.latLngToContainerPoint([l.lat, l.lng]);
      setPopupPos({ x: p.x, y: p.y });
    };
    update();
    map.on("move zoom", update);
    return () => {
      map.off("move zoom", update);
    };
  }, [selected, listings]);

  const sel = listings.find((l) => l.id === selected);
  const container = containerRef.current;
  let cardStyle: React.CSSProperties | undefined;
  if (popupPos && container) {
    const W = Math.min(327, container.clientWidth - 24);
    const H = 330;
    const left = Math.min(Math.max(12, popupPos.x - W / 2), container.clientWidth - W - 12);
    const above = popupPos.y - H - 24 > 12;
    const top = above ? popupPos.y - H - 24 : Math.min(popupPos.y + 24, container.clientHeight - H - 12);
    cardStyle = { left, top: Math.max(12, top), width: W };
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div ref={containerRef} className="h-full w-full [&_.leaflet-tile-pane]:saturate-[.75]" />
      {onBoundsChange && (
        <button
          type="button"
          onClick={() => setSearchOnMove((s) => !s)}
          className="absolute left-1/2 top-6 z-[500] flex h-10 -translate-x-1/2 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
        >
          <span className={cn("flex h-4 w-4 items-center justify-center rounded border", searchOnMove ? "border-ink bg-ink text-white" : "border-[#B0B0B0]")}>
            {searchOnMove && <Icon name="check" size={10} strokeWidth={3.5} />}
          </span>
          Search as I move the map
        </button>
      )}
      {sel && cardStyle && (
        <div className="absolute z-[600] overflow-hidden rounded-xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.2)] animate-pop-in" style={cardStyle}>
          <a href={`/rooms/${sel.id}`} target="_blank" rel="noreferrer" className="block">
            <ImageCarousel images={sel.images} alt={sel.title} rounded="rounded-none" aspect="aspect-[327/212]" />
            <div className="p-4 text-[15px] leading-[19px]">
              <div className="flex justify-between gap-2">
                <span className="truncate font-semibold">
                  {sel.propertyType} in {sel.city}
                </span>
                {sel.reviewCount > 0 && (
                  <span className="flex shrink-0 items-center gap-1">
                    <StarSolid size={12} />
                    {formatRating(sel.ratingAvg)} ({sel.reviewCount})
                  </span>
                )}
              </div>
              <div className="truncate text-muted">{sel.title}</div>
              <div className="mt-1">
                <span className="font-semibold">{formatMoney(nights > 0 ? sel.price * nights : sel.price)}</span>
                {nights > 0 ? ` for ${nights} nights` : " night"}
              </div>
            </div>
          </a>
          <div className="absolute right-3 top-3 flex gap-2">
            <HeartButton id={sel.id} image={sel.images[0]} />
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSelected(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:scale-105"
            >
              <Icon name="close" size={12} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
