import { Booking } from "@/lib/types";
import { formatDateTime, formatKes, formatPhone } from "@/lib/format";
import { STATUS_META } from "@/lib/status";
import Logo from "./Logo";
import Badge from "./ui/Badge";
import { ArrowRightIcon } from "./ui/icons";

/**
 * The parcel ticket.
 *
 * Built to survive a print: the perforation, the QR and the reference are
 * all real ink rather than background colour, and `print-exact` keeps the
 * dark header when the browser would otherwise drop it. The `--tear-notch`
 * variable tells the perforation cut-outs what colour sits behind the
 * ticket so they read as holes rather than dots.
 */
export default function Ticket({
  booking,
  qrDataUrl,
}: {
  booking: Booking;
  qrDataUrl: string;
}) {
  const meta = STATUS_META[booking.status];
  const paid = booking.status === "paid" || booking.status === "verified";

  return (
    <article
      className="print-exact w-full max-w-[26rem] mx-auto bg-white rounded-xl overflow-hidden border border-ink-200 shadow-ticket"
      style={{ ["--tear-notch" as string]: "#F7F3EC" }}
      aria-label={`Parcel ticket ${booking.ref}`}
    >
      {/* Header */}
      <div className="bg-ink text-paper px-5 py-4 flex items-center justify-between">
        <span className="text-lg">
          <Logo />
        </span>
        <span className="text-right">
          <span className="block font-mono text-2xs uppercase tracking-[0.14em] text-paper/50">
            Reference
          </span>
          <span className="block font-mono text-[15px] font-bold text-amber tracking-tight">
            {booking.ref}
          </span>
        </span>
      </div>

      {/* Route */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs uppercase tracking-[0.12em] text-ink-400">
              From
            </p>
            <p className="font-display text-xl tracking-[-0.02em] truncate">
              {booking.origin}
            </p>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-amber shrink-0" />
          <div className="min-w-0 text-right">
            <p className="text-2xs uppercase tracking-[0.12em] text-ink-400">
              To
            </p>
            <p className="font-display text-xl tracking-[-0.02em] truncate">
              {booking.destination}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-paper px-3.5 py-2.5">
          <div className="min-w-0">
            <p className="text-2xs uppercase tracking-[0.12em] text-ink-400">
              Carrier
            </p>
            <p className="text-[15px] font-semibold truncate">
              {booking.carrierName}
            </p>
          </div>
          <Badge tone={meta.tone} dot>
            {paid ? `${meta.label} · ${formatKes(booking.priceKes)}` : meta.label}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <dl className="px-5 py-5 grid grid-cols-2 gap-x-4 gap-y-4 text-[13.5px]">
        <Detail label="Sender" value={booking.senderName} sub={formatPhone(booking.senderPhone)} />
        <Detail
          label="Recipient"
          value={booking.recipientName}
          sub={formatPhone(booking.recipientPhone)}
        />
        <Detail label="Contents" value={booking.description} sub={booking.category} />
        {/* No fee here — the status badge above already carries it. */}
        <Detail label="Weight" value={`${booking.weightKg} kg`} />
      </dl>

      <div className="tear-line mx-[18px]" />

      {/* Stub */}
      <div className="px-5 py-5 flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for booking ${booking.ref}`}
          className="w-[124px] h-[124px] shrink-0 rounded-md border border-ink-100 bg-white p-1"
        />
        <div className="min-w-0">
          <p className="font-mono text-[15px] font-bold tracking-tight">
            {booking.ref}
          </p>
          <p className="text-[12.5px] text-ink-500 leading-relaxed mt-1.5">
            Scan at the {booking.carrierName} counter to verify the parcel,
            weight and payment. Valid for drop-off within 48 hours.
          </p>
          <p className="font-mono text-2xs text-ink-400 mt-2.5">
            Booked {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-2xs uppercase tracking-[0.12em] text-ink-400 mb-0.5">
        {label}
      </dt>
      <dd className="font-semibold break-words">{value || "—"}</dd>
      {sub && sub !== "—" && (
        <dd className="text-2xs text-ink-400 mt-0.5 break-words">{sub}</dd>
      )}
    </div>
  );
}
