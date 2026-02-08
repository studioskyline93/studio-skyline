"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type VideoItem = {
  src: string;
  title?: string;
  note?: string;
};

function clamp(i: number, len: number) {
  if (len === 0) return 0;
  return ((i % len) + len) % len;
}

export function VideoTripleView({
  videos,
  collectionIndex,
}: {
  videos: VideoItem[];
  collectionIndex?: string;
}) {
  const [active, setActive] = useState(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const len = videos.length;

  useEffect(() => {
    if (active > len - 1) setActive(0);
  }, [active, len]);

  // Keyboard: left/right for selection, Esc closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalIndex(null);
      if (e.key === "ArrowLeft") setActive((a) => clamp(a - 1, len));
      if (e.key === "ArrowRight") setActive((a) => clamp(a + 1, len));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [len]);

  const prevIndex = useMemo(() => clamp(active - 1, len), [active, len]);
  const nextIndex = useMemo(() => clamp(active + 1, len), [active, len]);

  const prev = videos[prevIndex];
  const current = videos[active];
  const next = videos[nextIndex];

  if (len === 0) return null;

  return (
    <div className="space-y-6">
      {/* Top line */}
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-[0.25em] text-zinc-500">
          {collectionIndex ? `${collectionIndex} • ` : ""}LOOK
        </div>
        <div className="text-xs text-zinc-500">
          {String(active + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
        </div>
      </div>

      {/* Triple view */}
      <div className="relative">
        <div className="relative h-[48vh] min-h-[320px] w-full">
          {/* Left preview (clickable area) */}
          {len > 1 ? (
            <button
              type="button"
              onClick={() => setActive(prevIndex)}
              className="absolute left-0 top-0 h-full w-[34%] cursor-pointer"
              aria-label="Previous"
            >
              <div className="absolute inset-y-0 left-0 flex w-full items-center justify-center">
                <div className="w-[86%] max-w-[420px]">
                  <div className="relative aspect-video overflow-hidden bg-transparent">
                    <video
                      src={prev.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </button>
          ) : null}

          {/* Right preview (clickable area) */}
          {len > 1 ? (
            <button
              type="button"
              onClick={() => setActive(nextIndex)}
              className="absolute right-0 top-0 h-full w-[34%] cursor-pointer"
              aria-label="Next"
            >
              <div className="absolute inset-y-0 right-0 flex w-full items-center justify-center">
                <div className="w-[86%] max-w-[420px]">
                  <div className="relative aspect-video overflow-hidden bg-transparent">
                    <video
                      src={next.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-white/50 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </button>
          ) : null}

          {/* Center active */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-[560px]">
              <div className="relative aspect-video overflow-hidden bg-transparent">
                <video
                  key={current.src}
                  src={current.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Controls: chevrons */}
          {len > 1 ? (
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActive(prevIndex)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/70 bg-white/80 backdrop-blur hover:bg-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-zinc-800" />
              </button>

              <button
                type="button"
                onClick={() => setActive(nextIndex)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/70 bg-white/80 backdrop-blur hover:bg-white"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 text-zinc-800" />
              </button>
            </div>
          ) : null}
        </div>

        {/* Caption */}
        <div className="mt-5">
          <div className="text-xs tracking-[0.25em] text-zinc-500">SELECTED</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {current.title ?? `Video ${String(active + 1).padStart(2, "0")}`}
          </div>
          {current.note ? (
            <div className="mt-2 max-w-[70ch] text-sm text-zinc-600">
              {current.note}
            </div>
          ) : null}
          <div className={cn("mt-3 text-xs text-zinc-500", len > 1 ? "" : "hidden")}>
            Tip: click left/right sides or use ← → (Esc closes popup)
          </div>
        </div>

        {/* All videos grid */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-[0.25em] text-zinc-500">ALL</div>
            <div className="text-xs text-zinc-500">Click to open</div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v, i) => {
              const isActive = i === active;
              return (
                <button
                  key={v.src}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setModalIndex(i);
                  }}
                  className="group text-left"
                >
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white transition",
                      isActive
                        ? "border-zinc-900/40"
                        : "border-zinc-200/60 hover:border-zinc-400/60"
                    )}
                  >
                    <div className="relative aspect-video overflow-hidden bg-transparent">
                      <video
                        src={v.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className={cn(
                          "h-full w-full object-cover transition-transform duration-500",
                          isActive ? "scale-[1.01]" : "group-hover:scale-[1.03]"
                        )}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                        <div className="text-xs tracking-[0.25em] text-white/85">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        {isActive ? (
                          <div className="text-xs text-white/85">Selected</div>
                        ) : (
                          <div className="text-xs text-white/70 opacity-0 transition group-hover:opacity-100">
                            Open
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-sm font-medium text-zinc-900 line-clamp-1">
                        {v.title ?? `Video ${String(i + 1).padStart(2, "0")}`}
                      </div>
                      {v.note ? (
                        <div className="mt-1 text-sm text-zinc-600 line-clamp-1">
                          {v.note}
                        </div>
                      ) : null}

                      <div
                        className={cn(
                          "mt-3 h-[2px] w-12",
                          isActive ? "bg-red-600" : "bg-transparent"
                        )}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen popup */}
      {modalIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
              <div className="text-sm tracking-[0.25em] text-white/80">
                {String(modalIndex + 1).padStart(2, "0")} / {String(len).padStart(2, "0")}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                  onClick={() =>
                    setModalIndex((x) => (x === null ? null : clamp(x - 1, len)))
                  }
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
                  onClick={() =>
                    setModalIndex((x) => (x === null ? null : clamp(x + 1, len)))
                  }
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10"
                  onClick={() => setModalIndex(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="relative">
            <video
  key={videos[modalIndex].src}
  src={videos[modalIndex].src}
  controls
  playsInline
  preload="auto"
  className="max-h-[75vh] w-full bg-black object-contain"
/>

            </div>

            {(videos[modalIndex].title || videos[modalIndex].note) ? (
              <div className="border-t border-white/10 px-4 py-4 md:px-6">
                {videos[modalIndex].title ? (
                  <div className="text-base font-medium text-white">
                    {videos[modalIndex].title}
                  </div>
                ) : null}
                {videos[modalIndex].note ? (
                  <div className="mt-1 text-sm text-white/70">
                    {videos[modalIndex].note}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
