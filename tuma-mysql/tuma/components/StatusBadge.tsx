import Badge from "./ui/Badge";
import { STATUS_META } from "@/lib/status";
import { BookingStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: BookingStatus }) {
  // Unknown values shouldn't be possible, but a booking row from an older
  // deploy shouldn't crash a whole table either.
  const meta = STATUS_META[status] ?? {
    label: String(status).replace(/_/g, " "),
    tone: "neutral" as const,
  };
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}
