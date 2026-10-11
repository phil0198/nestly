import { NextResponse, type NextRequest } from "next/server";
import { countListings, priceDistribution } from "@/lib/listings";
import { parseSearchParams } from "@/lib/search-params";

export async function GET(req: NextRequest) {
  const filters = parseSearchParams(req.nextUrl.searchParams);
  const [count, prices] = await Promise.all([countListings(filters), priceDistribution(filters)]);
  return NextResponse.json({ count, prices });
}
