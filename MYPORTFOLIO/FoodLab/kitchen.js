// FoodLab "My Kitchen": shopping list and cooking history (both saved in this browser).
const SHOPPING_KEY = "foodlab-shopping";
const HISTORY_KEY = "foodlab-history";

function readList(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

function writeList(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch (error) {}
}

function formatAmount(amount) {
    return Number.isInteger(amount) ? String(amount) : String(Number(Number(amount).toFixed(2)));
}

function setStatus(message) {
    const status = document.getElementById("kitchen-status");
    if (status) status.textContent = message;
}

function itemText(item) {
    return `${formatAmount(item.amount)} ${item.unit ? item.unit + " " : ""}${item.name}`;
}

function renderShopping() {
    const list = readList(SHOPPING_KEY);
    const ul = document.getElementById("shopping-list");
    ul.innerHTML = "";

    list.forEach(function (item) {
        const li = document.createElement("li");
        li.className = "shopping-item" + (item.checked ? " is-checked" : "");

        const label = document.createElement("label");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = !!item.checked;
        box.addEventListener("change", function () {
            const current = readList(SHOPPING_KEY);
            const match = current.find(entry => entry.id === item.id);
            if (match) match.checked = box.checked;
            writeList(SHOPPING_KEY, current);
            renderShopping();
        });

        const text = document.createElement("span");
        text.textContent = itemText(item);
        label.append(box, text);

        const from = document.createElement("small");
        from.textContent = (item.from || []).join(", ");

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "shopping-remove";
        remove.setAttribute("aria-label", "Remove " + item.name);
        remove.textContent = "✕";
        remove.addEventListener("click", function () {
            writeList(SHOPPING_KEY, readList(SHOPPING_KEY).filter(entry => entry.id !== item.id));
            renderShopping();
        });

        li.append(label, from, remove);
        ul.appendChild(li);
    });

    document.getElementById("shopping-count").textContent =
        `${list.length} item${list.length === 1 ? "" : "s"}`;
    document.getElementById("shopping-empty").hidden = list.length > 0;
}

function renderHistory() {
    const history = readList(HISTORY_KEY);
    const ul = document.getElementById("history-list");
    ul.innerHTML = "";

    history.slice().reverse().slice(0, 30).forEach(function (entry) {
        const li = document.createElement("li");
        li.className = "history-item";

        const info = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = entry.name;
        const when = document.createElement("small");
        const date = new Date(entry.cookedAt);
        when.textContent = `${entry.servings} serving${entry.servings === 1 ? "" : "s"} · ` +
            (isNaN(date) ? "" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }));
        info.append(name, when);

        const again = document.createElement("a");
        again.href = "index.html#cook=" + encodeURIComponent(entry.recipeId);
        again.className = "history-again";
        again.textContent = "Cook again →";

        li.append(info, again);
        ul.appendChild(li);
    });

    document.getElementById("history-count").textContent =
        `${history.length} meal${history.length === 1 ? "" : "s"}`;
    document.getElementById("history-empty").hidden = history.length > 0;

    const summary = document.getElementById("history-summary");
    if (history.length === 0) {
        summary.textContent = "";
        return;
    }

    const counts = {};
    history.forEach(entry => { counts[entry.name] = (counts[entry.name] || 0) + 1; });
    const [topName, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const distinct = Object.keys(counts).length;
    summary.textContent =
        `You have cooked ${distinct} different recipe${distinct === 1 ? "" : "s"}. ` +
        `Most cooked: ${topName} (${topCount}×).`;
}

document.getElementById("shopping-copy").addEventListener("click", function () {
    const list = readList(SHOPPING_KEY);
    if (list.length === 0) { setStatus("Nothing to copy yet."); return; }
    const text = list.map(item => `${item.checked ? "[x]" : "[ ]"} ${itemText(item)}`).join("\n");

    const done = function () { setStatus("Shopping list copied."); };
    const fallback = function () { setStatus("Could not copy automatically. Select the list and copy it."); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
    } else {
        fallback();
    }
});

document.getElementById("shopping-clear-checked").addEventListener("click", function () {
    writeList(SHOPPING_KEY, readList(SHOPPING_KEY).filter(item => !item.checked));
    renderShopping();
});

document.getElementById("shopping-clear-all").addEventListener("click", function () {
    writeList(SHOPPING_KEY, []);
    renderShopping();
});

document.getElementById("history-clear").addEventListener("click", function () {
    writeList(HISTORY_KEY, []);
    renderHistory();
});

window.addEventListener("storage", function (event) {
    if (event.key === SHOPPING_KEY) renderShopping();
    if (event.key === HISTORY_KEY) renderHistory();
});

renderShopping();
renderHistory();
