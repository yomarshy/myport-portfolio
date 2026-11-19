(function () {
  "use strict";
  const C = window.FoodLabCustom, $ = id => document.getElementById(id);
  const UNITS = ["", "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "oz", "lb", "pinch"];
  const HEATS = ["Off", "Low", "Low-medium", "Medium", "High"];
  let editingId = null;

  $("f-category").innerHTML = C.CATEGORIES.map(c => `<option>${c}</option>`).join("");
  $("f-category").value = "My recipes";

  const opt = (list, v) => list.map(x => `<option value="${x}" ${x === v ? "selected" : ""}>${x || "(none)"}</option>`).join("");
  function addIng(i = {}) {
    const d = document.createElement("div"); d.className = "mine-line ing";
    d.innerHTML = `<input class="i-amount" type="number" min="0" step="any" placeholder="Amount" aria-label="Amount" value="${i.amount ?? ""}">
      <select class="i-unit" aria-label="Unit">${opt(UNITS, i.unit || "")}</select>
      <input class="i-name" type="text" maxlength="60" placeholder="Ingredient" aria-label="Ingredient name" value="${C.clean(i.name)}">
      <button type="button" class="mine-x" aria-label="Remove ingredient">✕</button>`;
    $("ing-rows").append(d);
  }
  function addStep(s = {}) {
    const d = document.createElement("div"); d.className = "mine-line step";
    d.innerHTML = `<input class="s-title" type="text" maxlength="80" placeholder="Step title" aria-label="Step title" value="${C.clean(s.title)}">
      <input class="s-min" type="number" min="0" max="600" placeholder="Min" aria-label="Minutes" value="${s.minutes ?? ""}">
      <select class="s-heat" aria-label="Heat">${opt(HEATS, s.heat || "Medium")}</select>
      <button type="button" class="mine-x" aria-label="Remove step">✕</button>
      <textarea class="s-text" maxlength="600" rows="2" placeholder="What to do" aria-label="Instruction">${C.clean(s.instruction, 600)}</textarea>`;
    $("step-rows").append(d);
  }
  document.addEventListener("click", e => { const x = e.target.closest(".mine-x"); if (x) x.closest(".mine-line").remove(); });
  $("add-ing").onclick = () => addIng(); $("add-step").onclick = () => addStep();

  function reset() {
    editingId = null; $("recipe-form").reset(); $("f-category").value = "My recipes"; $("f-servings").value = 2;
    $("ing-rows").innerHTML = ""; $("step-rows").innerHTML = ""; addIng(); addIng(); addIng(); addStep(); addStep();
    $("form-title").textContent = "New recipe"; $("save-btn").textContent = "Save recipe"; $("cancel-edit").hidden = true; $("form-error").hidden = true;
  }
  $("cancel-edit").onclick = reset;

  function fail(msg) { const e = $("form-error"); e.textContent = msg; e.hidden = false; e.scrollIntoView({ block: "nearest" }); }
  $("recipe-form").addEventListener("submit", e => {
    e.preventDefault();
    const name = C.clean($("f-name").value, 80);
    const ingredients = [...document.querySelectorAll(".ing")].map(r => ({ amount: Number(r.querySelector(".i-amount").value), unit: r.querySelector(".i-unit").value, name: C.clean(r.querySelector(".i-name").value, 60) })).filter(i => i.name);
    const steps = [...document.querySelectorAll(".step")].map(r => ({ title: C.clean(r.querySelector(".s-title").value, 80), minutes: Number(r.querySelector(".s-min").value) || 0, heat: r.querySelector(".s-heat").value, instruction: C.clean(r.querySelector(".s-text").value, 600) })).filter(s => s.title || s.instruction);
    if (!name) return fail("Give the recipe a name.");
    if (!ingredients.length) return fail("Add at least one ingredient.");
    if (!steps.length) return fail("Add at least one step.");
    const list = C.load();
    const id = editingId || "my-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const item = { id, name, description: $("f-desc").value, category: $("f-category").value, difficulty: $("f-difficulty").value, time: Number($("f-time").value) || 0, servings: Number($("f-servings").value) || 2, ingredients, steps };
    const at = list.findIndex(r => r.id === id);
    if (at >= 0) list[at] = item; else list.push(item);
    if (!C.save(list)) return fail("Could not save: browser storage is full or blocked.");
    Shared.toast(editingId ? "Recipe updated" : "Recipe saved");
    reset(); render();
  });

  function render() {
    const list = C.load(), ul = $("mine-list");
    $("mine-count").textContent = list.length + (list.length === 1 ? " recipe" : " recipes"); $("mine-empty").hidden = list.length > 0;
    ul.innerHTML = "";
    list.forEach(r => {
      const li = document.createElement("li"); li.className = "mine-item";
      const t = document.createElement("span"); t.innerHTML = `<strong></strong> <small></small>`;
      t.querySelector("strong").textContent = r.name; t.querySelector("small").textContent = `${C.toRecipe(r).time} min · serves ${C.toRecipe(r).servings} · ${r.ingredients.length} ingredients`;
      const open = Object.assign(document.createElement("a"), { className: "pantry-link", href: "index.html#cook=" + encodeURIComponent(r.id), textContent: "Open" });
      const edit = Object.assign(document.createElement("button"), { type: "button", className: "kitchen-button kitchen-button-light", textContent: "Edit" });
      const del = Object.assign(document.createElement("button"), { type: "button", className: "kitchen-button kitchen-button-light", textContent: "Delete" });
      edit.onclick = () => {
        editingId = r.id; $("f-name").value = r.name; $("f-desc").value = r.description || ""; $("f-category").value = r.category; $("f-difficulty").value = r.difficulty || "Easy";
        $("f-time").value = r.time || ""; $("f-servings").value = r.servings; $("ing-rows").innerHTML = ""; $("step-rows").innerHTML = "";
        r.ingredients.forEach(addIng); r.steps.forEach(addStep);
        $("form-title").textContent = "Edit recipe"; $("save-btn").textContent = "Save changes"; $("cancel-edit").hidden = false; $("f-name").focus(); window.scrollTo({ top: 0, behavior: "smooth" });
      };
      del.onclick = () => { if (!confirm(`Delete "${r.name}"? It will also be removed from your meal plan.`)) return;
        C.save(C.load().filter(x => x.id !== r.id));
        try { const p = JSON.parse(localStorage.getItem("foodlab-meal-plan") || "{}"); Object.keys(p).forEach(k => { if (p[k].id === r.id) delete p[k]; }); localStorage.setItem("foodlab-meal-plan", JSON.stringify(p)); } catch (err) {}
        render(); };
      const row = document.createElement("div"); row.className = "mine-actions"; row.append(open, edit, del);
      li.append(t, row); ul.append(li);
    });
  }
  reset(); render();
})();
