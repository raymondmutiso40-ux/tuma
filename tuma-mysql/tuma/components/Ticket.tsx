import { Booking } from "@/lib/types";

export default function Ticket({
  booking,
  qrDataUrl,
}: {
  booking: Booking;
  qrDataUrl: string;
}) {
  return (
    <div className="w-full max-w-sm mx-auto bg-white border-2 border-ink rounded-md overflow-hidden shadow-[0_16px_40px_rgba(27,31,43,0.18)]">
      <div className="bg-ink text-paper px-5 py-4 flex items-center justify-between">
        <div className="font-display text-lg">
          tu<span className="text-amber">ma</span>.
        </div>
        <div className="font-mono text-[11px] text-amber">{booking.ref}</div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between font-condensed font-bold text-2xl mb-4">
          <span>{booking.origin.split(" ")[0].toUpperCase()}</span>
          <span className="text-amber text-lg">&rarr;</span>
          <span>{booking.destination.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] mb-1">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate mb-0.5">Carrier</div>
            <div className="font-semibold">{booking.carrierName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate mb-0.5">Weight</div>
            <div className="font-semibold">{booking.weightKg} kg</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate mb-0.5">Sender</div>
            <div className="font-semibold">{booking.senderName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate mb-0.5">Recipient</div>
            <div className="font-semibold">{booking.recipientName}</div>
          </div>
        </div>
      </div>

      <div className="tear-line mx-[18px]" />

      <div className="p-5 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Booking QR code" className="w-[110px] h-[110px] shrink-0 border-4 border-white" />
        <div className="text-[12px] text-slate leading-relaxed">
          <div className="font-mono font-bold text-ink text-[15px] mb-1">{booking.ref}</div>
          Scan at the carrier counter to verify commodity, weight &amp; payment.
          Valid for drop-off within 48 hours.
        </div>
      </div>
    </div>
  );
}
