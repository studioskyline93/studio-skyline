"use client";

import { useEffect, useMemo, useState } from "react";

type ContactContent = {
  title: string;
  subtitle: string;
  intro: string;
  email: string;
  phone: string;
  address: string;
  whatsapp: string;
  mapUrl: string;
  formCtaLabel: string;
};

const defaults: ContactContent = {
  title: "Contact",
  subtitle: "Enquiries",
  intro: "",
  email: "",
  phone: "",
  address: "",
  whatsapp: "",
  mapUrl: "",
  formCtaLabel: "Send enquiry",
};

export default function ContactAdmin() {
  const [value, setValue] = useState<ContactContent>(defaults);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setValue({ ...defaults, ...(json.contact ?? {}) });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const update = (patch: Partial<ContactContent>) =>
    setValue((v) => ({ ...v, ...patch }));

  const canSave = useMemo(() => loaded && !saving, [loaded, saving]);

  const save = async () => {
    setSaving(true);

    const current = await fetch("/api/admin/site", { cache: "no-store" }).then((r) =>
      r.json()
    );

    const next = {
      ...current,
      contact: {
        title: String(value.title || "").trim(),
        subtitle: String(value.subtitle || "").trim(),
        intro: String(value.intro || "").trim(),
        email: String(value.email || "").trim(),
        phone: String(value.phone || "").trim(),
        address: String(value.address || "").trim(),
        whatsapp: String(value.whatsapp || "").trim(),
        mapUrl: String(value.mapUrl || "").trim(),
        formCtaLabel: String(value.formCtaLabel || "").trim(),
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
        <div>
          <h1 className="text-2xl font-semibold">Contact</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Edit contact content. Saves to <code>content/site.json</code>.
          </p>
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
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Email">
                <input
                  value={value.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="hello@..."
                />
              </Field>

              <Field label="Phone">
                <input
                  value={value.phone}
                  onChange={(e) => update({ phone: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="+91 ..."
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="WhatsApp (optional)">
                <input
                  value={value.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="+91 ..."
                />
              </Field>

              <Field label="Map URL (optional)">
                <input
                  value={value.mapUrl}
                  onChange={(e) => update({ mapUrl: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="https://maps.google.com/..."
                />
              </Field>
            </div>

            <Field label="Address (optional)">
              <textarea
                rows={3}
                value={value.address}
                onChange={(e) => update({ address: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </Field>

            <Field label="Form button label">
              <input
                value={value.formCtaLabel}
                onChange={(e) => update({ formCtaLabel: e.target.value })}
                className="mt-2 w-full rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </Field>
          </div>
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
