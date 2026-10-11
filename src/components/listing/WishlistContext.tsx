"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal } from "../ui/Modal";
import { useUI } from "../ui/UIContext";
import { useToast } from "../ui/Toast";
import { Icon } from "../icons";

interface WishlistSummary {
  id: string;
  name: string;
  cover: string | null;
  count: number;
}

interface Target {
  id: string;
  image?: string;
}

interface WishlistState {
  isSaved: (listingId: string) => boolean;
  toggle: (listing: Target) => void;
  wishlists: WishlistSummary[];
  refresh: () => Promise<void>;
}

const Ctx = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { openAuth } = useUI();
  const toast = useToast();
  const router = useRouter();
  const [saved, setSaved] = useState<Map<string, string>>(new Map()); // listingId -> wishlistId
  const [wishlists, setWishlists] = useState<WishlistSummary[]>([]);
  const [target, setTarget] = useState<Target | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/wishlists", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { wishlists: WishlistSummary[]; saved: Record<string, string> };
    setWishlists(data.wishlists);
    setSaved(new Map(Object.entries(data.saved)));
  }, []);

  useEffect(() => {
    if (status === "authenticated") void refresh();
    if (status === "unauthenticated") {
      setSaved(new Map());
      setWishlists([]);
    }
  }, [status, refresh]);

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  const toggle = useCallback(
    (listing: Target) => {
      if (status === "loading") return;
      if (status !== "authenticated") {
        openAuth("login", () => setTarget(listing));
        return;
      }
      const wishlistId = saved.get(listing.id);
      if (wishlistId) {
        // Optimistic removal
        setSaved((m) => {
          const next = new Map(m);
          next.delete(listing.id);
          return next;
        });
        const name = wishlists.find((w) => w.id === wishlistId)?.name;
        fetch("/api/wishlists/items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: listing.id }),
        }).then(() => {
          void refresh();
          router.refresh();
        });
        toast(<>Removed from {name ?? "wishlist"}</>, listing.image);
        return;
      }
      setCreating(false);
      setNewName("");
      setTarget(listing);
    },
    [status, saved, wishlists, openAuth, refresh, router, toast],
  );

  async function saveTo(wishlistId: string | null) {
    if (!target) return;
    setBusy(true);
    const res = await fetch("/api/wishlists/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: target.id, wishlistId, name: wishlistId ? undefined : newName.trim() }),
    });
    setBusy(false);
    if (!res.ok) return;
    const { wishlist } = (await res.json()) as { wishlist: { id: string; name: string } };
    setSaved((m) => new Map(m).set(target.id, wishlist.id));
    toast(<>Saved to {wishlist.name}</>, target.image);
    setTarget(null);
    void refresh();
    router.refresh();
  }

  const value = useMemo(() => ({ isSaved, toggle, wishlists, refresh }), [isSaved, toggle, wishlists, refresh]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={creating ? "Create wishlist" : "Save to wishlist"}
        width="max-w-[568px]"
        footer={
          creating ? (
            <div className="flex items-center justify-between">
              <button type="button" className="text-base font-semibold underline" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button type="button" className="btn-dark" disabled={!newName.trim() || busy} onClick={() => saveTo(null)}>
                Create
              </button>
            </div>
          ) : (
            <button type="button" className="btn-dark w-full" onClick={() => setCreating(true)}>
              Create new wishlist
            </button>
          )
        }
      >
        {creating ? (
          <div>
            <label className="block rounded-lg border border-[#B0B0B0] px-3 pb-2 pt-2 focus-within:border-ink focus-within:shadow-ring">
              <span className="block text-xs text-muted">Name</span>
              <input
                autoFocus
                maxLength={50}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newName.trim() && saveTo(null)}
                className="w-full text-base outline-none"
              />
            </label>
            <div className="mt-2 text-xs font-semibold text-muted">{newName.length}/50 characters</div>
          </div>
        ) : wishlists.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Icon name="heart" size={32} />
            <p className="mt-4 text-base text-muted">Create your first wishlist to start saving places you love.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
            {wishlists.map((w) => (
              <button key={w.id} type="button" disabled={busy} onClick={() => saveTo(w.id)} className="group text-left">
                <div className="aspect-square overflow-hidden rounded-xl bg-[#EBEBEB] shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
                  {w.cover && (
                    <img src={w.cover} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                </div>
                <div className="mt-2 truncate text-sm font-semibold">{w.name}</div>
                <div className="text-sm text-muted">
                  {w.count} saved
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
