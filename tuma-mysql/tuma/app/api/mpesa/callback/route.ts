import { NextRequest, NextResponse } from "next/server";
import { getBookingByCheckoutRequestId, updateBooking } from "@/lib/store";

/**
 * Safaricom's STK Push result callback — point MPESA_CALLBACK_URL here.
 *
 * This is the only thing that ever moves a booking to "paid". Without it the
 * booking flow starts a payment, polls for a confirmation that nothing is
 * writing, and times out after ~90 seconds no matter what the customer does
 * on their handset.
 *
 * Daraja posts a body shaped like:
 *
 *   { "Body": { "stkCallback": {
 *       "MerchantRequestID": "...",
 *       "CheckoutRequestID": "ws_CO_...",
 *       "ResultCode": 0,
 *       "ResultDesc": "The service request is processed successfully.",
 *       "CallbackMetadata": { "Item": [
 *         { "Name": "Amount", "Value": 152 },
 *         { "Name": "MpesaReceiptNumber", "Value": "SFG7H2K9LM" },
 *         { "Name": "TransactionDate", "Value": 20260818123045 },
 *         { "Name": "PhoneNumber", "Value": 254712345678 }
 *       ] } } } }
 *
 * ResultCode 0 is success; everything else is a failure (1032 cancelled,
 * 1037 timed out, 1 insufficient balance).
 */

type MetadataItem = { Name?: string; Value?: string | number };

function metadataValue(
  items: MetadataItem[],
  name: string
): string | number | undefined {
  return items.find((i) => i?.Name === name)?.Value;
}

/**
 * Daraja sends "20260818123045" — a local (EAT, UTC+3) wall-clock stamp with
 * no timezone marker. Reading it as UTC would file every payment three hours
 * early, so the offset is applied explicitly.
 */
function parseTransactionDate(value: string | number | undefined): string {
  const raw = String(value ?? "");
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw);
  if (!m) return new Date().toISOString();
  const [, y, mo, d, h, mi, s] = m;
  const parsed = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}+03:00`);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString()
    : parsed.toISOString();
}

/** Safaricom stops retrying once it gets this. */
const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

/**
 * The STK route stores the CheckoutRequestID only after Daraja replies, so a
 * very fast callback can arrive first. Retry the lookup briefly rather than
 * dropping a real payment on the floor.
 */
async function findBooking(checkoutRequestId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const booking = await getBookingByCheckoutRequestId(checkoutRequestId);
    if (booking) return booking;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  // This endpoint is public, and it decides whether a parcel counts as paid.
  // When MPESA_CALLBACK_SECRET is set, the token on the callback URL must
  // match, so a stranger who guesses a CheckoutRequestID still can't mark a
  // booking paid. Strongly recommended in production.
  const secret = process.env.MPESA_CALLBACK_SECRET;
  if (secret) {
    const token = req.nextUrl.searchParams.get("token");
    if (token !== secret) {
      console.warn("[mpesa/callback] rejected a call with a bad token");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    console.warn(
      "[mpesa/callback] MPESA_CALLBACK_SECRET is not set — this endpoint is unauthenticated"
    );
  }

  const body = await req.json().catch(() => null);
  const callback = body?.Body?.stkCallback;
  const checkoutRequestId: string | undefined = callback?.CheckoutRequestID;

  if (!checkoutRequestId) {
    // Nothing actionable, and retrying won't improve it — acknowledge so
    // Safaricom stops resending.
    console.error("[mpesa/callback] unrecognised payload", JSON.stringify(body));
    return NextResponse.json(ACK);
  }

  try {
    const booking = await findBooking(checkoutRequestId);
    if (!booking) {
      console.error(
        "[mpesa/callback] no booking for CheckoutRequestID",
        checkoutRequestId
      );
      return NextResponse.json(ACK);
    }

    // Callbacks can be delivered more than once. Settled bookings stay
    // settled — in particular, a repeat must never knock a parcel that has
    // already been accepted at the counter back to "paid".
    if (booking.status === "paid" || booking.status === "verified") {
      return NextResponse.json(ACK);
    }

    const resultCode = Number(callback.ResultCode);

    if (resultCode !== 0) {
      console.info(
        `[mpesa/callback] ${booking.ref} not paid: ${resultCode} ${callback.ResultDesc ?? ""}`
      );
      await updateBooking(booking.ref, { status: "payment_failed" });
      return NextResponse.json(ACK);
    }

    const items: MetadataItem[] = callback.CallbackMetadata?.Item ?? [];
    const amount = Number(metadataValue(items, "Amount"));
    const receipt = metadataValue(items, "MpesaReceiptNumber");

    // We set the amount ourselves when starting the push, so a mismatch means
    // either a bug or a forged callback. Don't mark it paid on that basis —
    // leave it for a human to look at.
    if (Number.isFinite(amount) && Math.round(amount) !== booking.priceKes) {
      console.error(
        `[mpesa/callback] amount mismatch on ${booking.ref}: got ${amount}, expected ${booking.priceKes}`
      );
      return NextResponse.json(ACK);
    }

    await updateBooking(booking.ref, {
      status: "paid",
      mpesaReceiptNumber: receipt ? String(receipt) : null,
      paidAt: parseTransactionDate(metadataValue(items, "TransactionDate")),
    });

    console.info(`[mpesa/callback] ${booking.ref} paid, receipt ${receipt}`);
    return NextResponse.json(ACK);
  } catch (err) {
    // A failure here is ours, not Safaricom's. Return 500 so the callback is
    // retried rather than silently losing a real payment.
    console.error("[mpesa/callback] failed to record", checkoutRequestId, err);
    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Could not record the payment" },
      { status: 500 }
    );
  }
}

// Daraja only ever POSTs here. Answering GET makes it obvious the URL is live
// when you paste it into a browser while setting the integration up.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "M-Pesa callback endpoint. Safaricom posts STK results here.",
  });
}
