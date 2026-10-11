import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AuthModal } from "@/components/auth/AuthModal";
import { MobileTabBar } from "@/components/header/MobileTabBar";

export const metadata: Metadata = {
  title: { default: "Nestly · Holiday rentals, cabins, beach houses & more", template: "%s · Nestly" },
  description: "Find a place to stay anywhere — cabins, beach houses, city lofts and one-of-a-kind homes.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <AuthModal />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
