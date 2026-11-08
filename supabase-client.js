// Content helpers — no Supabase needed any more.
// Site text comes from site.json and work.json (same folder as the HTML pages).
// Pictures and videos are served from Cloudflare R2.

var R2_PUBLIC_URL = "https://pub-3a2db1cd0a2746e8969d504aadce99e5.r2.dev";

async function loadJson(file) {
  var res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error(file + " returned " + res.status);
  return res.json();
}

// Read site content (testimonials, contact, about, etc.)
async function loadSiteContent() {
  try {
    return await loadJson("site.json");
  } catch (e) {
    console.error("Failed to load site content:", e);
    return null; // pages fall back to data.js
  }
}

// Read work collections
async function loadWorkContent() {
  try {
    var payload = await loadJson("work.json");
    if (!payload || !Array.isArray(payload.collections)) return { collections: [] };
    return payload;
  } catch (e) {
    console.error("Failed to load work content:", e);
    return null; // pages fall back to data.js
  }
}

// Editing from the admin page is switched off: content now lives in the JSON files.
function adminDisabled() {
  alert("Admin editing is switched off. Edit site.json / work.json and upload to R2 instead.");
  return false;
}
async function saveSiteContent(data) { return adminDisabled(); }
async function saveWorkContent(data) { return adminDisabled(); }
async function uploadToStorage(slug, file) { adminDisabled(); return null; }
async function deleteFromStorage(storagePath) { return adminDisabled(); }
async function listStorageFiles(prefix) { return []; }

// Public URL for a file in storage
function storagePublicUrl(slug, filename) {
  return R2_PUBLIC_URL + "/" + slug + "/videos/" + filename;
}
