import { NextRequest, NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/store";

// This simulates what a real M-Pesa Daraja STK Push integration would do:
// 1. POST to Safaricom's /stkpush endpoint with the amount + phone number
// 2. Safaricom pushes a PIN prompt to the customer's phone
// 3. Safaricom calls your callback URL once the customer enters their PIN
// Here we just fake the delay and mark the booking as paid.

export async function POST(req: NextRequest) {
  const { ref, phone } = await req.json();

  const booking = await getBooking(ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const updated = await updateBooking(ref, {
    status: "paid",
    mpesaPhone: phone || null,
    paidAt: new Date().toISOString(),
  });

  return NextResponse.json({
    status: "success",
    message: "Payment confirmed",
    booking: updated,
  });
}
