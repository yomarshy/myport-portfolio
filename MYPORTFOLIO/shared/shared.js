// SHARED CODE for public apps: FoodLab, COSMOS and CodeLearn.
//   1. Theme      (one dark-mode switch for all three apps)
//   2. Top bar    (links FoodLab / COSMOS / CodeLearn, theme button, skip link)
//   3. FoodLab menu (written once here instead of pasted into every page)
//   4. Queue      (ONE queue module used by FoodLab orders AND CodeLearn tasks)
//                 It stores data on the server when server.js is running (so your phone and laptop
//                 share it) and falls back to this browser's localStorage when it is not (Live Server).
//   5. Helpers    (toast, queue cards, AI calls)
// Load it from <head> so the theme is applied before the page paints.
(function () {
  "use strict";

  const script = document.currentScript;
  const ROOT = new URL("../", script.src).href;
  const THEME_KEY = "foodlab-dark-mode"; // same key FoodLab always used, so saved choices carry over
  const root = document.documentElement;
  const Shared = (window.Shared = { ROOT });

  /* ---------- 1. Theme ---------- */
  function savedTheme() {
    try { const v = localStorage.getItem(THEME_KEY); return v === null ? null : v === "true"; } catch (error) { return null; }
  }
  Shared.isDark = function () {
    const saved = savedTheme();
    return saved === null ? !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) : saved;
  };
  function applyTheme() {
    const dark = Shared.isDark();
    root.dataset.theme = dark ? "dark" : "light";
    if (document.body) document.body.classList.toggle("dark-mode", dark); // FoodLab's older CSS hooks
    const button = document.querySelector(".app-theme");
    if (button) {
      button.textContent = dark ? "☀️" : "🌙";
      button.setAttribute("aria-pressed", String(dark));
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: { dark } }));
  }
  Shared.setTheme = function (dark) {
    try { localStorage.setItem(THEME_KEY, String(!!dark)); } catch (error) {}
    applyTheme();
  };
  window.addEventListener("storage", (event) => { if (event.key === THEME_KEY) applyTheme(); });
  applyTheme();

  /* ---------- 5a. Toast ---------- */
  Shared.toast = function (message) {
    let stack = document.getElementById("toasts");
    if (!stack) { stack = document.createElement("div"); stack.id = "toasts"; document.body.append(stack); }
    const note = document.createElement("div");
    note.className = "toast";
    note.setAttribute("role", "status");
    note.textContent = message;
    stack.append(note);
    setTimeout(() => note.remove(), 3600);
  };

  /* ---------- 2. Top bar ---------- */
  const APPS = [
    ["foodlab", "🍳 FoodLab", "FoodLab/index.html"],
    ["cosmos", "✦ COSMOS", "COSMOS-Universe-Simulator/index.html"],
    ["codelearn", "🎓 CodeLearn", "ELearn/index.html"]
  ];
  function currentApp() {
    const path = decodeURIComponent(location.pathname);
    if (/\/FoodLab\//i.test(path)) return "foodlab";
    if (/\/COSMOS-Universe-Simulator\//i.test(path)) return "cosmos";
    if (/\/ELearn\//i.test(path)) return "codelearn";
    return "";
  }
  function buildTopBar() {
    if (document.querySelector(".app-bar")) return;
    const bar = document.createElement("nav");
    bar.className = "app-bar";
    bar.setAttribute("aria-label", "Apps");

    const brand = document.createElement("a");
    brand.className = "app-bar-brand"; brand.href = ROOT + "index.html"; brand.textContent = "WORKSPACE";

    const links = document.createElement("div");
    links.className = "app-bar-links";
    const here = currentApp();
    APPS.forEach(([id, label, path]) => {
      const a = document.createElement("a");
      a.className = "app-link"; a.href = ROOT + path; a.textContent = label;
      if (id === here) a.setAttribute("aria-current", "page");
      links.append(a);
    });

    const theme = document.createElement("button");
    theme.type = "button"; theme.className = "app-theme";
    theme.addEventListener("click", () => Shared.setTheme(!Shared.isDark()));

    bar.append(brand, links, theme);

    const skip = document.createElement("a");
    skip.className = "skip-link"; skip.href = "#main-content"; skip.textContent = "Skip to content";
    const main = document.querySelector("main");
    if (main) { if (!main.id) main.id = "main-content"; main.setAttribute("tabindex", "-1"); skip.href = "#" + main.id; document.body.prepend(skip); }

    document.body.prepend(bar);
    applyTheme();
  }

  /* ---------- 3. FoodLab menu (single copy) ---------- */
  const FOODLAB_MENU = [
    ["index.html#top", "⌂ Home"],
    ["index.html#recipes", "🍽 Recipes"],
    ["index.html#favorites", "❤ Favorites"],
    ["pantry.html", "🥘 What can I cook?"],
    ["planner.html", "📅 Meal planner"],
    ["my-recipes.html", "✍️ My recipes"],
    ["kitchen.html#shopping", "🛒 Shopping list"],
    ["kitchen.html#history", "◷ Cooking History"],
    ["settings.html", "⚙ Settings"]
  ];
  function mountMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("site-menu");
    if (!toggle || !menu) return;
    menu.innerHTML = "";
    FOODLAB_MENU.forEach(([href, label]) => {
      const a = document.createElement("a");
      a.className = "menu-link"; a.href = ROOT + "FoodLab/" + href; a.textContent = label;
      menu.append(a);
    });
    const setOpen = (open) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("click", (event) => { if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); } });
    menu.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  }

  document.addEventListener("DOMContentLoaded", () => { buildTopBar(); mountMenu(); applyTheme(); });

  /* ---------- 4. Queue module ---------- */
  const clone = (value) => JSON.parse(JSON.stringify(value));

  function createQueue(cfg) {
    // cfg: { name, legacyKey, active, shrink? }
    //   name       server collection name (/api/store/<name>)
    //   legacyKey  localStorage key used in local mode (and migrated to the server once)
    //   active     status of the oldest unfinished item ("Cooking" / "Coding"); the rest are "Queued"
    //   shrink     optional: frees browser storage when it is full (local mode only)
    const listeners = new Set();
    let cache = [], rev = 0, mode = null, loaded = false, chain = Promise.resolve();
    const queue = { name: cfg.name, storageFull: false };
    Object.defineProperty(queue, "mode", { get: () => mode });

    const emit = () => listeners.forEach((fn) => { try { fn(cache); } catch (error) { console.error(error); } });

    function readLocal() {
      try {
        const value = JSON.parse(localStorage.getItem(cfg.legacyKey) || "[]");
        return Array.isArray(value) ? value.filter((t) => t && t.id) : [];
      } catch (error) { return []; }
    }
    function writeLocal(list) {
      for (;;) {
        try { localStorage.setItem(cfg.legacyKey, JSON.stringify(list)); return true; }
        catch (error) { if (!(cfg.shrink && cfg.shrink(list))) return false; }
      }
    }
    async function api(method, body) {
      const response = await fetch("/api/store/" + cfg.name, {
        method, cache: "no-store",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      if (!(response.headers.get("content-type") || "").includes("application/json")) throw new Error("no-server");
      return { status: response.status, data: await response.json() };
    }

    async function pull() {
      if (mode === "local") {
        const list = readLocal();
        if (JSON.stringify(list) !== JSON.stringify(cache)) { cache = list; emit(); }
        return;
      }
      try {
        const { status, data } = await api("GET");
        if (status !== 200) throw new Error("no-server");
        if (mode === null) mode = "server";
        if (!loaded || data.rev !== rev) { const first = !loaded; cache = data.value; rev = data.rev; if (!first) emit(); }
      } catch (error) {
        if (mode === null) { mode = "local"; cache = readLocal(); }
      }
    }

    const ready = (async () => {
      await pull();
      if (mode === "server" && rev === 0 && cache.length === 0) {
        // First run with the server: move anything this browser saved earlier onto the server.
        const old = readLocal();
        if (old.length) {
          try {
            const { status, data } = await api("PUT", { rev: 0, value: old });
            if (status === 200) { cache = old; rev = data.rev; }
          } catch (error) {}
        }
      }
      loaded = true;
      emit();
      if (mode === "server") {
        setInterval(() => { if (!document.hidden) pull(); }, 2500);
        document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
      } else {
        window.addEventListener("storage", (event) => { if (event.key === cfg.legacyKey) pull(); });
      }
    })();
    queue.ready = ready;

    async function run(mutator) {
      await ready;
      if (mode === "local") {
        const list = readLocal();
        const changed = !!mutator(list);
        if (changed) queue.storageFull = !writeLocal(list);
        cache = list;
        if (changed) emit();
        return cache;
      }
      for (let attempt = 0; attempt < 6; attempt++) {
        const list = clone(cache);
        if (!mutator(list)) return cache;
        try {
          const { status, data } = await api("PUT", { rev, value: list });
          if (status === 200) { cache = list; rev = data.rev; emit(); return cache; }
          if (status === 409) { cache = data.value; rev = data.rev; continue; }
          throw new Error(data.error || "Save failed");
        } catch (error) {
          Shared.toast(error.message === "no-server" || error instanceof TypeError
            ? "Could not reach the server, so that change was not saved."
            : "Could not save: " + error.message);
          return null;
        }
      }
      Shared.toast("Another device changed this at the same time. Please try again.");
      return null;
    }

    // Changes run one after another so two quick clicks never race each other.
    // The mutator edits the list it is given and returns true if it changed anything.
    // Resolves to the saved list, or null when saving failed.
    queue.update = (mutator) => { const next = chain.then(() => run(mutator)); chain = next.catch(() => {}); return next; };
    queue.list = () => cache;
    queue.subscribe = (fn) => { listeners.add(fn); if (loaded) fn(cache); return () => listeners.delete(fn); };

    queue.add = (item) => queue.update((list) => {
      list.push(item);
      const recent = list.filter((t) => t.status === "Done").slice(-10);
      const keep = list.filter((t) => t.status !== "Done" || recent.includes(t));
      list.length = 0; list.push(...keep);
      return true;
    });

    queue.markDone = async (id) => {
      let hit = null;
      const saved = await queue.update((list) => {
        hit = null;
        const item = list.find((t) => t.id === id);
        if (!item || item.status === "Done") return false;
        item.status = "Done"; delete item.generating; hit = item;
        return true;
      });
      return saved ? hit : null;
    };

    queue.clearDone = async () => {
      let removed = 0;
      await queue.update((list) => {
        const rest = list.filter((t) => t.status !== "Done");
        removed = list.length - rest.length;
        if (!removed) return false;
        list.length = 0; list.push(...rest);
        return true;
      });
      return removed;
    };

    // The same rule for every queue: the oldest unfinished item is active, the rest wait.
    // Resolves to the items that had just arrived (status "New") so callers can announce them.
    queue.sync = async (extra) => {
      let arrivals = [];
      await queue.update((list) => {
        arrivals = [];
        let changed = extra ? !!extra(list) : false;
        let activeFound = false;
        list.forEach((item) => {
          if (item.status === "Done") return;
          const wanted = activeFound ? "Queued" : cfg.active;
          activeFound = true;
          if (item.status === "New") arrivals.push(item);
          if (item.status !== wanted) { item.status = wanted; changed = true; }
        });
        return changed;
      });
      return arrivals;
    };

    return queue;
  }

  // Drops the oldest saved code result to free browser storage (local mode only).
  function shrinkTasks(list) {
    const oldest = list.find((t) => t.result && t.status === "Done") || list.find((t) => t.result);
    if (!oldest) return false;
    delete oldest.result;
    oldest.error = "Saved code was removed to free browser storage.";
    return true;
  }

  Shared.queues = {
    orders: createQueue({ name: "orders", legacyKey: "agentcity-foodlab-orders", active: "Cooking" }),
    tasks: createQueue({ name: "tasks", legacyKey: "agentcity-elearn-tasks", active: "Coding", shrink: shrinkTasks })
  };

  /* ---------- 5b. Queue cards (one renderer for every queue) ---------- */
  // spec: { empty, title(item), detail?(item), note?(item), actions?(item) -> [{ action, label, secondary? }] }
  Shared.renderQueue = function (box, countEl, items, spec) {
    if (!box) return;
    const pending = items.filter((t) => t.status !== "Done");
    const finished = items.filter((t) => t.status === "Done").reverse();
    if (countEl) countEl.textContent = String(pending.length);
    box.classList.add("queue-box");
    box.innerHTML = "";
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "queue-empty"; empty.textContent = spec.empty;
      box.append(empty);
      return;
    }
    [...pending, ...finished].slice(0, 6).forEach((item) => {
      const card = document.createElement("div");
      card.className = "queue-card" + (item.status === "Done" ? " is-done" : "");
      const title = document.createElement("strong"); title.textContent = spec.title(item);
      card.append(title);
      const detail = spec.detail && spec.detail(item);
      if (detail) { const p = document.createElement("p"); p.textContent = detail; card.append(p); }
      const status = document.createElement("span");
      status.className = "queue-status" + (item.status === spec.activeLabel ? " is-active" : item.status === "Queued" || item.status === "New" ? " is-waiting" : "");
      status.textContent = item.status || "New";
      card.append(status);
      const note = spec.note && spec.note(item);
      if (note) { const p = document.createElement("p"); p.setAttribute("role", "status"); p.textContent = note; card.append(p); }
      const actions = spec.actions ? spec.actions(item) : [];
      if (actions.length) {
        const row = document.createElement("div"); row.className = "queue-actions";
        actions.forEach((a) => {
          const b = document.createElement("button");
          b.type = "button"; b.className = "queue-btn" + (a.secondary ? " secondary" : "");
          b.dataset.action = a.action; b.dataset.id = item.id; b.textContent = a.label;
          if (a.disabled) b.disabled = true;
          row.append(b);
        });
        card.append(row);
      }
      box.append(card);
    });
    if (finished.length) {
      const clear = document.createElement("button");
      clear.type = "button"; clear.className = "queue-btn secondary"; clear.dataset.action = "clear";
      clear.textContent = `Clear ${finished.length} finished`;
      box.append(clear);
    }
  };

  // One click handler for a queue box: handlers = { done(id), clear(), ...anything else }.
  Shared.bindQueue = function (box, handlers) {
    box.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button || button.disabled) return;
      const handler = handlers[button.dataset.action];
      if (handler) handler(button.dataset.id, button);
    });
  };

  /* ---------- 5b2. Shopping list (one copy, used by the recipe page and "What can I cook?") ---------- */
  // Adds a recipe's ingredients, scaled to the servings. Same ingredient + unit are combined.
  // onlyNames (optional list of ingredient names) limits it to those ingredients.
  // Returns how many ingredients were added, or null if saving failed.
  Shared.addToShoppingList = function (recipe, servings, onlyNames) {
    let list = [];
    try { const v = JSON.parse(localStorage.getItem("foodlab-shopping") || "[]"); list = Array.isArray(v) ? v : []; } catch (error) {}
    const multiplier = servings / recipe.servings;
    const wanted = onlyNames ? onlyNames.map((n) => n.toLowerCase()) : null;
    let added = 0;
    recipe.ingredients.forEach((ingredient) => {
      if (wanted && !wanted.includes(ingredient.name.toLowerCase())) return;
      added++;
      const amount = ingredient.amount * multiplier;
      const unit = ingredient.unit || "";
      const existing = list.find((item) => item.name.toLowerCase() === ingredient.name.toLowerCase() && (item.unit || "") === unit);
      if (existing) {
        existing.amount = Number((existing.amount + amount).toFixed(2));
        existing.checked = false;
        if (!existing.from.includes(recipe.name)) existing.from.push(recipe.name);
      } else {
        list.push({ id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, name: ingredient.name, unit, amount: Number(amount.toFixed(2)), checked: false, from: [recipe.name] });
      }
    });
    try { localStorage.setItem("foodlab-shopping", JSON.stringify(list)); } catch (error) { return null; }
    return added;
  };

  /* ---------- 5c. AI calls (server.js keeps the key and the spending cap) ---------- */
  Shared.ai = async function (endpoint, payload) {
    let response, data;
    try {
      response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      data = await response.json();
    } catch (error) {
      throw new Error("The AI needs the app started with: node server.js (see README).");
    }
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  };
  Shared.usage = async function () {
    try { const r = await fetch("/api/usage", { cache: "no-store" }); return r.ok ? await r.json() : null; } catch (error) { return null; }
  };
})();
