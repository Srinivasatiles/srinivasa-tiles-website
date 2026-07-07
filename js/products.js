// Srinivasa Tiles — product data loading, gallery rendering, lightbox

let PRODUCT_DATA = null;

async function loadProducts() {
  if (PRODUCT_DATA) return PRODUCT_DATA;
  const res = await fetch("data/products.json");
  PRODUCT_DATA = await res.json();
  return PRODUCT_DATA;
}

function allProducts(data) {
  const out = [];
  data.categories.forEach(cat => {
    cat.products.forEach(p => out.push(p));
  });
  return out;
}

function productCardHTML(p) {
  const imgs = p.images && p.images.length ? p.images : ["assets/images/logo/logo-icon.png"];
  const multi = imgs.length > 1;
  const imgTags = imgs.map((src, i) =>
    `<img src="${src}" alt="${p.name} photo ${i + 1}" loading="lazy" data-idx="${i}">`
  ).join("");

  return `
  <article class="product-card" data-product="${p.category}/${p.slug}">
    <div class="product-gallery">
      <div class="product-gallery-scroll" data-lightbox-trigger="${p.category}/${p.slug}">
        ${imgTags}
      </div>
      ${multi ? `<div class="product-gallery-badge">${ICONS.layers}${imgs.length} photos</div>` : ""}
      ${multi ? `<div class="product-gallery-hint">${ICONS.arrow}Swipe for more</div>` : ""}
    </div>
    <div class="product-body">
      <div class="product-body-top">
        <h4>${p.name}</h4>
        <span class="product-size-chip">${p.size}</span>
      </div>
      <div class="product-specs">
        <div class="product-spec"><span>Weight</span><strong>${p.weight}</strong></div>
        <div class="product-spec"><span>Per Sq.Ft</span><strong>${p.per_sft}</strong></div>
      </div>
    </div>
  </article>`;
}

function renderCategorySection(cat) {
  return `
  <div class="category-block reveal" id="cat-${cat.slug}">
    <div class="category-block-head">
      <div>
        <div class="eyebrow">${cat.name}</div>
        <h2>${cat.tagline}</h2>
      </div>
      <span class="count">${cat.products.length} design${cat.products.length !== 1 ? "s" : ""}</span>
    </div>
    <div class="product-grid">
      ${cat.products.map(productCardHTML).join("")}
    </div>
  </div>`;
}

/* ---------------- Lightbox ---------------- */
function setupLightbox(data) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.id = "lightbox";
  lb.innerHTML = `
    <button class="lightbox-close" id="lightboxClose" aria-label="Close">${ICONS.close}</button>
    <div class="lightbox-inner">
      <div class="lightbox-title">
        <h3 id="lightboxTitle"></h3>
        <p id="lightboxMeta"></p>
      </div>
      <div class="lightbox-scroll" id="lightboxScroll"></div>
      <div class="lightbox-scroll-hint">${ICONS.scroll}Scroll to view all photos</div>
    </div>
  `;
  document.body.appendChild(lb);

  function openLightbox(catSlug, prodSlug) {
    const cat = data.categories.find(c => c.slug === catSlug);
    const prod = cat && cat.products.find(p => p.slug === prodSlug);
    if (!prod) return;
    document.getElementById("lightboxTitle").textContent = prod.name;
    document.getElementById("lightboxMeta").textContent = `${prod.size} · ${prod.weight} · ${prod.per_sft} per sq.ft`;
    const scrollEl = document.getElementById("lightboxScroll");
    scrollEl.innerHTML = prod.images.map((src, i) =>
      `<img src="${src}" alt="${prod.name} photo ${i + 1}">`
    ).join("");
    scrollEl.scrollTop = 0;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.body.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-lightbox-trigger]");
    if (trigger) {
      const [catSlug, prodSlug] = trigger.getAttribute("data-lightbox-trigger").split("/");
      openLightbox(catSlug, prodSlug);
    }
  });
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
}

/* ---------------- Page bootstraps ---------------- */
async function initProductsPage() {
  const data = await loadProducts();
  const wrap = document.getElementById("productCategories");
  if (wrap) {
    wrap.innerHTML = data.categories.map(renderCategorySection).join("");
  }
  setupLightbox(data);
  initReveal();

  // Filter pills
  const filterRow = document.getElementById("filterRow");
  if (filterRow) {
    filterRow.innerHTML = `<button class="filter-pill active" data-target="all">All Products</button>` +
      data.categories.map(c => `<button class="filter-pill" data-target="cat-${c.slug}">${c.name}</button>`).join("");
    filterRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      filterRow.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-target");
      if (target === "all") {
        window.scrollTo({ top: document.getElementById("productCategories").offsetTop - 110, behavior: "smooth" });
      } else {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
}

async function initHomeFeatured() {
  const data = await loadProducts();
  const wrap = document.getElementById("homeCategoryGrid");
  if (!wrap) return;
  const covers = {
    "premium-roofing": null, "ceiling-tiles": null, "premium-jally": null,
    "ceiling-jally": null, "decorative-designs": null, "ridges": null,
  };
  wrap.innerHTML = data.categories.map(cat => {
    const cover = cat.products.find(p => p.images.length)?.images[0] || "assets/images/logo/logo-icon.png";
    const totalDesigns = cat.products.length;
    return `
    <a href="products.html#cat-${cat.slug}" class="cat-card reveal">
      <img src="${cover}" alt="${cat.name}" loading="lazy">
      <span class="cat-card-arrow">${ICONS.arrow}</span>
      <div class="cat-card-body">
        <div class="cat-card-count">${totalDesigns} Design${totalDesigns !== 1 ? "s" : ""}</div>
        <h3>${cat.name}</h3>
        <p>${cat.tagline}</p>
      </div>
    </a>`;
  }).join("");
  initReveal();
}

async function initGalleryPage() {
  const data = await loadProducts();
  const wrap = document.getElementById("masonryWrap");
  if (!wrap) return;
  const products = allProducts(data);
  wrap.innerHTML = products.map(p => {
    const img = p.images[0];
    if (!img) return "";
    return `<div class="masonry-item" data-lightbox-trigger="${p.category}/${p.slug}">
      <img src="${img}" alt="${p.name}" loading="lazy">
      <span class="tag">${p.categoryName}</span>
    </div>`;
  }).join("");
  setupLightbox(data);

  const filterRow = document.getElementById("galleryFilterRow");
  if (filterRow) {
    filterRow.innerHTML = `<button class="filter-pill active" data-cat="all">All</button>` +
      data.categories.map(c => `<button class="filter-pill" data-cat="${c.slug}">${c.name}</button>`).join("");
    filterRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-pill");
      if (!btn) return;
      filterRow.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.getAttribute("data-cat");
      wrap.querySelectorAll(".masonry-item").forEach(item => {
        const key = item.getAttribute("data-lightbox-trigger").split("/")[0];
        item.style.display = (cat === "all" || cat === key) ? "" : "none";
      });
    });
  }
}
