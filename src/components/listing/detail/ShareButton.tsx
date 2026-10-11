"use client";

import { useState } from "react";
import { Icon } from "../../icons";
import { Modal } from "../../ui/Modal";
import { useToast } from "../../ui/Toast";

export function ShareButton({ title, image, subtitle, round }: { title: string; image?: string; subtitle?: string; round?: boolean }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const url = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be unavailable */
    }
    toast("Link copied");
  }

  const options = [
    { label: "Copy Link", icon: "edit", action: copy },
    { label: "Email", icon: "message", action: () => (window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`) },
    { label: "Messages", icon: "message", action: () => (window.location.href = `sms:?&body=${encodeURIComponent(url)}`) },
    { label: "More options", icon: "dots", action: () => navigator.share?.({ title, url }).catch(() => {}) },
  ];

  return (
    <>
      {round ? (
        <button
          type="button"
          aria-label="Share"
          onClick={() => setOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
        >
          <Icon name="share" size={16} strokeWidth={2} />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-faint">
          <Icon name="share" size={16} strokeWidth={2} />
          Share
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} bare width="max-w-[568px]" bodyClassName="px-6 pb-6 pt-16">
        <h2 className="text-[26px] font-semibold leading-[30px]">Share this place</h2>
        <div className="mt-6 flex items-center gap-4">
          {image && <img src={image} alt="" className="h-16 w-16 rounded-lg object-cover" />}
          <div className="text-base">
            <div className="font-semibold">{title}</div>
            {subtitle && <div className="text-muted">{subtitle}</div>}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => {
                o.action();
                setOpen(false);
              }}
              className="flex items-center gap-4 rounded-xl border border-hairline p-5 text-base font-semibold hover:bg-faint"
            >
              <Icon name={o.icon} size={24} />
              {o.label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
