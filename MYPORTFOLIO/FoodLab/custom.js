// "My recipes": recipes the user wrote, saved in this browser. Loaded after recipes.js, before script.js / pantry.js.
// It adds them to the shared `recipes` object, so search, favourites, "What can I cook?", the meal planner and
// AgentCity orders all treat them like the built-in ones.
(function () {
  "use strict";
  const KEY = "foodlab-custom-recipes";
  const CATEGORIES = ["Chicken", "Vegetarian", "Egg", "Fish", "My recipes"];
  const clean = (value, max) => String(value == null ? "" : value).replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, max || 200);
  const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='600' height='400' fill='#E7F1E8'/><text x='300' y='235' font-size='140' text-anchor='middle'>🍲</text></svg>");

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value.filter(r => r && r.id && r.name && Array.isArray(r.ingredients) && Array.isArray(r.steps)) : [];
    } catch (error) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (error) { return false; }
  }
  function toRecipe(c) {
    const steps = c.steps.map(s => ({ title: clean(s.title, 80) || "Step", instruction: clean(s.instruction, 600), minutes: Math.max(0, Number(s.minutes) || 0), heat: clean(s.heat, 20) || "Medium" }));
    return {
      name: clean(c.name, 80), category: CATEGORIES.includes(c.category) ? c.category : "My recipes",
      image: PLACEHOLDER, description: clean(c.description, 300) || "My own recipe.",
      time: Math.max(1, Number(c.time) || steps.reduce((s, x) => s + x.minutes, 0) || 1),
      servings: Math.min(Math.max(Math.round(Number(c.servings)) || 2, 1), 50), custom: true, difficulty: c.difficulty || "Easy",
      ingredients: c.ingredients.map(i => ({ name: clean(i.name, 60), amount: Number(i.amount) > 0 ? Number(i.amount) : 1, unit: clean(i.unit, 10) })).filter(i => i.name),
      steps
    };
  }

  window.FoodLabCustom = { KEY, CATEGORIES, load, save, clean, toRecipe, PLACEHOLDER };
  const mine = load();
  if (typeof recipes !== "undefined") mine.forEach(c => { if (!recipes[c.id]) recipes[c.id] = toRecipe(c); });

  // Home page: add cards (this runs before script.js, which wires the buttons).
  const grid = document.getElementById("recipe-grid");
  if (grid && mine.length) {
    mine.forEach(c => {
      const r = toRecipe(c);
      const card = document.createElement("article");
      card.className = "recipe-card";
      card.dataset.category = r.category; card.dataset.search = r.name.toLowerCase(); card.dataset.cuisine = "other";
      card.dataset.time = String(r.time); card.dataset.difficulty = r.difficulty; card.dataset.custom = "true";
      card.innerHTML = `<img src="${r.image}" alt="${r.name}" loading="lazy"><div class="recipe-card-content">
        <button type="button" class="favorite-button" data-favorite="${c.id}" aria-label="Add ${r.name} to favorites" aria-pressed="false">♡</button>
        <p class="recipe-category">${r.category} · mine</p><h3>${r.name}</h3><p>${r.description}</p>
        <p class="recipe-meta">${r.time} min · ${r.difficulty}</p>
        <button type="button" class="recipe-button" data-recipe="${c.id}">View Recipe</button></div>`;
      grid.append(card);
    });
    const filters = document.querySelector(".category-filters");
    if (filters && mine.some(c => toRecipe(c).category === "My recipes")) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "category"; b.dataset.category = "My recipes"; b.textContent = "My recipes";
      filters.append(b);
    }
  }
})();
