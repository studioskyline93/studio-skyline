"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type HeroMediaItem =
  | { type: "video"; src: string; alt?: string }
  | { type: "photo"; src: string; alt?: string };

  export default function ProductionHouseHero({
    media,
  }: {
    media: any[];
  })  
 {
  const items = useMemo(() => (media ? [...media] : []), [media]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length
    );
  }, [items.length]);

  const next = useCallback(() => {
    if (items.length === 0) return;
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, prev, next]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-sm text-zinc-600">
        No media passed to hero.
      </div>
    );
  }

  const openIndex = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setActiveIndex(index);
  };

  return (
    <>
      {/* HERO GRID */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <button
            type="button"
            onClick={() => openIndex(0)}
            className="lg:col-span-8 text-left"
          >
            <MediaTile item={items[0]} />
          </button>

          <div className="lg:col-span-4 grid gap-4">
            {items.slice(1, 3).map((item) => (
              <button
                key={item.src}
                type="button"
                onClick={() =>
                  openIndex(items.findIndex((m) => m.src === item.src))
                }
                className="text-left"
              >
                <MediaTile item={item} />
              </button>
            ))}
          </div>
        </div>

        {/* Walkthrough row */}
        <div className="mt-4 flex items-center gap-3 text-xs text-zinc-600">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200/60 bg-white/70">
            1
          </span>
          <span className="h-px w-10 bg-zinc-200/70" />
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200/60 bg-white/70">
            2
          </span>
          <span className="h-px w-10 bg-zinc-200/70" />
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200/60 bg-white/70">
            3
          </span>
          <span className="ml-2">Click to open. Use ← → to walk through.</span>
        </div>
      </section>

      {/* MODAL */}
      {activeIndex !== null && items[activeIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur"
          onClick={close}
        >
          <div
            className="absolute inset-0 flex items-center justify-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-6xl">
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                {items[activeIndex].type === "video" ? (
                  <video
                    key={items[activeIndex].src}
                    src={items[activeIndex].src}
                    controls
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={items[activeIndex].src}
                    alt={items[activeIndex].alt ?? ""}
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {items[activeIndex].alt && (
                <div className="mt-3 text-center text-sm text-white/70">
                  {items[activeIndex].alt}
                </div>
              )}

              <button
                type="button"
                onClick={prev}
                className="absolute left-[-56px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={next}
                className="absolute right-[-56px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl"
              >
                ›
              </button>

              <button
                type="button"
                onClick={close}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MediaTile({ item }: { item: HeroMediaItem }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/70 backdrop-blur">
      <div className="relative aspect-video w-full">
        {item.type === "video" ? (
          <video
            src={item.src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image src={item.src} alt={item.alt ?? ""} fill className="object-cover" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white text-lg opacity-0 transition group-hover:opacity-100">
          ▶
        </div>
      </div>
    </div>
  );
}
