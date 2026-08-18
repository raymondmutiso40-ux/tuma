import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "action"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  // Default call to action — the Tuma navy.
  primary:
    "bg-ink text-paper hover:bg-ink-800 active:bg-ink-950 shadow-sm hover:shadow-card",
  // Brand amber. Dark text, because amber can't carry white legibly.
  accent:
    "bg-amber text-ink hover:bg-amber-light active:bg-amber-600 shadow-sm hover:shadow-card",
  // Money / commit actions — teal reads as "safe to proceed".
  action:
    "bg-teal text-white hover:bg-teal-light active:bg-teal-dark shadow-sm hover:shadow-card",
  outline:
    "border border-ink-200 bg-white text-ink hover:border-ink-400 hover:bg-ink-100/60 active:bg-ink-100",
  ghost: "text-ink-600 hover:text-ink hover:bg-ink-100/70 active:bg-ink-200/60",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-md",
  // 44px — the minimum comfortable touch target on a phone.
  md: "h-11 px-5 text-sm gap-2 rounded-md",
  lg: "h-[52px] px-6 text-[15px] gap-2.5 rounded-lg",
};

export function buttonClasses(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
  } = opts ?? {};
  return cn(
    "inline-flex items-center justify-center font-semibold tracking-[-0.01em]",
    "transition-all duration-200 ease-out select-none",
    "disabled:opacity-55 disabled:pointer-events-none",
    "active:translate-y-px",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner and blocks input without changing the button's width. */
  loading?: boolean;
};

export default function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading && (
        <span
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
