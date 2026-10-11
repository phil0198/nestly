import { cn } from "@/lib/utils";

const palette = ["#222222", "#5e4a3a", "#3a5e52", "#4a3a5e", "#5e3a46", "#3a4a5e"];

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const bg = palette[name.length % palette.length];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full font-semibold text-white", className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}
