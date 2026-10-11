"use client";

import { useState } from "react";
import { AMENITIES, AMENITY_GROUPS } from "@/lib/constants";
import { Icon } from "../../icons";
import { Modal } from "../../ui/Modal";

const SAFETY_IDS = ["smoke-alarm", "co-alarm"];

export function Amenities({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState(false);
  const have = new Set(ids);
  // Show what's present first, then safety items that are missing (struck through) like the reference.
  const present = AMENITIES.filter((a) => have.has(a.id));
  const missingSafety = AMENITIES.filter((a) => SAFETY_IDS.includes(a.id) && !have.has(a.id));
  const preview = [...present.slice(0, 10 - missingSafety.length), ...missingSafety].slice(0, 10);

  return (
    <section className="border-b border-divider py-12">
      <h2 className="text-[22px] font-semibold leading-[26px]">What this place offers</h2>
      <div className="mt-6 grid gap-x-8 sm:grid-cols-2">
        {preview.map((a) => {
          const missing = !have.has(a.id);
          return (
            <div key={a.id} className="flex items-center gap-4 pb-4 text-base">
              <Icon name={a.icon} size={24} />
              <span className={missing ? "line-through" : ""}>{a.label}</span>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => setOpen(true)} className="btn-outline mt-6 !px-6 !py-[13px]">
        Show all {present.length} amenities
      </button>
      <Modal open={open} onClose={() => setOpen(false)} width="max-w-[780px]" bodyClassName="px-6 pb-8 sm:px-10">
        <h2 className="mb-6 pt-2 text-[26px] font-semibold leading-[30px]">What this place offers</h2>
        {AMENITY_GROUPS.map((group) => {
          const items = present.filter((a) => a.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="pb-6">
              <h3 className="pb-4 pt-6 text-lg font-semibold">{group}</h3>
              {items.map((a) => (
                <div key={a.id} className="flex items-center gap-4 border-b border-divider py-6 text-base last:border-0">
                  <Icon name={a.icon} size={28} />
                  {a.label}
                </div>
              ))}
            </div>
          );
        })}
        {missingSafety.length > 0 && (
          <div>
            <h3 className="pb-4 pt-6 text-lg font-semibold">Not included</h3>
            {missingSafety.map((a) => (
              <div key={a.id} className="flex items-center gap-4 border-b border-divider py-6 text-base last:border-0">
                <Icon name={a.icon} size={28} />
                <span className="line-through">{a.label}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </section>
  );
}
