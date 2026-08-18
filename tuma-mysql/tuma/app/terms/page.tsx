import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "How booking, payment and drop-off work when you use Tuma.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="What you can expect from Tuma, and what we expect from you when you book a parcel."
      sections={[
        {
          heading: "What Tuma does",
          body: [
            "Tuma is a booking layer in front of existing carriers. You capture the parcel details, choose a carrier and pay the booking fee up front. We issue a QR ticket that the carrier's counter staff scan when you drop the parcel off.",
            "Tuma does not transport parcels. Carriage, delivery times and any claim about a lost or damaged parcel are matters between you and the carrier you selected.",
          ],
        },
        {
          heading: "Booking fees and payment",
          body: [
            "The fee shown before payment is calculated from the parcel weight and the carrier's rate. You approve it on your own phone through an M-Pesa STK push — Tuma never sees or stores your M-Pesa PIN.",
            "If a payment is not confirmed, the booking stays in an unpaid state and no ticket is issued. Nothing is charged for an abandoned booking.",
          ],
        },
        {
          heading: "Using your ticket",
          body: [
            "Drop the parcel off within 48 hours of booking. A ticket is tied to the parcel described at booking — carriers can refuse a parcel that does not match its description, weight or photo.",
            "You are responsible for the accuracy of what you declare, and for not sending anything the carrier or Kenyan law prohibits.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "As a prototype, this service can change or be withdrawn without notice.",
          ],
        },
      ]}
    />
  );
}
