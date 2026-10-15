// Shared header, footer, and mobile menu logic

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const NAV = [
  { href: "index.html", label: "Home" },
  { href: "work.html", label: "Work" },
  { href: "production-house.html", label: "Production House" },
  { href: "clients.html", label: "Clients" },
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
  const mobileLinks = NAV.map((n, i) =>
    `<a href="${n.href}" onclick="closeMobileMenu()">
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

function injectLocationStyles() {
  if (document.getElementById("footer-location-css")) return;
  const st = document.createElement("style");
  st.id = "footer-location-css";
  // Neutral defaults for pages without their own theme; index.html's
  // body.ix-themed rules are more specific and override these.
  st.textContent = `
    .site-footer .ix-loc{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:clamp(24px,4vw,56px);align-items:stretch;max-width:1280px;margin:0 auto clamp(32px,4vw,56px);padding-bottom:clamp(32px,4vw,56px);border-bottom:1px solid rgba(128,128,128,.35)}
    .site-footer .ix-loc h3{font-size:clamp(22px,2.4vw,30px);margin:0 0 14px;font-weight:500;line-height:1.25}
    .site-footer .ix-eyebrow{display:block;font-size:11px;letter-spacing:.22em;text-transform:uppercase;opacity:.6;margin-bottom:10px}
    .site-footer .ix-loc address{font-style:normal;margin:0 0 18px;line-height:1.8}
    .site-footer .footer-copy{max-width:1280px;margin:0 auto;font-size:12px;opacity:.7}
    .site-footer .ix-contact{margin:0 0 22px}
    .site-footer .ix-contact .ix-eyebrow{margin:0 0 4px}
    .site-footer .ix-contact .ix-contact-links{display:flex;flex-wrap:wrap;gap:2px 18px;margin-bottom:14px}
    .site-footer .ix-contact a{color:inherit;text-decoration:none}
    .site-footer .ix-dir{display:inline-block;padding:12px 22px;border:1px solid currentColor;border-radius:999px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;color:inherit}
    .site-footer .ix-map{min-height:260px;border-radius:6px;overflow:hidden;border:1px solid rgba(128,128,128,.35)}
    .site-footer .ix-map iframe{display:block;width:100%;height:100%;min-height:260px;border:0}
    @media (max-width:760px){.site-footer .ix-loc{grid-template-columns:1fr}}
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
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.body.style.overflow = "";
}

function initPage() {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (footerEl) { injectLocationStyles(); footerEl.innerHTML = renderFooter(); }
}

document.addEventListener("DOMContentLoaded", initPage);
