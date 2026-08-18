"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Booking, BookingStatus } from "@/lib/types";
import { formatDateTime, formatKes } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Field";
import {
  CheckIcon,
  LogoutIcon,
  PackageIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Filter = "all" | BookingStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending_payment", label: "Awaiting payment" },
  { key: "paid", label: "Paid" },
  { key: "verified", label: "Accepted" },
  { key: "payment_failed", label: "Failed" },
];

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load bookings");
      setBookings(data.bookings);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionStatus === "authenticated") loadBookings();
  }, [sessionStatus]);

  async function setStatus(ref: string, newStatus: BookingStatus) {
    setUpdatingRef(ref);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setBookings((prev) => prev.map((b) => (b.ref === ref ? data.booking : b)));
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setUpdatingRef(null);
    }
  }

  const stats = useMemo(() => {
    const by = (s: BookingStatus) => bookings.filter((b) => b.status === s);
    const awaiting = by("pending_payment");
    return {
      total: bookings.length,
      active: by("paid").length,
      completed: by("verified").length,
      awaitingCount: awaiting.length,
      awaitingValue: awaiting.reduce((sum, b) => sum + b.priceKes, 0),
    };
  }, [bookings]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return [b.ref, b.senderName, b.recipientName, b.destination, b.carrierName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, filter, query]);

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <SkeletonGroup label="Checking your session">
          <Skeleton className="h-10 w-40" />
        </SkeletonGroup>
      </div>
    );
  }

  // The auth middleware guards `/admin/*` but not `/admin` itself, so this
  // page can be reached signed out. The API still refuses to return anything
  // — this just replaces the resulting error with the door out.
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-ink-200 bg-white shadow-card">
          <EmptyState
            icon={<LogoutIcon className="w-6 h-6 rotate-180" />}
            title="Sign in to continue"
            description="The operations dashboard is limited to approved Tuma staff accounts."
            action={
              <Link href="/admin/login" className={buttonClasses({ size: "lg" })}>
                Go to sign in
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 bg-ink text-paper on-dark">
        <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl shrink-0 rounded-md">
            <Logo suffix="admin" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-[13px] text-paper/60 truncate max-w-[16rem]">
              {session?.user?.email}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="text-paper/70 hover:text-paper hover:bg-white/10"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="max-w-content mx-auto px-4 sm:px-6 py-7 sm:py-9">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-[-0.03em]">
              Operations
            </h1>
            <p className="text-[14px] text-ink-500 mt-1.5">
              Every booking, newest first. Updates apply immediately.
            </p>
          </div>
          <Button variant="outline" onClick={loadBookings} loading={loading}>
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert
            tone="error"
            title="Couldn't load bookings"
            className="mb-6"
            action={
              <Button size="sm" variant="outline" onClick={loadBookings}>
                Try again
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Stats — only the four numbers that change what an operator does
            next. No charts. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
          <StatCard
            label="Total bookings"
            value={stats.total}
            loading={loading}
          />
          <StatCard
            label="Awaiting payment"
            value={stats.awaitingCount}
            hint={
              stats.awaitingCount > 0
                ? `${formatKes(stats.awaitingValue)} uncollected`
                : "Nothing outstanding"
            }
            tone={stats.awaitingCount > 0 ? "warning" : "neutral"}
            loading={loading}
          />
          <StatCard
            label="Active parcels"
            value={stats.active}
            hint="Paid, not yet accepted"
            tone="info"
            loading={loading}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            hint="Accepted at counter"
            tone="success"
            loading={loading}
          />
        </div>

        {/* Filters + search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
          <div
            className="flex gap-1.5 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:pb-0"
            role="group"
            aria-label="Filter bookings by status"
          >
            {FILTERS.map((f) => {
              const on = filter === f.key;
              const count =
                f.key === "all"
                  ? bookings.length
                  : bookings.filter((b) => b.status === f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors",
                    on
                      ? "bg-ink text-paper border-ink"
                      : "bg-white text-ink-600 border-ink-200 hover:border-ink-400"
                  )}
                >
                  {f.label}
                  <span className={cn("ml-1.5", on ? "text-paper/50" : "text-ink-400")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:ml-auto lg:w-72">
            <SearchIcon className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ref, name or town"
              aria-label="Search bookings"
              className="pl-10 h-11"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonGroup label="Loading bookings">
            <div className="rounded-lg border border-ink-200 bg-white overflow-hidden shadow-card">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 border-b border-ink-100 last:border-0"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40 hidden sm:block" />
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-6 w-24 rounded-full ml-auto" />
                </div>
              ))}
            </div>
          </SkeletonGroup>
        ) : bookings.length === 0 ? (
          <div className="rounded-lg border border-ink-200 bg-white shadow-card">
            <EmptyState
              icon={<PackageIcon className="w-6 h-6" />}
              title="No bookings yet"
              description="Bookings appear here the moment a customer completes the booking flow."
              action={
                <Link href="/book" className={buttonClasses({ variant: "outline" })}>
                  Open the booking flow
                </Link>
              }
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-lg border border-ink-200 bg-white shadow-card">
            <EmptyState
              icon={<SearchIcon className="w-6 h-6" />}
              title="Nothing matches those filters"
              description="Try a different status, or clear the search box."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop: table. */}
            <div className="hidden lg:block rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Bookings, newest first
                </caption>
                <thead>
                  <tr className="bg-ink-100/70 text-left text-2xs uppercase tracking-[0.1em] text-ink-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Ref</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Route</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Sender / recipient</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Carrier</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Fee</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Created</th>
                    <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => (
                    <tr
                      key={b.ref}
                      className="border-t border-ink-100 hover:bg-paper-light/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-medium">{b.ref}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {b.origin} → {b.destination}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block">{b.senderName}</span>
                        <span className="block text-ink-400 text-[13px]">
                          → {b.recipientName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{b.carrierName}</td>
                      <td className="px-5 py-3.5 font-mono whitespace-nowrap">
                        {formatKes(b.priceKes)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 whitespace-nowrap">
                        {formatDateTime(b.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <RowActions
                            booking={b}
                            busy={updatingRef === b.ref}
                            onSetStatus={setStatus}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet: cards, because an eight-column table on a
                phone is unusable. */}
            <ul className="lg:hidden space-y-3">
              {visible.map((b) => (
                <li
                  key={b.ref}
                  className="rounded-lg border border-ink-200 bg-white shadow-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono font-bold">{b.ref}</p>
                      <p className="text-[13.5px] text-ink-500 mt-0.5">
                        {b.origin} → {b.destination}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
                    <div>
                      <dt className="text-ink-400">Sender</dt>
                      <dd className="font-medium truncate">{b.senderName}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Recipient</dt>
                      <dd className="font-medium truncate">{b.recipientName}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Carrier</dt>
                      <dd className="font-medium truncate">{b.carrierName}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-400">Fee</dt>
                      <dd className="font-mono font-medium">
                        {formatKes(b.priceKes)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 pt-3.5 border-t border-ink-100 flex items-center justify-between gap-3">
                    <span className="font-mono text-2xs text-ink-400">
                      {formatDateTime(b.createdAt)}
                    </span>
                    <RowActions
                      booking={b}
                      busy={updatingRef === b.ref}
                      onSetStatus={setStatus}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-[13px] text-ink-400">
              Showing {visible.length} of {bookings.length} bookings
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  loading,
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "neutral" | "warning" | "info" | "success";
  loading: boolean;
}) {
  const accent = {
    neutral: "bg-ink-300",
    warning: "bg-warning",
    info: "bg-info",
    success: "bg-success",
  }[tone];

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4 sm:p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className={cn("w-1.5 h-1.5 rounded-full", accent)} aria-hidden />
        <p className="text-2xs uppercase tracking-[0.1em] text-ink-500">
          {label}
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-14 mt-2.5" />
      ) : (
        <p className="font-display text-[28px] leading-none tracking-[-0.03em] mt-2.5">
          {value}
        </p>
      )}
      {hint && !loading && (
        <p className="text-2xs text-ink-400 mt-2">{hint}</p>
      )}
    </div>
  );
}

/** The two status transitions an operator can make, unchanged from before. */
function RowActions({
  booking,
  busy,
  onSetStatus,
}: {
  booking: Booking;
  busy: boolean;
  onSetStatus: (ref: string, status: BookingStatus) => void;
}) {
  if (booking.status === "verified") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-400">
        <CheckIcon className="w-4 h-4" />
        Done
      </span>
    );
  }

  if (booking.status === "paid") {
    return (
      <Button
        size="sm"
        variant="primary"
        loading={busy}
        onClick={() => onSetStatus(booking.ref, "verified")}
        title={STATUS_META.verified.description}
      >
        Mark accepted
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="action"
      loading={busy}
      onClick={() => onSetStatus(booking.ref, "paid")}
      title={STATUS_META.paid.description}
    >
      Mark paid
    </Button>
  );
}
