import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
  accent: "bg-amber/15 text-amber-700 border-amber/30",
};

const DOTS: Record<BadgeTone, string> = {
  neutral: "bg-ink-400",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  accent: "bg-amber-600",
};

/**
 * Status pill. The dot is not decoration — it means status is never
 * communicated by colour alone (the label carries it too, and the dot gives
 * a second non-colour cue in dense tables).
 */
export default function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-2xs font-semibold uppercase tracking-[0.06em] whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", DOTS[tone])} aria-hidden />
      )}
      {children}
    </span>
  );
}
