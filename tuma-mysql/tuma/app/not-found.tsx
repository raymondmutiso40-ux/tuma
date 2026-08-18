import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { buttonClasses } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main
        id="main"
        className="max-w-xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center"
      >
        <span className="mx-auto mb-6 flex w-14 h-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
          <SearchIcon className="w-6 h-6" />
        </span>
        <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
          Page not found
        </p>
        <h1 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-2">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-4 text-[15px] text-ink-500 leading-relaxed max-w-sm mx-auto">
          The link may be out of date. If you were looking for a booking, track
          it with your reference instead.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/track" className={buttonClasses({ size: "lg" })}>
            Track a parcel
          </Link>
          <Link
            href="/"
            className={buttonClasses({ variant: "outline", size: "lg" })}
          >
            Back to home
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
