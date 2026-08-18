import Link from "next/link";
import DepartureBoard from "@/components/DepartureBoard";
import { CARRIERS } from "@/lib/types";

export default function LandingPage() {
  return (
    <main>
      {/* NAV */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="font-display text-xl tracking-tight">
          tu<span className="text-amber">ma</span>.
        </div>
        <Link
          href="/book"
          className="font-condensed font-bold uppercase tracking-wide text-sm bg-ink text-paper px-5 py-2.5 rounded-sm hover:bg-black transition-colors"
        >
          Book a parcel
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <video
          className="hero-video absolute inset-0 -z-10 w-full h-full object-cover"
          src="/hero-3d.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* scrim — keeps the copy legible over the animation */}
        <div className="absolute inset-0 -z-10 bg-ink/75" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-[1.15fr_1fr] gap-12 items-center">
          <div>
            <div className="font-mono text-xs uppercase tracking-[2px] text-amber mb-5">
              For Nairobi&rsquo;s bus &amp; courier counters
            </div>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">
              Skip the line.
              <br />
              Print your ticket
              <br />
              at home.
            </h1>
            <p className="text-paper/70 text-lg max-w-md mb-9 leading-relaxed">
              Photograph your parcel, pick a carrier, pay on M-Pesa, and walk
              straight to the counter with a ready ticket. No forms. No
              queue.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/book"
                className="font-condensed font-bold uppercase tracking-wide bg-amber text-ink px-7 py-3.5 rounded-sm hover:brightness-95 transition"
              >
                Book a parcel
              </Link>
              <a
                href="#how"
                className="font-condensed font-bold uppercase tracking-wide border-2 border-paper/30 px-7 py-3.5 rounded-sm hover:border-paper/60 transition"
              >
                See how it works
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <DepartureBoard />
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="font-mono text-xs uppercase tracking-[2px] text-amber mb-3">
          The problem
        </div>
        <h2 className="font-display text-3xl md:text-4xl mb-14 max-w-xl">
          Booking a parcel still means a trip you didn&rsquo;t need to make.
        </h2>

        <div className="grid md:grid-cols-2 gap-px bg-ink/10 border border-ink/10 rounded-md overflow-hidden">
          <div className="bg-white p-8">
            <div className="font-condensed font-bold uppercase tracking-wide text-sm text-slate mb-5">
              The queue, today
            </div>
            <ul className="space-y-4 text-[15px] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-rust font-bold">&times;</span>
                Travel to the office just to fill in a form
              </li>
              <li className="flex gap-3">
                <span className="text-rust font-bold">&times;</span>
                Wait behind everyone else doing the same paperwork
              </li>
              <li className="flex gap-3">
                <span className="text-rust font-bold">&times;</span>
                Counter staff re-type details you already know
              </li>
              <li className="flex gap-3">
                <span className="text-rust font-bold">&times;</span>
                Pay in person, in cash or on the spot
              </li>
            </ul>
          </div>
          <div className="bg-ink text-paper p-8">
            <div className="font-condensed font-bold uppercase tracking-wide text-sm text-amber mb-5">
              With tuma
            </div>
            <ul className="space-y-4 text-[15px] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-teal font-bold">&#10003;</span>
                Fill everything in from wherever you are
              </li>
              <li className="flex gap-3">
                <span className="text-teal font-bold">&#10003;</span>
                Pay upfront on M-Pesa in a few taps
              </li>
              <li className="flex gap-3">
                <span className="text-teal font-bold">&#10003;</span>
                Arrive with a ticket already printed
              </li>
              <li className="flex gap-3">
                <span className="text-teal font-bold">&#10003;</span>
                Staff scan a QR code &mdash; parcel accepted in seconds
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white border-y-2 border-ink">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="font-mono text-xs uppercase tracking-[2px] text-amber mb-3">
            How it works
          </div>
          <h2 className="font-display text-3xl md:text-4xl mb-14 max-w-xl">
            Five stops from photo to drop-off.
          </h2>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { n: "01", t: "Parcel", d: "Photograph the item, describe it, note the weight." },
              { n: "02", t: "Route", d: "Enter destination and sender / recipient details." },
              { n: "03", t: "Carrier", d: "Compare carriers and prices, pick one." },
              { n: "04", t: "Pay", d: "Confirm the fee with an M-Pesa STK push." },
              { n: "05", t: "Ticket", d: "Print or screenshot your QR ticket. Drop off." },
            ].map((s) => (
              <div key={s.n} className="border-t-4 border-ink pt-4">
                <div className="font-mono text-xs text-slate mb-2">{s.n}</div>
                <div className="font-condensed font-bold text-xl mb-2">{s.t}</div>
                <div className="text-[13.5px] text-slate leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARRIERS */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="font-mono text-xs uppercase tracking-[2px] text-amber mb-3">
          Works with
        </div>
        <h2 className="font-display text-3xl md:text-4xl mb-12 max-w-xl">
          Book across every counter, one flow.
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {CARRIERS.map((c) => (
            <div
              key={c.key}
              className="border-2 border-ink rounded-md p-6 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber flex items-center justify-center font-display text-sm shrink-0">
                {c.badge}
              </div>
              <div>
                <div className="font-condensed font-bold text-lg leading-tight">
                  {c.name}
                </div>
                <div className="font-mono text-[11px] text-slate mt-1">{c.eta}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-6">
            Your next parcel doesn&rsquo;t need a queue.
          </h2>
          <Link
            href="/book"
            className="inline-block font-condensed font-bold uppercase tracking-wide bg-amber text-ink px-8 py-4 rounded-sm hover:brightness-95 transition"
          >
            Book a parcel now
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-[13px] text-slate">
        <div className="font-display text-base text-ink">
          tu<span className="text-amber">ma</span>.
        </div>
        <div>Prototype for demonstration purposes &middot; Nairobi, Kenya</div>
      </footer>
    </main>
  );
}
