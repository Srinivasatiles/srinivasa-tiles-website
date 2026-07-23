// Srinivasa Tiles — Quote Calculator
// Depends on loadProducts() (js/products.js) and SITE / whatsappLink() (js/main.js).
//
// Physics behind the numbers:
//   per_sft = pieces that cover one square foot   (e.g. "1.2 nos")
//   weight  = kilograms per single piece          (e.g. "3.1 kg")
//   SFT  -> No's : nos = sft * per_sft
//   No's -> SFT  : sft = nos / per_sft
//   Tonnage      : (nos * weight) / 1000
// Grade is a quality classification recorded on the quote; it does not change
// the physical coverage or weight, so it has no effect on the maths.

// Grade lists are defined per category in data/products.json (`grades: [...]`),
// e.g. Roofing/Ceiling/Jally = 1st, 2nd, 2A, OB. This is only a safety fallback
// for a category that has no `grades` array. A product may also carry its own.
const CALC_GRADES = ["1st Class", "2nd Class", "2A", "4th Class", "OB"];

// Which field the customer last typed in — decides which value we auto-fill.
let calcLastEdited = "sft";

function gradesFor(cat, prod) {
  if (prod && Array.isArray(prod.grades) && prod.grades.length) return prod.grades;
  if (cat && Array.isArray(cat.grades) && cat.grades.length) return cat.grades;
  return CALC_GRADES;
}

function fmtInt(n) {
  return Math.round(n).toLocaleString("en-IN");
}
function fmt1(n) {
  // One decimal place, but drop a trailing ".0" so whole numbers read cleanly.
  const r = Math.round(n * 10) / 10;
  return r.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}
function fmt3(n) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

async function initCalculatorPage() {
  const data = await loadProducts();

  const els = {
    category: document.getElementById("calcCategory"),
    design: document.getElementById("calcDesign"),
    grade: document.getElementById("calcGrade"),
    sft: document.getElementById("calcSft"),
    nos: document.getElementById("calcNos"),
    coverageNote: document.getElementById("calcCoverageNote"),
    resetBtn: document.getElementById("calcResetBtn"),
    empty: document.getElementById("calcEmpty"),
    output: document.getElementById("calcOutput"),
    selection: document.getElementById("calcSelection"),
    outSft: document.getElementById("calcOutSft"),
    outNos: document.getElementById("calcOutNos"),
    outTonnage: document.getElementById("calcOutTonnage"),
    whatsappBtn: document.getElementById("calcWhatsappBtn"),
    summaryBlock: document.getElementById("calcSummaryBlock"),
    sumCategory: document.getElementById("sumCategory"),
    sumDesign: document.getElementById("sumDesign"),
    sumGrade: document.getElementById("sumGrade"),
    sumSft: document.getElementById("sumSft"),
    sumNos: document.getElementById("sumNos"),
    sumWeight: document.getElementById("sumWeight"),
  };

  // ---- Populate categories ----
  els.category.innerHTML =
    `<option value="">Select a category…</option>` +
    data.categories.map(c => `<option value="${c.slug}">${c.name}</option>`).join("");

  function currentCategory() {
    return data.categories.find(c => c.slug === els.category.value) || null;
  }
  function currentProduct() {
    const cat = currentCategory();
    if (!cat) return null;
    return cat.products.find(p => p.slug === els.design.value) || null;
  }

  // ---- Category changes -> refill Design, reset Grade + quantities ----
  els.category.addEventListener("change", () => {
    const cat = currentCategory();
    if (cat) {
      els.design.disabled = false;
      els.design.innerHTML =
        `<option value="">Select a design…</option>` +
        cat.products.map(p => `<option value="${p.slug}">${p.name}</option>`).join("");
    } else {
      els.design.disabled = true;
      els.design.innerHTML = `<option value="">Select a category first</option>`;
    }
    resetGrade("Select a design first");
    disableQuantities();
    clearQuantityValues();
    recompute();
  });

  // ---- Design changes -> fill Grade list, enable quantities ----
  els.design.addEventListener("change", () => {
    const cat = currentCategory();
    const prod = currentProduct();
    if (prod) {
      const grades = gradesFor(cat, prod);
      els.grade.disabled = false;
      els.grade.innerHTML =
        `<option value="">Select a grade…</option>` +
        grades.map(g => `<option value="${g}">${g}</option>`).join("");
      els.sft.disabled = false;
      els.nos.disabled = false;
      els.coverageNote.textContent =
        `${prod.name} — ${prod.size}, ${prod.weight}/piece, ${prod.per_sft} per sq.ft.`;
    } else {
      resetGrade("Select a design first");
      disableQuantities();
      els.coverageNote.textContent = "";
    }
    // Keep any quantity already typed and re-derive against the new design.
    recompute();
  });

  els.grade.addEventListener("change", recompute);

  // ---- Quantity inputs: whichever the user edits is the source of truth ----
  els.sft.addEventListener("input", () => { calcLastEdited = "sft"; recompute(); });
  els.nos.addEventListener("input", () => { calcLastEdited = "nos"; recompute(); });

  els.resetBtn.addEventListener("click", () => {
    els.category.value = "";
    els.design.disabled = true;
    els.design.innerHTML = `<option value="">Select a category first</option>`;
    resetGrade("Select a design first");
    disableQuantities();
    clearQuantityValues();
    els.coverageNote.textContent = "";
    calcLastEdited = "sft";
    recompute();
  });

  function resetGrade(placeholder) {
    els.grade.disabled = true;
    els.grade.innerHTML = `<option value="">${placeholder}</option>`;
  }
  function disableQuantities() {
    els.sft.disabled = true;
    els.nos.disabled = true;
  }
  function clearQuantityValues() {
    els.sft.value = "";
    els.nos.value = "";
  }

  // ---- Core recompute + render ----
  function recompute() {
    const cat = currentCategory();
    const prod = currentProduct();
    const grade = els.grade.value;

    // Derive the partner value even before a grade is chosen, so the fields
    // feel responsive; the full result only shows once everything is valid.
    let sftExact = null;
    let nosExact = null;

    if (prod) {
      const perSft = parseFloat(prod.per_sft);
      if (calcLastEdited === "nos") {
        const nos = parseFloat(els.nos.value);
        if (!isNaN(nos) && nos > 0 && perSft > 0) {
          nosExact = nos;
          sftExact = nos / perSft;
          els.sft.value = fmt1Plain(sftExact);
        } else if (els.nos.value === "") {
          els.sft.value = "";
        }
      } else {
        const sft = parseFloat(els.sft.value);
        if (!isNaN(sft) && sft > 0 && perSft > 0) {
          sftExact = sft;
          nosExact = sft * perSft;
          els.nos.value = Math.round(nosExact);
        } else if (els.sft.value === "") {
          els.nos.value = "";
        }
      }
    }

    const ready = cat && prod && grade && sftExact !== null && nosExact !== null;
    if (!ready) {
      els.output.classList.add("calc-hidden");
      els.summaryBlock.classList.add("calc-hidden");
      els.empty.classList.remove("calc-hidden");
      return;
    }

    const weightPerPiece = parseFloat(prod.weight);   // kg
    const totalKg = nosExact * weightPerPiece;
    const tonnage = totalKg / 1000;

    const sftDisplay = fmt1(sftExact);
    const nosDisplay = fmtInt(nosExact);
    const weightDisplay = `${fmt3(tonnage)} t  ·  ${fmt1(totalKg)} kg`;

    // Result panel
    els.empty.classList.add("calc-hidden");
    els.output.classList.remove("calc-hidden");
    els.selection.innerHTML =
      `<span class="calc-chip"><b>Category</b> ${cat.name}</span>` +
      `<span class="calc-chip"><b>Design</b> ${prod.name}</span>` +
      `<span class="calc-chip"><b>Grade</b> ${grade}</span>`;
    els.outSft.innerHTML = `${sftDisplay}<small>sq.ft</small>`;
    els.outNos.innerHTML = `${nosDisplay}<small>nos</small>`;
    els.outTonnage.innerHTML = `${fmt3(tonnage)}<small>tonnes · ${fmt1(totalKg)} kg</small>`;

    els.whatsappBtn.href = whatsappLink(buildQuoteMessage({
      category: cat.name, design: prod.name, grade,
      sft: sftDisplay, nos: nosDisplay, tonnage: fmt3(tonnage), kg: fmt1(totalKg),
    }));

    // Final summary table
    els.summaryBlock.classList.remove("calc-hidden");
    els.sumCategory.textContent = cat.name;
    els.sumDesign.textContent = prod.name;
    els.sumGrade.textContent = grade;
    els.sumSft.innerHTML = `<strong>${sftDisplay}</strong> sq.ft`;
    els.sumNos.innerHTML = `<strong>${nosDisplay}</strong> nos`;
    els.sumWeight.innerHTML = `<strong>${weightDisplay}</strong>`;
  }

  // Plain (ungrouped) one-decimal value for writing back into a number input,
  // which cannot contain thousands separators.
  function fmt1Plain(n) {
    return String(Math.round(n * 10) / 10);
  }

  function buildQuoteMessage(q) {
    return (
      `Hello Srinivasa Tiles, please share a quote for:\n` +
      `Category: ${q.category}\n` +
      `Design: ${q.design}\n` +
      `Grade: ${q.grade}\n` +
      `SFT: ${q.sft} sq.ft\n` +
      `No's: ${q.nos} pieces\n` +
      `Weight: ${q.tonnage} tonnes (${q.kg} kg)`
    );
  }

  initReveal();
}
