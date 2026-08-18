import { cn } from "@/lib/cn";

/**
 * Loading placeholder. Prefer this over a spinner anywhere the final shape
 * is predictable — it stops the layout jumping when data lands.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("skeleton rounded-md", className)}
      aria-hidden
    />
  );
}

/** Wraps a skeleton block so screen readers announce the wait once. */
export function SkeletonGroup({
  label = "Loading",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}
