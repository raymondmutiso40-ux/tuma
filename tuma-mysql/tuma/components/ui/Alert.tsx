import { cn } from "@/lib/cn";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "./icons";

export type AlertTone = "error" | "success" | "info" | "warning";

const TONES: Record<AlertTone, { box: string; icon: string }> = {
  error: { box: "bg-danger-soft border-danger/25 text-danger", icon: "text-danger" },
  success: {
    box: "bg-success-soft border-success/25 text-success",
    icon: "text-success",
  },
  warning: {
    box: "bg-warning-soft border-warning/25 text-warning",
    icon: "text-warning",
  },
  info: { box: "bg-info-soft border-info/25 text-info", icon: "text-info" },
};

const ICONS: Record<AlertTone, (p: { className?: string }) => JSX.Element> = {
  error: AlertIcon,
  success: CheckCircleIcon,
  warning: AlertIcon,
  info: InfoIcon,
};

export default function Alert({
  tone = "info",
  title,
  action,
  className,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const Icon = ICONS[tone];
  return (
    <div
      // Errors interrupt; everything else is announced politely.
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3.5 animate-slide-down",
        TONES[tone].box,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-px", TONES[tone].icon)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm leading-snug">{title}</p>}
        {children && (
          <div className={cn("text-[13.5px] leading-relaxed", title && "mt-0.5")}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
