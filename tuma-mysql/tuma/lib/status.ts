import { Booking, BookingStatus } from "./types";
import type { BadgeTone } from "@/components/ui/Badge";

/**
 * Single source of truth for how each booking status is *presented*.
 * The stored values are unchanged — this only maps them to human wording
 * and a tone, so a status never reads differently on two screens.
 */
export const STATUS_META: Record<
  BookingStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  pending_payment: {
    label: "Awaiting payment",
    tone: "warning",
    description: "The M-Pesa payment hasn't been confirmed yet.",
  },
  payment_failed: {
    label: "Payment failed",
    tone: "danger",
    description: "The M-Pesa request was cancelled or timed out.",
  },
  paid: {
    label: "Paid",
    tone: "success",
    description: "Payment confirmed — the ticket is ready to use.",
  },
  verified: {
    label: "Accepted",
    tone: "info",
    description: "Scanned and accepted at the carrier counter.",
  },
};

export type JourneyStep = {
  key: string;
  title: string;
  detail: string;
  at: string | null;
  state: "done" | "current" | "failed" | "upcoming";
};

/**
 * Turns a booking into the visual journey shown on the tracking and verify
 * screens. Only the four stored states exist, so the journey is derived
 * rather than tracked separately.
 */
export function buildJourney(booking: Booking): JourneyStep[] {
  const { status } = booking;
  const paid = status === "paid" || status === "verified";
  const accepted = status === "verified";
  const failed = status === "payment_failed";

  return [
    {
      key: "booked",
      title: "Booking created",
      detail: `${booking.origin} → ${booking.destination}`,
      at: booking.createdAt,
      state: "done",
    },
    {
      key: "paid",
      title: failed ? "Payment failed" : "Payment confirmed",
      detail: failed
        ? "Start the payment again from the booking page."
        : "M-Pesa booking fee received.",
      at: booking.paidAt,
      state: failed ? "failed" : paid ? "done" : "current",
    },
    {
      key: "ticket",
      title: "Ticket issued",
      detail: "QR ticket ready to print or show at the counter.",
      at: booking.paidAt,
      state: paid ? "done" : "upcoming",
    },
    {
      key: "accepted",
      title: "Parcel accepted",
      detail: accepted
        ? `Checked in at the ${booking.carrierName} counter.`
        : `Hand the parcel to ${booking.carrierName} and let staff scan the QR.`,
      at: booking.verifiedAt,
      state: accepted ? "done" : paid ? "current" : "upcoming",
    },
    {
      key: "transit",
      title: "In transit",
      detail: `On the way to ${booking.destination}.`,
      at: null,
      state: accepted ? "current" : "upcoming",
    },
  ];
}
