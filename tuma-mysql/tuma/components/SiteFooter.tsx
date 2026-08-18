import Link from "next/link";
import Logo from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/book", label: "Book a parcel" },
      { href: "/track", label: "Track a parcel" },
      { href: "/#how", label: "How it works" },
      { href: "/#carriers", label: "Carriers" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/#faq", label: "Help & FAQ" },
      { href: "mailto:hello@tuma.co.ke", label: "hello@tuma.co.ke" },
      { href: "tel:+254700000000", label: "+254 700 000 000" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-paper/70 on-dark">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="text-2xl text-paper inline-block rounded-md">
              <Logo />
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Pre-book parcels with any Kenyan carrier, pay on M-Pesa and arrive
              at the counter with a ready QR ticket.
            </p>
            <p className="mt-4 flex items-center gap-2 text-2xs font-mono uppercase tracking-[0.14em] text-paper/45">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-light" aria-hidden />
              Nairobi, Kenya
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-2xs font-semibold uppercase tracking-[0.14em] text-amber mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-paper transition-colors rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-2xs">
          <p className="text-paper/45">
            © {new Date().getFullYear()} Tuma · Prototype for demonstration
            purposes
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-paper transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-paper transition-colors">
              Privacy
            </Link>
            <Link
              href="/admin"
              className="hover:text-paper transition-colors text-paper/45"
            >
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
