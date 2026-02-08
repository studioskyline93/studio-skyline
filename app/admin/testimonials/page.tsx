"use client";

import { useEffect, useMemo, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  company?: string;
};

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((json) => {
        setItems(Array.isArray(json.testimonials) ? json.testimonials : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const addNew = () => {
    setItems((t) => [
      ...t,
      { quote: "", author: "", company: "" },
    ]);
  };

  const remove = (i: number) => {
    setItems((t) => t.filter((_, idx) => idx !== i));
  };

  const move = (from: number, to: number) => {
    setItems((t) => {
      const copy = [...t];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const update = (i: number, patch: Partial<Testimonial>) => {
    setItems((t) => {
      const copy = [...t];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  };

  const canSave = useMemo(() => {
    if (!loaded) return false;
    // Allow empty items while drafting, but at least one should have quote or author to be meaningful
    return true;
  }, [loaded]);

  const save = async () => {
    setSaving(true);

    // Keep existing JSON and only patch testimonials
    const current = await fetch("/api/admin/site").then((r) => r.json());

    const next = {
      ...current,
      testimonials: items.map((t) => ({
        quote: String(t.quote || "").trim(),
        author: String(t.author || "").trim(),
        company: String(t.company || "").trim() || undefined,
      })),
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

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold">Testimonials</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Add, edit, reorder. Changes save to <code>content/site.json</code>.
            </p>
          </div>

          <button
            type="button"
            onClick={addNew}
            className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Add testimonial
          </button>
        </div>

        <section className="mt-10 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-6 text-sm text-zinc-600">
              No testimonials yet. Click “Add testimonial”.
            </div>
          ) : null}

          {items.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-zinc-500">
                  #{String(i + 1).padStart(2, "0")}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(i, Math.max(0, i - 1))}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, Math.min(items.length - 1, i + 1))}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="rounded-lg border border-zinc-200/60 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <div className="text-xs text-zinc-500">Quote</div>
                  <textarea
                    value={t.quote}
                    onChange={(e) => update(i, { quote: e.target.value })}
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    placeholder="Write the testimonial…"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-zinc-500">Author</div>
                    <input
                      value={t.author}
                      onChange={(e) => update(i, { author: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      placeholder="e.g. Brand Director"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-zinc-500">Company (optional)</div>
                    <input
                      value={t.company ?? ""}
                      onChange={(e) => update(i, { company: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      placeholder="e.g. Luxury Fashion Brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-10">
          <button
            type="button"
            onClick={save}
            disabled={saving || !canSave}
            className="rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
