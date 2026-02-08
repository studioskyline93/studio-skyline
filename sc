import fs from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");
const workPath = path.join(root, "content", "work.json");

const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
const existingWork = fs.existsSync(workPath)
  ? JSON.parse(fs.readFileSync(workPath, "utf8"))
  : { collections: [] };

const oldCollections = site?.work?.collections ?? [];
if (!Array.isArray(oldCollections) || oldCollections.length === 0) {
  console.error("No site.work.collections found in content/site.json");
  process.exit(1);
}

const current = Array.isArray(existingWork.collections)
  ? existingWork.collections
  : [];

const bySlug = new Map(current.map((c) => [c.slug, c]));

// Merge: site collections fill in anything missing by slug
for (const c of oldCollections) {
  if (!c?.slug) continue;

  // Normalize minimal shape
  const normalized = {
    slug: String(c.slug),
    index: c.index ?? undefined,
    title: c.title ?? c.slug,
    subtitle: c.subtitle ?? undefined,
    description: c.description ?? undefined,
    videos: Array.isArray(c.videos) ? c.videos : [],
  };

  if (!bySlug.has(normalized.slug)) {
    bySlug.set(normalized.slug, normalized);
  } else {
    // If already exists in work.json, keep work.json version (don’t overwrite)
    // but fill missing fields from site.json
    const prev = bySlug.get(normalized.slug);
    bySlug.set(normalized.slug, {
      ...normalized,
      ...prev,
      videos: Array.isArray(prev.videos) && prev.videos.length ? prev.videos : normalized.videos,
    });
  }
}

const merged = { collections: Array.from(bySlug.values()) };

// Write back
fs.writeFileSync(workPath, JSON.stringify(merged, null, 2) + "\n", "utf8");

console.log(`✅ Migrated ${oldCollections.length} collections from site.json into work.json`);
console.log(`✅ work.json now has ${merged.collections.length} collections total`);
