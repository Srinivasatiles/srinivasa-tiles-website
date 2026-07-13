// Srinivasa Tiles — shared site chrome (nav, footer, WhatsApp, reveal animations)

const SITE = {
  name: "Srinivasa Tiles",
  short: "STH",
  tagline: "Clay Heritage Since the 1930s · Hosur",
  phone1: "+91 8951296369",
  phone1_tel: "+918951296369",
  phone2: "+91 7708156600",
  phone2_tel: "+917708156600",
  email: "sales@sthindia.com",
  address: "Bennikal Road, Sanamavu Village, Rayakottai Road, Hosur - 635119, Krishnagiri Dist, Tamil Nadu",
  mapsLink: "https://maps.app.goo.gl/GCZ3m3GYtuJSuc8F8",
  mapsEmbed: "https://www.google.com/maps?q=Bennikal+Road+Sanamavu+Village+Hosur+635119&output=embed",
  whatsappNumber: "918951296369",
  whatsappDefaultMsg: "Hello Srinivasa Tiles, I'd like to know more about your terracotta products.",
};

// Pulls live values from data/settings.json (editable via the admin dashboard),
// falling back to the defaults above if the file is missing or the site is opened offline.
async function loadSiteSettings() {
  try {
    const res = await fetch("data/settings.json");
    if (!res.ok) return SITE;
    const s = await res.json();
    if (s.phone1) { SITE.phone1 = s.phone1; SITE.phone1_tel = "+" + s.phone1.replace(/[^0-9]/g, ""); }
    if (s.phone2) { SITE.phone2 = s.phone2; SITE.phone2_tel = "+" + s.phone2.replace(/[^0-9]/g, ""); }
    if (s.email) SITE.email = s.email;
    if (s.address) SITE.address = s.address;
    if (s.mapsLink) SITE.mapsLink = s.mapsLink;
    if (s.whatsappNumber) SITE.whatsappNumber = s.whatsappNumber;
  } catch (e) { /* keep defaults */ }
  return SITE;
}

function whatsappLink(msg) {
  const text = encodeURIComponent(msg || SITE.whatsappDefaultMsg);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}

const NAV_ITEMS = [
  { href: "index.html", label: "Home" },
  { href: "about.html", label: "About Us" },
  { href: "products.html", label: "Products" },
  { href: "gallery.html", label: "Gallery" },
  { href: "contact.html", label: "Contact Us" },
];

function currentPage() {
  const p = location.pathname.split("/").pop() || "index.html";
  return p;
}

function renderNav() {
  const cur = currentPage();
  const links = NAV_ITEMS.map(item =>
    `<a href="${item.href}" class="${cur === item.href ? 'active' : ''}">${item.label}</a>`
  ).join("");

  const mobileLinks = NAV_ITEMS.map(item =>
    `<a href="${item.href}">${item.label}</a>`
  ).join("");

  const nav = document.createElement("header");
  nav.className = "nav";
  nav.innerHTML = `
    <div class="container">
      <a href="index.html" class="nav-brand">
        <img src="assets/images/logo/logo.png" alt="${SITE.name} logo">
        <span class="word"><strong>${SITE.name}</strong><span>STH &middot; TERRACOTTA</span></span>
      </a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-actions">
        <a href="contact.html" class="btn btn-primary btn-sm desktop-only">Get a Quote</a>
        <button type="button" class="nav-burger" aria-label="Open menu" id="burgerBtn">${ICONS.menu}</button>
      </div>
    </div>
    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-top">
        <a href="index.html" class="nav-brand">
          <img src="assets/images/logo/logo.png" alt="${SITE.name} logo">
        </a>
        <button type="button" class="nav-burger" aria-label="Close menu" id="closeMenuBtn">${ICONS.close}</button>
      </div>
      ${mobileLinks}
      <a href="contact.html" class="btn btn-primary btn-block">Get a Quote</a>
    </div>
  `;
  document.body.prepend(nav);

  // Event delegation on document.body (rather than binding directly to the buttons) so this
  // keeps working even if the nav markup is ever re-rendered or timing shifts slightly.
  document.body.addEventListener("click", (e) => {
    if (e.target.closest("#burgerBtn")) {
      document.getElementById("mobileMenu").classList.add("open");
      document.body.style.overflow = "hidden";
    }
    if (e.target.closest("#closeMenuBtn")) {
      document.getElementById("mobileMenu").classList.remove("open");
      document.body.style.overflow = "";
    }
    // Also close the menu automatically if someone taps a nav link inside it
    if (e.target.closest("#mobileMenu a")) {
      document.getElementById("mobileMenu").classList.remove("open");
      document.body.style.overflow = "";
    }
  });
}

function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="assets/images/logo/logo.png" alt="${SITE.name}">
            <strong>${SITE.name}</strong>
          </div>
          <p class="desc">Terracotta crafted for generations. Handcrafted roofing, jally and ceiling tiles made from natural clay in Hosur, Tamil Nadu.</p>
        </div>
        <div>
          <h5>Explore</h5>
          <div class="footer-links">
            <a href="index.html">Home</a>
            <a href="about.html">About Us</a>
            <a href="products.html">Products</a>
            <a href="gallery.html">Gallery</a>
            <a href="contact.html">Contact Us</a>
          </div>
        </div>
        <div>
          <h5>Reach Us</h5>
          <div class="footer-links">
            <a href="tel:${SITE.phone1_tel}">${SITE.phone1}</a>
            <a href="tel:${SITE.phone2_tel}">${SITE.phone2}</a>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
            <a href="${SITE.mapsLink}" target="_blank" rel="noopener" class="footer-address"><span class="footer-map-pin">${ICONS.pin}</span>${SITE.address}</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; <span id="yr"></span> ${SITE.name}. All rights reserved.</span>
        <span>Handcrafted terracotta from Hosur, Tamil Nadu</span>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
  document.getElementById("yr").textContent = new Date().getFullYear();
}

function renderWhatsapp() {
  const a = document.createElement("a");
  a.href = whatsappLink();
  a.target = "_blank";
  a.rel = "noopener";
  a.className = "whatsapp-fab";
  a.setAttribute("aria-label", "Chat with us on WhatsApp");
  a.innerHTML = `<span class="ping"></span>${ICONS.whatsapp}`;
  document.body.appendChild(a);
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || els.length === 0) {
    els.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadSiteSettings();
  renderNav();
  renderFooter();
  renderWhatsapp();
  initReveal();
  if (window.onSiteReady) window.onSiteReady();
});
