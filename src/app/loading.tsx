import { ListingGridSkeleton } from "@/components/listing/ListingGrid";

export default function Loading() {
  return (
    <div className="page-gutter mx-auto max-w-[2520px] pt-[180px]">
      <ListingGridSkeleton />
    </div>
  );
}
