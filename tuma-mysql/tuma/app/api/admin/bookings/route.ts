import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllBookings, updateBooking } from "@/lib/store";

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Temporary debug logging — check Vercel function logs for this to see
  // exactly what's happening with the session/cookie on each request.
  console.log("[admin/bookings] cookie header present:", !!req.headers.get("cookie"));
  console.log("[admin/bookings] session:", JSON.stringify(session));
  return !!session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await getAllBookings();
  return NextResponse.json({ bookings });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ref, status } = await req.json();
  const allowedStatuses = ["pending_payment", "payment_failed", "paid", "verified"];
  if (!ref || !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid ref or status" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paidAt = new Date().toISOString();
  if (status === "verified") patch.verifiedAt = new Date().toISOString();

  const updated = await updateBooking(ref, patch);
  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: updated });
}
