import { cn } from "@/lib/cn";
import { CheckIcon } from "./ui/icons";

/**
 * Booking progress.
 *
 * Two presentations of the same state: a labelled track on tablet and up,
 * and a compact "Step 2 of 5" bar on phones — where five labels side by side
 * would be unreadable. The bar is the same element, not a second component,
 * so the two can't drift apart.
 */
export default function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div>
      {/* Phones */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-[13px] font-semibold">{steps[current]}</p>
          <p className="font-mono text-2xs text-ink-500">
            Step {current + 1} of {steps.length}
          </p>
        </div>
        <div
          className="h-1.5 rounded-full bg-ink-200 overflow-hidden"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={current + 1}
          aria-label={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
        >
          <div
            className="h-full rounded-full bg-teal transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tablet and up */}
      <ol className="hidden sm:flex items-center gap-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors duration-300",
                    done && "bg-teal text-white",
                    active && "bg-ink text-paper",
                    !done && !active && "bg-ink-100 text-ink-400"
                  )}
                  aria-hidden
                >
                  {done ? <CheckIcon className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] font-medium whitespace-nowrap transition-colors duration-300",
                    active ? "text-ink" : done ? "text-ink-600" : "text-ink-400"
                  )}
                >
                  {label}
                  {active && <span className="sr-only"> (current step)</span>}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "flex-1 h-px min-w-[1rem] transition-colors duration-300",
                    done ? "bg-teal" : "bg-ink-200"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
