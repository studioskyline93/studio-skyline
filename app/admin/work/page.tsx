"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type WorkVideo = { src: string; title?: string };
type WorkCollection = {
  slug: string;
  index?: string;
  title: string;
  subtitle?: string;
  description?: string;
  videos: WorkVideo[];
};
type WorkData = { collections: WorkCollection[] };

function supabasePublicSrcFor(slug: string, filename: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/work/${slug}/videos/${filename}`;
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export default function AdminWorkPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [work, setWork] = useState<WorkData>({ collections: [] });

  const [activeSlug, setActiveSlug] = useState<string>("");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  const [deletingSrc, setDeletingSrc] = useState<string | null>(null);

  // NEW: small local form for editing collection fields (so edits don’t fight state)
  const [edit, setEdit] = useState<{
    slug: string;
    index: string;
    title: string;
    subtitle: string;
    description: string;
  }>({ slug: "", index: "", title: "", subtitle: "", description: "" });

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const active = useMemo(() => {
    return work.collections.find((c) => c.slug === activeSlug) || null;
  }, [work.collections, activeSlug]);

  const activeFolder = useMemo(() => {
    if (!active) return "";
    return `work/${active.slug}/videos`;
  }, [active]);

  async function loadWork() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/work", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load work.json");
      const data = (await res.json()) as WorkData;
      setWork(data);

      const first = data.collections?.[0]?.slug;
      if (first) setActiveSlug((prev) => prev || first);
    } catch {
      setStatus("Could not load Work content.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableFiles(folder: string) {
    if (!folder) return;
    setStatus("");
    try {
      const res = await fetch(
        `/api/admin/media?folder=${encodeURIComponent(folder)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setAvailableFiles(Array.isArray(data.files) ? data.files : []);
    } catch {
      setAvailableFiles([]);
      setStatus("Could not load files from /public.");
    }
  }

  useEffect(() => {
    loadWork();
  }, []);

  useEffect(() => {
    if (!activeFolder) return;
    loadAvailableFiles(activeFolder);
  }, [activeFolder]);

  // NEW: whenever active collection changes, populate edit form
  useEffect(() => {
    if (!active) return;
    setEdit({
      slug: active.slug || "",
      index: active.index || "",
      title: active.title || "",
      subtitle: active.subtitle || "",
      description: active.description || "",
    });
  }, [active?.slug]); // only when switching collections

  // IMPORTANT: updates by slug so buttons never use stale state
  function updateActive(mutator: (c: WorkCollection) => WorkCollection) {
    if (!activeSlug) return;

    setWork((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.slug === activeSlug ? mutator(c) : c
      ),
    }));
  }

  // ---------- Collection CRUD + reorder ----------

  function moveCollection(slug: string, dir: "up" | "down") {
    setWork((prev) => {
      const list = [...(prev.collections || [])];
      const index = list.findIndex((c) => c.slug === slug);
      if (index === -1) return prev;

      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;

      [list[index], list[target]] = [list[target], list[index]];
      return { ...prev, collections: list };
    });
  }

  function createCollection() {
    const slugInput = window
      .prompt(
        "New category slug (lowercase, numbers, hyphen). Example: premium-fancy-boxes"
      )
      ?.trim()
      .toLowerCase();

    if (!slugInput) return;
    if (!isSafeSlug(slugInput)) {
      setStatus("Invalid slug. Use lowercase letters, numbers, and hyphens only.");
      return;
    }

    const titleInput = window.prompt("Title for this category?", "")?.trim();
    if (!titleInput) {
      setStatus("Title is required.");
      return;
    }

    setWork((prev) => {
      const exists = prev.collections.some((c) => c.slug === slugInput);
      if (exists) {
        setStatus("That slug already exists.");
        return prev;
      }

      const next: WorkCollection = {
        slug: slugInput,
        index: "",
        title: titleInput,
        subtitle: "",
        description: "",
        videos: [],
      };

      return { ...prev, collections: [...prev.collections, next] };
    });

    setActiveSlug(slugInput);
    setStatus("New category created. Add videos, then Save changes.");
  }

  function deleteCollection(slug: string) {
    const ok = window.confirm(
      `Delete category "${slug}"?\n\nThis removes it from work.json (non-destructive). Files in /public are NOT deleted.`
    );
    if (!ok) return;

    setWork((prev) => {
      const next = prev.collections.filter((c) => c.slug !== slug);
      return { ...prev, collections: next };
    });

    // pick a new active slug
    if (activeSlug === slug) {
      const remaining = work.collections.filter((c) => c.slug !== slug);
      setActiveSlug(remaining[0]?.slug || "");
    }

    setStatus("Category removed. Click Save changes to persist.");
  }

  function applyCollectionEdits() {
    if (!active) return;

    const newSlug = edit.slug.trim().toLowerCase();
    if (!newSlug) {
      setStatus("Slug cannot be empty.");
      return;
    }
    if (!isSafeSlug(newSlug)) {
      setStatus("Invalid slug. Use lowercase letters, numbers, and hyphens only.");
      return;
    }
    if (!edit.title.trim()) {
      setStatus("Title cannot be empty.");
      return;
    }

    setWork((prev) => {
      // slug uniqueness check (if renaming)
      if (
        newSlug !== active.slug &&
        prev.collections.some((c) => c.slug === newSlug)
      ) {
        setStatus("That slug already exists.");
        return prev;
      }

      const nextCollections = prev.collections.map((c) => {
        if (c.slug !== active.slug) return c;

        // If slug changed, rewrite video src paths to match new slug folder
        const slugChanged = newSlug !== active.slug;
        const nextVideos = slugChanged
          ? (c.videos || []).map((v) => ({
              ...v,
              src: v.src.replace(
                `/work/${active.slug}/videos/`,
                `/work/${newSlug}/videos/`
              ),
            }))
          : c.videos || [];

        return {
          ...c,
          slug: newSlug,
          index: edit.index.trim(),
          title: edit.title.trim(),
          subtitle: edit.subtitle.trim(),
          description: edit.description.trim(),
          videos: nextVideos,
        };
      });

      return { ...prev, collections: nextCollections };
    });

    if (newSlug !== active.slug) {
      setActiveSlug(newSlug);
      setStatus(
        "Category updated. Note: if you renamed the slug, you must also rename the folder in /public/work to match."
      );
    } else {
      setStatus("Category updated. Click Save changes to persist.");
    }
  }

  // ---------- Videos (existing features) ----------

  function addVideoFromFilename(filename: string) {
    if (!active) return;
  
    const src = supabasePublicSrcFor(active.slug, filename);
    if (!src) {
      setStatus("Missing NEXT_PUBLIC_SUPABASE_URL env var.");
      return;
    }
  
    updateActive((c) => {
      const already = (c.videos || []).some((v) => v.src === src);
      if (already) return c;
  
      return { ...c, videos: [...(c.videos || []), { src }] };
    });
  }
  

  function removeVideo(src: string) {
    updateActive((c) => ({
      ...c,
      videos: (c.videos || []).filter((v) => v.src !== src),
    }));
  }

  function moveVideo(src: string, dir: "up" | "down") {
    updateActive((c) => {
      const list = [...(c.videos || [])];
      const index = list.findIndex((v) => v.src === src);
      if (index === -1) return c;

      const target = dir === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return c;

      [list[index], list[target]] = [list[target], list[index]];
      return { ...c, videos: list };
    });
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!active) return;
  
    setStatus("");
  
    try {
      for (const file of Array.from(files)) {
        // 1) ask server for a signed upload URL (small request)
        const metaRes = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: active.slug,
            filename: file.name,
          }),
        });
  
        const meta = await metaRes.json().catch(() => ({}));
        if (!metaRes.ok) throw new Error(meta?.error || "Failed to start upload");
  
        // 2) upload the file directly to Supabase (big file goes here)
        const putRes = await fetch(meta.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "video/mp4" },
          body: file,
        });
  
        if (!putRes.ok) throw new Error("Upload failed");
  
        // 3) add the new video to the CURRENT category immediately (so it shows)
        updateActive((c) => {
          const already = (c.videos || []).some((v) => v.src === meta.src);
          if (already) return c;
          return { ...c, videos: [...(c.videos || []), { src: meta.src }] };
        });
      }
  
      // refresh the “Uploaded videos” list
      await loadAvailableFiles(activeFolder);
      setStatus("Upload complete. Click Save changes to persist.");
    } catch (e: any) {
      setStatus(e?.message || "Upload failed.");
    } finally {
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  }
  
  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(work),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Save failed");
      setStatus("Saved.");
    } catch (e: any) {
      setStatus(e?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function parseSrcToFolderAndFilename(src: string) {
    const clean = src.startsWith("/") ? src.slice(1) : src;
    const parts = clean.split("/").filter(Boolean);
    const filename = parts.pop() || "";
    const folder = parts.join("/");
    return { folder, filename };
  }

  async function deleteForever(src: string) {
    if (!src) return;
    const { folder, filename } = parseSrcToFolderAndFilename(src);

    if (!folder || !filename) {
      setStatus("Could not determine file path for deletion.");
      return;
    }

    const ok1 = window.confirm(
      `Delete forever?\n\n${filename}\n\nThis will remove the file from /public and cannot be undone.`
    );
    if (!ok1) return;

    const ok2 = window.confirm(
      "Final confirmation: This is permanent. Delete now?"
    );
    if (!ok2) return;

    setDeletingSrc(src);
    setStatus("");

    try {
      let res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, filename }),
      });

      if (res.status === 405 || res.status === 404) {
        const qs = new URLSearchParams({ folder, filename }).toString();
        res = await fetch(`/api/admin/delete?${qs}`, { method: "DELETE" });
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      removeVideo(src);
      if (activeFolder) await loadAvailableFiles(activeFolder);

      setStatus("Deleted forever. Click Save changes to persist JSON update.");
    } catch (e: any) {
      setStatus(e?.message || "Delete failed.");
    } finally {
      setDeletingSrc(null);
    }
  }

  const activeVideoSrcs = new Set((active?.videos || []).map((v) => v.src));
  const addableFiles = availableFiles.filter((f) => {
    if (!active) return true;
    const src = supabasePublicSrcFor(active.slug, f);
    return src ? !activeVideoSrcs.has(src) : true;
  });
  

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Work</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Manage categories and videos (stored in <span className="font-mono">content/work.json</span>).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm underline">
              ← Back
            </a>
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="rounded-full border border-zinc-200/60 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>

        {status ? (
          <div className="mt-6 rounded-xl border border-zinc-200/60 bg-white/70 p-4 text-sm text-zinc-700">
            {status}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* LEFT */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Categories</div>
              <button
                type="button"
                onClick={createCollection}
                className="rounded-full border border-zinc-200/60 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                + New
              </button>
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="text-sm text-zinc-500">Loading…</div>
              ) : work.collections.length === 0 ? (
                <div className="text-sm text-zinc-500">No categories yet.</div>
              ) : (
                <div className="grid gap-2">
                  {work.collections.map((c) => (
                    <div
                      key={c.slug}
                      className={[
                        "flex items-stretch gap-2 rounded-xl border",
                        c.slug === activeSlug
                          ? "border-zinc-300 bg-zinc-50"
                          : "border-zinc-200/60 bg-white hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSlug(c.slug)}
                        className="flex-1 px-3 py-2 text-left"
                      >
                        <div className="text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-zinc-500">/{c.slug}</div>
                      </button>

                      <div className="flex flex-col justify-center gap-1 pr-2">
                        <button
                          type="button"
                          onClick={() => moveCollection(c.slug, "up")}
                          className="text-xs text-zinc-500 hover:text-zinc-800"
                          title="Move category up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCollection(c.slug, "down")}
                          className="text-xs text-zinc-500 hover:text-zinc-800"
                          title="Move category down"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-5 backdrop-blur">
            {!active ? (
              <div className="text-sm text-zinc-500">Select a category.</div>
            ) : (
              <>
                {/* Category editor */}
                <div className="rounded-xl border border-zinc-200/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">Category details</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        If you change the slug, rename the folder in{" "}
                        <span className="font-mono">/public/work</span> too.
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => deleteCollection(active.slug)}
                        className="text-sm underline text-red-600 hover:text-red-700"
                      >
                        Delete category
                      </button>
                      <button
                        type="button"
                        onClick={applyCollectionEdits}
                        className="rounded-full border border-zinc-200/60 px-3 py-1.5 text-sm hover:bg-zinc-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">Index</span>
                      <input
                        value={edit.index}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, index: e.target.value }))
                        }
                        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="01"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">Slug</span>
                      <input
                        value={edit.slug}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, slug: e.target.value }))
                        }
                        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm font-mono"
                        placeholder="paper-bags"
                      />
                    </label>

                    <label className="grid gap-1 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Title</span>
                      <input
                        value={edit.title}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, title: e.target.value }))
                        }
                        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="Paper Bags"
                      />
                    </label>

                    <label className="grid gap-1 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Subtitle</span>
                      <input
                        value={edit.subtitle}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, subtitle: e.target.value }))
                        }
                        className="rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="Luxury paper bags"
                      />
                    </label>

                    <label className="grid gap-1 sm:col-span-2">
                      <span className="text-xs text-zinc-500">Description</span>
                      <textarea
                        value={edit.description}
                        onChange={(e) =>
                          setEdit((p) => ({ ...p, description: e.target.value }))
                        }
                        className="min-h-[88px] rounded-lg border border-zinc-200/60 bg-white px-3 py-2 text-sm"
                        placeholder="Short description shown below the videos."
                      />
                    </label>
                  </div>
                </div>

                {/* Upload row */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{active.title}</div>
                    <div className="text-xs text-zinc-500">
                      Folder: /public/{activeFolder}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="video/mp4"
                      multiple
                      className="hidden"
                      onChange={(e) => uploadFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="rounded-full border border-zinc-200/60 px-4 py-2 text-sm hover:bg-zinc-50"
                    >
                      Upload MP4
                    </button>
                  </div>
                </div>

                {/* Current videos */}
                <div className="mt-6">
                  <div className="text-sm font-medium">Current videos</div>

                  <div className="mt-3 grid gap-3">
                    {(active.videos || []).length === 0 ? (
                      <div className="text-sm text-zinc-500">
                        No videos in this category yet.
                      </div>
                    ) : (
                      active.videos.map((v) => {
                        const isDeleting = deletingSrc === v.src;
                        return (
                          <div
                            key={v.src}
                            className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200/60 p-3"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm">
                                {v.title || v.src.split("/").pop()}
                              </div>
                              <div className="truncate text-xs text-zinc-500">
                                {v.src}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Reorder videos */}
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveVideo(v.src, "up")}
                                  className="text-xs text-zinc-500 hover:text-zinc-800"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveVideo(v.src, "down")}
                                  className="text-xs text-zinc-500 hover:text-zinc-800"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                              </div>

                              <video
                                src={v.src}
                                muted
                                playsInline
                                className="h-12 w-20 rounded-lg border border-zinc-200/60 object-cover"
                              />

                              <div className="flex flex-col items-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => removeVideo(v.src)}
                                  className="text-sm underline"
                                  disabled={isDeleting}
                                >
                                  Remove
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deleteForever(v.src)}
                                  className="text-sm underline text-red-600 hover:text-red-700 disabled:opacity-50"
                                  disabled={isDeleting}
                                  title="Deletes the file from /public forever"
                                >
                                  {isDeleting ? "Deleting…" : "Delete forever"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Available files */}
                <div className="mt-10">
                  <div className="text-sm font-medium">Uploaded videos</div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Add files from{" "}
                    <span className="font-mono">/public/{activeFolder}</span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {availableFiles.length === 0 ? (
                      <div className="text-sm text-zinc-500">No files found.</div>
                    ) : addableFiles.length === 0 ? (
                      <div className="text-sm text-zinc-500">
                        All uploaded files are already added to this category.
                      </div>
                    ) : (
                      addableFiles.map((f) => (
                        <div
                          key={f}
                          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 p-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm">{f}</div>
                            <div className="truncate text-xs text-zinc-500">
                              {`/work/${active.slug}/videos/${f}`}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => addVideoFromFilename(f)}
                            className="text-sm underline"
                          >
                            Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}