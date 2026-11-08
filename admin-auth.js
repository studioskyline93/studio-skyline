// Admin login (password, checked by the Cloudflare Worker) - included on all admin pages.

function _loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = function () { reject(new Error("Could not load " + src)); };
    document.head.appendChild(s);
  });
}

async function _ensureClient() {
  if (typeof ADMIN_API === "undefined") await _loadScript("supabase-client.js");
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
    var res = await fetch(ADMIN_API + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: pw })
    });
    var out = await res.json().catch(function () { return {}; });
    if (!res.ok || !out.token) throw new Error(out.error || ("HTTP " + res.status));
    ssSetToken(out.token);
    _showAdmin();
  } catch (e) {
    console.error("Admin login failed:", e);
    var m = (e && e.message) ? e.message : "";
    if (/incorrect/i.test(m)) err.textContent = "Incorrect email or password.";
    else err.textContent = "Login failed: " + (m || "unknown error");
    err.style.display = "block";
    document.getElementById("adminPwInput").value = "";
    document.getElementById("adminPwInput").focus();
    btn.disabled = false; btn.textContent = "Enter";
  }
}

async function adminLogout() {
  ssClearToken();
  location.reload();
}

async function initAdminAuth() {
  var content = document.getElementById("adminContent");
  if (content) content.style.display = "none";
  try { await _ensureClient(); }
  catch (e) { showLoginScreen("Could not start login: " + e.message); return; }
  if (!ADMIN_API) { showLoginScreen("Admin is not set up yet: add the Worker address to supabase-client.js (ADMIN_API)."); return; }

  if (ssGetToken()) {
    try {
      var r = await fetch(ADMIN_API + "/api/check", { headers: { Authorization: "Bearer " + ssGetToken() } });
      if (r.ok) { _showAdmin(); return; }
      ssClearToken();
    } catch (e) {
      showLoginScreen("Could not reach the admin server. Check your connection and reload.");
      return;
    }
  }
  showLoginScreen();
}
