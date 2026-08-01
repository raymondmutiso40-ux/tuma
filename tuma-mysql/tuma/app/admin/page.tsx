"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Booking, BookingStatus } from "@/lib/types";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending_payment: "bg-amber/20 text-amber",
  payment_failed: "bg-rust/20 text-rust",
  paid: "bg-teal/20 text-teal",
  verified: "bg-ink/10 text-ink",
};

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);

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

  if (sessionStatus === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-slate">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-display text-xl">
          tu<span className="text-amber">ma</span>. <span className="text-slate text-sm font-body">admin</span>
        </a>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate">{session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="font-condensed font-bold uppercase tracking-wide border-2 border-ink px-4 py-1.5 rounded-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-2xl">Bookings</h1>
          <button
            onClick={loadBookings}
            className="font-condensed font-bold uppercase tracking-wide text-sm border-2 border-ink px-4 py-2 rounded-sm"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 border-2 border-rust text-rust text-sm px-4 py-3 rounded-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="text-slate">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto border-2 border-ink rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink text-paper text-left font-condensed uppercase tracking-wide text-xs">
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Sender / Recipient</th>
                  <th className="px-4 py-3">Carrier</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.ref} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-mono">{b.ref}</td>
                    <td className="px-4 py-3">{b.origin} → {b.destination}</td>
                    <td className="px-4 py-3">
                      {b.senderName} → {b.recipientName}
                    </td>
                    <td className="px-4 py-3">{b.carrierName}</td>
                    <td className="px-4 py-3 font-mono">KES {b.priceKes}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {b.status !== "paid" && (
                          <button
                            disabled={updatingRef === b.ref}
                            onClick={() => setStatus(b.ref, "paid")}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-sm bg-teal text-white disabled:opacity-50"
                          >
                            Mark paid
                          </button>
                        )}
                        {b.status === "paid" && (
                          <button
                            disabled={updatingRef === b.ref}
                            onClick={() => setStatus(b.ref, "verified")}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-sm bg-ink text-paper disabled:opacity-50"
                          >
                            Mark verified
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
