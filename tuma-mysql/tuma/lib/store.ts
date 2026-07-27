import { getPool } from "./db";
import { Booking, BookingStatus } from "./types";
import { RowDataPacket } from "mysql2";

interface BookingRow extends RowDataPacket {
  ref: string;
  created_at: Date;
  status: BookingStatus;
  description: string;
  category: string;
  weight_kg: string;
  photo_data_url: string | null;
  origin: string;
  destination: string;
  sender_name: string;
  sender_phone: string | null;
  recipient_name: string;
  recipient_phone: string | null;
  carrier_key: string;
  carrier_name: string;
  price_kes: number;
  mpesa_phone: string | null;
  paid_at: Date | null;
  verified_at: Date | null;
}

function rowToBooking(row: BookingRow): Booking {
  return {
    ref: row.ref,
    createdAt: row.created_at.toISOString(),
    status: row.status,
    description: row.description,
    category: row.category,
    weightKg: Number(row.weight_kg),
    photoDataUrl: row.photo_data_url,
    origin: row.origin,
    destination: row.destination,
    senderName: row.sender_name,
    senderPhone: row.sender_phone || "",
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone || "",
    carrierKey: row.carrier_key,
    carrierName: row.carrier_name,
    priceKes: row.price_kes,
    mpesaPhone: row.mpesa_phone,
    paidAt: row.paid_at ? row.paid_at.toISOString() : null,
    verifiedAt: row.verified_at ? row.verified_at.toISOString() : null,
  };
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO bookings
      (ref, created_at, status, description, category, weight_kg, photo_data_url,
       origin, destination, sender_name, sender_phone, recipient_name, recipient_phone,
       carrier_key, carrier_name, price_kes, mpesa_phone, paid_at, verified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      booking.ref,
      new Date(booking.createdAt),
      booking.status,
      booking.description,
      booking.category,
      booking.weightKg,
      booking.photoDataUrl,
      booking.origin,
      booking.destination,
      booking.senderName,
      booking.senderPhone || null,
      booking.recipientName,
      booking.recipientPhone || null,
      booking.carrierKey,
      booking.carrierName,
      booking.priceKes,
      booking.mpesaPhone,
      booking.paidAt ? new Date(booking.paidAt) : null,
      booking.verifiedAt ? new Date(booking.verifiedAt) : null,
    ]
  );
  return booking;
}

export async function getBooking(ref: string): Promise<Booking | undefined> {
  const pool = getPool();
  const [rows] = await pool.query<BookingRow[]>(
    "SELECT * FROM bookings WHERE ref = ? LIMIT 1",
    [ref]
  );
  if (!rows.length) return undefined;
  return rowToBooking(rows[0]);
}

export async function updateBooking(
  ref: string,
  patch: Partial<Booking>
): Promise<Booking | undefined> {
  const existing = await getBooking(ref);
  if (!existing) return undefined;

  const merged: Booking = { ...existing, ...patch };
  const pool = getPool();
  await pool.query(
    `UPDATE bookings SET
      status = ?, mpesa_phone = ?, paid_at = ?, verified_at = ?
     WHERE ref = ?`,
    [
      merged.status,
      merged.mpesaPhone,
      merged.paidAt ? new Date(merged.paidAt) : null,
      merged.verifiedAt ? new Date(merged.verifiedAt) : null,
      ref,
    ]
  );
  return merged;
}

export function generateRef(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `TM-${num}`;
}
