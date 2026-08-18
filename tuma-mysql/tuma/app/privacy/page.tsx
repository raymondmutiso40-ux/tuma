import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Tuma collects when you book a parcel, and why.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="What the prototype collects when you book a parcel, why it needs it, and who can see it."
      sections={[
        {
          heading: "What we collect",
          body: [
            "For each booking: the parcel description, category and weight; the photo you attach, if any; the origin and destination; the sender's and recipient's names and phone numbers; the carrier you chose and the fee.",
            "For payment: the phone number the M-Pesa request is sent to, and the result Safaricom reports back. Your M-Pesa PIN is entered on your own handset and is never sent to, or stored by, Tuma.",
          ],
        },
        {
          heading: "Why we need it",
          body: [
            "The parcel details and photo are what counter staff check the parcel against on drop-off. The names and phone numbers appear on the ticket so the carrier can identify the sender and contact the recipient on arrival.",
          ],
        },
        {
          heading: "Who can see it",
          body: [
            "Anyone holding the booking reference can view that booking's status, and carrier counter staff can view its full details in order to accept the parcel. Tuma operations staff signed in to the admin area can see all bookings.",
            "Treat your booking reference like a ticket number: anyone you share it with can look the booking up.",
          ],
        },
        {
          heading: "How long it is kept",
          body: [
            "Bookings stay in the database for as long as the prototype runs. Because this is a demonstration build, do not enter details you would not be comfortable sharing.",
          ],
        },
        {
          heading: "Questions",
          body: [
            "Email hello@tuma.co.ke and we will answer, or delete a booking on request.",
          ],
        },
      ]}
    />
  );
}
