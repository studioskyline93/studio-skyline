"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type VideoItem = {
  src: string;
  title?: string;
  note?: string;
};

export function VideoShowcase({
  videos,
  collectionIndex,
}: {
  videos: VideoItem[];
  collectionIndex?: string;
}) {
  const [active, setActive] = useState(0);

  // keep active valid if videos change
  useEffect(() => {
    if (active > videos.length - 1) setActive(0);
  }, [active, videos.length]);

  const current = useMemo(() => videos[active], [videos, active]);

  return (
    <div className="grid gap-8 md:grid-cols-[380px_1fr]">
      {/* List */}
      <aside className="order-2 md:order-1">
        <div className="sticky top-24">
          <div className="flex items-center justify-between pb-3">
            <div className="text-xs tracking-[0.25em] text-zinc-500">
              {collectionIndex ? `${collectionIndex} • ` : ""}VIDEOS
            </div>
            <div className="text-xs text-zinc-500">
              {String(active + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}
            </div>
          </div>

          <div className="divide-y divide-zinc-200/60 rounded-2xl border border-zinc-200/60 bg-white">
            {videos.map((v, i) => {
              const isActive = i === active;
              return (
                <button
                  key={v.src}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full text-left px-5 py-4 transition",
                    "hover:bg-zinc-50",
                    isActive && "bg-zinc-50"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className={cn("text-sm font-medium", isActive ? "text-black" : "text-zinc-700")}>
                      {v.title ?? `Video ${String(i + 1).padStart(2, "0")}`}
                    </div>
                    <div className={cn("text-xs tracking-[0.25em]", isActive ? "text-zinc-800" : "text-zinc-400")}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {v.note ? (
                    <div className={cn("mt-1 text-sm", isActive ? "text-zinc-600" : "text-zinc-500")}>
                      {v.note}
                    </div>
                  ) : null}

                  {isActive ? (
                    <div className="mt-3 h-[2px] w-14 bg-red-600" />
                  ) : (
                    <div className="mt-3 h-[2px] w-14 bg-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Hero */}
      <section className="order-1 md:order-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-black">
          <div className="relative aspect-video">
            <video
              key={current.src} // forces reload when switching
              src={current.src}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain bg-black"
            />
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs tracking-[0.25em] text-zinc-500">
            SELECTED
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {current.title ?? `Video ${String(active + 1).padStart(2, "0")}`}
          </div>
          {current.note ? (
            <div className="mt-2 max-w-[70ch] text-sm text-zinc-600">
              {current.note}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
