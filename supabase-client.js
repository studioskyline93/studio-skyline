// Content + admin helpers. No Supabase any more.
//
//  • Pictures and videos live in Cloudflare R2.
//  • Site text (work.json / site.json) is read from the admin Worker, and falls back
//    to the work.json / site.json files next to the pages if the Worker has nothing yet.
//  • The admin pages log in, save and upload through the Worker.

var R2_PUBLIC_URL = "https://pub-3a2db1cd0a2746e8969d504aadce99e5.r2.dev";

// >>> After you create the Worker, paste its address between the quotes, e.g.
// >>> "https://studio-admin.your-name.workers.dev"   (no slash at the end)
var ADMIN_API = "https://studio-admin.riaomshandilya.workers.dev";

var SS_TOKEN_KEY = "ss-admin-token";

// Old code may still call this; there is no Supabase now.
function getSupabase() { return null; }

function ssGetToken() { try { return localStorage.getItem(SS_TOKEN_KEY) || ""; } catch (e) { return ""; } }
function ssSetToken(t) { try { localStorage.setItem(SS_TOKEN_KEY, t); } catch (e) {} }
function ssClearToken() { try { localStorage.removeItem(SS_TOKEN_KEY); } catch (e) {} }

async function ssAdminFetch(path, opts) {
  opts = opts || {};
  opts.headers = Object.assign({}, opts.headers, { Authorization: "Bearer " + ssGetToken() });
  var res = await fetch(ADMIN_API + path, opts);
  if (res.status === 401) {
    ssClearToken();
    alert("Your login expired. Please log in again.");
    location.reload();
    throw new Error("Unauthorized");
  }
  return res;
}

async function ssLoadJson(key) {
  if (ADMIN_API) {
    try {
      var r = await fetch(ADMIN_API + "/content/" + key, { cache: "no-store" });
      if (r.ok) return await r.json();
    } catch (e) { /* fall through to the file */ }
  }
  var res = await fetch(key + ".json", { cache: "no-cache" });
  if (!res.ok) throw new Error(key + ".json returned " + res.status);
  return res.json();
}

// Read site content (testimonials, contact, about, etc.)
async function loadSiteContent() {
  try { return await ssLoadJson("site"); }
  catch (e) { console.error("Failed to load site content:", e); return null; }   // pages fall back to data.js
}

// Read work collections
async function loadWorkContent() {
  try {
    var payload = await ssLoadJson("work");
    if (!payload || !Array.isArray(payload.collections)) return { collections: [] };
    return payload;
  } catch (e) { console.error("Failed to load work content:", e); return null; }
}

async function ssSave(key, data) {
  if (!ADMIN_API) { alert("Admin is not set up yet: add the Worker address to supabase-client.js (ADMIN_API)."); return false; }
  try {
    var res = await ssAdminFetch("/api/content/" + key, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch (e) { console.error("Failed to save " + key + ":", e); return false; }
}
async function saveSiteContent(data) { return ssSave("site", data); }
async function saveWorkContent(data) { return ssSave("work", data); }

// Upload a picture / video to R2
async function uploadToStorage(slug, file) {
  if (!ADMIN_API) { alert("Admin is not set up yet: add the Worker address to supabase-client.js (ADMIN_API)."); return null; }
  try {
    var res = await ssAdminFetch("/api/upload?slug=" + encodeURIComponent(slug) + "&name=" + encodeURIComponent(file.name), {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file
    });
    var out = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(out.error || ("HTTP " + res.status));
    return { path: out.path, src: out.src };
  } catch (e) {
    console.error("Upload failed:", e);
    if (e.message !== "Unauthorized") alert("Upload failed: " + e.message);
    return null;
  }
}

// Delete a file from R2
async function deleteFromStorage(storagePath) {
  try {
    var res = await ssAdminFetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: storagePath })
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch (e) { console.error("Delete failed:", e); return false; }
}

async function listStorageFiles(prefix) { return []; }

function storagePublicUrl(slug, filename) {
  return R2_PUBLIC_URL + "/" + slug + "/videos/" + filename;
}
