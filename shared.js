// Favicon: injected on every page that loads shared.js
(function addFavicons() {
  if (document.querySelector('link[rel~="icon"]')) return;
  [
    { rel: "icon", href: "favicon.ico", sizes: "any" },
    { rel: "icon", href: "favicon.png", type: "image/png", sizes: "512x512" },
    { rel: "apple-touch-icon", href: "apple-touch-icon.png", sizes: "180x180" },
  ].forEach(function (a) {
    var l = document.createElement("link");
    Object.keys(a).forEach(function (k) { l.setAttribute(k, a[k]); });
    document.head.appendChild(l);
  });
})();

// Shared header, footer, and mobile menu logic

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const NAV = [
  { href: "index.html", label: "Home" },
  { href: "work.html", label: "Work" },
  { href: "production-house.html", label: "Production House" },
  { href: "clients.html", label: "Brands" },
  { href: "about.html", label: "About" },
  { href: "contact.html", label: "Contact" },
];

const SITE = {
  name: "Studio Skyline Graphics Pvt. Ltd.",
  city: "New Delhi",
  emails: ["contact@studioskylinegraphics.com", "studioskyline93@gmail.com"],
  phones: ["011-40527042", "011-40527043", "011-40527044"],
  addressLine: "93 DSIDC Complex, Near Okhla Post Office, Okhla Phase I, Okhla Industrial Estate",
  pincode: "110020",
  mapsUrl: "https://maps.app.goo.gl/EenU3czcuWe8jpna8",
  mapsQuery: "Studio Skyline Graphics Pvt Ltd, 93 DSIDC Complex, Near Okhla Post Office, Okhla Phase I, Okhla Industrial Estate, New Delhi, Delhi 110020",
};

function renderHeader() {
  const navLinks = NAV.map(n => `<a href="${n.href}">${n.label}</a>`).join("");
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const mobileLinks = NAV.map((n, i) =>
    `<a href="${n.href}" onclick="closeMobileMenu()"${n.href === here ? ' aria-current="page"' : ""}>
      <span class="label">${n.label}</span>
      <span class="idx">${String(i + 1).padStart(2, "0")}</span>
    </a>`
  ).join("");

  return `
  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="header-logo">
        <img src="public/brand/logo.png" alt="Studio Skyline Logo" class="header-logo-img">
        <div class="header-logo-text">
          <div class="header-logo-name">Studio Skyline</div>
          <div class="header-logo-sub">Graphics Pvt. Ltd.</div>
        </div>
      </a>
      <nav class="header-nav">${navLinks}</nav>
      <button class="menu-btn" onclick="openMobileMenu()" aria-label="Open menu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        Menu
      </button>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-inner">
        <div class="mobile-menu-top">
          <span>Navigation</span>
          <button class="close-btn" onclick="closeMobileMenu()" aria-label="Close menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Close
          </button>
        </div>
        <div class="mobile-menu-links">${mobileLinks}</div>
        <div class="mobile-menu-footer">Premium packaging &bull; print &bull; manufacturing</div>
      </div>
    </div>
  </header>`;
}

function injectHeaderStyles() {
  if (document.getElementById("header-menu-css")) return;
  const st = document.createElement("style");
  st.id = "header-menu-css";
  // Themed mobile menu (burgundy full-screen overlay, same look as the footer).
  // Doubled id beats each page's own "#site-header" rules. Only the menu button's
  // look and the overlay are styled here; desktop header layout is left to style.css.
  const H = "#site-header#site-header";
  const M = "#mobileMenu#mobileMenu";
  st.textContent = `
    ${H} .menu-btn{background:transparent;color:var(--burgundy,#800D1B);border:1px solid var(--burgundy,#800D1B);border-radius:999px;padding:9px 16px;font-family:var(--sans,"Inter",system-ui,sans-serif);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;line-height:1;cursor:pointer;align-items:center;gap:8px;transition:background .3s ease,color .3s ease}
    ${H} .menu-btn:hover{background:var(--burgundy,#800D1B);color:#fff}
    ${H} .menu-btn svg{width:14px;height:14px;flex:none}


    ${M}{position:fixed;inset:0;z-index:2147483000;display:none;width:100%;height:100vh;height:100dvh;margin:0;padding:0;background:#800D1B;color:#fff;overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;visibility:hidden;transform:none;font-family:var(--sans,"Inter",system-ui,sans-serif)}
    ${M}.open{display:block;visibility:visible;opacity:1;pointer-events:auto;animation:mmFade .35s ease both}
    ${M}::before{content:"";position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.018) 0 1px,transparent 1px 5px),linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.08))}
    ${M} .mobile-menu-inner{position:relative;display:flex;flex-direction:column;min-height:100%;max-width:640px;margin:0 auto;padding:max(16px,env(safe-area-inset-top)) clamp(20px,5vw,32px) max(20px,env(safe-area-inset-bottom));box-sizing:border-box;background:none}
    ${M} .mobile-menu-top{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.18);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6)}
    ${M} .mobile-menu-top span{color:rgba(255,255,255,.6);font-size:10px}
    ${M} .close-btn{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:8px 14px;font-family:inherit;font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;line-height:1;cursor:pointer;transition:background .3s ease,color .3s ease}
    ${M} .close-btn:hover{background:#fff;color:#800D1B}
    ${M} .close-btn svg{width:14px;height:14px;flex:none}
    ${M} .mobile-menu-links{display:flex;flex-direction:column;flex:1;justify-content:flex-start;padding:8px 0 0}
    ${M} .mobile-menu-links a{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.14);color:#fff;text-decoration:none;background:none;transition:padding-left .35s cubic-bezier(.2,.7,.2,1),color .3s ease}
    ${M} .mobile-menu-links a .label{font-family:var(--serif,"Cormorant Garamond",Georgia,serif);font-size:clamp(22px,6.2vw,28px);font-weight:500;line-height:1.15;letter-spacing:.005em;color:inherit}
    ${M} .mobile-menu-links a .idx{font-size:10px;letter-spacing:.2em;color:rgba(255,255,255,.55)}
    ${M} .mobile-menu-links a:hover,${M} .mobile-menu-links a:active{padding-left:8px}
    ${M} .mobile-menu-links a[aria-current="page"] .label{font-style:italic}
    ${M} .mobile-menu-links a[aria-current="page"] .idx{color:#fff}
    ${M}.open .mobile-menu-links a{animation:mmRise .6s cubic-bezier(.2,.7,.2,1) backwards}
    ${M}.open .mobile-menu-links a:nth-child(1){animation-delay:.05s}
    ${M}.open .mobile-menu-links a:nth-child(2){animation-delay:.10s}
    ${M}.open .mobile-menu-links a:nth-child(3){animation-delay:.15s}
    ${M}.open .mobile-menu-links a:nth-child(4){animation-delay:.20s}
    ${M}.open .mobile-menu-links a:nth-child(5){animation-delay:.25s}
    ${M}.open .mobile-menu-links a:nth-child(6){animation-delay:.30s}
    ${M} .mobile-menu-footer{padding-top:16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.6)}
    @keyframes mmFade{from{opacity:0}to{opacity:1}}
    @keyframes mmRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @media (prefers-reduced-motion:reduce){${M}.open,${M}.open .mobile-menu-links a{animation:none}}
  `;
  document.head.appendChild(st);
}

function injectLocationStyles() {
  if (document.getElementById("footer-location-css")) return;
  const st = document.createElement("style");
  st.id = "footer-location-css";
  // Full footer theme (burgundy, same as index.html). Scoped to #site-footer and
  // doubled-id for specificity so it wins over each page's own "body.fb-page #site-footer"
  // rule and looks identical on every page, no matter what body class the page uses.
  const F = "#site-footer#site-footer";
  const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .45  0 0 0 0 .33  0 0 0 0 .22  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";
  st.textContent = `
    ${F}{--f-burgundy:#800D1B;--f-serif:"Cormorant Garamond","Cormorant",Georgia,"Times New Roman",serif;--f-sans:"Inter","Manrope",system-ui,-apple-system,"Segoe UI",sans-serif;
      position:relative;isolation:isolate;margin-top:clamp(72px,9vw,140px);padding:clamp(48px,6vw,88px) clamp(22px,5vw,64px) clamp(28px,3vw,40px);
      background-color:var(--burgundy,var(--f-burgundy));
      background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.018) 0 1px,transparent 1px 5px),linear-gradient(180deg,rgba(255,255,255,.025),rgba(0,0,0,.05));
      color:rgba(255,255,255,.86);border-top:0;font-family:var(--f-sans);font-size:13px;line-height:1.8;letter-spacing:.02em;-webkit-font-smoothing:antialiased;box-sizing:border-box}
    ${F}::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:${GRAIN};background-size:220px 220px;opacity:.12;mix-blend-mode:soft-light}
    ${F} *{box-sizing:border-box}
    ${F}>*{max-width:1280px;margin-left:auto;margin-right:auto}
    ${F} .site-footer{background:none;padding:0;margin:0;border:0;color:inherit;font:inherit}
    ${F} h3{color:#fff;font-family:var(--f-serif);font-weight:500;letter-spacing:.01em}
    ${F} span,${F} div,${F} address{color:inherit}
    ${F} a{color:rgba(255,255,255,.86);text-decoration:none;background-image:linear-gradient(currentColor,currentColor);background-size:0 1px;background-repeat:no-repeat;background-position:0 100%;transition:color .3s ease,background-size .45s cubic-bezier(.2,.7,.2,1)}
    ${F} a:hover{color:#fff;background-size:100% 1px}

    ${F} .ix-loc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:clamp(24px,4vw,56px);align-items:stretch;max-width:1280px;margin:0 auto clamp(32px,4vw,56px);padding-bottom:clamp(32px,4vw,56px);border-bottom:1px solid rgba(255,255,255,.18)}
    ${F} .ix-loc h3{font-size:clamp(22px,2.4vw,30px);line-height:1.25;margin:0 0 14px}
    ${F} .ix-eyebrow{display:block;font-family:var(--f-sans);font-size:11px;font-weight:400;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6);opacity:1;margin-bottom:10px}
    ${F} .ix-loc address{font-style:normal;font-family:var(--f-sans);font-size:13px;margin:0 0 22px;line-height:1.8;color:rgba(255,255,255,.86)}
    ${F} .ix-contact{margin:0 0 22px}
    ${F} .ix-contact .ix-eyebrow{margin:0 0 4px}
    ${F} .ix-contact .ix-contact-links{display:flex;flex-wrap:wrap;gap:2px 18px;margin-bottom:14px}
    ${F} .ix-loc .ix-dir{display:inline-block;padding:12px 22px;border:1px solid rgba(255,255,255,.55);border-radius:999px;color:#fff;font-size:12px;letter-spacing:.14em;text-transform:uppercase;background-image:none;transition:background .3s ease,color .3s ease}
    ${F} .ix-loc .ix-dir:hover{background:#fff;color:var(--burgundy,var(--f-burgundy))}
    ${F} .ix-map{min-height:260px;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.15)}
    ${F} .ix-map iframe{display:block;width:100%;height:100%;min-height:260px;border:0;filter:grayscale(.25) contrast(1.02)}
    ${F} .footer-copy{max-width:1280px;margin:0 auto;font-size:12px;color:rgba(255,255,255,.6);opacity:1}
    @media (max-width:760px){${F} .ix-loc{grid-template-columns:1fr}}
  `;
  document.head.appendChild(st);
}

function renderFooter() {
  const year = new Date().getFullYear();
  const phoneLinks = SITE.phones.map(p => `<a href="tel:+91${p.replace(/\D/g, "").replace(/^0/, "")}">${p}</a>`).join("");
  const emailLinks = SITE.emails.map(e => `<a href="mailto:${e}">${e}</a>`).join("");
  const mapSrc = "https://maps.google.com/maps?q=" + encodeURIComponent(SITE.mapsQuery) + "&z=16&output=embed";
  return `
  <footer class="site-footer">
    <div class="ix-loc">
      <div>
        <span class="ix-eyebrow">Visit us</span>
        <h3>${SITE.name}</h3>
        <address>${SITE.addressLine},<br>${SITE.city}, Delhi ${SITE.pincode}</address>
        <div class="ix-contact">
          <span class="ix-eyebrow">Call</span>
          <div class="ix-contact-links">${phoneLinks}</div>
          <span class="ix-eyebrow">Email</span>
          <div class="ix-contact-links">${emailLinks}</div>
        </div>
        <a class="ix-dir" href="${SITE.mapsUrl}" target="_blank" rel="noopener">Open in Google Maps</a>
      </div>
      <div class="ix-map">
        <iframe title="${esc(SITE.name)} location" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
    <div class="footer-copy">&copy; ${year} ${SITE.name} All rights reserved.</div>
  </footer>`;
}

function openMobileMenu() {
  document.getElementById("mobileMenu").classList.add("open");
  document.documentElement.classList.add("menu-open");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.documentElement.classList.remove("menu-open");
  document.body.style.overflow = "";
}

function initPage() {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) {
    injectHeaderStyles();
    headerEl.innerHTML = renderHeader();
    // Move the overlay out of the header: the header has backdrop-filter/sticky,
    // which would otherwise trap the fixed full-screen menu inside the header bar.
    const mm = document.getElementById("mobileMenu");
    if (mm) document.body.appendChild(mm);
  }
  if (footerEl) { injectLocationStyles(); footerEl.innerHTML = renderFooter(); }
}

document.addEventListener("keydown", e => { if (e.key === "Escape") closeMobileMenu(); });
document.addEventListener("DOMContentLoaded", initPage);
