"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex-1 border-2 border-ink font-condensed font-bold uppercase tracking-wide py-3.5 rounded-sm"
    >
      Print
    </button>
  );
}
