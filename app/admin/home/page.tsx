"use client";

import { useEffect, useState } from "react";

type CTA = { label: string; href: string };

type HomeHero = {
  city: string;
  title: string;
  intro: string;
  highlight: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  ctaTertiary: CTA;
};

export default function HomeAdminPage() {
  const [hero, setHero] = useState<HomeHero | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((json) => {
        const h = json?.home?.hero;
        if (!h) return;
        setHero(h);
      });
  }, []);

  const update = (key: keyof HomeHero, value: any) => {
    setHero((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateCTA = (which: "ctaPrimary" | "ctaSecondary" | "ctaTertiary", key: "label" | "href", value: string) => {
    setHero((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [which]: {
          ...prev[which],
          [key]: value,
        },
      };
    });
  };

  const save = async () => {
    if (!hero) return;

    setSaving(true);

    // Load current full JSON so we don't overwrite other sections (productionHouse/testimonials/etc)
    const current = await fetch("/api/admin/site").then((r) => r.json());

    const next = {
      ...current,
      home: {
        ...(current.home || {}),
        hero,
      },
    };

    const res = await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Failed to save");
      return;
    }

    alert("Saved");
  };

  if (!hero) {
    return (
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-sm text-zinc-600">
            Loading home hero…
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Home</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Edit the Home hero content (no code changes)
            </p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-black px-5 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
  <a
    href="#hero"
    className="rounded-full border border-zinc-200/60 bg-white/70 px-4 py-2 text-xs text-zinc-800 no-underline hover:bg-zinc-50"
  >
    Hero
  </a>
  <a
    href="#highlight"
    className="rounded-full border border-zinc-200/60 bg-white/70 px-4 py-2 text-xs text-zinc-800 no-underline hover:bg-zinc-50"
  >
    Highlight
  </a>
  <a
    href="#buttons"
    className="rounded-full border border-zinc-200/60 bg-white/70 px-4 py-2 text-xs text-zinc-800 no-underline hover:bg-zinc-50"
  >
    Buttons
  </a>
</div>

        <div className="mt-10 space-y-6">
  <div id="hero" />

          <Field
            label="City (small text above the hero)"
            value={hero.city}
            onChange={(v) => update("city", v)}
          />

          <Field
            label="Hero title"
            value={hero.title}
            onChange={(v) => update("title", v)}
          />

          <TextArea
            label="Intro paragraph"
            value={hero.intro}
            onChange={(v) => update("intro", v)}
          />
<div id="highlight" />
          <TextArea
            label="Highlight (small text under Capabilities)"
            value={hero.highlight}
            onChange={(v) => update("highlight", v)}
          />
<div id="buttons" />
<div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5">
  <div className="text-sm font-semibold">Buttons</div>


            <div className="mt-4 space-y-5">
              <CTAEditor
                title="Primary (red)"
                cta={hero.ctaPrimary}
                onLabel={(v) => updateCTA("ctaPrimary", "label", v)}
                onHref={(v) => updateCTA("ctaPrimary", "href", v)}
              />

              <CTAEditor
                title="Secondary"
                cta={hero.ctaSecondary}
                onLabel={(v) => updateCTA("ctaSecondary", "label", v)}
                onHref={(v) => updateCTA("ctaSecondary", "href", v)}
              />

              <CTAEditor
                title="Tertiary"
                cta={hero.ctaTertiary}
                onLabel={(v) => updateCTA("ctaTertiary", "label", v)}
                onHref={(v) => updateCTA("ctaTertiary", "href", v)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5">
      <div className="text-xs font-medium text-zinc-700">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full rounded-xl border border-zinc-200/60 bg-white px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5">
      <div className="text-xs font-medium text-zinc-700">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-3 w-full rounded-xl border border-zinc-200/60 bg-white px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function CTAEditor({
  title,
  cta,
  onLabel,
  onHref,
}: {
  title: string;
  cta: { label: string; href: string };
  onLabel: (v: string) => void;
  onHref: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white p-4">
      <div className="text-xs font-semibold text-zinc-800">{title}</div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[11px] text-zinc-600">Label</div>
          <input
            value={cta.label}
            onChange={(e) => onLabel(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <div>
          <div className="text-[11px] text-zinc-600">Link</div>
          <input
            value={cta.href}
            onChange={(e) => onHref(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
}
