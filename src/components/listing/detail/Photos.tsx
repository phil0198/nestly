"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Chevron, Icon } from "../../icons";
import { HeartButton } from "../ListingCard";
import { ShareButton } from "./ShareButton";

function Img({ src, alt, className, onClick }: { src: string; alt: string; className?: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("group relative block h-full w-full overflow-hidden bg-[#EBEBEB]", className)}>
      <img
        src={src}
        alt={alt}
        onError={(e) => (e.currentTarget.style.visibility = "hidden")}
        className="h-full w-full object-cover text-transparent transition-[filter] duration-200 group-hover:brightness-[.85]"
      />
    </button>
  );
}

/** Full-screen single-photo viewer with keyboard navigation. */
function Lightbox({ images, index, onClose, onIndex }: { images: string[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(Math.min(images.length - 1, index + 1));
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onIndex]);

  return createPortal(
    <div className="fixed inset-0 z-[95] flex flex-col bg-black text-white animate-fade-in" role="dialog" aria-modal aria-label="Photo viewer">
      <div className="flex h-[72px] shrink-0 items-center justify-between px-6 sm:px-10">
        <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10">
          <Icon name="close" size={14} strokeWidth={2.5} />
          Close
        </button>
        <span className="text-sm">
          {index + 1} / {images.length}
        </span>
        <span className="w-[86px]" />
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-10 sm:px-24">
        <img key={images[index]} src={images[index]} alt="" className="max-h-full max-w-full object-contain animate-fade-in" />
        {index > 0 && (
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => onIndex(index - 1)}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 hover:bg-white/10 sm:left-10"
          >
            <Chevron dir="left" size={16} />
          </button>
        )}
        {index < images.length - 1 && (
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => onIndex(index + 1)}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/60 hover:bg-white/10 sm:right-10"
          >
            <Chevron dir="right" size={16} />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** "Show all photos" — vertical photo tour with a 1-2-1 mosaic, as on the reference site. */
function PhotoTour({ images, title, onClose, onOpen, listingId }: { images: string[]; title: string; onClose: () => void; onOpen: (i: number) => void; listingId: string }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: number[][] = [];
  for (let i = 0; i < images.length; ) {
    if (rows.length % 2 === 0) {
      rows.push([i]);
      i += 1;
    } else {
      rows.push(images[i + 1] ? [i, i + 1] : [i]);
      i += 2;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-white animate-modal-in" role="dialog" aria-modal aria-label={`Photos of ${title}`}>
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between bg-white px-4 sm:px-6">
        <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint">
          <Icon name="chevron-left" size={16} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-1">
          <ShareButton title={title} />
          <HeartButtonText listingId={listingId} image={images[0]} />
        </div>
      </div>
      <div className="mx-auto max-w-[740px] px-4 pb-16 pt-4 sm:px-6">
        <div className="flex flex-col gap-2">
          {rows.map((row, r) => (
            <div key={r} className={cn("grid gap-2", row.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
              {row.map((i) => (
                <div key={i} className={row.length === 2 ? "aspect-[4/5]" : "aspect-[3/2]"}>
                  <Img src={images[i]} alt={`Photo ${i + 1}`} onClick={() => onOpen(i)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function HeartButtonText({ listingId, image }: { listingId: string; image?: string }) {
  return (
    <span className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-faint">
      <HeartButton id={listingId} image={image} className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:!fill-[rgba(0,0,0,0)] [&_svg]:!stroke-ink [&[aria-pressed=true]_svg]:!fill-brand [&[aria-pressed=true]_svg]:!stroke-brand" />
      Save
    </span>
  );
}

export function PhotoGrid({ images, title, listingId }: { images: string[]; title: string; listingId: string }) {
  const [tour, setTour] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const router = useRouter();
  const openLightbox = useCallback((i: number) => setLightbox(i), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const closeTour = useCallback(() => setTour(false), []);

  return (
    <>
      {/* Desktop/tablet 1 + 4 mosaic */}
      <div className="relative hidden sm:block">
        <div className="grid h-[min(560px,45vw)] min-h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
          <div className="col-span-2 row-span-2">
            <Img src={images[0]} alt={title} onClick={() => setTour(true)} />
          </div>
          {images.slice(1, 5).map((src) => (
            <div key={src}>
              <Img src={src} alt="" onClick={() => setTour(true)} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTour(true)}
          className="absolute bottom-6 right-6 flex items-center gap-2 rounded-lg border border-ink bg-white px-4 py-[7px] text-sm font-semibold transition-transform hover:bg-faint active:scale-95"
        >
          <Icon name="grid" size={16} />
          Show all photos
        </button>
      </div>

      {/* Phone: swipeable full-bleed carousel with floating actions */}
      <div className="relative -mx-6 sm:hidden">
        <div
          className="scrollbar-none flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <div key={src} className="h-full w-full shrink-0 snap-center">
              <Img src={src} alt={i === 0 ? title : ""} onClick={() => setTour(true)} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
        >
          <Icon name="chevron-left" size={14} strokeWidth={2.5} />
        </button>
        <div className="absolute right-4 top-4 flex gap-3">
          <ShareButton title={title} round />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]">
            <HeartButton id={listingId} image={images[0]} className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:!fill-[rgba(0,0,0,0)] [&_svg]:!stroke-ink [&[aria-pressed=true]_svg]:!fill-brand [&[aria-pressed=true]_svg]:!stroke-brand" />
          </span>
        </div>
        <span className="absolute bottom-4 right-4 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          {mobileIndex + 1} / {images.length}
        </span>
      </div>

      {tour && <PhotoTour images={images} title={title} listingId={listingId} onClose={closeTour} onOpen={openLightbox} />}
      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={closeLightbox} onIndex={setLightbox} />}
    </>
  );
}

export { HeartButtonText };
