"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import StepIndicator from "@/components/StepIndicator";
import PhotoCapture from "@/components/PhotoCapture";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Field";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { CARRIERS, DESTINATIONS } from "@/lib/types";
import { formatKes } from "@/lib/format";
import { cn } from "@/lib/cn";

const STEPS = ["Parcel", "Route", "Carrier", "Review", "Payment"];
const CATEGORIES = ["Documents", "Electronics", "Clothing", "Food items", "Other"];

const PARCEL = 0;
const ROUTE = 1;
const CARRIER = 2;
const REVIEW = 3;
const PAYMENT = 4;

type Errors = Record<string, string>;

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(PARCEL);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [destination, setDestination] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  const [carrierKey, setCarrierKey] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");

  const [paying, setPaying] = useState(false);
  const [payStage, setPayStage] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const weightNum = parseFloat(weightKg) || 0;
  const selectedCarrier = CARRIERS.find((c) => c.key === carrierKey);
  const price = selectedCarrier
    ? Math.round(selectedCarrier.ratePerKg * (weightNum || 3))
    : 0;

  // The cheapest option for this parcel gets the "Best price" flag.
  const cheapestKey = CARRIERS.reduce((best, c) =>
    c.ratePerKg < best.ratePerKg ? c : best
  ).key;

  /** Same required fields as before — now reported per input. */
  function validate(target: number): boolean {
    const next: Errors = {};
    if (target === PARCEL) {
      if (!description.trim()) next.description = "Tell us what you're sending.";
      if (!weightKg) next.weightKg = "Add the parcel weight.";
      else if (weightNum <= 0) next.weightKg = "Weight must be more than 0 kg.";
    }
    if (target === ROUTE) {
      if (!destination) next.destination = "Choose a destination town.";
      if (!senderName.trim()) next.senderName = "Sender name is required.";
      if (!recipientName.trim()) next.recipientName = "Recipient name is required.";
    }
    if (target === CARRIER && !carrierKey) {
      next.carrierKey = "Pick a carrier to continue.";
    }
    if (target === PAYMENT) {
      const digits = mpesaPhone.replace(/\D/g, "");
      if (!digits) next.mpesaPhone = "Enter the M-Pesa number to charge.";
      else if (digits.length < 9) next.mpesaPhone = "That number looks too short.";
    }
    setErrors(next);
    setError("");
    return Object.keys(next).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    // Default the M-Pesa number to the sender's, but never overwrite a
    // number the user has already typed.
    if (step === REVIEW && !mpesaPhone) setMpesaPhone(senderPhone);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setErrors({});
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  function goTo(target: number) {
    setErrors({});
    setError("");
    setStep(target);
  }

  async function confirmAndPay() {
    if (!validate(PAYMENT)) return;
    setPaying(true);
    setPayStage("waiting");
    setError("");
    try {
      const createRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          category: category || "Other",
          weightKg: weightNum,
          photoDataUrl,
          origin: "Nairobi",
          destination,
          senderName,
          senderPhone,
          recipientName,
          recipientPhone,
          carrierKey,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Could not create booking");
      const ref = createData.booking.ref as string;

      const stkRes = await fetch("/api/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, phone: mpesaPhone }),
      });
      const stkData = await stkRes.json();
      if (!stkRes.ok) throw new Error(stkData.error || "Payment failed");

      // The STK push has been sent to the customer's phone. Real
      // confirmation comes from Safaricom's callback, which the server
      // records against this booking asynchronously — so we poll for it
      // rather than assuming success here.
      const confirmedStatus = await pollForPaymentResult(ref);

      if (confirmedStatus === "paid") {
        setPayStage("confirmed");
        setTimeout(() => router.push(`/ticket/${ref}`), 900);
      } else if (confirmedStatus === "payment_failed") {
        throw new Error(
          "Payment wasn't completed — you may have entered the wrong PIN or cancelled. Please try again."
        );
      } else {
        throw new Error(
          "Didn't receive confirmation in time. Check your phone — if you already paid, refresh in a moment."
        );
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setPaying(false);
      setPayStage("idle");
    }
  }

  // Polls GET /api/bookings/[ref] every 3s, for up to ~90s (the customer
  // has 60s to enter their PIN, plus a little slack for the callback to
  // arrive and be processed).
  async function pollForPaymentResult(
    ref: string
  ): Promise<"paid" | "payment_failed" | "timeout"> {
    const maxAttempts = 30;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const res = await fetch(`/api/bookings/${ref}`);
      if (!res.ok) continue;
      const data = await res.json();
      const status = data.booking?.status;
      if (status === "paid") return "paid";
      if (status === "payment_failed") return "payment_failed";
    }
    return "timeout";
  }

  return (
    <>
      <SiteHeader />

      {/* Progress sits directly under the nav and stays put while the step
          content scrolls. */}
      <div className="sticky top-16 z-40 bg-paper/90 backdrop-blur-md border-b border-ink-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5">
          <StepIndicator steps={STEPS} current={step} />
        </div>
      </div>

      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 pb-32 pt-8 sm:pt-10">
        {error && (
          <Alert tone="error" title="We couldn't complete that" className="mb-6">
            {error}
          </Alert>
        )}

        {/* ── STEP 1 · PARCEL ───────────────────────────────────────────── */}
        {step === PARCEL && (
          <section key="parcel" className="animate-fade-up">
            <StepHeading
              eyebrow="Step 1 of 5"
              title="What are you sending?"
              description="Snap a photo and describe the item. This is what counter staff check against on drop-off."
            />

            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-semibold text-ink-800 mb-1.5">
                  Photo of the parcel
                  <span className="ml-2 font-normal text-ink-400">Optional</span>
                </p>
                <PhotoCapture value={photoDataUrl} onChange={setPhotoDataUrl} />
              </div>

              <Field
                label="What's inside"
                required
                error={errors.description}
                hint="A short description is enough — e.g. 2 boxes of phone accessories."
              >
                {({ id, describedBy, invalid }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    invalid={invalid}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 2 boxes of phone accessories"
                    autoComplete="off"
                  />
                )}
              </Field>

              <fieldset>
                <legend className="text-[13px] font-semibold text-ink-800 mb-2">
                  Category
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const on = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setCategory(on ? "" : c)}
                        className={cn(
                          "h-10 px-4 rounded-full text-[13.5px] font-medium border transition-all duration-150",
                          on
                            ? "bg-ink text-paper border-ink"
                            : "bg-white text-ink-600 border-ink-200 hover:border-ink-400"
                        )}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <Field
                label="Weight"
                required
                error={errors.weightKg}
                hint="Your carrier's fee is calculated per kilo."
              >
                {({ id, describedBy, invalid }) => (
                  <div className="relative">
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      type="number"
                      inputMode="decimal"
                      min="0.5"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 4"
                      className="pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-400 pointer-events-none">
                      kg
                    </span>
                  </div>
                )}
              </Field>
            </div>
          </section>
        )}

        {/* ── STEP 2 · ROUTE ────────────────────────────────────────────── */}
        {step === ROUTE && (
          <section key="route" className="animate-fade-up">
            <StepHeading
              eyebrow="Step 2 of 5"
              title="Where's it headed?"
              description="Enter sender and recipient details exactly as they should appear on the ticket."
            />

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="rounded-md bg-ink-100/70 border border-ink-200 px-4 py-3">
                  <p className="text-2xs uppercase tracking-[0.1em] text-ink-400">
                    From
                  </p>
                  <p className="text-[15px] font-semibold mt-1">Nairobi</p>
                </div>
                <Field label="To" required error={errors.destination}>
                  {({ id, describedBy, invalid }) => (
                    <Select
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <option value="">Select destination town</option>
                      {DESTINATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>

              <ContactGroup title="Sender">
                <Field label="Full name" required error={errors.senderName}>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Full name"
                      autoComplete="name"
                    />
                  )}
                </Field>
                <Field label="Phone" hint="Used for booking updates.">
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      type="tel"
                      inputMode="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      autoComplete="tel"
                    />
                  )}
                </Field>
              </ContactGroup>

              <ContactGroup title="Recipient">
                <Field label="Full name" required error={errors.recipientName}>
                  {({ id, describedBy, invalid }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      invalid={invalid}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Full name"
                    />
                  )}
                </Field>
                <Field label="Phone" hint="They'll be called on arrival.">
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      type="tel"
                      inputMode="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                    />
                  )}
                </Field>
              </ContactGroup>
            </div>
          </section>
        )}

        {/* ── STEP 3 · CARRIER ──────────────────────────────────────────── */}
        {step === CARRIER && (
          <section key="carrier" className="animate-fade-up">
            <StepHeading
              eyebrow="Step 3 of 5"
              title="Pick a carrier"
              description={`Prices shown for ${weightNum || 3} kg to ${
                destination || "your destination"
              }.`}
            />

            {errors.carrierKey && (
              <Alert tone="error" className="mb-4">
                {errors.carrierKey}
              </Alert>
            )}

            <div
              className="space-y-3"
              role="radiogroup"
              aria-label="Available carriers"
            >
              {CARRIERS.map((c) => {
                const p = Math.round(c.ratePerKg * (weightNum || 3));
                const selected = carrierKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setCarrierKey(c.key);
                      setErrors({});
                    }}
                    className={cn(
                      "w-full text-left rounded-lg border p-4 sm:p-5 transition-all duration-200",
                      "flex items-center gap-4",
                      selected
                        ? "border-teal bg-teal/[0.06] ring-2 ring-teal/25 shadow-card"
                        : "border-ink-200 bg-white hover:border-ink-300 hover:shadow-card"
                    )}
                  >
                    <span
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-display text-sm shrink-0 transition-colors",
                        selected ? "bg-teal text-white" : "bg-amber text-ink"
                      )}
                      aria-hidden
                    >
                      {selected ? <CheckIcon className="w-5 h-5" /> : c.badge}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[16px] tracking-[-0.01em]">
                          {c.name}
                        </span>
                        {c.key === cheapestKey && (
                          <Badge tone="success">Best price</Badge>
                        )}
                      </span>
                      <span className="block text-[13px] text-ink-500 mt-1">
                        {c.eta} · to {destination || "destination"}
                      </span>
                      <span className="mt-1.5 flex items-center gap-1.5 text-2xs font-medium text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
                        Accepting parcels today
                      </span>
                    </span>

                    <span className="text-right shrink-0">
                      <span className="block font-mono font-bold text-[17px]">
                        {formatKes(p)}
                      </span>
                      <span className="block text-2xs uppercase tracking-[0.08em] text-ink-400 mt-0.5">
                        booking fee
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── STEP 4 · REVIEW ───────────────────────────────────────────── */}
        {step === REVIEW && (
          <section key="review" className="animate-fade-up">
            <StepHeading
              eyebrow="Step 4 of 5"
              title="Check the details"
              description="Everything below goes onto your ticket. Change anything that isn't right before you pay."
            />

            <div className="rounded-lg border border-ink-200 bg-white shadow-card overflow-hidden">
              <ReviewGroup title="Parcel" onEdit={() => goTo(PARCEL)}>
                <ReviewRow label="Description" value={description} />
                <ReviewRow label="Category" value={category || "Other"} />
                <ReviewRow label="Weight" value={`${weightNum} kg`} />
                <ReviewRow
                  label="Photo"
                  value={photoDataUrl ? "Attached" : "Not attached"}
                />
              </ReviewGroup>

              <ReviewGroup title="Route" onEdit={() => goTo(ROUTE)}>
                <ReviewRow label="From" value="Nairobi" />
                <ReviewRow label="To" value={destination} />
                <ReviewRow
                  label="Sender"
                  value={[senderName, senderPhone].filter(Boolean).join(" · ")}
                />
                <ReviewRow
                  label="Recipient"
                  value={[recipientName, recipientPhone].filter(Boolean).join(" · ")}
                />
              </ReviewGroup>

              <ReviewGroup title="Carrier" onEdit={() => goTo(CARRIER)} last>
                <ReviewRow label="Carrier" value={selectedCarrier?.name ?? "—"} />
                <ReviewRow label="Dispatch" value={selectedCarrier?.eta ?? "—"} />
              </ReviewGroup>

              <div className="flex items-baseline justify-between px-5 py-4 bg-ink text-paper">
                <span className="text-sm font-medium text-paper/70">
                  Total due now
                </span>
                <span className="font-mono font-bold text-xl">
                  {formatKes(price)}
                </span>
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[13px] text-ink-500 leading-relaxed">
              <ShieldIcon className="w-4 h-4 text-teal shrink-0 mt-0.5" />
              You&rsquo;ll approve the payment on your own phone. Tuma never sees
              your M-Pesa PIN.
            </p>
          </section>
        )}

        {/* ── STEP 5 · PAYMENT ──────────────────────────────────────────── */}
        {step === PAYMENT && (
          <section key="payment" className="animate-fade-up">
            <StepHeading
              eyebrow="Step 5 of 5"
              title="Pay with M-Pesa"
              description="We'll send a payment request to your phone. Enter your PIN to confirm."
            />

            <div className="rounded-lg border border-ink-200 bg-white shadow-card p-5 mb-6">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-500">
                  {selectedCarrier?.name} · Nairobi → {destination}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-dashed border-ink-200">
                <span className="text-sm font-semibold">Amount to pay</span>
                <span className="font-mono font-bold text-2xl">
                  {formatKes(price)}
                </span>
              </div>
            </div>

            <Field
              label="M-Pesa number"
              required
              error={errors.mpesaPhone}
              hint="The STK push is sent to this number."
            >
              {({ id, describedBy, invalid }) => (
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    invalid={invalid}
                    type="tel"
                    inputMode="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    disabled={paying}
                    className="pl-10"
                  />
                </div>
              )}
            </Field>

            <Button
              variant="action"
              size="lg"
              fullWidth
              className="mt-6"
              loading={paying}
              onClick={confirmAndPay}
            >
              {paying ? "Waiting for confirmation…" : `Pay ${formatKes(price)}`}
            </Button>

            {payStage !== "idle" && (
              <div
                className="mt-6 rounded-lg border border-ink-200 bg-white p-5 text-center animate-scale-in"
                role="status"
                aria-live="polite"
              >
                {payStage === "waiting" ? (
                  <>
                    <span className="relative mx-auto mb-3 flex w-12 h-12 items-center justify-center">
                      <span className="absolute inset-0 rounded-full border-2 border-teal/40 animate-pulse-ring" />
                      <PhoneIcon className="w-6 h-6 text-teal" />
                    </span>
                    <p className="font-semibold text-[15px]">
                      Check your phone
                    </p>
                    <p className="text-[13.5px] text-ink-500 mt-1 leading-relaxed max-w-xs mx-auto">
                      Enter your M-Pesa PIN to approve {formatKes(price)}. This
                      page updates on its own — don&rsquo;t close it.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="mx-auto mb-3 flex w-12 h-12 items-center justify-center rounded-full bg-success text-white animate-check-pop">
                      <CheckIcon className="w-6 h-6" />
                    </span>
                    <p className="font-semibold text-[15px] text-success">
                      Payment confirmed
                    </p>
                    <p className="text-[13.5px] text-ink-500 mt-1">
                      Generating your ticket…
                    </p>
                  </>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Sticky action bar — thumb-reachable on a phone, and it never covers
          the payment button because that step renders its own. */}
      {step !== PAYMENT && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-ink-200">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex gap-3">
            {step > PARCEL && (
              <Button variant="outline" size="lg" onClick={back}>
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button size="lg" fullWidth onClick={next} className="group">
              {step === REVIEW ? "Continue to payment" : "Continue"}
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-7">
      <p className="font-mono text-2xs uppercase tracking-[0.16em] text-amber-700">
        {eyebrow}
      </p>
      <h1 className="font-display text-[27px] sm:text-3xl tracking-[-0.03em] mt-2">
        {title}
      </h1>
      <p className="mt-2.5 text-[14.5px] text-ink-500 leading-relaxed max-w-md">
        {description}
      </p>
    </header>
  );
}

function ContactGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-lg border border-ink-200 bg-white p-5">
      <legend className="px-2 -ml-2 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400">
        {title}
      </legend>
      <div className="grid sm:grid-cols-2 gap-5 mt-1">{children}</div>
    </fieldset>
  );
}

function ReviewGroup({
  title,
  onEdit,
  last = false,
  children,
}: {
  title: string;
  onEdit: () => void;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("p-5", !last && "border-b border-ink-200")}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xs font-semibold uppercase tracking-[0.12em] text-ink-400">
          {title}
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-[13px] font-semibold text-teal hover:text-teal-dark transition-colors rounded-sm"
        >
          Edit<span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      <dl className="space-y-2">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 text-[14px]">
      <dt className="text-ink-500 shrink-0">{label}</dt>
      <dd className="font-medium text-right break-words min-w-0">
        {value || "—"}
      </dd>
    </div>
  );
}
