"use client";

import { useState } from "react";
import Button from "./ui/Button";
import { CheckIcon, PrinterIcon, ShareIcon } from "./ui/icons";

/**
 * Ticket actions.
 *
 * "Print" also covers saving a PDF — every browser's print dialog offers
 * "Save as PDF", so this is a real download route without pulling in a
 * canvas-rasterising dependency just to make a separate button.
 *
 * "Share" uses the Web Share API where it exists (all the mobile browsers
 * that matter here) and quietly falls back to copying the link.
 */
// Note: the prop is `bookingRef`, not `ref` — React reserves `ref` and would
// never pass it through as a normal prop.
export default function TicketActions({ bookingRef }: { bookingRef: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const shareData = {
      title: `Tuma ticket ${bookingRef}`,
      text: `Parcel booking ${bookingRef} — show this QR ticket at the counter.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed the sheet, or the browser refused — fall through to
        // copying so the button still does something useful.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy your ticket link:", url);
    }
  }

  return (
    <div className="flex gap-3 w-full">
      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={() => window.print()}
      >
        <PrinterIcon className="w-4 h-4" />
        Print / PDF
      </Button>
      <Button variant="outline" size="lg" fullWidth onClick={share}>
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4 text-success" />
            Link copied
          </>
        ) : (
          <>
            <ShareIcon className="w-4 h-4" />
            Share
          </>
        )}
      </Button>
    </div>
  );
}
