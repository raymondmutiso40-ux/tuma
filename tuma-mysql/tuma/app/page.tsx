import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HeroVideo from "@/components/HeroVideo";
import DepartureBoard from "@/components/DepartureBoard";
import Reveal from "@/components/ui/Reveal";
import { buttonClasses } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  CameraIcon,
  CardIcon,
  CheckIcon,
  ClockIcon,
  QrIcon,
  ShieldIcon,
  TruckIcon,
  XIcon,
} from "@/components/ui/icons";
import { CARRIERS } from "@/lib/types";
import { formatKes } from "@/lib/format";

const STEPS = [
  {
    n: "01",
    title: "Capture your parcel",
    detail:
      "Photograph the item, describe it and note the weight. That photo is what counter staff check on drop-off.",
    Icon: CameraIcon,
  },
  {
    n: "02",
    title: "Choose your carrier",
    detail:
      "Compare carriers, travel times and prices side by side, then pick the one that suits you.",
    Icon: TruckIcon,
  },
  {
    n: "03",
    title: "Pay securely",
    detail:
      "Confirm the booking fee with an M-Pesa STK push. No cash at the counter, no surprises.",
    Icon: CardIcon,
  },
  {
    n: "04",
    title: "Receive your QR ticket",
    detail:
      "Print it or keep it on your phone. Staff scan the code and accept the parcel in seconds.",
    Icon: QrIcon,
  },
];

const OLD_WAY = [
  "Travel to the office just to fill in a form",
  "Wait behind everyone else doing the same paperwork",
  "Counter staff re-type details you already know",
  "Pay in person, in cash or on the spot",
];

const TUMA_WAY = [
  "Fill everything in from wherever you are",
  "Pay upfront on M-Pesa in a few taps",
  "Arrive with a ticket already printed",
  "Staff scan a QR code — parcel accepted in seconds",
];

const TRUST = [
  { Icon: ClockIcon, label: "Under 3 minutes", detail: "to complete a booking" },
  { Icon: ShieldIcon, label: "M-Pesa secured", detail: "paid before you travel" },
  { Icon: QrIcon, label: "QR verified", detail: "at the carrier counter" },
];

const FAQ = [
  {
    q: "Do I still need to go to the carrier's office?",
    a: "Yes — you drop the parcel off, but you skip the queue and the paperwork. Everything is already captured and paid for, so staff just scan your QR code and take the parcel.",
  },
  {
    q: "What am I paying for on M-Pesa?",
    a: "The booking fee for your chosen carrier, calculated from the parcel weight. You pay it upfront so nothing is owed at the counter.",
  },
  {
    q: "How long is my ticket valid?",
    a: "Drop the parcel off within 48 hours of booking. After that, book again — your details are quick to re-enter.",
  },
  {
    q: "What if the payment doesn't go through?",
    a: "The booking stays saved as awaiting payment and nothing is charged. You can start the M-Pesa request again from the booking page.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        {/* The 3D animation is the background of this whole section; the copy
            sits on top of it. HeroVideo brings its own scrim. */}
        <section className="relative isolate bg-ink-950 text-paper on-dark overflow-hidden">
          <HeroVideo />

          <div className="relative max-w-content mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-36">
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/10 px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.14em] text-amber">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber" aria-hidden />
                  For Nairobi&rsquo;s bus &amp; courier counters
                </span>

                <h1 className="font-display text-[2.5rem] leading-[1.04] tracking-[-0.03em] mt-6 sm:text-5xl lg:text-[3.75rem]">
                  Skip the line.
                  <br />
                  Print your ticket
                  <br />
                  <span className="text-amber">at home.</span>
                </h1>

                <p className="mt-6 text-[17px] leading-relaxed text-paper/85 max-w-md">
                  Photograph your parcel, pick a carrier, pay on M-Pesa and walk
                  straight to the counter with a ready ticket. No forms. No queue.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/book"
                    className={buttonClasses({
                      variant: "accent",
                      size: "lg",
                      className: "group",
                    })}
                  >
                    Book a parcel
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="#how"
                    className={buttonClasses({
                      size: "lg",
                      className:
                        "bg-white/5 text-paper border border-white/15 hover:bg-white/10 hover:border-white/25 shadow-none",
                    })}
                  >
                    See how it works
                  </a>
                </div>

                <dl className="mt-10 grid grid-cols-3 gap-4 max-w-lg border-t border-white/10 pt-6">
                  {TRUST.map(({ Icon, label, detail }) => (
                    <div key={label}>
                      <Icon className="w-5 h-5 text-amber mb-2" />
                      <dt className="text-[13.5px] font-semibold text-paper">
                        {label}
                      </dt>
                      <dd className="text-2xs text-paper/65 mt-0.5 leading-snug">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* The dispatch board floats over the animation on the right,
                  where the scrim is lightest. */}
              <div className="animate-fade-up [animation-delay:140ms] lg:justify-self-end lg:w-[22rem]">
                <DepartureBoard />
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section id="how" className="scroll-mt-20 bg-paper">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="max-w-xl">
              <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
                How Tuma works
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-3">
                Four steps from photo to drop-off.
              </h2>
              <p className="mt-4 text-ink-500 leading-relaxed">
                The whole journey — parcel, carrier, payment, ticket — happens
                before you leave the house.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 80}>
                  <div className="relative h-full">
                    {/* Journey connector, desktop only. */}
                    {i < STEPS.length - 1 && (
                      <span
                        // Sits level with the middle of the step icon (24px
                        // card padding + half of the 44px icon).
                        className="hidden lg:block absolute top-[46px] left-full w-6 border-t border-dashed border-ink-300"
                        aria-hidden
                      />
                    )}
                    <div className="h-full bg-white border border-ink-200 rounded-lg p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                      <div className="flex items-center justify-between mb-5">
                        <span className="w-11 h-11 rounded-lg bg-ink text-amber flex items-center justify-center">
                          <step.Icon className="w-5 h-5" />
                        </span>
                        <span className="font-mono text-sm text-ink-300 font-medium">
                          {step.n}
                        </span>
                      </div>
                      <h3 className="text-[17px] font-semibold tracking-[-0.02em]">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM / SOLUTION ───────────────────────────────────────── */}
        <section className="bg-white border-y border-ink-200">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="max-w-xl">
              <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
                The problem
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-3">
                Booking a parcel still means a trip you didn&rsquo;t need to make.
              </h2>
            </Reveal>

            <div className="mt-12 grid md:grid-cols-2 gap-5">
              <Reveal>
                <div className="h-full rounded-lg border border-ink-200 bg-paper-light p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-500 mb-6">
                    The queue, today
                  </h3>
                  <ul className="space-y-4">
                    {OLD_WAY.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-danger-soft text-danger flex items-center justify-center shrink-0 mt-0.5">
                          <XIcon className="w-3 h-3" />
                        </span>
                        <span className="text-ink-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="h-full rounded-lg bg-ink text-paper p-7 shadow-lifted on-dark">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-amber mb-6">
                    With Tuma
                  </h3>
                  <ul className="space-y-4">
                    {TUMA_WAY.map((item) => (
                      <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                        <span className="text-paper/85">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── CARRIERS ─────────────────────────────────────────────────── */}
        <section id="carriers" className="scroll-mt-20 bg-paper">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <Reveal className="max-w-xl">
              <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
                Works with
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-3">
                Book across every counter, one flow.
              </h2>
              <p className="mt-4 text-ink-500 leading-relaxed">
                Same booking, same ticket, whichever carrier you choose. Prices
                shown for a typical 3&nbsp;kg parcel.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {CARRIERS.map((carrier, i) => (
                <Reveal key={carrier.key} delay={i * 80}>
                  <div className="h-full bg-white border border-ink-200 rounded-lg p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="flex items-center gap-3.5">
                      <span className="w-12 h-12 rounded-full bg-amber text-ink flex items-center justify-center font-display text-sm shrink-0">
                        {carrier.badge}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[17px] tracking-[-0.01em] truncate">
                          {carrier.name}
                        </h3>
                        <p className="text-[13px] text-ink-500 mt-0.5">
                          {carrier.eta}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-ink-100 flex items-baseline justify-between">
                      <span className="text-2xs uppercase tracking-[0.1em] text-ink-400">
                        From
                      </span>
                      <span className="font-mono font-bold text-lg">
                        {formatKes(carrier.ratePerKg * 3)}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 bg-white border-t border-ink-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <Reveal>
              <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
                Questions
              </p>
              <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] mt-3">
                Before you book.
              </h2>
            </Reveal>

            <div className="mt-10 divide-y divide-ink-200 border-y border-ink-200">
              {FAQ.map((item) => (
                // <details> gives us keyboard support and open/close semantics
                // for free — no JS, no ARIA to get wrong.
                <details key={item.q} className="group py-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[15px] font-semibold tracking-[-0.01em] marker:hidden">
                    {item.q}
                    <span
                      className="w-7 h-7 rounded-full border border-ink-200 flex items-center justify-center shrink-0 transition-transform duration-200 group-open:rotate-45"
                      aria-hidden
                    >
                      <span className="relative block w-3 h-3">
                        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink-600" />
                        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink-600" />
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-[14.5px] text-ink-500 leading-relaxed max-w-2xl">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="bg-ink text-paper on-dark">
          <div className="max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] max-w-2xl mx-auto">
                Your next parcel doesn&rsquo;t need a queue.
              </h2>
              <p className="mt-4 text-paper/60 max-w-md mx-auto leading-relaxed">
                Book in under three minutes and collect your QR ticket before you
                leave the house.
              </p>
              <Link
                href="/book"
                className={buttonClasses({
                  variant: "accent",
                  size: "lg",
                  className: "mt-8 group",
                })}
              >
                Book a parcel now
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
