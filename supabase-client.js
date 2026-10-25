// Supabase helper functions (uses the browser JS client loaded via CDN)
// Requires supabase-config.js to be loaded first
//
// CHANGE (R2 migration): content (login, site data, work data) still lives in
// Supabase. Files (videos/images) now live in Cloudflare R2 and are reached
// through the Worker defined in supabase-config.js (MEDIA_API_URL / MEDIA_BASE_URL).

var _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Supabase not configured — using local data.js fallback");
    return null;
  }
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

// Read site content (testimonials, contact, about, etc.)
async function loadSiteContent() {
  var sb = getSupabase();
  if (!sb) return null;
  try {
    var result = await sb.from("content").select("data").eq("key", "site").single();
    if (result.error) throw result.error;
    return result.data ? result.data.data : null;
  } catch (e) {
    console.error("Failed to load site content:", e);
    return null;
  }
}

// Read work collections
async function loadWorkContent() {
  var sb = getSupabase();
  if (!sb) return null;
  try {
    var result = await sb.from("content").select("data").eq("key", "work").single();
    if (result.error) throw result.error;
    var payload = result.data ? result.data.data : null;
    if (!payload || !Array.isArray(payload.collections)) return { collections: [] };
    return payload;
  } catch (e) {
    console.error("Failed to load work content:", e);
    return null;
  }
}

// Save site content
async function saveSiteContent(data) {
  var sb = getSupabase();
  if (!sb) { alert("Supabase not configured"); return false; }
  try {
    var result = await sb.from("content").upsert({
      key: "site",
      data: data,
      updated_at: new Date().toISOString()
    });
    if (result.error) throw result.error;
    return true;
  } catch (e) {
    console.error("Failed to save site content:", e);
    return false;
  }
}

// Save work collections
async function saveWorkContent(data) {
  var sb = getSupabase();
  if (!sb) { alert("Supabase not configured"); return false; }
  try {
    var result = await sb.from("content").upsert({
      key: "work",
      data: data,
      updated_at: new Date().toISOString()
    });
    if (result.error) throw result.error;
    return true;
  } catch (e) {
    console.error("Failed to save work content:", e);
    return false;
  }
}

// ------------------------------------------------------------
// Storage (Cloudflare R2 via the Worker)
// ------------------------------------------------------------

// Get the admin's current Supabase login token (the Worker checks it)
async function getAuthToken() {
  var sb = getSupabase();
  if (!sb) return null;
  var result = await sb.auth.getSession();
  var session = result && result.data ? result.data.session : null;
  return session ? session.access_token : null;
}

// Call the Worker with the admin's login token
async function mediaApi(pathname, options) {
  var token = await getAuthToken();
  if (!token) throw new Error("Not logged in");
  options = options || {};
  options.headers = Object.assign({ Authorization: "Bearer " + token }, options.headers || {});
  var res = await fetch(MEDIA_API_URL + pathname, options);
  var body = await res.json().catch(function() { return {}; });
  if (!res.ok) throw new Error(body.error || ("Request failed: " + res.status));
  return body;
}

// Public URL for any stored path
function mediaUrl(objectPath) {
  return MEDIA_BASE_URL.replace(/\/+$/, "") + "/" + objectPath;
}

// Upload a file to R2 (browser -> one-time link -> R2 directly)
async function uploadToStorage(slug, file) {
  var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  var objectPath = slug + "/videos/" + Date.now() + "-" + safeName;
  var contentType = file.type || "video/mp4";

  try {
    var signed = await mediaApi("/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: objectPath, contentType: contentType })
    });

    var put = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: file
    });
    if (!put.ok) throw new Error("R2 upload failed: " + put.status);

    return {
      path: objectPath,
      src: mediaUrl(objectPath)
    };
  } catch (e) {
    console.error("Upload failed:", e);
    return null;
  }
}

// Delete a file from R2
async function deleteFromStorage(storagePath) {
  try {
    await mediaApi("/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: storagePath })
    });
    return true;
  } catch (e) {
    console.error("Delete failed:", e);
    return false;
  }
}

// List files in a storage folder (prefix like "my-slug/videos")
async function listStorageFiles(prefix) {
  try {
    var body = await mediaApi("/list?prefix=" + encodeURIComponent(prefix || ""));
    return (body.names || []).filter(function(n) {
      return /\.(mp4|webm|mov|m4v|jpe?g|png|webp|gif|avif)$/i.test(n);
    });
  } catch (e) {
    console.error("List files failed:", e);
    return [];
  }
}

// Get public URL for a file in storage
function storagePublicUrl(slug, filename) {
  return mediaUrl(slug + "/videos/" + filename);
}
