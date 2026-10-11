import Link from "next/link";
import { Header } from "@/components/header/Header";

export default function NotFound() {
  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow py-24">
        <h1 className="text-[32px] font-semibold">This place isn&rsquo;t available</h1>
        <p className="mt-3 max-w-md text-base text-muted">The listing may have been removed by its host or the link is incorrect.</p>
        <Link href="/" className="btn-dark mt-8">Explore other stays</Link>
      </main>
    </>
  );
}
