// Srinivasa Tiles — Quote Calculator (multi-product enquiry builder)
// Depends on loadProducts() (js/products.js) and SITE / whatsappLink() (js/main.js).
//
// Physics behind the numbers (per single design):
//   per_sft = pieces that cover one square foot   (e.g. "1.2 nos")
//   weight  = kilograms per single piece          (e.g. "3.1 kg")
//   SFT  -> No's : nos = sft * per_sft
//   No's -> SFT  : sft = nos / per_sft
//   Tonnage      : (nos * weight) / 1000
// Grade is a quality classification recorded on the enquiry; it does NOT change
// the physical coverage or weight, so it has no effect on the maths.

// Grade lists are defined per category in data/products.json (`grades: [...]`).
// This is only a safety fallback for a category with no `grades` array.
const CALC_GRADES = ["1st Class", "2nd Class", "2A", "4th Class", "OB"];

// Enquiries are delivered by Web3Forms — same free endpoint/key the contact form
// (js/form.js) uses. The access key is a public, submission-only key.
const CALC_FORM_ENDPOINT = "https://api.web3forms.com/submit";
const CALC_WEB3FORMS_KEY = "6d28936b-d6ba-47f3-acd3-d4943eca525c";

// Products the customer has added to this enquiry.
let enquiryItems = [];
let enquirySeq = 0;          // id generator
let editingId = null;        // id of the item currently being edited, or null
let calcLastEdited = "sft";  // which quantity field the customer last typed in

function gradesFor(cat, prod) {
  if (prod && Array.isArray(prod.grades) && prod.grades.length) return prod.grades;
  if (cat && Array.isArray(cat.grades) && cat.grades.length) return cat.grades;
  return CALC_GRADES;
}

/* ---------- number formatting ---------- */
function fmtInt(n) { return Math.round(n).toLocaleString("en-IN"); }
function fmt1(n) {
  const r = Math.round(n * 10) / 10;
  return r.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}
function fmt3(n) { return n.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 }); }
function fmt1Plain(n) { return String(Math.round(n * 10) / 10); }   // for writing into number inputs
function weightLabel(kg) { return `${fmt3(kg / 1000)} t · ${fmt1(kg)} kg`; }

async function initCalculatorPage() {
  const data = await loadProducts();

  const els = {
    category: document.getElementById("calcCategory"),
    design: document.getElementById("calcDesign"),
    grade: document.getElementById("calcGrade"),
    sft: document.getElementById("calcSft"),
    nos: document.getElementById("calcNos"),
    preview: document.getElementById("calcItemPreview"),
    addBtn: document.getElementById("calcAddBtn"),
    cancelEditBtn: document.getElementById("calcCancelEditBtn"),
    btnRow: document.getElementById("calcBtnRow"),
    formCard: document.getElementById("calcFormCard"),
    // totals panel
    totProducts: document.getElementById("totProducts"),
    totNos: document.getElementById("totNos"),
    totTonnage: document.getElementById("totTonnage"),
    // table
    emptyTable: document.getElementById("calcEmptyTable"),
    tableWrap: document.getElementById("calcTableWrap"),
    rows: document.getElementById("calcRows"),
    grandSft: document.getElementById("grandSft"),
    grandNos: document.getElementById("grandNos"),
    grandWeight: document.getElementById("grandWeight"),
    // enquiry form
    enquiryForm: document.getElementById("calcEnquiryForm"),
    sendBtn: document.getElementById("calcSendBtn"),
    whatsappBtn: document.getElementById("calcWhatsappBtn"),
    success: document.getElementById("calcSuccess"),
    successIcon: document.getElementById("calcSuccessIcon"),
  };

  els.successIcon.innerHTML = ICONS.quality;

  /* ---------- populate dropdowns ---------- */
  els.category.innerHTML =
    `<option value="">Select a category…</option>` +
    data.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");

  function currentCategory() { return data.categories.find(c => c.slug === els.category.value) || null; }
  function currentProduct() {
    const cat = currentCategory();
    return cat ? cat.products.find(p => p.slug === els.design.value) || null : null;
  }

  function populateDesigns(catSlug) {
    const cat = data.categories.find(c => c.slug === catSlug);
    if (cat) {
      els.design.disabled = false;
      els.design.innerHTML =
        `<option value="">Select a design…</option>` +
        cat.products.map(p => `<option value="${p.slug}">${p.name}</option>`).join("");
    } else {
      els.design.disabled = true;
      els.design.innerHTML = `<option value="">Select a category first</option>`;
    }
  }

  function populateGrades(catSlug, designSlug) {
    const cat = data.categories.find(c => c.slug === catSlug);
    const prod = cat ? cat.products.find(p => p.slug === designSlug) : null;
    if (prod) {
      const grades = gradesFor(cat, prod);
      els.grade.disabled = false;
      els.grade.innerHTML =
        `<option value="">Select a grade…</option>` +
        grades.map(g => `<option value="${g}">${g}</option>`).join("");
    } else {
      els.grade.disabled = true;
      els.grade.innerHTML = `<option value="">Select a design first</option>`;
    }
  }

  /* ---------- selection-form behaviour ---------- */
  els.category.addEventListener("change", () => {
    populateDesigns(els.category.value);
    els.grade.disabled = true;
    els.grade.innerHTML = `<option value="">Select a design first</option>`;
    els.sft.disabled = true; els.nos.disabled = true;
    els.sft.value = ""; els.nos.value = "";
    renderPreview();
  });

  els.design.addEventListener("change", () => {
    const prod = currentProduct();
    populateGrades(els.category.value, els.design.value);
    if (prod) {
      els.sft.disabled = false; els.nos.disabled = false;
    } else {
      els.sft.disabled = true; els.nos.disabled = true;
    }
    autofillPartner();
    renderPreview();
  });

  els.grade.addEventListener("change", renderPreview);
  els.sft.addEventListener("input", () => { calcLastEdited = "sft"; autofillPartner(); renderPreview(); });
  els.nos.addEventListener("input", () => { calcLastEdited = "nos"; autofillPartner(); renderPreview(); });

  // Fill the partner quantity field from whichever field was last edited.
  function autofillPartner() {
    const prod = currentProduct();
    if (!prod) return;
    const perSft = parseFloat(prod.per_sft);
    if (calcLastEdited === "nos") {
      const n = parseFloat(els.nos.value);
      if (n > 0 && perSft > 0) els.sft.value = fmt1Plain(n / perSft);
      else if (els.nos.value === "") els.sft.value = "";
    } else {
      const s = parseFloat(els.sft.value);
      if (s > 0 && perSft > 0) els.nos.value = Math.round(s * perSft);
      else if (els.sft.value === "") els.nos.value = "";
    }
  }

  // Build a full item object from the current selection, or null if incomplete.
  function computeCurrentItem() {
    const cat = currentCategory();
    const prod = currentProduct();
    if (!cat || !prod) return null;
    const perSft = parseFloat(prod.per_sft);
    const wpp = parseFloat(prod.weight);
    let sftExact, nosExact, mode;
    if (calcLastEdited === "nos") {
      const n = parseFloat(els.nos.value);
      if (!(n > 0) || !(perSft > 0)) return null;
      mode = "nos"; nosExact = n; sftExact = n / perSft;
    } else {
      const s = parseFloat(els.sft.value);
      if (!(s > 0) || !(perSft > 0)) return null;
      mode = "sft"; sftExact = s; nosExact = s * perSft;
    }
    const totalKg = nosExact * wpp;
    return {
      catSlug: cat.slug, catName: cat.name,
      designSlug: prod.slug, designName: prod.name,
      grade: els.grade.value, mode,
      sftExact, nosExact, tileCount: Math.round(nosExact),
      totalKg, tonnage: totalKg / 1000,
      size: prod.size, weight: prod.weight, per_sft: prod.per_sft,
    };
  }

  function renderPreview() {
    const item = computeCurrentItem();
    const hasGrade = !!els.grade.value;
    if (item) {
      els.preview.innerHTML =
        `This item: <strong>${fmtInt(item.nosExact)}</strong> nos · ` +
        `<strong>${fmt3(item.tonnage)}</strong> t ` +
        `<span style="opacity:0.8;">(${fmt1(item.sftExact)} sq.ft)</span>` +
        (hasGrade ? "" : ` — <span style="color:var(--clay-bright); font-weight:700;">select a grade to add</span>`);
    } else {
      els.preview.textContent = "Select a category, design and grade, then enter a quantity to preview this item.";
    }
    els.addBtn.disabled = !(item && hasGrade);
  }

  /* ---------- add / edit / remove ---------- */
  els.addBtn.addEventListener("click", () => {
    const item = computeCurrentItem();
    if (!item || !item.grade) return;
    if (editingId !== null) {
      item.id = editingId;
      const idx = enquiryItems.findIndex(i => i.id === editingId);
      if (idx > -1) enquiryItems[idx] = item; else enquiryItems.push(item);
      exitEditMode();
    } else {
      item.id = ++enquirySeq;
      enquiryItems.push(item);
    }
    resetSelection(true);   // keep category selected for quick multi-add
    renderPreview();
    renderEnquiry();
  });

  els.cancelEditBtn.addEventListener("click", () => {
    exitEditMode();
    resetSelection(false);
    renderPreview();
  });

  // Row actions (edit / remove) via delegation.
  els.rows.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = parseInt(btn.getAttribute("data-id"), 10);
    if (btn.getAttribute("data-action") === "remove") {
      enquiryItems = enquiryItems.filter(i => i.id !== id);
      if (editingId === id) { exitEditMode(); resetSelection(false); }
      renderEnquiry();
      renderPreview();
    } else if (btn.getAttribute("data-action") === "edit") {
      startEdit(id);
    }
  });

  function startEdit(id) {
    const item = enquiryItems.find(i => i.id === id);
    if (!item) return;
    editingId = id;
    // Rebuild the dependent dropdowns, then restore the saved values.
    els.category.value = item.catSlug;
    populateDesigns(item.catSlug);
    els.design.value = item.designSlug;
    populateGrades(item.catSlug, item.designSlug);
    els.grade.value = item.grade;
    els.sft.disabled = false; els.nos.disabled = false;
    if (item.mode === "nos") {
      calcLastEdited = "nos";
      els.nos.value = String(Math.round(item.nosExact));
      els.sft.value = fmt1Plain(item.sftExact);
    } else {
      calcLastEdited = "sft";
      els.sft.value = fmt1Plain(item.sftExact);
      els.nos.value = String(Math.round(item.nosExact));
    }
    els.addBtn.textContent = "Update product";
    els.cancelEditBtn.style.display = "";
    els.btnRow.classList.add("two");
    els.formCard.classList.add("is-editing");
    renderPreview();
    els.formCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function exitEditMode() {
    editingId = null;
    els.addBtn.textContent = "+ Add product to enquiry";
    els.cancelEditBtn.style.display = "none";
    els.btnRow.classList.remove("two");
    els.formCard.classList.remove("is-editing");
  }

  function resetSelection(keepCategory) {
    if (!keepCategory) {
      els.category.value = "";
      populateDesigns("");
    } else if (els.category.value) {
      populateDesigns(els.category.value);   // reset design list back to placeholder
    }
    els.grade.disabled = true;
    els.grade.innerHTML = `<option value="">Select a design first</option>`;
    els.sft.disabled = true; els.nos.disabled = true;
    els.sft.value = ""; els.nos.value = "";
    calcLastEdited = "sft";
  }

  /* ---------- render enquiry table + totals ---------- */
  function renderEnquiry() {
    if (enquiryItems.length === 0) {
      els.tableWrap.classList.add("calc-hidden");
      els.emptyTable.classList.remove("calc-hidden");
    } else {
      els.emptyTable.classList.add("calc-hidden");
      els.tableWrap.classList.remove("calc-hidden");
      els.rows.innerHTML = enquiryItems.map((it, i) => `
        <tr>
          <td class="col-num">${i + 1}</td>
          <td>
            <span class="cell-strong">${it.designName}</span>
            <span class="cell-sub">${it.catName} · ${it.size}</span>
          </td>
          <td><span class="calc-grade-pill">${it.grade}</span></td>
          <td>${fmt1(it.sftExact)} <span class="cell-sub" style="display:inline;">sq.ft</span></td>
          <td>${fmtInt(it.nosExact)} <span class="cell-sub" style="display:inline;">nos</span></td>
          <td>${weightLabel(it.totalKg)}</td>
          <td class="col-actions">
            <button type="button" class="calc-row-btn" data-action="edit" data-id="${it.id}">Edit</button>
            <button type="button" class="calc-row-btn danger" data-action="remove" data-id="${it.id}">Remove</button>
          </td>
        </tr>`).join("");
    }

    const totSft = enquiryItems.reduce((s, i) => s + i.sftExact, 0);
    const totNos = enquiryItems.reduce((s, i) => s + i.nosExact, 0);
    const totKg = enquiryItems.reduce((s, i) => s + i.totalKg, 0);

    els.grandSft.textContent = `${fmt1(totSft)} sq.ft`;
    els.grandNos.textContent = `${fmtInt(totNos)} nos`;
    els.grandWeight.textContent = weightLabel(totKg);

    els.totProducts.textContent = enquiryItems.length;
    els.totNos.innerHTML = `${fmtInt(totNos)}<small>nos</small>`;
    els.totTonnage.innerHTML = `${fmt3(totKg / 1000)}<small>tonnes · ${fmt1(totKg)} kg</small>`;

    els.whatsappBtn.href = whatsappLink(buildEnquiryText());
  }

  /* ---------- enquiry text (email + WhatsApp) ---------- */
  function buildEnquiryText(contact) {
    const lines = enquiryItems.map((it, i) =>
      `${i + 1}. ${it.designName} (${it.catName}) — Grade: ${it.grade} — ` +
      `${fmt1(it.sftExact)} sq.ft / ${fmtInt(it.nosExact)} nos / ${fmt3(it.tonnage)} t`
    );
    const totNos = enquiryItems.reduce((s, i) => s + i.nosExact, 0);
    const totKg = enquiryItems.reduce((s, i) => s + i.totalKg, 0);
    let msg = "Hello Srinivasa Tiles, please share a quote for the following:\n\n" +
      lines.join("\n") +
      `\n\nGRAND TOTAL: ${fmtInt(totNos)} nos · ${fmt3(totKg / 1000)} tonnes (${fmt1(totKg)} kg)`;
    if (contact) {
      msg += `\n\nName: ${contact.name}\nPhone: ${contact.phone}`;
      if (contact.email) msg += `\nEmail: ${contact.email}`;
      if (contact.note) msg += `\nNotes: ${contact.note}`;
    }
    return msg;
  }

  /* ---------- submit enquiry ---------- */
  els.enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = els.enquiryForm.name.value.trim();
    const phone = els.enquiryForm.phone.value.trim();
    const email = els.enquiryForm.email.value.trim();
    const note = els.enquiryForm.note.value.trim();

    if (enquiryItems.length === 0) {
      alert("Please add at least one product to your enquiry first.");
      return;
    }
    if (!name || !phone) {
      alert("Please fill in your name and phone number.");
      return;
    }

    const contact = { name, phone, email, note };
    const message = buildEnquiryText(contact);

    els.sendBtn.disabled = true;
    els.sendBtn.textContent = "Sending…";
    try {
      const fd = new FormData();
      fd.append("access_key", CALC_WEB3FORMS_KEY);
      fd.append("subject", `New quote enquiry (${enquiryItems.length} product${enquiryItems.length !== 1 ? "s" : ""}) from ${name}`);
      fd.append("from_name", "Srinivasa Tiles Website");
      fd.append("name", name);
      fd.append("phone", phone);
      if (email) fd.append("email", email);
      fd.append("message", message);
      fd.append("botcheck", els.enquiryForm.botcheck.checked ? "true" : "");
      const res = await fetch(CALC_FORM_ENDPOINT, {
        method: "POST", headers: { "Accept": "application/json" }, body: fd,
      });
      if (!res.ok) throw new Error("submit failed");
      els.enquiryForm.style.display = "none";
      els.success.classList.add("show");
    } catch (err) {
      // Fall back to opening the customer's email client with everything pre-filled.
      const subject = encodeURIComponent(`Quote enquiry from ${name} — Srinivasa Tiles`);
      window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    } finally {
      els.sendBtn.disabled = false;
      els.sendBtn.textContent = "Send Enquiry";
    }
  });

  // Initial paint.
  renderEnquiry();
  renderPreview();
  initReveal();
}
