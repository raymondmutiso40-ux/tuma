"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { buttonClasses } from "./ui/Button";
import { MenuIcon, XIcon } from "./ui/icons";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book a parcel" },
  { href: "/track", label: "Track parcel" },
  { href: "/#how", label: "How it works" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile panel on navigation — otherwise it stays open over the
  // new page after a client-side route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it too, and body scroll is locked while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // "/#how" is an anchor on the landing page, so it should never light up as
  // the current page on its own.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-ink-200/70">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="text-xl shrink-0 rounded-md"
            aria-label="tuma home"
          >
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "text-ink"
                      : "text-ink-500 hover:text-ink hover:bg-ink-100/70"
                  )}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-amber"
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/book"
              className={buttonClasses({
                size: "sm",
                className: "hidden sm:inline-flex",
              })}
            >
              Book a parcel
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden w-11 h-11 -mr-2 inline-flex items-center justify-center rounded-md text-ink hover:bg-ink-100 transition-colors"
            >
              {open ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel. Rendered under the bar, full width, big touch targets. */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-ink-200 bg-paper animate-slide-down"
        >
          <nav className="px-4 py-3" aria-label="Mobile">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between h-12 px-3 rounded-md text-[15px] font-medium transition-colors",
                    active ? "bg-ink text-paper" : "text-ink-700 hover:bg-ink-100"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber" aria-hidden />
                  )}
                </Link>
              );
            })}
            <Link
              href="/book"
              className={buttonClasses({ fullWidth: true, className: "mt-3" })}
            >
              Book a parcel
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
