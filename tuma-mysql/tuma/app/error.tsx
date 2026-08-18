"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button, { buttonClasses } from "@/components/ui/Button";
import Logo from "@/components/Logo";
import { AlertIcon } from "@/components/ui/icons";

/**
 * Route-level error boundary.
 *
 * Customers see plain language and a way forward — never a stack trace or an
 * HTTP status. The real error still goes to the console (and to whatever
 * monitoring is wired up in production) for whoever has to debug it.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[tuma] unhandled error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="max-w-content mx-auto w-full px-4 sm:px-6 py-6">
        <Link href="/" className="text-xl rounded-md">
          <Logo />
        </Link>
      </div>

      <main
        id="main"
        className="flex-1 flex items-center justify-center px-4 pb-20"
      >
        <div className="text-center max-w-md">
          <span className="mx-auto mb-6 flex w-14 h-14 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertIcon className="w-6 h-6" />
          </span>
          <h1 className="font-display text-3xl tracking-[-0.03em]">
            Something went wrong
          </h1>
          <p className="mt-4 text-[15px] text-ink-500 leading-relaxed">
            This one is on us — nothing you did caused it. Try again, and if it
            keeps happening let us know and we&rsquo;ll take a look.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={reset}>
              Try again
            </Button>
            <a
              href="mailto:hello@tuma.co.ke"
              className={buttonClasses({ variant: "outline", size: "lg" })}
            >
              Contact support
            </a>
          </div>

          {/* The digest is the one thing support can use to find this in the
              server logs, so it's worth showing — quietly. */}
          {error.digest && (
            <p className="mt-8 font-mono text-2xs text-ink-400">
              Reference: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
