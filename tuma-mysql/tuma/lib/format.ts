/**
 * Formatting helpers.
 *
 * Locale and time zone are pinned rather than left to the runtime: these
 * values are rendered on the server and hydrated on the client, and a
 * machine-vs-browser locale mismatch would produce a hydration error.
 */
const KES = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0,
});

export function formatKes(amount: number): string {
  return `KES ${KES.format(Math.round(amount))}`;
}

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Nairobi",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Nairobi",
});

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_TIME.format(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_ONLY.format(d);
}

/** "0712 345 678" — cosmetic only, never used for the M-Pesa payload. */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}
