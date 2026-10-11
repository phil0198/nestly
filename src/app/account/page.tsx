import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { RequireLogin } from "@/components/RequireLogin";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/trips", icon: "briefcase", title: "Trips", body: "Upcoming and past stays" },
  { href: "/wishlists", icon: "heart", title: "Wishlists", body: "Places you've saved" },
  { href: "/host/listings", icon: "home", title: "Manage listings", body: "Edit and review your homes" },
  { href: "/host/reservations", icon: "calendar", title: "Host reservations", body: "Guests staying at your places" },
  { href: "/become-a-host", icon: "plus", title: "Create a new listing", body: "It's easy to start hosting" },
  { href: "/help", icon: "help", title: "Get help", body: "Answers to common questions" },
];

export default async function AccountPage() {
  const userId = await getUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId }, include: { _count: { select: { reservations: true, listings: true, reviews: true } } } })
    : null;
  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow min-h-[60vh] pb-16 pt-8 sm:pt-14">
        <h1 className="mb-8 text-[32px] font-semibold leading-9">{user ? "Profile" : "Account"}</h1>
        {!user ? (
          <RequireLogin title="Log in to manage your account" body="Your profile, trips and listings live here." />
        ) : (
          <>
            <div className="flex items-center gap-6 rounded-3xl p-6 shadow-[0_6px_20px_rgba(0,0,0,0.12)] sm:max-w-[420px]">
              <Avatar name={user.name} src={user.image} size={96} />
              <div>
                <div className="text-[28px] font-bold leading-8">{user.name.split(" ")[0]}</div>
                <div className="text-sm text-muted">{user.location ?? "Guest"}</div>
                <div className="mt-2 text-sm">
                  {user._count.reservations} trips · {user._count.reviews} reviews · {user._count.listings} listings
                </div>
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LINKS.map((l) => (
                <Link key={l.href + l.title} href={l.href} className="flex flex-col rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)]">
                  <Icon name={l.icon} size={32} />
                  <span className="mt-6 text-base font-semibold">{l.title}</span>
                  <span className="text-sm text-muted">{l.body}</span>
                </Link>
              ))}
            </div>
            <div className="mt-10">
              <LogoutButton />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
