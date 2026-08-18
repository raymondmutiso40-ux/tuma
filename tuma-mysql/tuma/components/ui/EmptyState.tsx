import { cn } from "@/lib/cn";

/**
 * Nothing-here state. Every empty list in the product uses this so a blank
 * screen always explains itself and offers the next action.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14 animate-fade-in",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-ink-100 text-ink-500 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-[-0.01em]">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
