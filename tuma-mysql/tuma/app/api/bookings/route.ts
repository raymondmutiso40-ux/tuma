import { NextRequest, NextResponse } from "next/server";
import { createBooking, generateRef } from "@/lib/store";
import { CARRIERS } from "@/lib/types";
import { Booking } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    description,
    category,
    weightKg,
    photoDataUrl,
    origin,
    destination,
    senderName,
    senderPhone,
    recipientName,
    recipientPhone,
    carrierKey,
  } = body;

  if (!description || !weightKg || !destination || !senderName || !recipientName || !carrierKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const carrier = CARRIERS.find((c) => c.key === carrierKey);
  if (!carrier) {
    return NextResponse.json({ error: "Unknown carrier" }, { status: 400 });
  }

  const priceKes = Math.round(carrier.ratePerKg * Number(weightKg));
  const ref = generateRef();

  const booking: Booking = {
    ref,
    createdAt: new Date().toISOString(),
    status: "pending_payment",
    description,
    category: category || "Other",
    weightKg: Number(weightKg),
    photoDataUrl: photoDataUrl || null,
    origin: origin || "Nairobi",
    destination,
    senderName,
    senderPhone: senderPhone || "",
    recipientName,
    recipientPhone: recipientPhone || "",
    carrierKey: carrier.key,
    carrierName: carrier.name,
    priceKes,
    mpesaPhone: null,
    paidAt: null,
    verifiedAt: null,
  };

  await createBooking(booking);

  return NextResponse.json({ booking });
}
