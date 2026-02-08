"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = {
  type: "video" | "photo";
  src: string;
  alt?: string;
};

export default function ProductionHouseAdmin() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((json) => setMedia(json.productionHouse?.hero?.media ?? []));
  }, []);

  useEffect(() => {
    fetch("/api/admin/media?folder=production-house/hero/videos")
      .then((r) => r.json())
      .then((d) => setVideos(d.files || []));

    fetch("/api/admin/media?folder=production-house/hero/photos")
      .then((r) => r.json())
      .then((d) => setPhotos(d.files || []));
  }, []);

  const upload = async (folder: string, file: File) => {
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

  const refreshLists = async () => {
    const v = await fetch(
      "/api/admin/media?folder=production-house/hero/videos"
    ).then((r) => r.json());
    setVideos(v.files || []);

    const p = await fetch(
      "/api/admin/media?folder=production-house/hero/photos"
    ).then((r) => r.json());
    setPhotos(p.files || []);
  };
  const deleteForever = async (folder: string, filename: string) => {
    const first = window.confirm(`Delete "${filename}" permanently?`);
    if (!first) return;
  
    const second = window.confirm(
      "This will delete the file from /public and cannot be undone. Delete forever?"
    );
    if (!second) return;
  
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
  
    // If the file is currently used in the hero list, remove it from hero too
    const deletedSrc = `/${folder}/${filename}`;
    setMedia((m) => m.filter((it) => it.src !== deletedSrc));
  
    await refreshLists();
  };

  
  const addVideo = (name: string) =>
    setMedia((m) => [...m, { type: "video", src: `/production-house/hero/videos/${name}` }]);

  const addPhoto = (name: string) =>
    setMedia((m) => [...m, { type: "photo", src: `/production-house/hero/photos/${name}` }]);

  const remove = (i: number) => setMedia((m) => m.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productionHouse: { hero: { media } } }),
    });
    setSaving(false);
    if (!res.ok) alert("Failed to save");
  };

  return (
    <main className="px-6 pt-24 pb-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Production House Admin</h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium">Upload video</h2>
            <div className="mt-3 flex items-center gap-3">
  <button
    type="button"
    onClick={() => videoInputRef.current?.click()}
    className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-xs hover:bg-zinc-50"
  >
    Choose video
  </button>

  <span className="text-xs text-zinc-500">MP4 only</span>

  <input
    ref={videoInputRef}
    type="file"
    accept="video/mp4"
    className="hidden"
    onChange={async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;

      const ok = await upload("production-house/hero/videos", f);
      if (ok) await refreshLists();

      e.target.value = "";
    }}
  />
</div>




            <div className="mt-3 space-y-2">
            {videos.map((v) => (
  <div key={v} className="flex items-center gap-2">
    <button
      type="button"
      className="flex-1 rounded-lg border px-3 py-2 text-left text-xs hover:bg-zinc-50"
      onClick={() => addVideo(v)}
    >
      Add {v}
    </button>

    <button
      type="button"
      className="rounded-lg border border-zinc-200/60 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
      onClick={() => deleteForever("production-house/hero/videos", v)}
      title="Delete file forever"
    >
      Delete
    </button>
  </div>
))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium">Upload photo</h2>
            <div className="mt-3 flex items-center gap-3">
  <button
    type="button"
    onClick={() => photoInputRef.current?.click()}
    className="rounded-full border border-zinc-200/60 bg-white px-4 py-2 text-xs hover:bg-zinc-50"
  >
    Choose photo
  </button>

  <span className="text-xs text-zinc-500">JPG/PNG/WebP</span>

  <input
    ref={photoInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;

      const ok = await upload("production-house/hero/photos", f);
      if (ok) await refreshLists();

      e.target.value = "";
    }}
  />
</div>


            <div className="mt-3 space-y-2">
            {photos.map((p) => (
  <div key={p} className="flex items-center gap-2">
    <button
      type="button"
      className="flex-1 rounded-lg border px-3 py-2 text-left text-xs hover:bg-zinc-50"
      onClick={() => addPhoto(p)}
    >
      Add {p}
    </button>

    <button
      type="button"
      className="rounded-lg border border-zinc-200/60 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
      onClick={() => deleteForever("production-house/hero/photos", p)}
      title="Delete file forever"
    >
      Delete
    </button>
  </div>
))}

            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-sm font-medium">Current media</h2>

          <div className="mt-4 space-y-3">
            {media.map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border p-3">
                <div className="h-16 w-28 overflow-hidden rounded-lg bg-black/5">
                  {item.type === "video" ? (
                    <video
                      src={item.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.src} alt={item.alt ?? ""} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex-1 text-xs truncate">
                  {item.type} — {item.src}
                </div>

                <button className="text-xs text-red-600" onClick={() => remove(i)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-8 rounded-full bg-black px-6 py-3 text-sm text-white"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </section>
      </div>
    </main>
  );
}

/* END OF FILE - DO NOT PUT ANYTHING BELOW THIS LINE */
