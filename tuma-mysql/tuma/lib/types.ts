export type BookingStatus =
  | "pending_payment"
  | "payment_failed"
  | "paid"
  | "verified";

export interface Booking {
  ref: string;
  createdAt: string;
  status: BookingStatus;

  // parcel
  description: string;
  category: string;
  weightKg: number;
  photoDataUrl: string | null;

  // route
  origin: string;
  destination: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;

  // carrier
  carrierKey: string;
  carrierName: string;
  priceKes: number;

  // payment
  mpesaPhone: string | null;
  mpesaCheckoutRequestId: string | null;
  mpesaReceiptNumber: string | null;
  paidAt: string | null;
  verifiedAt: string | null;
}

export interface Carrier {
  key: string;
  name: string;
  badge: string;
  eta: string;
  ratePerKg: number;
}

export const CARRIERS: Carrier[] = [
  { key: "easycoach", name: "Easycoach", badge: "EC", eta: "Same-day dispatch", ratePerKg: 38 },
  { key: "modern", name: "Modern Coast", badge: "MC", eta: "Next available bus", ratePerKg: 34 },
  { key: "guardian", name: "Guardian Angel", badge: "GA", eta: "Same-day dispatch", ratePerKg: 41 },
];

export const DESTINATIONS = ["Mombasa", "Kisumu", "Nakuru", "Eldoret", "Malindi", "Kakamega"];
