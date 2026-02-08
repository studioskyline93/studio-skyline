"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SafeVideo } from "@/components/safe-video";

type WorkCollection = {
  slug: string;
  title: string;
  videos: { src: string }[];
};

export function WorkReel() {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
    skipSnaps: true,
  });

  const [index, setIndex] = useState(0);
  const [collections, setCollections] = useState<WorkCollection[]>([]);

  // fetch latest from your existing admin work API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/work", { cache: "no-store" });
        const data = await res.json();
        const list = (data.collections ?? []) as WorkCollection[];
        if (!cancelled) setCollections(list);
      } catch {
        if (!cancelled) setCollections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Home shows first 5 categories (based on work.json order)
  const list = collections;


  const total = list.length;
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(
    2,
    "0"
  )}`;

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, total]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !emblaApi) return;

    let locked = false;

    const onWheel = (e: WheelEvent) => {
      // Use whichever axis is stronger (trackpad horizontal or mouse wheel vertical)
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
      // If there's basically no movement, ignore
      if (Math.abs(delta) < 2) return;
    
      e.preventDefault();
    
      if (locked) return;
      locked = true;
    
      if (delta > 0) emblaApi.scrollNext();
      else emblaApi.scrollPrev();
    
      window.setTimeout(() => (locked = false), 180);
    };
    

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [emblaApi]);

  if (list.length === 0) {
    return (
      <div className="px-5 pb-8 md:px-10 text-sm text-zinc-500">
        No work categories found.
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between px-5 pb-2 md:px-10">
        <div className="text-[12px] font-medium tracking-tight text-zinc-800">
          Selected work
        </div>
        <div className="text-[11px] text-zinc-500">{counter}</div>
      </div>

      <div
        ref={(node) => {
          emblaRef(node);
          viewportRef.current = node;
        }}
        className="overflow-hidden"
      >
        <div className="flex gap-3 pb-4 px-5 md:px-10">
          {list.map((c) => {
            const preview = c.videos?.[0]?.src;
            return (
              <Link
                key={c.slug}
                href={`/work/${c.slug}`}
                className="group no-underline"
              >
                <div className="w-[240px] sm:w-[280px] md:w-[320px]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200/60 bg-white">
                    {preview ? (
                      <SafeVideo
                        src={preview}
                        label={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-sm text-zinc-500">
                        No video yet
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold tracking-tight">
                        {c.title}
                      </div>
                      <div className="mt-1 text-sm text-zinc-600">
                        {c.videos.length} video{c.videos.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400">View</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-6 md:px-10">
        <div className="text-xs text-zinc-500">Drag / scroll</div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-zinc-200/60 px-4 py-2 text-sm"
            onClick={() => emblaApi?.scrollPrev()}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded-full border border-zinc-200/60 px-4 py-2 text-sm"
            onClick={() => emblaApi?.scrollNext()}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
