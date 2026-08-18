import { cn } from "@/lib/cn";

/**
 * The Tuma wordmark. One component so the amber "ma" and the full stop are
 * identical everywhere — header, footer, ticket and admin.
 */
export default function Logo({
  className,
  suffix,
}: {
  className?: string;
  /** e.g. "admin" — rendered as a quiet label beside the mark. */
  suffix?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-display tracking-[-0.03em] leading-none">
        tu<span className="text-amber">ma</span>.
      </span>
      {suffix && (
        <span className="font-body text-[0.55em] font-semibold uppercase tracking-[0.16em] text-ink-400">
          {suffix}
        </span>
      )}
    </span>
  );
}
