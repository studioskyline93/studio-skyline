// Admin password gate — included on all admin pages
// Password is set in supabase-config.js as ADMIN_PASSWORD

var ADMIN_SESSION_KEY = "ss_admin_auth";

function checkAdminAuth() {
  var stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (stored === ADMIN_PASSWORD) return true;
  return false;
}

function showLoginScreen() {
  // Hide page content
  document.getElementById("adminContent").style.display = "none";

  var overlay = document.createElement("div");
  overlay.id = "loginOverlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:999",
    "display:flex", "align-items:center", "justify-content:center",
    "background:linear-gradient(to bottom,#fff,#fffaf6)"
  ].join(";");

  overlay.innerHTML = [
    '<div style="width:100%;max-width:380px;padding:20px">',
      '<div style="font-size:24px;font-weight:600;letter-spacing:-0.02em">Admin Login</div>',
      '<div style="margin-top:4px;font-size:14px;color:#71717a">Studio Skyline</div>',
      '<div style="margin-top:24px;display:grid;gap:12px">',
        '<input id="adminPwInput" type="password" placeholder="Password"',
          ' style="width:100%;border-radius:12px;border:1px solid rgba(228,228,231,0.6);',
          'padding:12px 16px;font-size:14px;font-family:inherit;outline:none"',
          ' onkeydown="if(event.key===\'Enter\')tryLogin()">',
        '<button onclick="tryLogin()" class="btn-primary" style="width:100%;padding:12px;font-size:14px">',
          'Enter',
        '</button>',
        '<div id="loginError" style="font-size:13px;color:#dc2626;display:none">Incorrect password.</div>',
      '</div>',
    '</div>'
  ].join("");

  document.body.appendChild(overlay);
  document.getElementById("adminPwInput").focus();
}

function tryLogin() {
  var input = document.getElementById("adminPwInput").value;
  if (input === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_PASSWORD);
    document.getElementById("loginOverlay").remove();
    document.getElementById("adminContent").style.display = "";
    if (typeof onAdminReady === "function") onAdminReady();
  } else {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("adminPwInput").value = "";
    document.getElementById("adminPwInput").focus();
  }
}

function initAdminAuth() {
  if (checkAdminAuth()) {
    document.getElementById("adminContent").style.display = "";
    if (typeof onAdminReady === "function") onAdminReady();
  } else {
    showLoginScreen();
  }
}
