"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ListingCardData } from "@/lib/listings";
import { Icon } from "../icons";
import { Modal } from "../ui/Modal";
import { ListingCard } from "./ListingCard";
import { useWishlist } from "./WishlistContext";

const SearchMap = dynamic(() => import("../map/SearchMap").then((m) => m.SearchMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});

export function WishlistDetail({ id, name, listings }: { id: string; name: string; listings: ListingCardData[] }) {
  const router = useRouter();
  const { refresh } = useWishlist();
  const [hovered, setHovered] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [title, setTitle] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function rename() {
    await fetch(`/api/wishlists/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: title }) });
    setSettings(false);
    void refresh();
    router.refresh();
  }
  async function remove() {
    await fetch(`/api/wishlists/${id}`, { method: "DELETE" });
    void refresh();
    router.push("/wishlists");
    router.refresh();
  }

  return (
    <div className="lg:flex">
      <main className="page-gutter min-h-[70vh] pb-24 pt-8 lg:w-[58%] xl:w-[60%]">
        <div className="flex items-center justify-between">
          <Link href="/wishlists" aria-label="Back to wishlists" className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint">
            <Icon name="chevron-left" size={16} strokeWidth={2.5} />
          </Link>
          <button type="button" aria-label="Wishlist settings" onClick={() => setSettings(true)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-faint">
            <Icon name="dots" size={20} />
          </button>
        </div>
        <h1 className="mt-4 text-[32px] font-semibold leading-9">{name}</h1>
        {listings.length === 0 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Nothing saved yet</h2>
            <p className="mt-1 text-base text-muted">When you find a place you like, tap the heart to save it here.</p>
            <Link href="/" className="btn-dark mt-6">
              Start exploring
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} onHover={setHovered} />
            ))}
          </div>
        )}
      </main>
      <aside className="hidden lg:sticky lg:top-20 lg:block lg:h-[calc(100vh-80px)] lg:flex-1">
        <SearchMap listings={listings} hoveredId={hovered} />
      </aside>

      <Modal
        open={settings}
        onClose={() => setSettings(false)}
        title={confirmDelete ? "Delete this wishlist?" : "Settings"}
        footer={
          confirmDelete ? (
            <div className="flex justify-between">
              <button type="button" className="text-base font-semibold underline" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button type="button" className="btn-dark" onClick={remove}>
                Delete
              </button>
            </div>
          ) : (
            <div className="flex justify-between">
              <button type="button" className="text-base font-semibold underline" onClick={() => setConfirmDelete(true)}>
                Delete wishlist
              </button>
              <button type="button" className="btn-dark" disabled={!title.trim()} onClick={rename}>
                Save
              </button>
            </div>
          )
        }
      >
        {confirmDelete ? (
          <p className="text-base text-muted">&ldquo;{name}&rdquo; will be permanently deleted.</p>
        ) : (
          <label className="block rounded-lg border border-[#B0B0B0] px-3 pb-2 pt-2 focus-within:border-ink focus-within:shadow-ring">
            <span className="block text-xs text-muted">Name</span>
            <input value={title} maxLength={50} onChange={(e) => setTitle(e.target.value)} className="w-full text-base outline-none" />
          </label>
        )}
      </Modal>
    </div>
  );
}
