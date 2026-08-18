import { cn } from "@/lib/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Adds a lift on hover — only for cards that are themselves clickable. */
  interactive?: boolean;
  padded?: boolean;
};

export default function Card({
  interactive = false,
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-ink-200 rounded-lg shadow-card",
        padded && "p-5 sm:p-6",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-card-hover",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        {eyebrow && (
          <div className="font-mono text-2xs uppercase tracking-[0.14em] text-amber-700 mb-1.5">
            {eyebrow}
          </div>
        )}
        <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
        {description && (
          <p className="text-sm text-ink-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
