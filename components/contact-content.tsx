"use client";

import { useEffect, useState } from "react";

type ContactContent = {
  title?: string;
  subtitle?: string;
  intro?: string;
  email?: string;
  phone?: string;
  address?: string;
  whatsapp?: string;
  mapUrl?: string;
  formCtaLabel?: string;
};

export default function ContactContentBlock() {
  const [c, setC] = useState<ContactContent | null>(null);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => setC(json.contact ?? null))
      .catch(() => setC(null));
  }, []);

  if (!c) return null;

  return (
    <div className="rounded-3xl border border-zinc-200/60 bg-white/65 backdrop-blur p-6 ring-1 ring-zinc-200/60">
      <div className="text-xs uppercase tracking-widest text-zinc-500">
        {c.subtitle || "Enquiries"}
      </div>
      <h1 className="mt-3 text-2xl font-semibold">{c.title || "Contact"}</h1>

      {c.intro ? (
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">{c.intro}</p>
      ) : null}

      <div className="mt-6 space-y-2 text-sm text-zinc-700">
        {c.email ? (
          <div>
            <span className="text-zinc-500">Email:</span>{" "}
            <a className="underline" href={`mailto:${c.email}`}>
              {c.email}
            </a>
          </div>
        ) : null}

        {c.phone ? (
          <div>
            <span className="text-zinc-500">Phone:</span>{" "}
            <a className="underline" href={`tel:${c.phone}`}>
              {c.phone}
            </a>
          </div>
        ) : null}

        {c.whatsapp ? (
          <div>
            <span className="text-zinc-500">WhatsApp:</span>{" "}
            <a className="underline" href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}>
              {c.whatsapp}
            </a>
          </div>
        ) : null}

        {c.address ? (
          <div>
            <span className="text-zinc-500">Address:</span> {c.address}
          </div>
        ) : null}

        {c.mapUrl ? (
          <div>
            <a className="underline" href={c.mapUrl} target="_blank" rel="noreferrer">
              Open map
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
