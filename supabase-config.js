// ============================================================
// SUPABASE CONFIG — fill in your credentials here
// ============================================================
// Your Supabase project URL (found in Settings → API)
var SUPABASE_URL = "";
// Your Supabase anon/public key (found in Settings → API)
var SUPABASE_ANON_KEY = "";
// Your Supabase storage bucket name for work videos
var SUPABASE_BUCKET = "work";

// NOTE: Make sure your Supabase "content" table has RLS policies:
//   - Public SELECT for everyone (so the site can load data)
//   - INSERT/UPDATE for authenticated users or specific roles (for admin)
//
// If you want admin to work without login, add a permissive
// INSERT/UPDATE policy. For production, add Supabase Auth.
