"use client";

import { useRef, useState } from "react";
import Button from "./ui/Button";
import { CameraIcon, PackageIcon, RefreshIcon, XIcon } from "./ui/icons";
import { cn } from "@/lib/cn";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

/**
 * Downscales the chosen photo before it becomes a data URL.
 *
 * The photo is stored inline on the booking row, and a modern phone camera
 * produces 3–6 MB per shot — which is a slow upload on mobile data and a very
 * large database write. 1280px on the long edge is still comfortably enough
 * for counter staff to match the parcel. The output is the same
 * `data:image/...` string the rest of the flow already expects.
 */
function downscale(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const original = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't an image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        // Already small enough — keep the original bytes rather than
        // re-encoding and losing quality for nothing.
        if (scale === 1) return resolve(original);

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(original);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoCapture({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  async function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onChange(await downscale(file));
    } catch (e: any) {
      setError(e?.message || "Could not use that photo. Try another.");
    } finally {
      setBusy(false);
    }
  }

  if (value) {
    return (
      <div className="animate-scale-in">
        <div className="relative rounded-lg overflow-hidden border border-ink-200 bg-ink-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="The parcel you're sending"
            className="w-full max-h-72 object-contain"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-ink-950/70 text-paper backdrop-blur-sm flex items-center justify-center hover:bg-ink-950/90 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[13px] text-success font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
            Photo attached
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cameraInput.current?.click()}
            loading={busy}
          >
            <RefreshIcon className="w-4 h-4" />
            Retake
          </Button>
        </div>
        <CaptureInputs
          cameraRef={cameraInput}
          fileRef={fileInput}
          onFile={accept}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative rounded-lg border-2 border-dashed px-6 py-9 text-center transition-colors",
          dragging
            ? "border-teal bg-teal/5"
            : "border-ink-300 bg-white hover:border-ink-400"
        )}
      >
        {/* Framing guide — makes it obvious this is a photo of the parcel,
            not a generic file picker. */}
        <span className="pointer-events-none absolute inset-4 rounded-md" aria-hidden>
          {[
            "top-0 left-0 border-t-2 border-l-2 rounded-tl-md",
            "top-0 right-0 border-t-2 border-r-2 rounded-tr-md",
            "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md",
            "bottom-0 right-0 border-b-2 border-r-2 rounded-br-md",
          ].map((pos) => (
            <span
              key={pos}
              className={cn("absolute w-5 h-5 border-ink-200", pos)}
            />
          ))}
        </span>

        <span className="relative w-14 h-14 rounded-full bg-ink-100 text-ink-500 mx-auto flex items-center justify-center">
          {busy ? (
            <span className="w-5 h-5 rounded-full border-2 border-ink-400 border-t-transparent animate-spin" />
          ) : (
            <PackageIcon className="w-6 h-6" />
          )}
        </span>

        <p className="mt-4 text-[15px] font-semibold">
          {busy ? "Processing photo…" : "Add a photo of the parcel"}
        </p>
        <p className="mt-1 text-[13px] text-ink-500 max-w-xs mx-auto leading-relaxed">
          Lay the item flat, fill the frame, and make sure any labels are
          readable.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Button
            variant="primary"
            onClick={() => cameraInput.current?.click()}
            disabled={busy}
          >
            <CameraIcon className="w-4 h-4" />
            Take photo
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
          >
            Choose from gallery
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-[12.5px] text-danger font-medium">
          {error}
        </p>
      )}

      <CaptureInputs cameraRef={cameraInput} fileRef={fileInput} onFile={accept} />
    </div>
  );
}

/**
 * Two hidden inputs rather than one: `capture` opens the phone's camera
 * directly, which is wrong for "choose from gallery". Desktop browsers
 * ignore `capture` and show a normal file picker either way.
 */
function CaptureInputs({
  cameraRef,
  fileRef,
  onFile,
}: {
  cameraRef: React.RefObject<HTMLInputElement>;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (file: File | undefined) => void;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFile(e.target.files?.[0]);
    // Reset so picking the same file twice still fires a change event.
    e.target.value = "";
  };
  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handle}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handle}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </>
  );
}
