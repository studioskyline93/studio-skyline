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
  email: "studioskyline93@gmail.com",
  phone: "+91-9810264240",
  addressLine: "Okhla Industrial Area, New Delhi",
  instagram: "https://instagram.com/",
  youtube: "https://youtube.com/",
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

function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <div class="col-title">${SITE.name}</div>
        <div class="col-body">${SITE.addressLine}<br>${SITE.city}</div>
      </div>
      <div>
        <div class="col-title">Enquiries</div>
        <div class="col-body">
          <a href="mailto:${SITE.email}">${SITE.email}</a>
          <div style="margin-top:4px">${SITE.phone}</div>
        </div>
      </div>
      <div>
        <div class="col-title">Social</div>
        <div class="social-links">
          <a href="${SITE.instagram}">Instagram</a>
          <a href="${SITE.youtube}">YouTube</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
      <div class="footer-copy">&copy; ${year} ${SITE.name}. All rights reserved.</div>
    </div>
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
  if (footerEl) footerEl.innerHTML = renderFooter();
}

document.addEventListener("DOMContentLoaded", initPage);
