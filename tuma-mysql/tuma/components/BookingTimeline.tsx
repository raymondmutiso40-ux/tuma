import { Booking } from "@/lib/types";
import { buildJourney } from "@/lib/status";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { CheckIcon, XIcon } from "./ui/icons";

/**
 * The parcel journey, booked → delivered. Each step's state is carried by
 * the icon and the label as well as the colour, so it survives a
 * black-and-white print and colour-blind viewing.
 */
export default function BookingTimeline({ booking }: { booking: Booking }) {
  const steps = buildJourney(booking);

  return (
    <ol className="relative">
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const done = step.state === "done";
        const current = step.state === "current";
        const failed = step.state === "failed";

        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {/* connector */}
            {!last && (
              <span
                className={cn(
                  "absolute left-[13px] top-7 bottom-0 w-0.5 rounded-full",
                  done ? "bg-teal" : "bg-ink-200"
                )}
                aria-hidden
              />
            )}

            <span
              className={cn(
                "relative z-10 w-[27px] h-[27px] rounded-full shrink-0 flex items-center justify-center border-2",
                done && "bg-teal border-teal text-white",
                current && "bg-white border-amber text-amber-700",
                failed && "bg-danger border-danger text-white",
                step.state === "upcoming" && "bg-white border-ink-200 text-ink-300"
              )}
            >
              {done && <CheckIcon className="w-3.5 h-3.5" />}
              {failed && <XIcon className="w-3.5 h-3.5" />}
              {current && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber" aria-hidden />
                  <span
                    className="absolute inset-0 rounded-full border-2 border-amber animate-pulse-ring"
                    aria-hidden
                  />
                </>
              )}
              {step.state === "upcoming" && (
                <span className="w-2 h-2 rounded-full bg-ink-200" aria-hidden />
              )}
            </span>

            <div className="min-w-0 flex-1 -mt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.state === "upcoming" ? "text-ink-400" : "text-ink",
                    failed && "text-danger"
                  )}
                >
                  {step.title}
                </p>
                {current && (
                  <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-amber-700">
                    In progress
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-[13px] leading-relaxed mt-0.5",
                  step.state === "upcoming" ? "text-ink-400" : "text-ink-500"
                )}
              >
                {step.detail}
              </p>
              {step.at && (
                <p className="font-mono text-2xs text-ink-400 mt-1">
                  {formatDateTime(step.at)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
