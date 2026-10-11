"use client";

import { cn } from "@/lib/utils";
import { Icon } from "../icons";

export function StepperButton({
  onClick,
  disabled,
  label,
  kind,
  size = 32,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  kind: "minus" | "plus";
  size?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border text-muted transition-colors",
        disabled ? "cursor-not-allowed border-divider text-[#EBEBEB]" : "border-[#B0B0B0] hover:border-ink hover:text-ink",
      )}
    >
      <Icon name={kind} size={12} strokeWidth={2.6} />
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 16,
  label,
  suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <StepperButton kind="minus" label={`decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} />
      <span className="min-w-[1.5rem] text-center text-base tabular-nums" aria-live="polite">
        {value}
        {suffix && value >= max ? suffix : ""}
      </span>
      <StepperButton kind="plus" label={`increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} />
    </div>
  );
}
