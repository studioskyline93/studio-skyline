// Supabase helper functions (uses the browser JS client loaded via CDN)
// Requires supabase-config.js to be loaded first

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

// Upload a file to Supabase Storage
async function uploadToStorage(slug, file) {
  var sb = getSupabase();
  if (!sb) { alert("Supabase not configured"); return null; }

  var safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  var objectPath = slug + "/videos/" + Date.now() + "-" + safeName;

  try {
    var result = await sb.storage.from(SUPABASE_BUCKET).upload(objectPath, file, {
      contentType: file.type || "video/mp4",
      upsert: false
    });
    if (result.error) throw result.error;

    var pubResult = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(objectPath);
    return {
      path: objectPath,
      src: pubResult.data.publicUrl
    };
  } catch (e) {
    console.error("Upload failed:", e);
    return null;
  }
}

// Delete a file from Supabase Storage
async function deleteFromStorage(storagePath) {
  var sb = getSupabase();
  if (!sb) { alert("Supabase not configured"); return false; }
  try {
    var result = await sb.storage.from(SUPABASE_BUCKET).remove([storagePath]);
    if (result.error) throw result.error;
    return true;
  } catch (e) {
    console.error("Delete failed:", e);
    return false;
  }
}

// List files in a storage folder
async function listStorageFiles(prefix) {
  var sb = getSupabase();
  if (!sb) return [];
  try {
    var result = await sb.storage.from(SUPABASE_BUCKET).list(prefix, {
      limit: 200,
      sortBy: { column: "name", order: "desc" }
    });
    if (result.error) throw result.error;
    return (result.data || []).map(function(f) { return f.name; }).filter(function(n) {
      return n.toLowerCase().endsWith(".mp4");
    });
  } catch (e) {
    console.error("List files failed:", e);
    return [];
  }
}

// Get public URL for a file in storage
function storagePublicUrl(slug, filename) {
  var sb = getSupabase();
  if (!sb) return "";
  var result = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(slug + "/videos/" + filename);
  return result.data.publicUrl;
}
