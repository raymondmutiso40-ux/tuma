"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Skeleton from "@/components/ui/Skeleton";
import { GoogleIcon, ShieldIcon } from "@/components/ui/icons";

/**
 * Admin sign-in.
 *
 * This route is excluded from the auth middleware so it stays reachable
 * while logged out — it is the only door into /admin.
 */
export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen bg-ink-950 text-paper on-dark flex flex-col overflow-hidden">
      {/* Same amber glow as the marketing hero, so staff land somewhere that
          still looks like Tuma. */}
      <div
        className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(232,162,61,0.12)_0%,transparent_65%)]"
        aria-hidden
      />

      <main
        id="main"
        className="relative flex-1 flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl inline-block rounded-md">
              <Logo />
            </Link>
            <p className="mt-4 flex items-center justify-center gap-2 font-mono text-2xs uppercase tracking-[0.16em] text-amber">
              <ShieldIcon className="w-4 h-4" />
              Staff access
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 shadow-lifted">
            <h1 className="font-display text-2xl tracking-[-0.02em] text-center">
              Sign in to admin
            </h1>
            <p className="mt-2.5 text-[14px] text-paper/60 text-center leading-relaxed">
              Bookings, payments and counter verification for the Tuma
              operations team.
            </p>

            <Suspense fallback={<Skeleton className="h-[52px] w-full mt-7" />}>
              <SignInPanel />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-[13px] text-paper/45">
            Not staff?{" "}
            <Link href="/" className="text-paper/80 hover:text-paper underline">
              Go back to Tuma
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * NextAuth reports failures by redirecting back here with `?error=`. These
 * are translated into plain language — an operator seeing "OAuthCallback"
 * learns nothing useful.
 */
const ERRORS: Record<string, { title: string; body: string }> = {
  AccessDenied: {
    title: "That account isn't on the admin list",
    body: "Sign in with an approved Tuma staff account, or ask an administrator to add your email.",
  },
  Configuration: {
    title: "Sign-in isn't configured",
    body: "The Google credentials are missing on the server. An administrator needs to set them before staff can sign in.",
  },
  Verification: {
    title: "That sign-in link expired",
    body: "Start again to get a fresh one.",
  },
};

const DEFAULT_ERROR = {
  title: "Couldn't complete sign-in",
  body: "Something went wrong on the way back from Google. Please try again.",
};

function SignInPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [busy, setBusy] = useState(false);

  const errorCode = searchParams.get("error");
  const error = errorCode ? ERRORS[errorCode] ?? DEFAULT_ERROR : null;

  // Already signed in — don't make staff click through a login they don't
  // need.
  useEffect(() => {
    if (status === "authenticated") router.replace("/admin");
  }, [status, router]);

  return (
    <>
      {error && (
        <div className="mt-6">
          <Alert tone="error" title={error.title}>
            {error.body}
          </Alert>
        </div>
      )}

      <Button
        size="lg"
        fullWidth
        className="mt-7 bg-white text-ink hover:bg-paper-light"
        // Only the click itself disables this. Gating on the session status
        // would render the one button on the page as disabled during the
        // initial session fetch, which reads as broken.
        loading={busy}
        onClick={() => {
          setBusy(true);
          signIn("google", { callbackUrl: "/admin" });
        }}
      >
        {!busy && <GoogleIcon className="w-5 h-5" />}
        Continue with Google
      </Button>

      <p className="mt-5 text-2xs text-paper/40 text-center leading-relaxed">
        Access is limited to approved Tuma staff accounts.
      </p>
    </>
  );
}
