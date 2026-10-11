import Link from "next/link";
import { Icon } from "./icons";

const COLUMNS = [
  { title: "Support", links: ["Help Centre", "Safety information", "Cancellation options", "Accessibility support", "Report a concern"] },
  { title: "Hosting", links: ["Host your home", "Hosting resources", "Community forum", "Responsible hosting", "Host insurance"] },
  { title: "Nestly", links: ["Newsroom", "Careers", "Investors", "Gift cards", "Nestly.org stays"] },
];

function Legal() {
  return (
    <div className="flex flex-col-reverse gap-4 py-6 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>© {new Date().getFullYear()} Nestly, Inc.</span>
        <span aria-hidden>·</span>
        <Link href="/help" className="hover:underline">Terms</Link>
        <span aria-hidden>·</span>
        <Link href="/help" className="hover:underline">Sitemap</Link>
        <span aria-hidden>·</span>
        <Link href="/help" className="hover:underline">Privacy</Link>
      </div>
      <div className="flex items-center gap-6 font-semibold">
        <span className="flex items-center gap-2">
          <Icon name="globe" size={16} />
          English (US)
        </span>
        <span>$ USD</span>
      </div>
    </div>
  );
}

export function Footer({ wide = false }: { wide?: boolean }) {
  return (
    <footer className="mt-12 border-t border-hairline bg-faint pb-20 sm:pb-0">
      <div className={wide ? "page-gutter mx-auto max-w-[2520px]" : "container-narrow"}>
        <div className="grid gap-6 border-b border-hairline py-12 md:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.title} className="border-b border-hairline pb-6 last:border-0 md:border-0 md:pb-0">
              <h3 className="mb-3 text-sm font-semibold">{c.title}</h3>
              <ul className="space-y-3 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link href={l === "Host your home" ? "/become-a-host" : "/help"} className="hover:underline">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Legal />
      </div>
    </footer>
  );
}

/** Slim footer pinned to the bottom of the browse page on desktop. */
export function MiniFooter() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 hidden border-t border-hairline bg-white sm:block">
      <div className="page-gutter mx-auto flex h-12 max-w-[2520px] items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} Nestly, Inc.</span>
          <span>·</span>
          <Link href="/help" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link href="/help" className="hover:underline">Privacy</Link>
        </div>
        <div className="flex items-center gap-6 font-semibold">
          <span className="flex items-center gap-2">
            <Icon name="globe" size={16} />
            English (US)
          </span>
          <span>$ USD</span>
          <Link href="/help" className="flex items-center gap-2 hover:underline">
            Support &amp; resources
            <Icon name="chevron-up" size={12} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}
