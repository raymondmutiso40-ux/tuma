import { NextRequest, NextResponse } from "next/server";
import { getBooking, updateBooking } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: { ref: string } }) {
  const booking = await getBooking(params.ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}

// Used by the /verify page to simulate a counter-staff scan confirming the parcel.
export async function PATCH(req: NextRequest, { params }: { params: { ref: string } }) {
  const body = await req.json().catch(() => ({}));
  const booking = await getBooking(params.ref);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (body.action === "verify") {
    const updated = await updateBooking(params.ref, {
      status: "verified",
      verifiedAt: new Date().toISOString(),
    });
    return NextResponse.json({ booking: updated });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
