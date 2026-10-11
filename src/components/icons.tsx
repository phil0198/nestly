import type { SVGProps } from "react";

/**
 * Original line-icon set for Nestly. Every glyph is drawn on a 24×24 grid with a
 * currentColor stroke so it inherits text colour, matching the reference UI's
 * thin outlined icon style.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function base({ size = 24, strokeWidth = 1.6, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
}

const paths: Record<string, React.ReactNode> = {
  // ---- UI ----
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />
    </>
  ),
  "chevron-left": <path d="m15 4-8 8 8 8" />,
  "chevron-right": <path d="m9 4 8 8-8 8" />,
  "chevron-down": <path d="m4 9 8 8 8-8" />,
  "chevron-up": <path d="m4 15 8-8 8 8" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  heart: <path d="M12 20.5s-7.5-4.6-9.2-9.6C1.6 7.3 3.9 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4c3.4 0 5.7 3.3 4.5 6.9-1.7 5-9.2 9.6-9.2 9.6Z" />,
  share: (
    <>
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" />
      <path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12" />
    </>
  ),
  star: <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z" />,
  filters: (
    <>
      <path d="M3 7h10M17 7h4M3 17h4M11 17h10" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  map: (
    <>
      <path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5L9 4Z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 3 3 5-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  door: (
    <>
      <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M3.5 21h17" />
      <circle cx="14.5" cy="12.5" r=".8" fill="currentColor" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="m8.5 10.3-3-7.3h4l2.5 6M15.5 10.3l3-7.3h-4l-2.5 6" />
      <path d="m12 12 .9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3L12 12Z" />
    </>
  ),
  "message": <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-5 4v-15.5Z" />,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />,
  location: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  "credit-card": (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 9.5h19M6 15h4" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h3l1.5-2.5h6L16.5 7h3A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-10Z" />
      <circle cx="12" cy="13" r="3.8" />
    </>
  ),
  photos: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="m3.5 18 5.5-5 4 3.5 3-2.5 4.5 4" />
    </>
  ),
  trash: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />,
  edit: <path d="m15.5 4.5 4 4L8 20H4v-4L15.5 4.5Z" />,
  "arrow-left": <path d="M20 12H4m6-7-7 7 7 7" />,
  "arrow-right": <path d="M4 12h16m-6-7 7 7-7 7" />,
  logout: <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h10" />,
  gift: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="1" />
      <path d="M2.5 9h19M12 9v11.5M12 9C10.5 5.5 6.5 4 6.5 6.5S12 9 12 9Zm0 0c1.5-3.5 5.5-5 5.5-2.5S12 9 12 9Z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01" />
    </>
  ),
  bell: <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2.5H4L6 16Zm4 4.5a2 2 0 0 0 4 0" />,
  dots: (
    <>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  "upload": <path d="M12 16V4m-5 5 5-5 5 5M4 15v4.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V15" />,
  flag: <path d="M5 21V4m0 0h11.5l-2 4 2 4H5" />,
  sparkle: <path d="M12 3c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7ZM19 15.5c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5Z" />,
  translate: <path d="M3 5h10M8 3v2c0 4-2.5 7-5 8.5M5.5 9c1 2 3 3.6 5.5 4.5M12.5 21l4-10 4 10M14 17.5h5" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M3 12.5h18" />
    </>
  ),
  home: <path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5M10 20v-5.5h4V20" />,

  // ---- Categories ----
  beachfront: (
    <>
      <path d="M3 19c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M12 15.5 9 5.5M4.5 9c1.5-3.5 5.6-5 9-3.6 2 .8 3.4 2.4 3.9 4.2L4.5 9Z" />
    </>
  ),
  cabins: (
    <>
      <path d="M2.5 11.5 12 4l9.5 7.5M5 10v10h14V10" />
      <path d="M5 13.5h14M5 17h14M10 20v-5h4v5" />
    </>
  ),
  "tiny-homes": (
    <>
      <path d="M6 20v-8l6-5 6 5v8H6Z" />
      <path d="M10.5 20v-4h3v4M4 13.5l8-7 8 7" />
    </>
  ),
  mountains: (
    <>
      <path d="m2.5 20 6.5-11 4 6.5 2.5-4L21.5 20h-19Z" />
      <path d="m7 11.5 2-1 1.5 1" />
    </>
  ),
  lakefront: (
    <>
      <path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M6 13.5 9.5 7l3.5 6.5M14 13.5l2.5-4.5 2.5 4.5M9.5 7V4" />
    </>
  ),
  "amazing-views": (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m3.5 17.5 5-5.5 4 4 2.5-2.5 5.5 5" />
      <circle cx="16" cy="8.5" r="1.8" />
    </>
  ),
  countryside: (
    <>
      <path d="M2.5 18c3-3.5 6.5-5 9.5-5s6.5 1.5 9.5 5" />
      <path d="M2.5 21h19M17 13V8.5M14.5 10.5 17 8.5l2.5 2M7 14.5V11m-2 1.5 2-1.5 2 1.5" />
      <circle cx="9" cy="5.5" r="2" />
    </>
  ),
  "amazing-pools": (
    <>
      <path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M8 14V5.5a2 2 0 0 1 4 0M16 14V5.5a2 2 0 0 0-2-2M8 8.5h8M8 11.5h8" />
    </>
  ),
  islands: (
    <>
      <path d="M2.5 19.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M5 16.5c2-1.6 4.4-2.5 7-2.5s5 .9 7 2.5M12.5 14c0-3-.5-5.5-1.5-7.5" />
      <path d="M11 6.5c-2-1.5-4.5-1.3-6 .5M11 6.5c.5-2 2.5-3.3 5-3M11 6.5c2.3-.5 4.6.6 5.5 2.8" />
    </>
  ),
  design: (
    <>
      <path d="M4 20V10a8 8 0 0 1 16 0v10" />
      <path d="M8 20v-9a4 4 0 0 1 8 0v9M2.5 20h19" />
    </>
  ),
  castles: (
    <>
      <path d="M4 21V9h3V7h2v2h2V5.5L12 4l1 1.5V9h2V7h2v2h3v12H4Z" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4M4 9V6M20 9V6" />
    </>
  ),
  tropical: (
    <>
      <path d="M12 21c0-5 .6-9 2-12.5" />
      <path d="M14 8.5c-1.5-3-5-4-8-2.5 3 0 5.5 1.3 8 2.5ZM14 8.5c1-3 4.5-4.5 7.5-3.5-3 .5-5.5 1.8-7.5 3.5ZM14 8.5c-3-.3-6 1.3-7.5 4.5 2.5-1.7 5-3.3 7.5-4.5ZM14 8.5c2.8.5 5 2.8 5.5 5.8-1.8-2.3-3.6-4.3-5.5-5.8Z" />
      <path d="M7 21h10" />
    </>
  ),
  arctic: (
    <>
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
      <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2M4 10.5l3-.5-1-3M20 13.5l-3 .5 1 3M4 13.5l3 .5-1 3M20 10.5l-3-.5 1-3" />
    </>
  ),
  treehouses: (
    <>
      <path d="M12 21v-6M8 21h8" />
      <path d="M12 3a6 6 0 0 0-6 6c0 1 .2 1.8.6 2.6A4 4 0 0 0 10 17h4a4 4 0 0 0 3.4-5.4c.4-.8.6-1.6.6-2.6a6 6 0 0 0-6-6Z" />
      <path d="M9.5 11.5h5v3h-5z" />
    </>
  ),
  camping: (
    <>
      <path d="M2.5 20 12 5l9.5 15h-19Z" />
      <path d="m12 12-3.5 8M12 12l3.5 8M10 3.5l2 1.5 2-1.5" />
    </>
  ),
  vineyards: (
    <>
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="12" cy="16" r="2" />
      <circle cx="9" cy="19.5" r="1.5" />
      <circle cx="15" cy="19.5" r="1.5" />
      <path d="M12 10V6m0 0c1.5-2 4-2.5 6-1.5-1.5 2-4 2.5-6 1.5Z" />
    </>
  ),
  skiing: (
    <>
      <circle cx="15.5" cy="4.5" r="1.8" />
      <path d="M3 17.5 21 21M7 12l4-3.5 3 3-2.5 3.5 2.5 3M11 8.5l-3.5 1M14 11.5l3.5-1" />
    </>
  ),
  historical: (
    <>
      <path d="M3 9.5 12 4l9 5.5H3ZM4.5 20.5h15M3 20.5h18" />
      <path d="M6 10v8.5M10 10v8.5M14 10v8.5M18 10v8.5" />
    </>
  ),
  domes: (
    <>
      <path d="M3 19a9 9 0 0 1 18 0H3Z" />
      <path d="M12 10v9M7 12l2.5 7M17 12l-2.5 7M3.8 15h16.4" />
    </>
  ),
  farms: (
    <>
      <path d="M4 21V10l5-5 5 5v11H4Z" />
      <path d="M7 21v-5h4v5M4 10h10M14 12h3.5V21M17.5 12a2.5 2.5 0 0 1 2.5 2.5V21M14 21h7.5" />
    </>
  ),
  boats: (
    <>
      <path d="M3 16h18l-2.5 4.5h-13L3 16Z" />
      <path d="M12 3v13M12 4l6 9.5h-6M11 6.5 6 13.5h5" />
    </>
  ),
  "luxe": (
    <>
      <path d="M6 4h12l3 5-9 11L3 9l3-5Z" />
      <path d="M3 9h18M9 4l3 16 3-16M7 9l2-5M17 9l-2-5" />
    </>
  ),
  "trending": <path d="M12 3c.5 3.5 4 5 4 9.5a4 4 0 0 1-8 0c0-1.6.6-2.6 1.5-3.5.3 1.2 1 2 2 2.2-.5-2.6-.2-5.4.5-8.2ZM7 17.5A6 6 0 0 0 17 17.5" />,

  // ---- Amenities ----
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r=".9" fill="currentColor" />
    </>
  ),
  kitchen: (
    <>
      <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2 0-3.5 2.5-3.5 6.5S15 13 17 13" />
    </>
  ),
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" />
    </>
  ),
  pool: (
    <>
      <path d="M3 17c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 20.5c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M8 14V5.5a2 2 0 0 1 4 0M16 14V5.5a2 2 0 0 0-2-2M8 9h8" />
    </>
  ),
  "hot-tub": (
    <>
      <path d="M3 12h18v5.5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V12Z" />
      <path d="M8 9c-1-1.2 1-2.3 0-3.5M12 9c-1-1.2 1-2.3 0-3.5M16 9c-1-1.2 1-2.3 0-3.5" />
    </>
  ),
  ac: (
    <>
      <rect x="2.5" y="5" width="19" height="8" rx="1.5" />
      <path d="M6 10.5h12M7 16.5v3M12 16.5v4M17 16.5v3" />
    </>
  ),
  heating: <path d="M12 21a6 6 0 0 0 6-6c0-4-3-5.5-3-9-2 1-3.5 2.6-4 5-1-.6-1.6-1.6-1.8-2.8C7.6 9.8 6 12.2 6 15a6 6 0 0 0 6 6Z" />,
  washer: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M4 6.5h16M7 4.5h.01M10 4.5h.01" />
    </>
  ),
  dryer: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M4 6.5h16M10.5 11c1 1-1 2 0 3M13.5 11c1 1-1 2 0 3" />
    </>
  ),
  tv: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  workspace: (
    <>
      <path d="M3 10h18M5 10v10M19 10v10M8 10V5h8v5" />
      <path d="M10 7.5h4" />
    </>
  ),
  fireplace: (
    <>
      <path d="M2.5 4h19v4h-19zM4 8v13h16V8" />
      <path d="M12 19.5a2.8 2.8 0 0 0 2.8-2.8c0-2-1.4-2.7-1.4-4.4-1 .5-1.6 1.2-1.9 2.3-.4-.3-.7-.7-.8-1.3-.9.9-1.5 2-1.5 3.4a2.8 2.8 0 0 0 2.8 2.8Z" />
    </>
  ),
  "beach-access": (
    <>
      <path d="M12 15.5 9 5.5M4.5 9c1.5-3.5 5.6-5 9-3.6 2 .8 3.4 2.4 3.9 4.2L4.5 9Z" />
      <path d="M3 20h18" />
    </>
  ),
  "lake-access": (
    <>
      <path d="M3 15c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 19c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M7 10h10l-1.5 2h-7L7 10ZM12 10V4l3.5 4.5H12" />
    </>
  ),
  "ski-in": (
    <>
      <path d="M3 17.5 21 21M5 15l3-6 4 1 3-5M12 10l2 3" />
      <circle cx="17" cy="4" r="1.6" />
    </>
  ),
  bbq: (
    <>
      <path d="M3.5 10h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="m8 17-2 4.5M16 17l2 4.5M12 18.5v3M9 7c-.8-1 .8-2 0-3M12 7c-.8-1 .8-2 0-3M15 7c-.8-1 .8-2 0-3" />
    </>
  ),
  patio: (
    <>
      <path d="M12 3 3 8h18l-9-5ZM12 8v13M8 21h8" />
      <path d="M4 14h4v7M20 14h-4v7" />
    </>
  ),
  gym: <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" />,
  "ev-charger": (
    <>
      <rect x="4" y="3" width="10" height="18" rx="1.5" />
      <path d="M2.5 21h13M9.5 7 7.5 11h3l-2 4M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V7l-2-2" />
    </>
  ),
  crib: <path d="M4 4v17M20 4v17M4 8h16M4 18h16M8 8v10M12 8v10M16 8v10" />,
  "self-check-in": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 10.5h6M9 14h6M12 18h.01" />
    </>
  ),
  "smoke-alarm": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v1M12 18.5v1" />
    </>
  ),
  "co-alarm": (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M10.5 10a2.2 2.2 0 1 0 0 4M15.3 12a1.8 2 0 1 1-3.6 0 1.8 2 0 1 1 3.6 0Z" />
    </>
  ),
  "first-aid": (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M9 6V4h6v2M12 10v6M9 13h6" />
    </>
  ),
  pets: (
    <>
      <circle cx="6" cy="10" r="1.8" />
      <circle cx="10" cy="6" r="1.8" />
      <circle cx="14" cy="6" r="1.8" />
      <circle cx="18" cy="10" r="1.8" />
      <path d="M12 11.5c-2.5 0-5 3.6-5 6a2.5 2.5 0 0 0 3.2 2.4c1.2-.4 2.4-.4 3.6 0A2.5 2.5 0 0 0 17 17.5c0-2.4-2.5-6-5-6Z" />
    </>
  ),
  "mountain-view": (
    <>
      <path d="m2.5 20 6.5-11 4 6.5 2.5-4L21.5 20h-19Z" />
      <circle cx="17.5" cy="5.5" r="1.8" />
    </>
  ),
  "ocean-view": (
    <>
      <path d="M2.5 15c1.6 0 1.6-1.2 3.2-1.2S7.3 15 8.9 15s1.6-1.2 3.1-1.2S13.6 15 15.2 15s1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2M2.5 19c1.6 0 1.6-1.2 3.2-1.2S7.3 19 8.9 19s1.6-1.2 3.1-1.2S13.6 19 15.2 19s1.6-1.2 3.1-1.2 1.6 1.2 3.2 1.2" />
      <path d="M7 10.5a5 5 0 0 1 10 0M12 3.5v1.5M5.6 6.1l1 1M18.4 6.1l-1 1" />
    </>
  ),
  "hair-dryer": (
    <>
      <path d="M14 5.5a4.5 4.5 0 1 0 0 9h6v-9h-6Z" />
      <path d="M11 14l-1.5 7h3l1-6.5" />
      <circle cx="14" cy="10" r="1.5" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H17M8 6c-.8-1 .8-2 0-3M12 6c-.8-1 .8-2 0-3M3 21h15" />
    </>
  ),
  dishwasher: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <path d="M4 7h16M8 4.8h.01M11 4.8h.01M8 11h8v6H8z" />
    </>
  ),
  "free-cancel": (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9.5 13.5l5 4.5M14.5 13.5l-5 4.5" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19.5V5M3 13h18v6.5M21 13v-1.5a3 3 0 0 0-3-3h-7V13" />
      <circle cx="7" cy="10.5" r="1.8" />
      <path d="M3 17h18" />
    </>
  ),
  bath: (
    <>
      <path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3ZM6 12V5.5a2 2 0 0 1 3.8-1M7 20l-1 1.5M17 20l1 1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2" />
    </>
  ),
};

export type IconName = keyof typeof paths | string;

export function Icon({ name, ...props }: IconProps & { name: IconName }) {
  const node = paths[name] ?? paths.sparkle;
  return <svg {...base(props)}>{node}</svg>;
}

/** Solid star used in ratings (the reference UI uses a filled glyph next to scores). */
export function StarSolid({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="currentColor" d="m12 1.8 3.1 6.4 7 1-5.1 4.9 1.2 7-6.2-3.3-6.2 3.3 1.2-7-5.1-4.9 7-1L12 1.8Z" />
    </svg>
  );
}

/** Heart used on listing cards: translucent dark fill with white outline, or brand fill when saved. */
export function CardHeart({ saved, size = 24 }: { saved: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      style={{
        display: "block",
        fill: saved ? "var(--brand)" : "rgba(0,0,0,0.5)",
        stroke: "white",
        strokeWidth: 2,
        overflow: "visible",
      }}
    >
      <path d="M16 27.5C9.2 23 3 18 3 11.4 3 7.6 5.9 4.8 9.4 4.8c2.6 0 4.9 1.5 6.6 3.9 1.7-2.4 4-3.9 6.6-3.9 3.5 0 6.4 2.8 6.4 6.6 0 6.6-6.2 11.6-13 16.1Z" />
    </svg>
  );
}

/** Small bold chevron used inside carousel arrow buttons. */
export function Chevron({ dir, size = 12 }: { dir: "left" | "right" | "down" | "up"; size?: number }) {
  const d = {
    left: "M21 4 9 16l12 12",
    right: "m11 4 12 12-12 12",
    down: "M4 11l12 12 12-12",
    up: "M4 21 16 9l12 12",
  }[dir];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ display: "block", fill: "none", stroke: "currentColor", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round", overflow: "visible" }}>
      <path d={d} />
    </svg>
  );
}
