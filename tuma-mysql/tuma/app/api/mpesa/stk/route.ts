// app/api/mpesa/stk/route.ts — replace the whole existing file
import { NextRequest, NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/store";
import { initiateStkPush } from "@/lib/daraja";

export async function POST(req: NextRequest) {
  const { ref, phone } = await req.json();

  const booking = await getBooking(ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  try {
    const result = await initiateStkPush({
      phone,
      amount: booking.priceKes,
      accountReference: booking.ref,
      transactionDesc: "Parcel fee",
    });

    await updateBooking(ref, {
      mpesaPhone: null,
    mpesaCheckoutRequestId: null,
    mpesaReceiptNumber: null,
      
    });

    return NextResponse.json({
      status: "pending",
      message: result.customerMessage || "Check your phone and enter your M-Pesa PIN",
      checkoutRequestId: result.checkoutRequestId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Could not start M-Pesa payment" },
      { status: 502 }
    );
  }
}
