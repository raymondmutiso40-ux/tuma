"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { STATUS_META } from "@/lib/status";
import { formatKes, formatPhone } from "@/lib/format";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import BookingTimeline from "@/components/BookingTimeline";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { CheckIcon, SearchIcon, ShieldIcon } from "@/components/ui/icons";

type Load =
  | { kind: "loading" }
  | { kind: "found"; booking: Booking }
  | { kind: "missing" }
  | { kind: "error" };

export default function VerifyPage() {
  const params = useParams();
  const bookingRef = params.ref as string;

  const [load, setLoad] = useState<Load>({ kind: "loading" });
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [justVerified, setJustVerified] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoad({ kind: "loading" });
    try {
      const res = await fetch(`/api/bookings/${bookingRef}`);
      if (res.status === 404) return setLoad({ kind: "missing" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setLoad({ kind: "found", booking: data.booking });
    } catch {
      setLoad({ kind: "error" });
    }
  }, [bookingRef]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  async function verify() {
    setVerifying(true);
    setVerifyError("");
    try {
      const res = await fetch(`/api/bookings/${bookingRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not verify this parcel");
      setLoad({ kind: "found", booking: data.booking });
      setJustVerified(true);
    } catch (e: any) {
      setVerifyError(e.message || "Could not verify this parcel");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Staff-facing, so this deliberately does not use the customer nav. */}
      <header className="bg-ink text-paper on-dark">
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg rounded-md">
            <Logo suffix="counter" />
          </Link>
          <span className="flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.14em] text-paper/50">
            <ShieldIcon className="w-4 h-4" />
            Staff view
          </span>
        </div>
      </header>

      <main id="main" className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="font-display text-2xl sm:text-3xl tracking-[-0.03em] mb-1">
          Verify parcel
        </h1>
        <p className="font-mono text-[13px] text-ink-500 mb-7">{bookingRef}</p>

        {load.kind === "loading" && (
          <SkeletonGroup label="Looking up booking">
            <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-card space-y-5">
              <div className="flex justify-between gap-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </SkeletonGroup>
        )}

        {load.kind === "missing" && (
          <div className="rounded-lg border border-ink-200 bg-white shadow-card">
            <EmptyState
              icon={<SearchIcon className="w-6 h-6" />}
              title="No booking found"
              description={`Nothing matches reference ${bookingRef}. Ask the customer to check their ticket.`}
            />
          </div>
        )}

        {load.kind === "error" && (
          <Alert
            tone="error"
            title="Couldn't load this booking"
            action={
              <Button size="sm" variant="outline" onClick={fetchBooking}>
                Retry
              </Button>
            }
          >
            The booking service didn&rsquo;t respond. Check the connection and
            try again.
          </Alert>
        )}

        {load.kind === "found" && (
          <VerifyCard
            booking={load.booking}
            verifying={verifying}
            verifyError={verifyError}
            justVerified={justVerified}
            onVerify={verify}
          />
        )}
      </main>
    </div>
  );
}

function VerifyCard({
  booking,
  verifying,
  verifyError,
  justVerified,
  onVerify,
}: {
  booking: Booking;
  verifying: boolean;
  verifyError: string;
  justVerified: boolean;
  onVerify: () => void;
}) {
  const paid = booking.status === "paid" || booking.status === "verified";
  const accepted = booking.status === "verified";

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-wrap items-start justify-between gap-3 border-b border-ink-200">
          <div className="min-w-0">
            <p className="font-mono text-xl font-bold tracking-tight">
              {booking.ref}
            </p>
            <p className="text-[15px] text-ink-500 mt-1">
              {booking.origin} → {booking.destination}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* The photo is the whole point of a counter check — show it big. */}
        {booking.photoDataUrl && (
          <div className="border-b border-ink-200 bg-ink-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={booking.photoDataUrl}
              alt="Photo of the parcel taken at booking"
              className="w-full max-h-64 object-contain"
            />
          </div>
        )}

        <dl className="p-5 sm:p-6 grid grid-cols-2 gap-x-4 gap-y-4 text-[14px]">
          <Row label="Carrier" value={booking.carrierName} />
          <Row label="Weight" value={`${booking.weightKg} kg`} />
          <Row label="Contents" value={booking.description} />
          <Row label="Category" value={booking.category} />
          <Row label="Sender" value={booking.senderName} sub={formatPhone(booking.senderPhone)} />
          <Row
            label="Recipient"
            value={booking.recipientName}
            sub={formatPhone(booking.recipientPhone)}
          />
        </dl>

        {/* Payment is the thing staff must not get wrong, so it gets its own
            unambiguous band rather than being one cell in the grid. */}
        <div
          className={`px-5 sm:px-6 py-4 flex items-center justify-between gap-3 border-t ${
            paid
              ? "bg-success-soft border-success/20 text-success"
              : "bg-danger-soft border-danger/20 text-danger"
          }`}
        >
          <span className="text-sm font-semibold">
            {paid ? "Payment received" : "Not paid"}
          </span>
          <span className="font-mono font-bold">
            {formatKes(booking.priceKes)}
          </span>
        </div>
      </div>

      {verifyError && <Alert tone="error">{verifyError}</Alert>}

      {accepted ? (
        <div
          className={`rounded-lg border-2 border-success bg-success-soft px-5 py-5 text-center ${
            justVerified ? "animate-scale-in" : ""
          }`}
          role="status"
        >
          <span
            className={`mx-auto mb-2.5 flex w-12 h-12 items-center justify-center rounded-full bg-success text-white ${
              justVerified ? "animate-check-pop" : ""
            }`}
          >
            <CheckIcon className="w-6 h-6" />
          </span>
          <p className="font-semibold text-success">Verified &amp; accepted</p>
          <p className="text-[13px] text-success/80 mt-1">
            {STATUS_META.verified.description}
          </p>
        </div>
      ) : (
        <>
          <Button
            variant="action"
            size="lg"
            fullWidth
            loading={verifying}
            onClick={onVerify}
          >
            <CheckIcon className="w-5 h-5" />
            Verify &amp; accept parcel
          </Button>
          {!paid && (
            <Alert tone="warning" title="Payment not confirmed">
              Collect the {formatKes(booking.priceKes)} fee before accepting this
              parcel.
            </Alert>
          )}
        </>
      )}

      <div className="rounded-lg border border-ink-200 bg-white p-5 sm:p-6 shadow-card">
        <h2 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400 mb-5">
          Booking journey
        </h2>
        <BookingTimeline booking={booking} />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-2xs uppercase tracking-[0.12em] text-ink-400 mb-0.5">
        {label}
      </dt>
      <dd className="font-semibold break-words">{value || "—"}</dd>
      {sub && sub !== "—" && (
        <dd className="text-2xs text-ink-400 mt-0.5">{sub}</dd>
      )}
    </div>
  );
}
