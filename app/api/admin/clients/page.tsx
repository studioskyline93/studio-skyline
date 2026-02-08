"use client";

import { useEffect, useRef, useState } from "react";

type ClientItem = {
  name: string;
  logo?: string; // "/clients/logos/xxx.png"
  url?: string;
};

export default function AdminClientsPage() {
  const [site, setSite] = useState<any>(null);
  const [items, setItems] = useState<ClientItem[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const loadSite = async () => {
    const json = await fetch("/api/admin/site").then((r) => r.json());
    setSite(json);
    setItems(json.clients?.items ?? []);
  };

  const refreshLogos = async () => {
    const d = await fetch("/api/admin/media?folder=clients/logos").then((r) =>
      r.json()
    );
    setLogos(d.files || []);
  };

  useEffect(() => {
    loadSite();
    refreshLogos();
  }, []);

  const uploadLogo = async (file: File) => {
    const fd = new FormData();
    fd.append("folder", "clients/logos");
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Upload failed");
      return false;
    }
    return true;
  };

  const addClient = () => {
    setItems((prev) => [
      ...prev,
      { name: "New Client", logo: "", url: "" },
    ]);
  };

  const removeClient = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const move = (from: number, to: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const update = (i: number, patch: Partial<ClientItem>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  };

  const save = async () => {
    if (!site) return;
    setSaving(true);

    const current = await fetch("/api/admin/site").then((r) => r.json());

    const next = {
      ...current,
      clients: {
        title: current.clients?.title ?? "Clients",
        subtitle: current.clients?.subtitle ?? "Selected clients and collaborators",
        items,
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

    alert("Saved!");
    setSite(next);
  };

  if (!site) {
    return (
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-sm text-zinc-600">Loading…</div>
      </main>
    );
  }

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Clients Admin</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Add clients + upload logos
          </p>
        </div>

        {/* Upload logo */}
        <section className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Upload logo</div>
              <div className="text-xs text-zinc-600">PNG/JPG/WebP/SVG</div>
            </div>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-xs hover:bg-zinc-50"
            >
              Choose logo
            </button>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;

                const ok = await uploadLogo(f);
                if (ok) await refreshLogos();

                e.target.value = "";
              }}
            />
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {logos.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  // just a helper: copies path to clipboard
                  const path = `/clients/logos/${name}`;
                  navigator.clipboard?.writeText(path);
                  alert(`Copied:\n${path}`);
                }}
                className="flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white p-3 text-left text-xs hover:bg-zinc-50"
              >
                <span className="truncate text-zinc-700">{name}</span>
                <span className="text-zinc-500">Copy path</span>
              </button>
            ))}
          </div>
        </section>

        {/* Clients list */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Clients</div>
            <button
              type="button"
              onClick={addClient}
              className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-xs hover:bg-zinc-50"
            >
              + Add client
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {items.map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="rounded-2xl border border-zinc-200/60 bg-white/70 p-4"
              >
                <div className="grid gap-3 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-4">
                    <div className="text-xs text-zinc-500">Name</div>
                    <input
                      value={c.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                      placeholder="Client name"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <div className="text-xs text-zinc-500">Logo path</div>
                    <input
                      value={c.logo ?? ""}
                      onChange={(e) => update(i, { logo: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                      placeholder='/clients/logos/client.png'
                    />
                  </div>

                  <div className="md:col-span-3">
                    <div className="text-xs text-zinc-500">Website</div>
                    <input
                      value={c.url ?? ""}
                      onChange={(e) => update(i, { url: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                      placeholder="https://…"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-zinc-500">
                    {c.logo ? `Logo: ${c.logo}` : "No logo selected"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => move(i, Math.max(0, i - 1))}
                      className="rounded-full border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, Math.min(items.length - 1, i + 1))}
                      className="rounded-full border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClient(i)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-8 rounded-full bg-black px-6 py-3 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </section>
      </div>
    </main>
  );
}
