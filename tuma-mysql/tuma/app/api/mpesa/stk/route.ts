import { NextRequest, NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/store";
import { initiateStkPush, normalizeMsisdn } from "@/lib/daraja";

/**
 * Starts an M-Pesa payment for a booking.
 *
 * The CheckoutRequestID that Daraja returns is the only handle Safaricom
 * gives us for the resulting callback — it identifies the transaction by
 * that, not by our booking ref. It must be stored, or the callback has
 * nothing to match against and the payment can never be recorded.
 */
export async function POST(req: NextRequest) {
  const { ref, phone } = await req.json().catch(() => ({}));

  if (!ref || !phone) {
    return NextResponse.json(
      { error: "A booking reference and phone number are required" },
      { status: 400 }
    );
  }

  const booking = await getBooking(ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Don't push a second prompt for something already settled — a retry here
  // would charge the customer twice.
  if (booking.status === "paid" || booking.status === "verified") {
    return NextResponse.json(
      { error: "This booking has already been paid for" },
      { status: 409 }
    );
  }

  const msisdn = normalizeMsisdn(phone);
  if (msisdn.length < 12) {
    return NextResponse.json(
      { error: "That doesn't look like a valid M-Pesa number" },
      { status: 400 }
    );
  }

  try {
    const result = await initiateStkPush({
      phone: msisdn,
      amount: booking.priceKes,
      accountReference: booking.ref,
      transactionDesc: "Parcel fee",
    });

    await updateBooking(ref, {
      status: "pending_payment",
      mpesaPhone: msisdn,
      mpesaCheckoutRequestId: result.checkoutRequestId,
    });

    return NextResponse.json({
      status: "pending",
      message:
        result.customerMessage || "Check your phone and enter your M-Pesa PIN",
      checkoutRequestId: result.checkoutRequestId,
    });
  } catch (err: any) {
    console.error("[mpesa/stk] push failed for", ref, err);
    return NextResponse.json(
      { error: err.message || "Could not start M-Pesa payment" },
      { status: 502 }
    );
  }
}
