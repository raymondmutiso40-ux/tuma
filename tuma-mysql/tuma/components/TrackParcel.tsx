"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { STATUS_META } from "@/lib/status";
import { formatDateTime, formatKes } from "@/lib/format";
import BookingTimeline from "./BookingTimeline";
import StatusBadge from "./StatusBadge";
import Button, { buttonClasses } from "./ui/Button";
import Alert from "./ui/Alert";
import Skeleton, { SkeletonGroup } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import { Input } from "./ui/Field";
import { PackageIcon, SearchIcon } from "./ui/icons";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; booking: Booking }
  | { kind: "missing"; ref: string }
  | { kind: "error" };

export default function TrackParcel() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") ?? "";

  const [query, setQuery] = useState(initialRef);
  const [state, setState] = useState<State>({ kind: "idle" });

  const lookup = useCallback(async (raw: string) => {
    const ref = raw.trim().toUpperCase();
    if (!ref) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(ref)}`);
      if (res.status === 404) {
        setState({ kind: "missing", ref });
        return;
      }
      if (!res.ok) throw new Error("lookup failed");
      const data = await res.json();
      setState({ kind: "found", booking: data.booking });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  // Deep link from the ticket page: /track?ref=TM-123456 looks itself up.
  useEffect(() => {
    if (initialRef) lookup(initialRef);
  }, [initialRef, lookup]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(query);
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <SearchIcon className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="TM-123456"
            aria-label="Booking reference"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="pl-10 font-mono uppercase"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="sm:h-12 sm:px-7"
          loading={state.kind === "loading"}
        >
          Track parcel
        </Button>
      </form>

      <div className="mt-8">
        {state.kind === "idle" && (
          <EmptyState
            icon={<PackageIcon className="w-6 h-6" />}
            title="Enter your reference"
            description="It starts with TM- and is printed at the top of your ticket and in your booking confirmation."
          />
        )}

        {state.kind === "loading" && (
          <SkeletonGroup label="Looking up your booking">
            <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card">
              <div className="flex justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="mt-8 space-y-5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SkeletonGroup>
        )}

        {state.kind === "missing" && (
          <EmptyState
            icon={<SearchIcon className="w-6 h-6" />}
            title="No booking with that reference"
            description={`We couldn't find ${state.ref}. Check the reference on your ticket — it's six digits after TM-.`}
            action={
              <Link href="/book" className={buttonClasses({ variant: "outline" })}>
                Book a parcel instead
              </Link>
            }
          />
        )}

        {state.kind === "error" && (
          <Alert
            tone="error"
            title="Something went wrong"
            action={
              <Button size="sm" variant="outline" onClick={() => lookup(query)}>
                Try again
              </Button>
            }
          >
            We couldn&rsquo;t reach the booking service. Please try again in a
            moment.
          </Alert>
        )}

        {state.kind === "found" && (
          <BookingCard booking={state.booking} />
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const meta = STATUS_META[booking.status];
  const paid = booking.status === "paid" || booking.status === "verified";

  return (
    <div className="animate-fade-up space-y-5">
      <div className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-ink-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xl font-bold tracking-tight">
                {booking.ref}
              </p>
              <p className="text-[15px] text-ink-500 mt-1">
                {booking.origin} → {booking.destination} · {booking.carrierName}
              </p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-3 text-[13.5px] text-ink-500 leading-relaxed">
            {meta.description}
          </p>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-ink-200 border-b border-ink-200">
          <Stat label="Booked" value={formatDateTime(booking.createdAt)} />
          <Stat label="Weight" value={`${booking.weightKg} kg`} />
          <Stat label="Fee" value={formatKes(booking.priceKes)} />
          <Stat label="Recipient" value={booking.recipientName} />
        </dl>

        <div className="p-5 sm:p-6">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400 mb-5">
            Parcel journey
          </h2>
          <BookingTimeline booking={booking} />
        </div>
      </div>

      {paid && (
        <Link
          href={`/ticket/${booking.ref}`}
          className={buttonClasses({ fullWidth: true, size: "lg" })}
        >
          View QR ticket
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3.5 min-w-0">
      <dt className="text-2xs uppercase tracking-[0.1em] text-ink-400">
        {label}
      </dt>
      <dd className="text-[13.5px] font-semibold mt-1 truncate">{value}</dd>
    </div>
  );
}
