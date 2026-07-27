"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Booking } from "@/lib/types";

export default function VerifyPage() {
  const params = useParams();
  const ref = params.ref as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${ref}`);
    if (res.ok) {
      const data = await res.json();
      setBooking(data.booking);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  async function verify() {
    setVerifying(true);
    const res = await fetch(`/api/bookings/${ref}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    const data = await res.json();
    setBooking(data.booking);
    setVerifying(false);
  }

  return (
    <div className="max-w-md mx-auto min-h-screen px-6 py-10">
      <div className="font-mono text-[10px] uppercase tracking-[1.5px] text-slate mb-1.5">
        Counter staff view
      </div>
      <h1 className="font-display text-2xl mb-6">Verify parcel</h1>

      {loading && <p className="text-slate text-sm">Looking up booking…</p>}

      {notFound && (
        <div className="border-2 border-rust text-rust rounded-sm px-4 py-3 text-sm">
          No booking found for reference <b>{ref}</b>.
        </div>
      )}

      {booking && (
        <div className="border-2 border-ink rounded-md p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-condensed font-bold text-xl">{booking.ref}</div>
              <div className="text-slate text-sm">
                Nairobi &rarr; {booking.destination}
              </div>
            </div>
            <span
              className={`font-mono text-[10px] uppercase px-2.5 py-1 rounded-sm ${
                booking.status === "verified"
                  ? "bg-teal/15 text-teal"
                  : booking.status === "paid"
                  ? "bg-amber/20 text-amber"
                  : "bg-rust/15 text-rust"
              }`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[13px] mb-5">
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Carrier</div>
              <div className="font-semibold">{booking.carrierName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Weight</div>
              <div className="font-semibold">{booking.weightKg} kg</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Description</div>
              <div className="font-semibold">{booking.description}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Fee</div>
              <div className="font-semibold">
                KES {booking.priceKes} &middot;{" "}
                {booking.status === "paid" || booking.status === "verified" ? "Paid" : "Unpaid"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Sender</div>
              <div className="font-semibold">{booking.senderName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate mb-0.5">Recipient</div>
              <div className="font-semibold">{booking.recipientName}</div>
            </div>
          </div>

          {booking.status === "verified" ? (
            <div className="text-center py-3 border-2 border-teal rounded-sm text-teal font-condensed font-bold uppercase tracking-wide">
              &#10003; Verified &amp; accepted
            </div>
          ) : (
            <button
              onClick={verify}
              disabled={verifying}
              className="w-full bg-teal text-white font-condensed font-bold uppercase tracking-wide py-3.5 rounded-sm disabled:opacity-60"
            >
              {verifying ? "Verifying…" : "Verify & accept parcel"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
