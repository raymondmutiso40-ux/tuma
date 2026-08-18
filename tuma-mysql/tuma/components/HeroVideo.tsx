"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The Tuma 3D logistics animation, as the hero's background layer.
 *
 * Renders as an absolutely-positioned fill behind the hero copy — drop it in
 * as the first child of a `relative` section. It carries its own scrim,
 * because the copy on top has to stay readable over whatever frame happens
 * to be playing.
 *
 * Loading behaviour is deliberate: the ~2 MB file is not requested until the
 * hero is actually near the viewport, so it never competes with the hero text
 * for the initial paint. Until it can play — and permanently, for anyone who
 * asked for reduced motion — a branded gradient holds the space, so there is
 * no black flash and no layout shift.
 *
 * Never unmuted: `muted` is also what allows browsers to autoplay at all.
 */
export default function HeroVideo({
  src = "/hero-3d.mp4",
  poster,
  className,
}: {
  src?: string;
  /** Optional first-frame image. Falls back to the gradient below. */
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
      return; // gradient only
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
  // source is attached. A rejected promise here is not worth surfacing — the
  // gradient is already on screen.
  useEffect(() => {
    if (!shouldLoad) return;
    videoRef.current?.play().catch(() => {});
  }, [shouldLoad]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 -z-10 overflow-hidden bg-ink-950", className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(120%_100%_at_70%_0%,#252A3A_0%,#0E1119_70%)]",
          "transition-opacity duration-700",
          ready ? "opacity-0" : "opacity-100"
        )}
      />

      <video
        ref={videoRef}
        className={cn(
          "hero-video absolute inset-0 w-full h-full object-cover",
          "transition-opacity duration-1000",
          ready ? "opacity-100" : "opacity-0"
        )}
        src={shouldLoad ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        // Browsers disagree on which of these lands first, and a codec the
        // client can't decode fires none of them — in which case the gradient
        // simply stays put.
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onPlaying={() => setReady(true)}
      />

      {/* Scrim. On phones the copy spans the full width, so the darkening is
          even; from lg the text sits on the left, so the gradient goes heavy
          there and lets the animation come through on the right.
          Opacity values must be multiples of 5 — Tailwind's scale has no
          /92 or /64, and an unrecognised stop compiles to nothing at all,
          which silently leaves the copy sitting on raw video. */}
      <div className="absolute inset-0 bg-ink-950/80 lg:hidden" />
      <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/45" />

      {/* Warm brand glow, and a fade into the section below. */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_10%_0%,rgba(232,162,61,0.14)_0%,transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink-950 to-transparent" />
    </div>
  );
}
