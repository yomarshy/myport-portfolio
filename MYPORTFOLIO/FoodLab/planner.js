(function () {
  "use strict";
  const KEY = "foodlab-meal-plan";
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], MEALS = ["Breakfast", "Lunch", "Dinner"];
  const $ = id => document.getElementById(id);
  const slot = (d, m) => d + "-" + m;
  let plan = {};
  try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); if (v && typeof v === "object" && !Array.isArray(v)) plan = v; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) { Shared.toast("Could not save the plan (browser storage blocked)."); } };
  const todayIdx = (new Date().getDay() + 6) % 7;
  // drop meals whose recipe no longer exists
  Object.keys(plan).forEach(k => { if (!plan[k] || !recipes[plan[k].id]) delete plan[k]; });

  const ids = Object.keys(recipes);
  const options = sel => `<option value="">— none —</option>` + ids.map(id => `<option value="${id}" ${id === sel ? "selected" : ""}>${recipes[id].name}</option>`).join("");

  function build() {
    let h = `<thead><tr><th scope="col"><span class="visually-hidden">Meal</span></th>${DAYS.map((d, i) => `<th scope="col" class="${i === todayIdx ? "is-today" : ""}">${d}${i === todayIdx ? " · today" : ""}</th>`).join("")}</tr></thead><tbody>`;
    MEALS.forEach(m => {
      h += `<tr><th scope="row">${m}</th>`;
      DAYS.forEach((d, i) => {
        const p = plan[slot(d, m)];
        h += `<td class="${i === todayIdx ? "is-today" : ""}"><select data-slot="${slot(d, m)}" aria-label="${d} ${m}">${options(p && p.id)}</select>`;
        if (p) h += `<div class="planner-sub"><label>Serves <input type="number" min="1" max="50" value="${p.servings}" data-serv="${slot(d, m)}" aria-label="Servings for ${d} ${m}"></label><a href="index.html#cook=${encodeURIComponent(p.id)}">Cook →</a></div>`;
        h += `</td>`;
      });
      h += `</tr>`;
    });
    $("planner").innerHTML = h + "</tbody>";
    totals();
  }

  // Combined ingredient totals for the week (same name + unit added together).
  function totals() {
    const sum = new Map();
    Object.values(plan).forEach(p => {
      const r = recipes[p.id], k = p.servings / r.servings;
      r.ingredients.forEach(i => {
        const key = i.name.toLowerCase() + "|" + (i.unit || "");
        const e = sum.get(key) || { name: i.name, unit: i.unit || "", amount: 0 };
        e.amount += i.amount * k; sum.set(key, e);
      });
    });
    const rows = [...sum.values()].sort((a, b) => a.name.localeCompare(b.name));
    $("need-list").innerHTML = rows.map(e => `<li class="shopping-item"><span>${Number(e.amount.toFixed(2))} ${e.unit} ${e.name}</span></li>`.replace(/\s+/g, " ")).join("");
    $("need-count").textContent = rows.length + (rows.length === 1 ? " item" : " items");
    $("need-empty").hidden = rows.length > 0;
    $("plan-shop").disabled = !rows.length;
  }

  document.addEventListener("change", e => {
    const s = e.target.dataset.slot, v = e.target.dataset.serv;
    if (s !== undefined) {
      if (e.target.value) plan[s] = { id: e.target.value, servings: (plan[s] && plan[s].id === e.target.value ? plan[s].servings : recipes[e.target.value].servings) };
      else delete plan[s];
      save(); build();
    } else if (v !== undefined && plan[v]) {
      plan[v].servings = Math.min(Math.max(Math.round(Number(e.target.value)) || 1, 1), 50); save(); totals();
    }
  });

  $("plan-shop").onclick = () => {
    let n = 0, fail = false;
    Object.values(plan).forEach(p => { const a = Shared.addToShoppingList(recipes[p.id], p.servings); if (a === null) fail = true; else n += a; });
    $("plan-status").textContent = fail ? "Could not save the shopping list (browser storage blocked)." : `Added ${n} ingredient lines from ${Object.keys(plan).length} meals. Open the shopping list to tick them off.`;
  };
  $("plan-copy").onclick = async () => {
    const lines = DAYS.map(d => `${d}: ` + MEALS.map(m => { const p = plan[slot(d, m)]; return `${m} ${p ? recipes[p.id].name : "-"}`; }).join(" | "));
    try { await navigator.clipboard.writeText(lines.join("\n")); $("plan-status").textContent = "Plan copied."; } catch (e) { $("plan-status").textContent = "Copy is blocked in this browser."; }
  };
  $("plan-clear").onclick = () => { if (!Object.keys(plan).length || !confirm("Clear the whole week?")) return; plan = {}; save(); build(); $("plan-status").textContent = "Week cleared."; };
  build();
})();
