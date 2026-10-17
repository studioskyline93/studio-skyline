// Admin login (Supabase Auth) - included on all admin pages.
// Log in with the email + password of the admin user created in Supabase.
// Works on any admin page even if it does not load the Supabase scripts itself.

function _loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = function () { reject(new Error("Could not load " + src)); };
    document.head.appendChild(s);
  });
}

async function _ensureSupabase() {
  if (typeof supabase === "undefined") await _loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
  if (typeof SUPABASE_URL === "undefined") await _loadScript("supabase-config.js");
  if (typeof getSupabase !== "function") await _loadScript("supabase-client.js");
  return getSupabase();
}

var _adminReadyFired = false;

function _showAdmin() {
  var overlay = document.getElementById("loginOverlay");
  if (overlay) overlay.remove();
  var content = document.getElementById("adminContent");
  if (content) content.style.display = "";

  if (!document.getElementById("adminLogoutBtn")) {
    var b = document.createElement("button");
    b.id = "adminLogoutBtn";
    b.textContent = "Log out";
    b.onclick = adminLogout;
    b.style.cssText = "position:fixed;top:10px;right:12px;z-index:60;font-size:13px;padding:6px 12px;" +
      "border-radius:999px;border:1px solid rgba(228,228,231,.9);background:rgba(255,255,255,.92);cursor:pointer;font-family:inherit";
    document.body.appendChild(b);
  }
  if (!_adminReadyFired) {
    _adminReadyFired = true;
    if (typeof onAdminReady === "function") onAdminReady();
  }
}

function showLoginScreen(message) {
  var content = document.getElementById("adminContent");
  if (content) content.style.display = "none";
  if (document.getElementById("loginOverlay")) return;

  var overlay = document.createElement("div");
  overlay.id = "loginOverlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:999",
    "display:flex", "align-items:center", "justify-content:center",
    "background:linear-gradient(to bottom,#fff,#fffaf6)"
  ].join(";");

  var field = "width:100%;border-radius:12px;border:1px solid rgba(228,228,231,0.6);" +
              "padding:12px 16px;font-size:14px;font-family:inherit;outline:none";
  overlay.innerHTML = [
    '<div style="width:100%;max-width:380px;padding:20px">',
      '<div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">Admin Login</div>',
      '<div style="margin-top:4px;font-size:14px;color:#71717a">Studio Skyline</div>',
      '<div style="margin-top:24px;display:grid;gap:12px">',
        '<input id="adminEmailInput" type="email" autocomplete="username" placeholder="Email" style="' + field + '"',
          ' onkeydown="if(event.key===\'Enter\')document.getElementById(\'adminPwInput\').focus()">',
        '<input id="adminPwInput" type="password" autocomplete="current-password" placeholder="Password" style="' + field + '"',
          ' onkeydown="if(event.key===\'Enter\')tryLogin()">',
        '<button id="adminLoginBtn" onclick="tryLogin()" class="btn-primary" style="width:100%;padding:12px;font-size:14px">Enter</button>',
        '<div id="loginError" style="font-size:13px;color:#dc2626;display:none"></div>',
      '</div>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  if (message) {
    var err = document.getElementById("loginError");
    err.textContent = message;
    err.style.display = "block";
  }
  document.getElementById("adminEmailInput").focus();
}

async function tryLogin() {
  var email = document.getElementById("adminEmailInput").value.trim();
  var pw = document.getElementById("adminPwInput").value;
  var err = document.getElementById("loginError");
  var btn = document.getElementById("adminLoginBtn");
  err.style.display = "none";
  if (!email || !pw) { err.textContent = "Enter your email and password."; err.style.display = "block"; return; }

  btn.disabled = true; btn.textContent = "Checking...";
  try {
    var r = await getSupabase().auth.signInWithPassword({ email: email, password: pw });
    if (r.error) throw r.error;
    _showAdmin();
  } catch (e) {
    console.error("Admin login failed:", e);
    var m = (e && e.message) ? e.message : "";
    if (/not confirmed/i.test(m)) err.textContent = "This email is not confirmed yet. In Supabase, delete the user and recreate it with 'Auto Confirm User' ticked.";
    else if (/invalid login/i.test(m)) err.textContent = "Incorrect email or password.";
    else err.textContent = "Login failed: " + (m || "unknown error");
    err.style.display = "block";
    document.getElementById("adminPwInput").value = "";
    document.getElementById("adminPwInput").focus();
    btn.disabled = false; btn.textContent = "Enter";
  }
}

async function adminLogout() {
  try { await getSupabase().auth.signOut(); } catch (e) {}
  location.reload();
}

async function initAdminAuth() {
  var content = document.getElementById("adminContent");
  if (content) content.style.display = "none";
  var sb;
  try { sb = await _ensureSupabase(); }
  catch (e) { showLoginScreen("Could not start login: " + e.message); return; }
  if (!sb) { showLoginScreen("Supabase is not configured."); return; }

  var s = await sb.auth.getSession();
  if (s && s.data && s.data.session) _showAdmin(); else showLoginScreen();

  sb.auth.onAuthStateChange(function (event) {
    if (event === "SIGNED_OUT") location.reload();
  });
}
