import Link from "next/link";
import { Header } from "@/components/header/Header";

export default function NotFound() {
  return (
    <>
      <Header variant="plain" wide={false} />
      <main className="container-narrow py-24">
        <h1 className="text-[56px] font-bold leading-none text-brand">Oops!</h1>
        <p className="mt-4 text-[22px] font-semibold">We can&rsquo;t seem to find the page you&rsquo;re looking for.</p>
        <p className="mt-2 text-sm text-muted">Error code: 404</p>
        <Link href="/" className="btn-dark mt-8">Back to home</Link>
      </main>
    </>
  );
}
