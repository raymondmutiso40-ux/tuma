import { Suspense } from "react";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TrackParcel from "@/components/TrackParcel";
import Skeleton from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Track a parcel",
  description:
    "Enter your Tuma booking reference to see where your parcel is in its journey.",
};

export default function TrackPage() {
  return (
    <>
      <SiteHeader />

      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <header className="mb-8">
          <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
            Track a parcel
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-2">
            Where&rsquo;s my parcel?
          </h1>
          <p className="mt-3 text-[15px] text-ink-500 leading-relaxed max-w-md">
            Enter the reference from your ticket to see the booking status and
            its journey so far.
          </p>
        </header>

        {/* useSearchParams needs a Suspense boundary so the rest of the page
            can still be prerendered. */}
        <Suspense
          fallback={
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-full sm:w-36" />
            </div>
          }
        >
          <TrackParcel />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}
