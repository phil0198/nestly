"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { DESTINATIONS, SUGGESTED_DESTINATIONS } from "@/lib/constants";
import { guestSummary } from "@/lib/search-params";
import { Icon } from "../icons";
import { Calendar } from "../ui/Calendar";
import { GuestPicker } from "../ui/GuestPicker";
import { formatRange, useSearchDraft } from "./useSearchDraft";
import { SearchGlyph } from "./DesktopSearch";

type Step = "where" | "when" | "who";

/** Phone search: a single pill that opens a full-screen sheet with stacked Where / When / Who cards. */
export function MobileSearchPill() {
  const { summary, draft, setDraft, submit, reset } = useSearchDraft();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("where");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const hasQuery = summary.where !== "Anywhere" || summary.when !== "Any week" || summary.who !== "Add guests";
  const q = draft.location.trim().toLowerCase();
  const matches = q ? DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q)) : SUGGESTED_DESTINATIONS.slice(1);

  const close = () => {
    setOpen(false);
    reset();
  };

  const card = "rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.12)]";
  const row = (label: string, value: string, s: Step) => (
    <button type="button" onClick={() => setStep(s)} className={cn(card, "flex w-full items-center justify-between px-5 py-5 text-sm animate-fade-in")}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </button>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep("where");
          setOpen(true);
        }}
        className="flex h-14 min-w-0 flex-1 items-center gap-4 rounded-full border border-[#EBEBEB]/60 bg-white pl-5 pr-4 text-left shadow-[0_3px_10px_rgba(0,0,0,0.1)]"
      >
        <SearchGlyph size={18} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{hasQuery ? summary.where : "Where to?"}</span>
          <span className="block truncate text-xs text-muted">
            {hasQuery ? `${summary.when} · ${summary.who}` : "Anywhere · Any week · Add guests"}
          </span>
        </span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex flex-col bg-faint animate-modal-in" role="dialog" aria-modal aria-label="Search">
            <div className="relative flex h-16 shrink-0 items-center justify-center">
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="absolute left-6 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-white"
              >
                <Icon name="close" size={14} strokeWidth={2.5} />
              </button>
              <span className="relative px-3 py-2 text-base font-semibold after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:bg-ink">
                Stays
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-4">
              {step === "where" ? (
                <div className={cn(card, "p-6 animate-fade-in")}>
                  <h2 className="text-[22px] font-extrabold leading-[26px]">Where to?</h2>
                  <label className="mt-5 flex h-14 items-center gap-3 rounded-xl border border-[#B0B0B0] px-4 focus-within:border-ink">
                    <SearchGlyph size={14} />
                    <input
                      autoFocus
                      value={draft.location}
                      onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                      placeholder="Search destinations"
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted"
                      onKeyDown={(e) => e.key === "Enter" && setStep("when")}
                    />
                  </label>
                  <ul className="mt-4">
                    {matches.map((d) => (
                      <li key={d.label}>
                        <button
                          type="button"
                          onClick={() => {
                            setDraft({ ...draft, location: d.query });
                            setStep("when");
                          }}
                          className="flex w-full items-center gap-4 py-2 text-left"
                        >
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EBEBEB]/70">
                            <Icon name={d.icon} size={20} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm">{d.label}</span>
                            <span className="block truncate text-xs text-muted">{d.sub}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                row("Where", draft.location || "I'm flexible", "where")
              )}

              {step === "when" ? (
                <div className={cn(card, "flex min-h-0 flex-col p-6 animate-fade-in")}>
                  <h2 className="text-[22px] font-extrabold leading-[26px]">When&rsquo;s your trip?</h2>
                  <div className="mt-4 grid grid-cols-7 border-b border-divider pb-2 text-center text-xs font-semibold text-muted">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                  <div className="-mx-2 mt-2 max-h-[46vh] overflow-y-auto px-2">
                    <Calendar
                      vertical
                      verticalCount={12}
                      cell={Math.min(48, Math.floor((typeof window !== "undefined" ? window.innerWidth - 72 : 320) / 7))}
                      checkIn={draft.checkIn}
                      checkOut={draft.checkOut}
                      onChange={(r) => setDraft({ ...draft, ...r })}
                      hideWeekdays
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-divider pt-4">
                    <button
                      type="button"
                      className="text-base font-semibold underline"
                      onClick={() => {
                        if (draft.checkIn) setDraft({ ...draft, checkIn: null, checkOut: null });
                        else setStep("who");
                      }}
                    >
                      {draft.checkIn ? "Reset" : "Skip"}
                    </button>
                    <button type="button" className="btn-dark !px-8 !py-3" onClick={() => setStep("who")}>
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                row("When", formatRange(draft.checkIn, draft.checkOut, "Add dates"), "when")
              )}

              {step === "who" ? (
                <div className={cn(card, "p-6 animate-fade-in")}>
                  <h2 className="text-[22px] font-extrabold leading-[26px]">Who&rsquo;s coming?</h2>
                  <GuestPicker compact value={draft.guests} onChange={(guests) => setDraft({ ...draft, guests })} />
                </div>
              ) : (
                row("Who", guestSummary(draft.guests, "Add guests"), "who")
              )}
            </div>

            <div className="flex h-[76px] shrink-0 items-center justify-between border-t border-hairline bg-white px-6">
              <button
                type="button"
                className="text-base font-semibold underline"
                onClick={() => setDraft({ location: "", checkIn: null, checkOut: null, guests: { adults: 0, children: 0, infants: 0, pets: 0 } })}
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => {
                  submit();
                  setOpen(false);
                }}
                className="btn-brand gap-2 !px-6"
              >
                <SearchGlyph size={16} />
                Search
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
