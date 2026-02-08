"use client";

import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type WorkVideo = { src: string; title?: string };
type WorkCollection = {
  slug: string;
  index: string;
  title: string;
  subtitle?: string;
  description?: string;
  videos: WorkVideo[];
};

export default function AdminWorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 16: params is a Promise in some routes
  const { slug } = React.use(params);

  const [site, setSite] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [collection, setCollection] = useState<WorkCollection | null>(null);

  const [files, setFiles] = useState<string[]>([]);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Always load latest site.json from API (not static import)
  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((json) => {
        setSite(json);

        const collections = (json.work?.collections ?? []) as WorkCollection[];
        const c = collections.find((x) => x.slug === slug) ?? null;
        setCollection(c);
      });
  }, [slug]);

  const folder = useMemo(() => `work/${slug}/videos`, [slug]);

  const refreshFiles = async () => {
    const d = await fetch(
      `/api/admin/media?folder=${encodeURIComponent(folder)}`
    ).then((r) => r.json());

    setFiles(d.files || []);
  };

  useEffect(() => {
    refreshFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Upload failed");
      return false;
    }
    return true;
  };

  const addVideo = (filename: string) => {
    if (!collection) return;
    const src = `/work/${slug}/videos/${filename}`;

    // prevent duplicates
    if (collection.videos.some((v) => v.src === src)) return;

    setCollection({
      ...collection,
      videos: [...collection.videos, { src, title: "" }],
    });
  };

  const removeFromList = (i: number) => {
    if (!collection) return;
    setCollection({
      ...collection,
      videos: collection.videos.filter((_, idx) => idx !== i),
    });
  };

  const move = (from: number, to: number) => {
    if (!collection) return;
    setCollection((prev) => {
      if (!prev) return prev;
      const copy = [...prev.videos];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return { ...prev, videos: copy };
    });
  };

  const setTitle = (i: number, title: string) => {
    if (!collection) return;
    setCollection((prev) => {
      if (!prev) return prev;
      const copy = [...prev.videos];
      copy[i] = { ...copy[i], title };
      return { ...prev, videos: copy };
    });
  };

  const deleteForever = async (filename: string) => {
    const ok1 = confirm(`Delete forever?\n\n${filename}`);
    if (!ok1) return;

    const ok2 = confirm(
      `This will permanently delete the file from /public/${folder}.\n\nClick OK to continue.`
    );
    if (!ok2) return;

    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder, filename }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Delete failed");
      return;
    }

    // remove from selected list too
    if (collection) {
      const src = `/work/${slug}/videos/${filename}`;
      setCollection({
        ...collection,
        videos: collection.videos.filter((v) => v.src !== src),
      });
    }

    await refreshFiles();
  };

  const save = async () => {
    if (!collection) return;
    setSaving(true);

    // fetch full json, merge, write back
    const current = await fetch("/api/admin/site").then((r) => r.json());
    const collections = (current.work?.collections ?? []) as WorkCollection[];

    const nextCollections = collections.map((c: WorkCollection) =>
      c.slug === slug ? { ...c, videos: collection.videos } : c
    );

    const next = {
      ...current,
      work: {
        ...current.work,
        collections: nextCollections,
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
  };

  if (!site) {
    return (
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-sm text-zinc-600">Loading…</div>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-sm text-zinc-600">
          Category not found: {slug}
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="text-xs tracking-widest text-zinc-500">
            {collection.index}
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{collection.title}</h1>
          <div className="mt-1 text-sm text-zinc-600">/work/{collection.slug}</div>
        </div>

        {/* Upload */}
        <section className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Upload video</div>
              <div className="text-xs text-zinc-600">MP4 only</div>
            </div>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-xs hover:bg-zinc-50"
            >
              Choose video
            </button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;

                const ok = await upload(f);
                if (ok) await refreshFiles();

                e.target.value = "";
              }}
            />
          </div>

          {/* Files in folder */}
          <div className="mt-5 grid gap-2 md:grid-cols-2">
            {files.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs text-zinc-700">{name}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addVideo(name)}
                    className="rounded-full border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    Add
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteForever(name)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Selected videos */}
        <section className="mt-8">
          <div className="text-sm font-medium">Videos on this page</div>

          <div className="mt-3 space-y-3">
            {collection.videos.map((v, i) => (
              <div
                key={v.src}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200/60 bg-white/70 p-4 md:flex-row md:items-center"
              >
                <div className="h-16 w-28 overflow-hidden rounded-lg bg-black/5">
                  <video
                    src={v.src}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-zinc-700">{v.src}</div>

                  <input
                    value={v.title ?? ""}
                    onChange={(e) => setTitle(i, e.target.value)}
                    placeholder="Optional title (shown in grid)"
                    className="mt-2 w-full rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-xs"
                  />
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
                    onClick={() =>
                      move(i, Math.min(collection.videos.length - 1, i + 1))
                    }
                    className="rounded-full border border-zinc-200/60 px-3 py-1 text-xs hover:bg-zinc-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromList(i)}
                    className="rounded-full border border-zinc-200/60 px-3 py-1 text-xs text-red-700 hover:bg-zinc-50"
                  >
                    Remove
                  </button>
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
