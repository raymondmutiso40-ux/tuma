"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Decorative dispatch board for the hero. The rows are illustrative sample
 * data, not live bookings — hence the "demo" chip, which is there so the
 * marketing surface doesn't imply a live feed it doesn't have.
 */
const ROWS = [
  { dest: "MOMBASA", carrier: "EASYCOACH", ref: "TM-482913", status: "READY" },
  { dest: "KISUMU", carrier: "MODERN COAST", ref: "TM-118475", status: "BOOKED" },
  { dest: "ELDORET", carrier: "GUARDIAN ANGEL", ref: "TM-905327", status: "PAID" },
  { dest: "NAKURU", carrier: "EASYCOACH", ref: "TM-660214", status: "READY" },
];

const STATUS_STYLES: Record<string, string> = {
  READY: "bg-teal-light/20 text-teal-light",
  PAID: "bg-amber/20 text-amber",
  BOOKED: "bg-white/10 text-paper/60",
};

export default function DepartureBoard({ className }: { className?: string }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-white/10 bg-ink-950/95 backdrop-blur-sm",
        "overflow-hidden shadow-lifted",
        className
      )}
      aria-hidden
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="font-mono text-2xs tracking-[0.16em] text-amber uppercase">
          Nairobi dispatch
        </span>
        <span className="flex items-center gap-1.5 font-mono text-2xs tracking-[0.14em] text-paper/40 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-light animate-pulse" />
          Demo
        </span>
      </div>

      <div className="divide-y divide-white/[0.07]">
        {ROWS.map((row, i) => {
          const dimmed = (tick + i) % ROWS.length === 0;
          return (
            <div
              key={row.ref}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-2.5 transition-opacity duration-500",
                dimmed ? "opacity-40" : "opacity-100"
              )}
            >
              <div className="min-w-0">
                <div className="font-semibold text-[15px] text-paper tracking-[-0.01em] leading-tight">
                  {row.dest}
                </div>
                <div className="font-mono text-2xs text-paper/40 mt-0.5 truncate">
                  {row.carrier} · {row.ref}
                </div>
              </div>
              <span
                className={cn(
                  "font-mono text-2xs px-2 py-1 rounded-full uppercase tracking-[0.08em] shrink-0",
                  STATUS_STYLES[row.status]
                )}
              >
                {row.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
