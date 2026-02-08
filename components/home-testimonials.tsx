"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  company?: string;
};

export default function HomeTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setItems(Array.isArray(json.testimonials) ? json.testimonials : []);
      })
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-xl font-semibold">Testimonials</h2>

        <div
  className="mt-5 -mx-1 overflow-x-auto pb-2"
  style={{ overscrollBehaviorX: "contain" }}
  onWheel={(e) => {
    if (!e.currentTarget) return;
    // If the user scrolls vertically, translate it to horizontal scrolling
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.currentTarget.scrollLeft += e.deltaY;
    } else {
      e.currentTarget.scrollLeft += e.deltaX;
    }
  }}
>
  <div className="flex gap-4 px-1">
    {items.map((t, i) => (
      <figure
        key={i}
        className="w-[320px] shrink-0 rounded-2xl border border-zinc-200/60 bg-white/70 p-5 md:w-[380px]"
      >
        <blockquote className="text-sm leading-relaxed text-zinc-800">
          “{t.quote}”
        </blockquote>

        <figcaption className="mt-4 text-sm text-zinc-600">
          <span className="font-medium text-zinc-900">{t.author}</span>
          {t.company ? <span> · {t.company}</span> : null}
        </figcaption>
      </figure>
    ))}
  </div>
</div>

      </div>
    </section>
  );
}
