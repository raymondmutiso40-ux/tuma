import { getBooking } from "@/lib/store";
import Ticket from "@/components/Ticket";
import PrintButton from "@/components/PrintButton";
import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";

export default async function TicketPage({ params }: { params: { ref: string } }) {
  const booking = await getBooking(params.ref);
  if (!booking) return notFound();

  const verifyPayload = JSON.stringify({
    ref: booking.ref,
    carrier: booking.carrierName,
    destination: booking.destination,
    weightKg: booking.weightKg,
    sender: booking.senderName,
    recipient: booking.recipientName,
  });

  const qrDataUrl = await QRCode.toDataURL(verifyPayload, {
    width: 220,
    margin: 1,
    color: { dark: "#1B1F2B", light: "#FFFFFF" },
  });

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">
      <header className="no-print px-6 pt-7 pb-5 border-b-2 border-ink flex items-center justify-between">
        <Link href="/" className="font-display text-xl">
          tu<span className="text-amber">ma</span>.
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-wide text-teal">
          Booking confirmed
        </span>
      </header>

      <main className="flex-1 px-6 py-10 flex flex-col items-center">
        <div className="no-print font-mono text-xs uppercase tracking-[1.5px] text-amber mb-1.5">
          Your ticket is ready
        </div>
        <h1 className="no-print font-display text-3xl mb-2 text-center">
          Show this at the counter
        </h1>
        <p className="no-print text-slate text-[14.5px] mb-8 max-w-md text-center">
          No form-filling, no queue &mdash; staff scan the code and take the
          parcel.
        </p>

        <Ticket booking={booking} qrDataUrl={qrDataUrl} />

        <div className="no-print flex gap-3 w-full max-w-sm mt-6">
          <PrintButton />
          <Link
            href="/book"
            className="flex-1 text-center bg-ink text-paper font-condensed font-bold uppercase tracking-wide py-3.5 rounded-sm"
          >
            New booking
          </Link>
        </div>

        <p className="no-print mt-6 text-[12.5px] text-slate text-center max-w-xs leading-relaxed">
          <b className="text-teal">Next:</b> walk to the {booking.carrierName}{" "}
          counter, hand over the parcel and let staff scan the QR.
        </p>

        <Link
          href={`/verify/${booking.ref}`}
          className="no-print mt-3 text-[12px] font-mono text-slate underline"
        >
          Simulate counter scan &rarr;
        </Link>
      </main>
    </div>
  );
}
