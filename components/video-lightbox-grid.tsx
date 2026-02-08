"use client";

import { useState } from "react";

type VideoItem = {
  src: string;
  title?: string;
  note?: string;
};

export function VideoLightboxGrid({ videos }: { videos: VideoItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((v, i) => (
          <button
            key={v.src}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group text-left"
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-200/60 bg-white transition hover:border-zinc-400/60">
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <video
                  src={v.src}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.currentTime = 0;
                    el.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                  }}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-90" />

                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-[0.25em] text-white/80">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    {v.title ? (
                      <div className="mt-1 line-clamp-2 text-base font-medium text-white">
                        {v.title}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm text-white/85 opacity-0 transition group-hover:opacity-100">
                    Play →
                  </div>
                </div>
              </div>

              <div className="p-4">
                {v.note ? (
                  <div className="text-sm text-zinc-700">{v.note}</div>
                ) : (
                  <div className="text-sm text-zinc-600">
                    Tap to view full screen
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 md:px-6">
              <div className="text-sm tracking-[0.25em] text-white/80">
                {String(activeIndex + 1).padStart(2, "0")}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-full px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  onClick={() =>
                    setActiveIndex((x) =>
                      x === null ? null : Math.max(0, x - 1)
                    )
                  }
                  disabled={activeIndex === 0}
                >
                  Prev
                </button>
                <button
                  className="rounded-full px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                  onClick={() =>
                    setActiveIndex((x) =>
                      x === null ? null : Math.min(videos.length - 1, x + 1)
                    )
                  }
                  disabled={activeIndex === videos.length - 1}
                >
                  Next
                </button>
                <button
                  className="rounded-full px-4 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setActiveIndex(null)}
                >
                  Close
                </button>
              </div>
            </div>

            <video
              src={videos[activeIndex].src}
              controls
              autoPlay
              playsInline
              className="max-h-[75vh] w-full bg-black object-contain"
            />

            {(videos[activeIndex].title || videos[activeIndex].note) ? (
              <div className="border-t border-white/10 px-4 py-4 md:px-6">
                {videos[activeIndex].title ? (
                  <div className="text-base font-medium text-white">
                    {videos[activeIndex].title}
                  </div>
                ) : null}
                {videos[activeIndex].note ? (
                  <div className="mt-1 text-sm text-white/70">
                    {videos[activeIndex].note}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
