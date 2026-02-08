"use client";

import { useEffect, useMemo, useState } from "react";

type AboutContent = {
  title: string;
  subtitle: string;
  intro: string;
  body: string;
  highlights: string[];
};

const defaults: AboutContent = {
  title: "About",
  subtitle: "Studio Skyline",
  intro: "",
  body: "",
  highlights: [],
};

export default function AboutAdmin() {
  const [value, setValue] = useState<AboutContent>(defaults);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        const about = json.about ?? {};
        setValue({
          ...defaults,
          ...about,
          highlights: Array.isArray(about.highlights) ? about.highlights : [],
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const update = (patch: Partial<AboutContent>) =>
    setValue((v) => ({ ...v, ...patch }));

  const addHighlight = () =>
    setValue((v) => ({ ...v, highlights: [...(v.highlights || []), ""] }));

  const removeHighlight = (i: number) =>
    setValue((v) => ({
      ...v,
      highlights: (v.highlights || []).filter((_, idx) => idx !== i),
    }));

  const moveHighlight = (from: number, to: number) =>
    setValue((v) => {
      const copy = [...(v.highlights || [])];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return { ...v, highlights: copy };
    });

  const updateHighlight = (i: number, next: string) =>
    setValue((v) => {
      const copy = [...(v.highlights || [])];
      copy[i] = next;
      return { ...v, highlights: copy };
    });

  const canSave = useMemo(() => loaded && !saving, [loaded, saving]);

  const save = async () => {
    setSaving(true);

    const current = await fetch("/api/admin/site", { cache: "no-store" }).then((r) =>
      r.json()
    );

    const next = {
      ...current,
      about: {
        title: String(value.title || "").trim(),
        subtitle: String(value.subtitle || "").trim(),
        intro: String(value.intro || "").trim(),
        body: String(value.body || "").trim(),
        highlights: (value.highlights || [])
          .map((h) => String(h || "").trim())
          .filter(Boolean),
      },
    };

    const res = await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    setSaving(false);

    if (!res.ok) return alert("Failed to save");
    alert("Saved");
  };

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">About</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Edit About content. Saves to <code>content/site.json</code> under{" "}
              <code>about</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={addHighlight}
            className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Add highlight
          </button>
        </div>

        <section className="mt-10 rounded-2xl border border-zinc-200/60 bg-white/70 p-6">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input
                  value={value.title}
                  onChange={(e) => update({ title: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </Field>

              <Field label="Subtitle">
                <input
                  value={value.subtitle}
                  onChange={(e) => update({ subtitle: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </Field>
            </div>

            <Field label="Intro">
              <textarea
                rows={3}
                value={value.intro}
                onChange={(e) => update({ intro: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Short intro paragraph…"
              />
            </Field>

            <Field label="Body">
              <textarea
                rows={8}
                value={value.body}
                onChange={(e) => update({ body: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Longer about copy…"
              />
            </Field>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {value.highlights.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-sm text-zinc-600">
              No highlights yet. Click “Add highlight”.
            </div>
          ) : null}

          {value.highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-zinc-500">
                  Highlight #{String(i + 1).padStart(2, "0")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveHighlight(i, Math.max(0, i - 1))}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHighlight(i, Math.min(value.highlights.length - 1, i + 1))}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <input
                value={h}
                onChange={(e) => updateHighlight(i, e.target.value)}
                className="mt-3 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="e.g. 15+ years in premium packaging"
              />
            </div>
          ))}
        </section>

        <div className="mt-10">
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      {children}
    </div>
  );
}
