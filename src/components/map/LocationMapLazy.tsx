"use client";

import dynamic from "next/dynamic";

export const LocationMapLazy = dynamic(() => import("./LocationMap").then((m) => m.LocationMap), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" />,
});
