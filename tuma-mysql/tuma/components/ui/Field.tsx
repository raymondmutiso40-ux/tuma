"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "./icons";

const CONTROL_BASE =
  "w-full h-12 rounded-md border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-400 " +
  "transition-colors duration-150 focus:outline-none focus:ring-4 disabled:bg-ink-100 disabled:text-ink-400";

const CONTROL_OK =
  "border-ink-200 hover:border-ink-300 focus:border-teal focus:ring-teal/15";
const CONTROL_ERROR = "border-danger focus:border-danger focus:ring-danger/15";

/**
 * Label + hint + error wrapper. Wires `htmlFor`, `aria-describedby` and
 * `aria-invalid` for whatever control it wraps, so form errors are announced
 * rather than just coloured red.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (ids: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-semibold text-ink-800 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-danger ml-0.5" aria-hidden>
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {error ? (
        <p id={errorId} className="mt-1.5 text-[12.5px] text-danger font-medium">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[12.5px] text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ invalid, className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL_BASE, invalid ? CONTROL_ERROR : CONTROL_OK, className)}
      {...rest}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ invalid, className, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL_BASE,
          invalid ? CONTROL_ERROR : CONTROL_OK,
          "appearance-none pr-11 cursor-pointer",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDownIcon className="w-4 h-4 text-ink-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
});
