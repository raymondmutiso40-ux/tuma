import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getBooking } from "@/lib/store";
import Ticket from "@/components/Ticket";
import TicketActions from "@/components/TicketActions";
import BookingTimeline from "@/components/BookingTimeline";
import SiteHeader from "@/components/SiteHeader";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import type { Metadata } from "next";

export function generateMetadata({
  params,
}: {
  params: { ref: string };
}): Metadata {
  return {
    title: `Ticket ${params.ref}`,
    robots: { index: false },
  };
}

export default async function TicketPage({
  params,
}: {
  params: { ref: string };
}) {
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
    width: 260,
    margin: 1,
    color: { dark: "#1B1F2B", light: "#FFFFFF" },
  });

  return (
    <>
      <SiteHeader />

      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="no-print text-center mb-9 animate-fade-up">
          <span className="mx-auto mb-4 flex w-14 h-14 items-center justify-center rounded-full bg-success text-white animate-check-pop">
            <CheckIcon className="w-7 h-7" />
          </span>
          <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
            Your ticket is ready
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-2">
            Show this at the counter
          </h1>
          <p className="mt-3 text-[15px] text-ink-500 max-w-sm mx-auto leading-relaxed">
            No form-filling and no queue — staff scan the code and take the
            parcel.
          </p>
        </div>

        <div className="animate-scale-in">
          <Ticket booking={booking} qrDataUrl={qrDataUrl} />
        </div>

        <div className="no-print mt-6 max-w-[26rem] mx-auto space-y-3">
          <TicketActions bookingRef={booking.ref} />
          <Link
            href="/book"
            className={buttonClasses({ fullWidth: true, size: "lg" })}
          >
            Book another parcel
          </Link>
        </div>

        <section className="no-print mt-12 max-w-[26rem] mx-auto rounded-lg border border-ink-200 bg-white p-6 shadow-card">
          <h2 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400 mb-5">
            What happens next
          </h2>
          <BookingTimeline booking={booking} />
        </section>

        <div className="no-print mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]">
          <Link
            href={`/track?ref=${booking.ref}`}
            className="font-semibold text-teal hover:text-teal-dark transition-colors"
          >
            Track this parcel
          </Link>
          <Link
            href={`/verify/${booking.ref}`}
            className="font-mono text-ink-400 hover:text-ink-600 transition-colors"
          >
            Counter scan view →
          </Link>
        </div>
      </main>
    </>
  );
}
