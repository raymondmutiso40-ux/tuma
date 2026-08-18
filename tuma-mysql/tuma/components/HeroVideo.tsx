"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { PackageIcon, QrIcon, TruckIcon } from "./ui/icons";

/**
 * The Tuma 3D logistics animation, presented as a product surface rather
 * than an embedded media element.
 *
 * Loading behaviour is deliberate: the ~2 MB file is not requested until the
 * element is actually near the viewport, so it never competes with the hero
 * text for the initial paint. Until it can play (and permanently, for anyone
 * who asked for reduced motion) a branded fallback panel holds the space, so
 * there is no black box and no layout shift.
 *
 * Never unmuted — `muted` is also what allows browsers to autoplay at all.
 */
export default function HeroVideo({
  src = "/hero-3d.mp4",
  poster,
  className,
}: {
  src?: string;
  /** Optional first-frame image. Falls back to the branded panel below. */
  poster?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return; // fallback panel only
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Some mobile browsers reject the initial autoplay attempt; retry once the
  // source is attached. A rejected promise here is not an error worth
  // surfacing — the fallback panel is already on screen.
  useEffect(() => {
    if (!shouldLoad) return;
    videoRef.current?.play().catch(() => {});
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className={cn(
        // The source is 1280×720, so the frame is 16:9 at every breakpoint —
        // object-cover then crops nothing.
        "relative aspect-video w-full",
        "rounded-xl lg:rounded-2xl overflow-hidden",
        "bg-ink-950 ring-1 ring-white/10 shadow-lifted",
        className
      )}
    >
      {/* Fallback surface — visible until the video can play, and always for
          reduced-motion users. */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-5",
          "bg-[radial-gradient(120%_100%_at_50%_0%,#252A3A_0%,#0E1119_70%)]",
          "transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100"
        )}
        aria-hidden
      >
        <div className="flex items-center gap-3 text-paper/70">
          <PackageIcon className="w-7 h-7" />
          <span className="w-8 h-px bg-paper/25" />
          <TruckIcon className="w-7 h-7 text-amber" />
          <span className="w-8 h-px bg-paper/25" />
          <QrIcon className="w-7 h-7" />
        </div>
        <p className="font-mono text-2xs uppercase tracking-[0.22em] text-paper/45">
          Parcel · Carrier · Ticket
        </p>
      </div>

      <video
        ref={videoRef}
        className={cn(
          "hero-video absolute inset-0 w-full h-full object-cover",
          "transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
        src={shouldLoad ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        // Decorative: the surrounding copy already says what this shows.
        aria-hidden
        tabIndex={-1}
        // Browsers disagree on which of these lands first, and a codec the
        // client can't decode fires none of them — in which case the fallback
        // panel simply stays put.
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onPlaying={() => setReady(true)}
      />

      {/* Depth: a soft vignette so the panel edges read as a screen, and a
          top sheen. Kept subtle — no gradient wash over the artwork. */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl lg:rounded-2xl ring-1 ring-inset ring-white/10"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none bg-gradient-to-t from-ink-950/45 to-transparent"
        aria-hidden
      />
    </div>
  );
}
