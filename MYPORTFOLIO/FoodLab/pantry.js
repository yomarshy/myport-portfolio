// "What can I cook?": matches the ingredients you have against every recipe. Works offline and costs nothing.
// Chef Luca (Claude, through server.js) is only asked when you press "Ask Luca" for swaps.
const PANTRY_KEY = "foodlab-pantry";
const STAPLE_WORDS = ["salt", "water", "oil"];

const $ = (id) => document.getElementById(id);

function loadPantry() {
    try {
        const value = JSON.parse(localStorage.getItem(PANTRY_KEY) || "{}");
        return {
            items: Array.isArray(value.items) ? value.items.filter(item => typeof item === "string") : [],
            staples: value.staples !== false
        };
    } catch (error) {
        return { items: [], staples: true };
    }
}

let pantry = loadPantry();

function savePantry() {
    try { localStorage.setItem(PANTRY_KEY, JSON.stringify(pantry)); } catch (error) {}
}

/* ---------- matching ---------- */
// eggs -> egg, tomatoes -> tomato, fillets -> fillet
function singular(word) {
    if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
    if (word.endsWith("oes")) return word.slice(0, -2);
    if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
}

function wordsOf(text) {
    return text.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/[\s-]+/).filter(Boolean).map(singular);
}

// "chicken" matches "Boneless chicken"; "boneless chicken breast" also matches "Boneless chicken".
function matches(term, ingredientName) {
    const a = wordsOf(term), b = wordsOf(ingredientName);
    if (!a.length || !b.length) return false;
    return a.every(word => b.includes(word)) || b.every(word => a.includes(word));
}

function isStaple(ingredientName) {
    return wordsOf(ingredientName).some(word => STAPLE_WORDS.includes(word));
}

function evaluate(recipeId, recipe) {
    const have = [], missing = [];
    recipe.ingredients.forEach(function (ingredient) {
        if (pantry.staples && isStaple(ingredient.name)) return; // assumed, not counted either way
        (pantry.items.some(term => matches(term, ingredient.name)) ? have : missing).push(ingredient.name);
    });
    return { recipeId, recipe, have, missing, total: have.length + missing.length };
}

function rankedRecipes() {
    return Object.entries(recipes)
        .map(([id, recipe]) => evaluate(id, recipe))
        .filter(result => result.have.length > 0)
        .sort((a, b) => a.missing.length - b.missing.length
            || b.have.length / b.total - a.have.length / a.total
            || a.recipe.name.localeCompare(b.recipe.name));
}

/* ---------- rendering ---------- */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderChips() {
    const ul = $("pantry-chips");
    ul.innerHTML = "";
    pantry.items.forEach(function (item) {
        const li = el("li", "pantry-chip");
        const remove = el("button", "pantry-chip-remove", "✕");
        remove.type = "button";
        remove.setAttribute("aria-label", "Remove " + item);
        remove.addEventListener("click", function () {
            pantry.items = pantry.items.filter(entry => entry !== item);
            savePantry();
            render();
        });
        li.append(el("span", "", item), remove);
        ul.append(li);
    });
    $("pantry-count").textContent = `${pantry.items.length} item${pantry.items.length === 1 ? "" : "s"}`;
}

function renderResults() {
    const box = $("pantry-results");
    box.innerHTML = "";

    if (pantry.items.length === 0) {
        box.append(el("p", "kitchen-empty", "Add a few ingredients above, for example: eggs, onion, tomato."));
        return;
    }

    const results = rankedRecipes();
    if (results.length === 0) {
        box.append(el("p", "kitchen-empty", "None of the recipes use those ingredients yet. Try adding onion, chicken, paneer, fish, eggs, rice or tomato."));
        return;
    }

    results.forEach(function (result) {
        const { recipe, recipeId, have, missing } = result;
        const card = el("article", "pantry-card" + (missing.length === 0 ? " is-ready" : ""));

        const img = document.createElement("img");
        img.src = recipe.image; img.alt = ""; img.loading = "lazy";

        const body = el("div", "pantry-card-body");
        body.append(el("h3", "", recipe.name));
        body.append(el("p", "pantry-score", missing.length === 0
            ? "✅ You have everything for this one."
            : `You have ${have.length} of ${result.total} ingredients.`));
        if (missing.length) body.append(el("p", "pantry-missing", "Missing: " + missing.join(", ")));

        const actions = el("div", "pantry-actions");
        const open = el("a", "pantry-link", "Open recipe →");
        open.href = "index.html#cook=" + encodeURIComponent(recipeId);
        actions.append(open);

        const answer = el("p", "chef-answer", "");
        answer.hidden = true;
        answer.setAttribute("role", "status");

        if (missing.length) {
            const shop = el("button", "pantry-btn", "🛒 Add missing to list");
            shop.type = "button";
            shop.addEventListener("click", function () {
                const added = Shared.addToShoppingList(recipe, recipe.servings, missing);
                Shared.toast(added === null ? "Could not save the shopping list." : `Added ${added} item${added === 1 ? "" : "s"} to your shopping list.`);
            });

            const ask = el("button", "pantry-btn", "👨‍🍳 Ask Luca for swaps");
            ask.type = "button";
            ask.addEventListener("click", async function () {
                ask.disabled = true;
                answer.hidden = false;
                answer.innerHTML = "";
                answer.append(el("span", "spinner"), document.createTextNode("Luca is thinking…"));
                try {
                    const data = await Shared.ai("/api/chef", { task: "substitute", recipe: recipe.name, servings: recipe.servings, missing, have: pantry.items });
                    answer.textContent = "👨‍🍳 " + data.reply;
                } catch (error) {
                    answer.textContent = "⚠️ " + error.message;
                }
                ask.disabled = false;
            });
            actions.append(shop, ask);
        }

        body.append(actions, answer);
        card.append(img, body);
        box.append(card);
    });
}

function render() {
    renderChips();
    renderResults();
}

/* ---------- events ---------- */
$("pantry-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = $("pantry-input");
    input.value.split(/[,\n;]/).map(text => text.trim().toLowerCase().slice(0, 40)).filter(Boolean).forEach(function (item) {
        if (!pantry.items.includes(item) && pantry.items.length < 40) pantry.items.push(item);
    });
    input.value = "";
    savePantry();
    render();
    input.focus();
});

$("pantry-staples").checked = pantry.staples;
$("pantry-staples").addEventListener("change", function (event) {
    pantry.staples = event.target.checked;
    savePantry();
    render();
});

$("pantry-clear").addEventListener("click", function () {
    pantry.items = [];
    savePantry();
    render();
});

window.addEventListener("storage", function (event) {
    if (event.key === PANTRY_KEY) { pantry = loadPantry(); $("pantry-staples").checked = pantry.staples; render(); }
});

render();
