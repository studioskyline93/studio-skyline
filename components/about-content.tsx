"use client";

import { useEffect, useState } from "react";

type AboutContent = {
  title?: string;
  subtitle?: string;
  intro?: string;
  body?: string;
  highlights?: string[];
};

type ContactContent = {
  address?: string;
  email?: string;
  phone?: string;
};

export default function AboutContentBlock() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [contact, setContact] = useState<ContactContent | null>(null);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setAbout(json.about ?? null);
        setContact(json.contact ?? null);
      })
      .catch(() => {
        setAbout(null);
        setContact(null);
      });
  }, []);

  if (!about && !contact) return null;

  const highlights = Array.isArray(about?.highlights) ? about?.highlights : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6">
        <div className="text-sm font-semibold">{about?.subtitle || "What we do"}</div>

        {about?.intro ? (
          <p className="mt-3 text-zinc-700">{about.intro}</p>
        ) : null}

        {about?.body ? (
          <p className="mt-3 whitespace-pre-line text-zinc-700">{about.body}</p>
        ) : null}

        {highlights.length ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            {highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200/60 bg-white p-6">
        <div className="text-sm font-semibold">Contact</div>
        <div className="mt-3 text-sm text-zinc-700">
          {contact?.address ? <div className="whitespace-pre-line">{contact.address}</div> : null}

          {contact?.email ? (
            <div className={contact?.address ? "mt-2" : ""}>
              <a className="underline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            </div>
          ) : null}

          {contact?.phone ? <div className="mt-1">{contact.phone}</div> : null}
        </div>
      </div>
    </div>
  );
}
