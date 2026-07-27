"use client";

import { useEffect, useState } from "react";

const ROWS = [
  { dest: "MOMBASA", carrier: "EASYCOACH", ref: "TM-482913", status: "READY TO PRINT" },
  { dest: "KISUMU", carrier: "MODERN COAST", ref: "TM-118475", status: "BOOKED" },
  { dest: "ELDORET", carrier: "GUARDIAN ANGEL", ref: "TM-905327", status: "PAID" },
  { dest: "NAKURU", carrier: "EASYCOACH", ref: "TM-660214", status: "READY TO PRINT" },
  { dest: "MALINDI", carrier: "MODERN COAST", ref: "TM-337850", status: "BOOKED" },
];

export default function DepartureBoard() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full max-w-md rounded-md border-2 border-amber/40 bg-ink overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber/20 bg-black/20">
        <span className="font-mono text-[10px] tracking-[2px] text-amber uppercase">
          Nairobi Dispatch
        </span>
        <span className="font-mono text-[10px] tracking-[2px] text-paper/50 uppercase">
          Live
        </span>
      </div>
      <div className="divide-y divide-white/10">
        {ROWS.map((row, i) => {
          const isFlipping = (tick + i) % ROWS.length === 0;
          return (
            <div
              key={row.ref}
              className={`grid grid-cols-[1fr_auto] gap-2 px-4 py-3 transition-all duration-300 ${
                isFlipping ? "opacity-40" : "opacity-100"
              }`}
            >
              <div>
                <div className="font-condensed font-bold text-lg text-paper tracking-wide leading-none">
                  {row.dest}
                </div>
                <div className="font-mono text-[10px] text-paper/50 mt-1">
                  {row.carrier} &middot; {row.ref}
                </div>
              </div>
              <div className="self-center">
                <span
                  className={`font-mono text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide ${
                    row.status === "READY TO PRINT"
                      ? "bg-teal/20 text-teal"
                      : row.status === "PAID"
                      ? "bg-amber/20 text-amber"
                      : "bg-white/10 text-paper/60"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
