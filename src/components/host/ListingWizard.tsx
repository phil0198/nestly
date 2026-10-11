"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AMENITIES, CATEGORIES, DESTINATIONS, PROPERTY_TYPES, ROOM_TYPE_DESCRIPTIONS, ROOM_TYPES, type RoomType } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { samplePhotos } from "@/lib/photos";
import { Icon } from "../icons";
import { LogoMark } from "../Logo";
import { Stepper } from "../ui/Stepper";
import { useUI } from "../ui/UIContext";

const PinMap = dynamic(() => import("./PinMap").then((m) => m.PinMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

interface Draft {
  propertyType: string;
  roomType: RoomType | "";
  city: string;
  region: string;
  country: string;
  lat: number | null;
  lng: number | null;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  categories: string[];
  images: string[];
  title: string;
  description: string;
  price: number;
}

const EMPTY: Draft = {
  propertyType: "",
  roomType: "",
  city: "",
  region: "",
  country: "",
  lat: null,
  lng: null,
  guests: 4,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  amenities: [],
  categories: [],
  images: [],
  title: "",
  description: "",
  price: 120,
};

const QUICK_PLACES: Record<string, { lat: number; lng: number; city: string; region: string; country: string }> = {
  Malibu: { lat: 34.0259, lng: -118.7798, city: "Malibu", region: "California", country: "United States" },
  "Lake Tahoe": { lat: 39.0968, lng: -120.0324, city: "Lake Tahoe", region: "California", country: "United States" },
  Lisbon: { lat: 38.7223, lng: -9.1393, city: "Lisbon", region: "Lisbon District", country: "Portugal" },
  Kyoto: { lat: 35.0116, lng: 135.7681, city: "Kyoto", region: "Kyoto Prefecture", country: "Japan" },
  Ubud: { lat: -8.5069, lng: 115.2625, city: "Ubud", region: "Bali", country: "Indonesia" },
  Santorini: { lat: 36.4167, lng: 25.4318, city: "Santorini", region: "South Aegean", country: "Greece" },
  Banff: { lat: 51.1784, lng: -115.5708, city: "Banff", region: "Alberta", country: "Canada" },
  Tulum: { lat: 20.2114, lng: -87.4654, city: "Tulum", region: "Quintana Roo", country: "Mexico" },
};

type StepId =
  | "intro"
  | "step1"
  | "type"
  | "room"
  | "location"
  | "basics"
  | "step2"
  | "amenities"
  | "photos"
  | "title"
  | "description"
  | "step3"
  | "categories"
  | "price"
  | "review";

const STEPS: { id: StepId; phase: 0 | 1 | 2 | 3 }[] = [
  { id: "intro", phase: 0 },
  { id: "step1", phase: 1 },
  { id: "type", phase: 1 },
  { id: "room", phase: 1 },
  { id: "location", phase: 1 },
  { id: "basics", phase: 1 },
  { id: "step2", phase: 2 },
  { id: "amenities", phase: 2 },
  { id: "photos", phase: 2 },
  { id: "title", phase: 2 },
  { id: "description", phase: 2 },
  { id: "step3", phase: 3 },
  { id: "categories", phase: 3 },
  { id: "price", phase: 3 },
  { id: "review", phase: 3 },
];

const STORAGE_KEY = "nestly:listing-draft";

function StepIntro({ n, title, body, art }: { n: number; title: string; body: string; art: string }) {
  return (
    <div className="mx-auto grid max-w-[1120px] items-center gap-10 md:grid-cols-2 md:gap-12">
      <div className="animate-fade-in">
        <div className="text-lg font-semibold">Step {n}</div>
        <h1 className="mt-4 text-[32px] font-semibold leading-9 sm:text-[48px] sm:leading-[54px]">{title}</h1>
        <p className="mt-6 text-lg leading-7">{body}</p>
      </div>
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-light to-white text-brand">
        <Icon name={art} size={160} strokeWidth={0.9} />
      </div>
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-[26px] font-semibold leading-[30px] sm:text-[32px] sm:leading-9">{title}</h1>
      {sub && <p className="mt-2 text-lg text-muted">{sub}</p>}
    </div>
  );
}

function Choice({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-xl border text-left transition-[transform,border-color,background] duration-150 active:scale-[0.97]",
        selected ? "border-[2px] border-ink bg-faint" : "border-hairline hover:border-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ListingWizard() {
  const router = useRouter();
  const { status } = useSession();
  const { openAuth } = useUI();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [center, setCenter] = useState<[number, number, number] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Restore / persist the draft so "Save & exit" means something.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { draft: Draft; step: number };
        setDraft({ ...EMPTY, ...saved.draft });
        setStep(Math.min(saved.step ?? 0, STEPS.length - 1));
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, step }));
    } catch {
      /* ignore */
    }
  }, [draft, step, loaded]);

  useEffect(() => {
    if (status === "unauthenticated") openAuth("login");
  }, [status, openAuth]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (key: "amenities" | "categories", v: string, max = 99) =>
    setDraft((d) => {
      const list = d[key];
      if (list.includes(v)) return { ...d, [key]: list.filter((x) => x !== v) };
      if (list.length >= max) return d;
      return { ...d, [key]: [...list, v] };
    });

  const current = STEPS[step];

  const canNext = (() => {
    switch (current.id) {
      case "type":
        return !!draft.propertyType;
      case "room":
        return !!draft.roomType;
      case "location":
        return draft.lat != null && !!draft.city.trim() && !!draft.country.trim();
      case "photos":
        return draft.images.length >= 5;
      case "title":
        return draft.title.trim().length >= 3;
      case "description":
        return draft.description.trim().length >= 20;
      case "categories":
        return draft.categories.length >= 1;
      case "price":
        return draft.price >= 10;
      default:
        return true;
    }
  })();

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    if (status === "loading") return;
    if (status !== "authenticated") return openAuth("login");
    setUploading(true);
    setError(null);
    const form = new FormData();
    list.forEach((f) => form.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { urls?: string[]; error?: string };
    setUploading(false);
    if (!res.ok || !data.urls) return setError(data.error ?? "Upload failed.");
    setDraft((d) => ({ ...d, images: [...d.images, ...data.urls!] }));
  }

  function useSamplePhotos() {
    const fresh = samplePhotos(Math.floor(Math.random() * 1000)).filter((u) => !draft.images.includes(u));
    set({ images: [...draft.images, ...fresh] });
  }

  async function publish() {
    if (status === "loading") return;
    if (status !== "authenticated") return openAuth("login");
    setPublishing(true);
    setError(null);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = (await res.json()) as { id?: string; error?: string };
    if (!res.ok || !data.id) {
      setPublishing(false);
      return setError(data.error ?? "Couldn't publish your listing.");
    }
    localStorage.removeItem(STORAGE_KEY);
    router.push(`/host/listings?published=${data.id}`);
    router.refresh();
  }

  function next() {
    setError(null);
    if (current.id === "review") return void publish();
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0 });
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  // Progress: three bars, each filling across its phase's steps.
  const phaseProgress = [1, 2, 3].map((p) => {
    const ids = STEPS.map((s, i) => ({ ...s, i })).filter((s) => s.phase === p);
    const done = ids.filter((s) => s.i < step).length;
    return Math.min(1, done / ids.length);
  });

  const body = (() => {
    switch (current.id) {
      case "intro":
        return (
          <div className="mx-auto grid max-w-[1120px] gap-12 md:grid-cols-2 md:items-center">
            <h1 className="text-[32px] font-semibold leading-9 sm:text-[48px] sm:leading-[54px]">Share your place with Nestly in three easy steps</h1>
            <ol className="divide-y divide-divider">
              {[
                ["Tell us about your place", "The basics: what kind of home it is, where it is and how many guests it fits."],
                ["Make it stand out", "Add at least five photos, a title and a description — we'll guide you."],
                ["Finish up and publish", "Choose categories, set a nightly price and go live."],
              ].map(([t, b], i) => (
                <li key={t} className="flex gap-4 py-8 first:pt-0">
                  <span className="text-[22px] font-semibold">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-[22px] font-semibold leading-[26px]">{t}</div>
                    <p className="mt-2 text-lg text-muted">{b}</p>
                  </div>
                  <Icon name={["home", "photos", "check-circle"][i]} size={56} strokeWidth={1} className="shrink-0 text-brand" />
                </li>
              ))}
            </ol>
          </div>
        );
      case "step1":
        return <StepIntro n={1} title="Tell us about your place" body="We'll ask what type of property you have, whether guests get the whole place or a room, where it is and how many people it sleeps." art="home" />;
      case "type":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Which best describes your place?" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PROPERTY_TYPES.map((p) => (
                <Choice key={p.id} selected={draft.propertyType === p.id} onClick={() => set({ propertyType: p.id })} className="flex h-[100px] flex-col justify-between p-4">
                  <Icon name={p.icon} size={32} />
                  <span className="text-base font-semibold">{p.id}</span>
                </Choice>
              ))}
            </div>
          </div>
        );
      case "room":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="What type of place will guests have?" />
            <div className="space-y-3">
              {ROOM_TYPES.map((r) => (
                <Choice key={r} selected={draft.roomType === r} onClick={() => set({ roomType: r })} className="flex w-full items-center justify-between gap-4 p-6">
                  <span>
                    <span className="block text-lg font-semibold">{r === "Entire home" ? "An entire place" : r === "Private room" ? "A room" : "A shared room"}</span>
                    <span className="block text-sm text-muted">{ROOM_TYPE_DESCRIPTIONS[r]}</span>
                  </span>
                  <Icon name={r === "Entire home" ? "home" : r === "Private room" ? "door" : "users"} size={32} />
                </Choice>
              ))}
            </div>
          </div>
        );
      case "location":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Where's your place located?" sub="Click the map to drop a pin. Your exact address is only shared with guests after they book." />
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.keys(QUICK_PLACES).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    const p = QUICK_PLACES[k];
                    set({ city: p.city, region: p.region, country: p.country, lat: p.lat, lng: p.lng });
                    setCenter([p.lat, p.lng, 13]);
                  }}
                  className="rounded-full border border-hairline px-4 py-2 text-sm hover:border-ink"
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="h-[340px] overflow-hidden rounded-2xl sm:h-[420px]">
              <PinMap lat={draft.lat} lng={draft.lng} center={center} onChange={(lat, lng) => set({ lat, lng })} />
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-[#B0B0B0]">
              {(
                [
                  ["city", "City / town"],
                  ["region", "State / province / region"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label], i) => (
                <label key={key} className={cn("block px-3 pb-2 pt-2 focus-within:shadow-ring", i > 0 && "border-t border-[#B0B0B0]")}>
                  <span className="block text-xs text-muted">{label}</span>
                  <input value={draft[key]} onChange={(e) => set({ [key]: e.target.value })} className="w-full text-base outline-none" list={key === "city" ? "cities" : undefined} />
                </label>
              ))}
              <datalist id="cities">
                {DESTINATIONS.map((d) => (
                  <option key={d.label} value={d.query} />
                ))}
              </datalist>
            </div>
            {draft.lat == null && <p className="mt-2 text-sm text-muted">Drop a pin on the map to continue.</p>}
          </div>
        );
      case "basics":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Share some basics about your place" sub="You can add more details later, like bed types." />
            <div className="divide-y divide-divider">
              {(
                [
                  ["guests", "Guests", 1, 16],
                  ["bedrooms", "Bedrooms", 0, 20],
                  ["beds", "Beds", 1, 30],
                ] as const
              ).map(([key, label, min, max]) => (
                <div key={key} className="flex items-center justify-between py-6">
                  <span className="text-lg">{label}</span>
                  <Stepper value={draft[key]} min={min} max={max} label={label.toLowerCase()} onChange={(n) => set({ [key]: n })} />
                </div>
              ))}
              <div className="flex items-center justify-between py-6">
                <span className="text-lg">Bathrooms</span>
                <div className="flex items-center gap-4">
                  <Stepper value={draft.baths * 2} min={1} max={40} label="bathrooms" onChange={(n) => set({ baths: n / 2 })} />
                  <span className="w-10 text-sm text-muted">{draft.baths}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "step2":
        return <StepIntro n={2} title="Make your place stand out" body="Add the amenities you offer, at least five photos, and a title and description that capture what makes it special." art="photos" />;
      case "amenities":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Tell guests what your place has to offer" sub="You can add more amenities after you publish." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AMENITIES.map((a) => (
                <Choice key={a.id} selected={draft.amenities.includes(a.id)} onClick={() => toggle("amenities", a.id)} className="flex h-[100px] flex-col justify-between p-4">
                  <Icon name={a.icon} size={30} />
                  <span className="text-sm font-semibold leading-4">{a.label}</span>
                </Choice>
              ))}
            </div>
          </div>
        );
      case "photos":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading
              title={draft.images.length ? "Ta-da! How does this look?" : "Add some photos of your place"}
              sub={draft.images.length ? "Drag in more photos or remove ones you don't love. The first photo is your cover." : "You'll need at least 5 photos to get started. You can add more or make changes later."}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) void upload(e.target.files);
                e.target.value = "";
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void upload(e.dataTransfer.files);
              }}
            >
              {draft.images.length === 0 ? (
                <div className={cn("flex h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed bg-faint", dragOver ? "border-ink" : "border-[#B0B0B0]")}>
                  <Icon name="camera" size={64} strokeWidth={1} />
                  <div className="mt-4 text-[22px] font-semibold">Drag your photos here</div>
                  <div className="mt-1 text-base">Choose at least 5 photos</div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="mt-6 text-base font-semibold underline">
                    {uploading ? "Uploading…" : "Upload from your device"}
                  </button>
                  <button type="button" onClick={useSamplePhotos} className="mt-3 text-sm text-muted underline">
                    or use 5 sample photos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {draft.images.map((src, i) => (
                    <div key={src} className={cn("group relative overflow-hidden rounded-xl bg-[#EBEBEB]", i === 0 ? "col-span-2 aspect-[3/2]" : "aspect-square")}>
                      <img src={src} alt="" className="h-full w-full object-cover text-transparent" />
                      {i === 0 && <span className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-sm font-semibold shadow">Cover photo</span>}
                      <div className="absolute right-3 top-3 flex gap-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => set({ images: [src, ...draft.images.filter((x) => x !== src)] })}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow"
                          >
                            Make cover
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label="Remove photo"
                          onClick={() => set({ images: draft.images.filter((x) => x !== src) })}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={cn("flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed", dragOver ? "border-ink bg-faint" : "border-[#B0B0B0]")}
                  >
                    <Icon name="plus" size={32} />
                    <span className="mt-2 text-base font-semibold">{uploading ? "Uploading…" : "Add more"}</span>
                  </button>
                </div>
              )}
            </div>
            {draft.images.length > 0 && draft.images.length < 5 && (
              <p className="mt-4 text-sm text-muted">
                Add {5 - draft.images.length} more photo{5 - draft.images.length === 1 ? "" : "s"} to continue ·{" "}
                <button type="button" onClick={useSamplePhotos} className="underline">
                  use sample photos
                </button>
              </p>
            )}
          </div>
        );
      case "title":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title={`Now, let's give your ${draft.propertyType.toLowerCase() || "place"} a title`} sub="Short titles work best. Have fun with it — you can always change it later." />
            <textarea
              value={draft.title}
              maxLength={32}
              rows={3}
              onChange={(e) => set({ title: e.target.value })}
              className="field-input resize-none !text-[22px] font-semibold"
              autoFocus
            />
            <div className="mt-2 text-sm font-semibold text-muted">{draft.title.length}/32</div>
          </div>
        );
      case "description":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Create your description" sub="Share what makes your place special." />
            <textarea value={draft.description} maxLength={2000} rows={8} onChange={(e) => set({ description: e.target.value })} className="field-input resize-none" autoFocus />
            <div className="mt-2 text-sm font-semibold text-muted">{draft.description.length}/2000</div>
          </div>
        );
      case "step3":
        return <StepIntro n={3} title="Finish up and publish" body="Pick the categories guests will find you in, set your nightly price, then review everything and publish." art="check-circle" />;
      case "categories":
        return (
          <div className="mx-auto max-w-[640px]">
            <Heading title="Where should guests discover you?" sub="Choose up to 3 categories for the browse page." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <Choice key={c.slug} selected={draft.categories.includes(c.slug)} onClick={() => toggle("categories", c.slug, 3)} className="flex h-[90px] flex-col justify-between p-4">
                  <Icon name={c.icon} size={28} />
                  <span className="text-sm font-semibold">{c.label}</span>
                </Choice>
              ))}
            </div>
          </div>
        );
      case "price":
        return (
          <div className="mx-auto max-w-[640px] text-center">
            <Heading title="Now, set your price" sub="You can change it anytime." />
            <div className="flex items-center justify-center gap-6">
              <Stepper value={draft.price} min={10} max={10000} label="price" onChange={(n) => set({ price: n })} />
            </div>
            <label className="mt-8 flex items-center justify-center text-[64px] font-extrabold leading-none tracking-tight sm:text-[96px]">
              <span>$</span>
              <input
                inputMode="numeric"
                value={draft.price}
                onChange={(e) => set({ price: Math.min(10000, Number(e.target.value.replace(/\D/g, "")) || 0) })}
                className="w-[4ch] bg-transparent text-left outline-none"
                style={{ width: `${Math.max(2, String(draft.price).length)}ch` }}
                aria-label="Nightly price"
              />
            </label>
            <p className="mt-4 text-base text-muted">per night · guests see about ${Math.round(draft.price * 1.14)} including the service fee</p>
          </div>
        );
      case "review":
        return (
          <div className="mx-auto max-w-[900px]">
            <Heading title="Review your listing" sub="Here's what guests will see. Make sure everything looks good." />
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-2xl p-4 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <div className="aspect-square overflow-hidden rounded-xl bg-[#EBEBEB]">
                  {draft.images[0] && <img src={draft.images[0]} alt="" className="h-full w-full object-cover text-transparent" />}
                </div>
                <div className="mt-4 flex justify-between text-base">
                  <span className="font-semibold">{draft.title || "Untitled"}</span>
                  <span>
                    New <Icon name="star" size={12} className="inline" />
                  </span>
                </div>
                <div className="text-base">
                  <span className="font-semibold">${draft.price}</span> night
                </div>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold">What&rsquo;s next?</h2>
                <ul className="mt-6 space-y-6">
                  <li className="flex gap-4">
                    <Icon name="check-circle" size={32} className="shrink-0" />
                    <div>
                      <div className="text-lg font-semibold">Goes live instantly</div>
                      <div className="text-base text-muted">Your place appears in browse and search right after publishing.</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Icon name="calendar" size={32} className="shrink-0" />
                    <div>
                      <div className="text-lg font-semibold">Track reservations</div>
                      <div className="text-base text-muted">See every booking under Host reservations.</div>
                    </div>
                  </li>
                </ul>
                <dl className="mt-8 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted">Type</dt><dd>{draft.propertyType} · {draft.roomType}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Location</dt><dd>{[draft.city, draft.country].filter(Boolean).join(", ")}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Basics</dt><dd>{draft.guests} guests · {draft.bedrooms} bedrooms · {draft.beds} beds · {draft.baths} baths</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Photos</dt><dd>{draft.images.length}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Amenities</dt><dd>{draft.amenities.length}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        );
    }
  })();

  const isLast = current.id === "review";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="flex h-[88px] shrink-0 items-center justify-between px-6 sm:px-12">
        <Link href="/" aria-label="Nestly home" className="text-ink">
          <LogoMark size={32} />
        </Link>
        <div className="flex gap-3">
          <Link href="/help" className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold hover:border-ink">
            Questions?
          </Link>
          <Link href={status === "authenticated" ? "/host/listings" : "/"} className="rounded-full border border-hairline px-4 py-2 text-xs font-semibold hover:border-ink">
            Save &amp; exit
          </Link>
        </div>
      </header>

      <main key={current.id} className="flex flex-1 items-start px-6 pb-36 pt-4 animate-fade-in sm:items-center sm:px-12">
        <div className="w-full">{body}</div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 bg-white">
        <div className="grid grid-cols-3 gap-2">
          {phaseProgress.map((p, i) => (
            <div key={i} className="h-1.5 bg-[#EBEBEB]">
              <div className="h-full bg-ink transition-[width] duration-500 ease-abnb" style={{ width: `${p * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex h-[80px] items-center justify-between px-6 sm:px-12">
          {step > 0 ? (
            <button type="button" onClick={back} className="-ml-2.5 rounded-lg px-2.5 py-2.5 text-base font-semibold underline hover:bg-faint">
              Back
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {error && <span className="hidden max-w-[320px] text-sm text-[#C13515] sm:inline">{error}</span>}
            <button
              type="button"
              onClick={next}
              disabled={!canNext || publishing}
              className={cn(isLast || step === 0 ? "btn-brand" : "btn-dark", "!px-8")}
            >
              {step === 0 ? "Get started" : isLast ? (publishing ? "Publishing…" : "Publish") : "Next"}
            </button>
          </div>
        </div>
        {error && <p className="px-6 pb-3 text-sm text-[#C13515] sm:hidden">{error}</p>}
      </footer>
    </div>
  );
}
