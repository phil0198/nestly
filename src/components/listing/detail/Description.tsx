"use client";

import { useState } from "react";
import { Icon } from "../../icons";
import { Modal } from "../../ui/Modal";

/** Description clamped to ~6 lines with a "Show more" modal, as on the reference listing page. */
export function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [intro, ...rest] = text.split("\n\n");
  return (
    <section className="border-b border-divider py-8">
      <p className="line-clamp-6 whitespace-pre-line text-base leading-6">{intro}</p>
      {rest.length > 0 && (
        <button type="button" onClick={() => setOpen(true)} className="mt-4 flex items-center gap-1 text-base font-semibold underline">
          Show more
          <Icon name="chevron-right" size={14} strokeWidth={2.5} />
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} width="max-w-[780px]" bodyClassName="px-6 pb-10 pt-2 sm:px-10">
        <h2 className="text-[26px] font-semibold leading-[30px] sm:text-[32px] sm:leading-9">About this space</h2>
        <div className="mt-6 space-y-6 text-base leading-6">
          {[intro, ...rest].map((para, i) => {
            const [first, ...lines] = para.split("\n");
            return lines.length ? (
              <div key={i}>
                <h3 className="mb-4 text-lg font-semibold">{first}</h3>
                <p className="whitespace-pre-line">{lines.join("\n")}</p>
              </div>
            ) : (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            );
          })}
        </div>
      </Modal>
    </section>
  );
}
