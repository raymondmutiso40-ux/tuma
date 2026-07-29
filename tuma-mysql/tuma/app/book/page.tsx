"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CARRIERS, DESTINATIONS } from "@/lib/types";

const STEPS = ["Parcel", "Route", "Carrier", "Pay"];
const CATEGORIES = ["Documents", "Electronics", "Clothing", "Food items", "Other"];

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

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
  const [mpesaPhone, setMpesaPhone] = useState("0712 345 678");

  const [paying, setPaying] = useState(false);
  const [payStage, setPayStage] = useState<"idle" | "waiting" | "confirmed">("idle");
  const [error, setError] = useState("");

  const weightNum = parseFloat(weightKg) || 0;
  const selectedCarrier = CARRIERS.find((c) => c.key === carrierKey);
  const price = selectedCarrier ? Math.round(selectedCarrier.ratePerKg * (weightNum || 3)) : 0;

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    setError("");
    if (step === 0) {
      if (!description.trim() || !weightKg) {
        setError("Add a description and weight.");
        return false;
      }
    }
    if (step === 1) {
      if (!destination || !senderName.trim() || !recipientName.trim()) {
        setError("Fill in destination, sender and recipient names.");
        return false;
      }
    }
    if (step === 2) {
      if (!carrierKey) {
        setError("Pick a carrier.");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validate()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  }

  async function confirmAndPay() {
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
        setTimeout(() => router.push(`/ticket/${ref}`), 800);
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
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">
      {/* header / tracker */}
      <header className="px-6 pt-7 pb-4 border-b-2 border-ink">
        <div className="flex items-baseline justify-between mb-4">
          <a href="/" className="font-display text-xl">
            tu<span className="text-amber">ma</span>.
          </a>
          <span className="font-mono text-[10px] uppercase tracking-wide text-slate">
            Nairobi &middot; Send
          </span>
        </div>
        <div className="flex gap-0.5">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 text-center pb-2.5 border-b-4 font-condensed font-bold text-[13px] uppercase tracking-wide transition-colors ${
                i === step
                  ? "border-amber text-ink"
                  : i < step
                  ? "border-teal text-teal"
                  : "border-ink/10 text-slate"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        {error && (
          <div className="mb-5 border-2 border-rust text-rust text-sm px-4 py-3 rounded-sm font-medium">
            {error}
          </div>
        )}

        {step === 0 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-[1.5px] text-amber mb-1.5">
              Step 1 of 4
            </div>
            <h1 className="font-display text-3xl mb-2">What are you sending?</h1>
            <p className="text-slate text-[14.5px] mb-7 max-w-md">
              Snap a photo and describe the item. This is what counter staff check
              against on drop-off.
            </p>

            <label className="block text-[12.5px] font-semibold mb-2">
              Photo of the commodity
            </label>
            <label
              htmlFor="photo"
              className="block border-2 border-dashed border-slate rounded-md p-6 text-center cursor-pointer hover:border-amber transition-colors mb-5"
            >
              <input id="photo" type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
              {photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoDataUrl} alt="commodity" className="max-h-48 mx-auto rounded-sm" />
              ) : (
                <>
                  <div className="text-2xl mb-1">📷</div>
                  <div className="text-sm text-slate">
                    <b className="text-ink">Tap to add a photo</b>
                    <br />
                    or drag one here
                  </div>
                </>
              )}
            </label>

            <label className="block text-[12.5px] font-semibold mb-2">
              Commodity description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 boxes of phone accessories"
              className="w-full border-2 border-ink rounded-sm px-3.5 py-3 mb-5 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/30"
            />

            <label className="block text-[12.5px] font-semibold mb-2">Category</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3.5 py-2 rounded-full text-[13px] font-semibold border-2 transition-colors ${
                    category === c
                      ? "bg-ink text-paper border-ink"
                      : "bg-white text-slate border-ink/15"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="block text-[12.5px] font-semibold mb-2">Weight (kg)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 4"
              className="w-full border-2 border-ink rounded-sm px-3.5 py-3 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/30"
            />
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-[1.5px] text-amber mb-1.5">
              Step 2 of 4
            </div>
            <h1 className="font-display text-3xl mb-2">Where&rsquo;s it headed?</h1>
            <p className="text-slate text-[14.5px] mb-7 max-w-md">
              Enter sender and recipient details exactly as they should appear on
              the ticket.
            </p>

            <label className="block text-[12.5px] font-semibold mb-2">To</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full border-2 border-ink rounded-sm px-3.5 py-3 mb-5 bg-white focus:outline-none focus:border-amber"
            >
              <option value="">Select destination town</option>
              {DESTINATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-[12.5px] font-semibold mb-2">Sender name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border-2 border-ink rounded-sm px-3.5 py-3 focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold mb-2">Sender phone</label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full border-2 border-ink rounded-sm px-3.5 py-3 focus:outline-none focus:border-amber"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-semibold mb-2">Recipient name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full name"
                  className="w-full border-2 border-ink rounded-sm px-3.5 py-3 focus:outline-none focus:border-amber"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold mb-2">Recipient phone</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="07XX XXX XXX"
                  className="w-full border-2 border-ink rounded-sm px-3.5 py-3 focus:outline-none focus:border-amber"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-[1.5px] text-amber mb-1.5">
              Step 3 of 4
            </div>
            <h1 className="font-display text-3xl mb-2">Pick a carrier</h1>
            <p className="text-slate text-[14.5px] mb-7 max-w-md">
              Prices update based on weight and destination.
            </p>

            <div className="space-y-3">
              {CARRIERS.map((c) => {
                const p = Math.round(c.ratePerKg * (weightNum || 3));
                const selected = carrierKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCarrierKey(c.key)}
                    className={`w-full flex items-center gap-4 border-2 border-ink rounded-md p-4 text-left transition-colors ${
                      selected ? "bg-ink text-paper" : "bg-white text-ink"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-amber text-ink flex items-center justify-center font-display text-sm shrink-0">
                      {c.badge}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-base">{c.name}</div>
                      <div
                        className={`font-mono text-[12px] mt-0.5 ${
                          selected ? "text-amber" : "text-slate"
                        }`}
                      >
                        {c.eta}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">KES {p}</div>
                      <div className="font-mono text-[9.5px] uppercase text-slate">
                        booking fee
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-[1.5px] text-amber mb-1.5">
              Step 4 of 4
            </div>
            <h1 className="font-display text-3xl mb-2">Confirm &amp; pay</h1>
            <p className="text-slate text-[14.5px] mb-7 max-w-md">
              You&rsquo;re paying the booking fee now via M-Pesa.
            </p>

            <div className="border-2 border-ink rounded-md p-4 font-mono text-[13px] mb-6">
              <div className="flex justify-between py-1.5">
                <span>Carrier</span>
                <span>{selectedCarrier?.name}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Route</span>
                <span>Nairobi &rarr; {destination}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Weight</span>
                <span>{weightNum} kg</span>
              </div>
              <div className="flex justify-between pt-3 mt-1.5 border-t-2 border-dashed border-ink/15 font-bold text-base">
                <span>Total due now</span>
                <span>KES {price}</span>
              </div>
            </div>

            <label className="block text-[12.5px] font-semibold mb-2">M-Pesa number</label>
            <input
              type="tel"
              value={mpesaPhone}
              onChange={(e) => setMpesaPhone(e.target.value)}
              className="w-full border-2 border-ink rounded-sm px-3.5 py-3 mb-6 focus:outline-none focus:border-amber"
            />

            <button
              type="button"
              disabled={paying}
              onClick={confirmAndPay}
              className="w-full bg-teal text-white font-condensed font-bold uppercase tracking-wide text-lg py-4 rounded-sm disabled:opacity-60"
            >
              {paying ? "Processing…" : "Send M-Pesa STK push"}
            </button>

            {payStage !== "idle" && (
              <div className="mt-5 text-center text-sm text-slate">
                <div className="w-5 h-5 border-[3px] border-ink/10 border-t-teal rounded-full animate-spin mx-auto mb-2" />
                {payStage === "waiting"
                  ? "Waiting for PIN entry on your phone…"
                  : "Payment confirmed. Generating your ticket…"}
              </div>
            )}
          </div>
        )}
      </main>

      {step < 3 && (
        <div className="sticky bottom-0 bg-paper border-t-2 border-ink px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={back}
            className={`font-condensed font-bold uppercase tracking-wide border-2 border-ink px-6 py-3.5 rounded-sm ${
              step === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="flex-1 bg-ink text-paper font-condensed font-bold uppercase tracking-wide py-3.5 rounded-sm"
          >
            {step === 2 ? "Continue to payment" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
