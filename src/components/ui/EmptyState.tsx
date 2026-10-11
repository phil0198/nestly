import Link from "next/link";

export function EmptyState({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="border-b border-divider pb-12">
      <h2 className="text-[22px] font-semibold leading-[26px]">{title}</h2>
      <p className="mt-2 max-w-[460px] text-base text-muted">{body}</p>
      {cta && href && (
        <Link href={href} className="btn-outline mt-6">
          {cta}
        </Link>
      )}
    </div>
  );
}
