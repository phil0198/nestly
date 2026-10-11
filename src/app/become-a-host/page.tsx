import type { Metadata } from "next";
import { ListingWizard } from "@/components/host/ListingWizard";

export const metadata: Metadata = { title: "Create your listing" };

export default function BecomeAHostPage() {
  return <ListingWizard />;
}
