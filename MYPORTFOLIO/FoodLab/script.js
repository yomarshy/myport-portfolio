const procedureImages = {
    "chicken-curry": [
        "ASSET/CURRY MASALA/food curry 1.webp",
        "ASSET/CURRY MASALA/food curry 3.webp",
        "ASSET/CURRY MASALA/food curry 2.webp",
        "ASSET/CURRY MASALA/food curry 4.webp",
        "ASSET/CURRY MASALA/food curry 5.webp",
        "ASSET/CURRY MASALA/food curry 6.webp",
        "ASSET/CURRY MASALA/food curry 7.webp"
    ],
    "fish-fry": [
        "ASSET/fish/fish 1.webp",
        "ASSET/fish/fish 2.webp",
        "ASSET/fish/fish 3.webp",
        "ASSET/fish/fish 4.webp"
    ],
    "grilled-chicken": [
        "ASSET/grilled chicken/grilled 1.webp",
        "ASSET/grilled chicken/grilled 2.webp",
        "ASSET/grilled chicken/grilled 3.webp",
        "ASSET/grilled chicken/grilled 4.webp"
    ],
    "omelette": [
        "ASSET/omelette/omelette 1.webp",
        "ASSET/omelette/omelette 2.webp",
        "ASSET/omelette/omelette 3.webp",
        "ASSET/omelette/omelette 4.webp"
    ],
    "paneer-curry": [
        "ASSET/PANEER/paneer 1.webp",
        "ASSET/PANEER/paneer 2.webp",
        "ASSET/PANEER/paneer 3.webp",
        "ASSET/PANEER/paneer 4.webp",
        "ASSET/PANEER/paneer 5.webp"
    ],
    "fried-rice": [
        "ASSET/veg fried rice/veg 1.webp",
        "ASSET/veg fried rice/veg 2.webp",
        "ASSET/veg fried rice/veg 3.webp",
        "ASSET/veg fried rice/veg 4.webp",
        "ASSET/veg fried rice/veg 5.webp"
    ]
};

const recipeGrid = document.getElementById("recipe-grid");
const recipeDetail = document.getElementById("recipe-detail");
const recipeContent = document.getElementById("recipe-content");
const searchInput = document.getElementById("search-input");
const recipeCount = document.getElementById("recipe-count");
const emptyMessage = document.getElementById("empty-message");

function formatAmount(amount) {
    return Number.isInteger(amount)
        ? String(amount)
        : String(Number(amount.toFixed(2)));
}

function formatTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}


function calculateNutrition(ingredients) {
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fibre: 0
    };

    let hasNutritionData = false;

    ingredients.forEach(function (ingredient) {
        if (!ingredient.nutrition) return;

        hasNutritionData = true;

        let quantity = Number(ingredient.amount) || 0;
        const unit = (ingredient.unit || "").toLowerCase();

        // Egg nutrition is stored per egg, not per 100 g.
        if (unit === "pieces") {
            // Keep the quantity as a number of eggs.
        } else {
            // Other nutrition values are per 100 g.
            if (unit === "ml") quantity *= 0.92;
            if (unit === "tsp") quantity *= 5;
            if (unit === "tbsp") quantity *= 15;

            quantity /= 100;
        }

        Object.keys(totals).forEach(function (key) {
            totals[key] +=
                (Number(ingredient.nutrition[key]) || 0) * quantity;
        });
    });

    return { ...totals, hasNutritionData };
}


function renderRecipes() {
    if (!searchInput || !recipeGrid || !recipeCount || !emptyMessage) return;

    const searchTerm = searchInput.value.trim().toLowerCase();
    const activeCategory =
        document.querySelector(".category.active")?.dataset.category || "All";
    const maxTime = document.getElementById("max-time")?.value || "all";
    const difficulty = document.getElementById("difficulty-filter")?.value || "all";
    const sortOrder = document.getElementById("sort-recipes")?.value || "default";
    const cards = Array.from(recipeGrid.querySelectorAll(".recipe-card"));
    let preferredCuisine = "all";
    try { preferredCuisine = localStorage.getItem("foodlab-cuisine") || "all"; } catch (error) {}
    // Remember the original card order so "Default order" always restores it.
    cards.forEach((card, position) => {
        if (card.dataset.order === undefined) card.dataset.order = String(position);
    });
    cards.forEach(card => card.classList.toggle(
        "preferred-cuisine",
        preferredCuisine !== "all" && card.dataset.cuisine === preferredCuisine
    ));

    cards.forEach(function (card) {
        const recipeId = card.querySelector(".recipe-button")?.dataset.recipe;
        const recipe = recipes[recipeId];

        if (!recipe) {
            card.hidden = true;
            return;
        }

        const ingredientNames = recipe.ingredients.map(item => item.name).join(" ");
        const searchableText =
            `${recipe.name} ${recipe.description} ${recipe.category} ${ingredientNames}`.toLowerCase();

        const time = Number(card.dataset.time || recipe.time);
        const cardDifficulty = card.dataset.difficulty || "Easy";

        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory =
            activeCategory === "All" || recipe.category === activeCategory;
        const matchesTime =
            maxTime === "all" ||
            (Number.isFinite(time) && time > 0 && time <= Number(maxTime));
        const matchesDifficulty =
            difficulty === "all" || cardDifficulty === difficulty;

        card.hidden = !(
            matchesSearch && matchesCategory && matchesTime && matchesDifficulty
        );
    });

    
    const visibleCards = cards.filter(card => !card.hidden);


    visibleCards.sort(function (a, b) {
        const recipeA = recipes[a.querySelector(".recipe-button")?.dataset.recipe];
        const recipeB = recipes[b.querySelector(".recipe-button")?.dataset.recipe];
        const timeA = Number(a.dataset.time || recipeA.time) || Infinity;
        const timeB = Number(b.dataset.time || recipeB.time) || Infinity;

        if (sortOrder === "name-asc") {
            return recipeA.name.localeCompare(recipeB.name);
        }

        if (sortOrder === "default" && preferredCuisine !== "all") {
            const aPref = a.dataset.cuisine === preferredCuisine ? 0 : 1;
            const bPref = b.dataset.cuisine === preferredCuisine ? 0 : 1;
            if (aPref !== bPref) return aPref - bPref;
        }

        if (sortOrder === "time-asc") return timeA - timeB;
        if (sortOrder === "time-desc") return timeB - timeA;

        return Number(a.dataset.order) - Number(b.dataset.order);
    });

    visibleCards.forEach(card => recipeGrid.appendChild(card));

    recipeCount.textContent =
        `${visibleCards.length} recipe${visibleCards.length === 1 ? "" : "s"}`;

    emptyMessage.hidden = visibleCards.length !== 0;
}

function openRecipe(recipeId) {
    const recipe = recipes[recipeId];

    if (!recipe) {
        console.error("Recipe not found:", recipeId);
        return;
    }

    if (window.foodLabTimers) {
        window.foodLabTimers.forEach(timer => {
            if (timer.interval) clearInterval(timer.interval);
        });
    }

    window.foodLabTimers = new Map();

    const ingredientsHTML = recipe.ingredients.map(function (ingredient, index) {
        return `
            <li>
                <label>
                    <input type="checkbox" class="ingredient-check">
                    <span>
                        <strong class="ingredient-amount" data-index="${index}">
                            ${formatAmount(ingredient.amount)}
                        </strong>
                        ${ingredient.unit} ${ingredient.name}
                    </span>
                </label>
            </li>
        `;
    }).join("");

    const images = procedureImages[recipeId] || [];

    const stepsHTML = recipe.steps.map(function (step, index) {
        const photo = images[index] || recipe.image;
        const timerId = `foodlab-timer-${index}`;
        const seconds = step.minutes * 60;

        return `
            <article class="visual-step-card">
                <img
                    class="visual-step-image"
                    src="${photo}"
                    alt="${step.title}"
                    loading="lazy"
                >

                <div class="visual-step-content">
                    <span class="visual-step-number">
                        STEP ${index + 1} OF ${recipe.steps.length}
                    </span>

                    <h3>${step.title}</h3>
                    <p>${step.instruction}</p>
                    <p><strong>Heat level:</strong> ${step.heat}</p>

                    <div class="step-timer">
                        <p><strong>Estimated time:</strong>
                            ${step.minutes} minute${step.minutes === 1 ? "" : "s"}
                        </p>

                        <p class="timer-display" id="${timerId}">
                            ${formatTimer(seconds)}
                        </p>

                        <div class="timer-controls">
                            <button type="button" class="timer-start"
                                data-timer-id="${timerId}"
                                data-seconds="${seconds}">Start</button>

                            <button type="button" class="timer-pause"
                                data-timer-id="${timerId}" disabled>Pause</button>

                            <button type="button" class="timer-reset"
                                data-timer-id="${timerId}"
                                data-seconds="${seconds}">Reset</button>
                        </div>

                        <p class="timer-status"
                            id="${timerId}-status" aria-live="polite"></p>
                    </div>

                    <label class="visual-step-check">
                        <input type="checkbox" class="cooking-step-check">
                        <span>I've completed this step</span>
                    </label>
                </div>
            </article>
        `;
    }).join("");

    recipeContent.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}">
        <p class="food-label">${recipe.category.toUpperCase()}</p>
        <h1>${recipe.name}</h1>
        <p>${recipe.description}</p>
        <p id="cooked-count" class="cooked-count"></p>

        <div class="agentcity-send-panel">
            <button type="button" id="send-to-agentcity" class="agentcity-send-button">
                🏙️ Send cooking task to AgentCity
            </button>
            <p id="agentcity-send-status" class="agentcity-send-status" aria-live="polite">
                Send this recipe to the AgentCity restaurant team.
            </p>
        </div>

        <section class="chef-panel" aria-labelledby="chef-title">
            <h2 id="chef-title">👨‍🍳 Ask Chef Luca</h2>
            <p class="chef-hint">Substitutions, scaling and tips for this recipe from the restaurant's head chef (AI).</p>
            <div class="chef-chips">
                <button type="button" class="chef-chip" data-ask="now" data-question="Scale this recipe for my servings and tell me anything that does not scale in a simple way.">Scale for my servings</button>
                <button type="button" class="chef-chip" data-question="I don't have ___. What can I use instead?">I'm missing an ingredient</button>
                <button type="button" class="chef-chip" data-ask="now" data-question="How can I tell when this dish is properly cooked and safe to eat?">How do I know it's done?</button>
            </div>
            <form id="chef-form" class="chef-form">
                <label for="chef-input" class="visually-hidden">Your question for Chef Luca</label>
                <input id="chef-input" type="text" maxlength="200" placeholder="Ask about this recipe…" autocomplete="off" required>
                <button type="submit" id="chef-send">Ask</button>
            </form>
            <p id="chef-answer" class="chef-answer" role="status" aria-live="polite" hidden></p>
        </section>

        <p>⏱️ ${recipe.time} minutes total (${recipe.steps.reduce((s, x) => s + x.minutes, 0)} min of timed steps, the rest is prep) · Makes
            <span id="serving-display">${recipe.servings}</span> servings
        </p>

        <h2>Nutrition estimate per serving</h2>
        <div class="nutrition" id="nutrition-display"></div>
        <p>Nutrition values are estimates based on available ingredient data.</p>

        <label for="servings"><strong>Adjust servings:</strong></label>
        <select id="servings">
            ${[1, 2, 3, 4, 5, 6, 8].map(function (n) {
                return `<option value="${n}" ${n === recipe.servings ? "selected" : ""}>
                    ${n} serving${n === 1 ? "" : "s"}
                </option>`;
            }).join("")}
        </select>

        <div class="kitchen-actions">
            <button type="button" id="add-to-shopping" class="kitchen-button">🛒 Add ingredients to shopping list</button>
            <a href="kitchen.html#shopping" class="kitchen-link">View list →</a>
            <p id="shopping-status" class="agentcity-send-status" aria-live="polite"></p>
        </div>

        <h2>Ingredients</h2>
        <p>Tick each ingredient as you prepare it.</p>
        <ul id="ingredient-list">${ingredientsHTML}</ul>

        <div id="cooking-lock-message" class="cooking-lock-message">
            🔒 Tick every ingredient above to unlock cooking instructions.
        </div>

        <div id="cooking-instructions" hidden>
            <h2>Cooking instructions</h2>
            <p>Follow each step, use the timers as reminders, and tick steps when finished.</p>

            ${stepsHTML}

            <div class="food-ready-container">
                <p id="cooking-progress">0 of ${recipe.steps.length} steps completed</p>
                <button id="food-ready-button" type="button" disabled>
                    🍽️ Food Is Ready!
                </button>
                <p id="food-ready-message" hidden>
                    🎉 Great job! You've completed every cooking step. Enjoy your meal!
                </p>
            </div>
        </div>
    `;

    // Send real recipe data from FoodLab to AgentCity using shared localStorage.
    const sendToAgentCityButton = document.getElementById("send-to-agentcity");
    const sendToAgentCityStatus = document.getElementById("agentcity-send-status");

    sendToAgentCityButton.addEventListener("click", async function () {
        const order = {
            id: `foodlab-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            recipeId: recipeId,
            recipeName: recipe.name,
            cookingTime: recipe.time,
            servings: Number(document.getElementById("servings").value),
            ingredients: recipe.ingredients.map(function (ingredient) {
                return `${formatAmount(ingredient.amount)} ${ingredient.unit || ""} ${ingredient.name}`.replace(/\s+/g, " ");
            }),
            status: "New",
            sentAt: new Date().toISOString()
        };

        // Open AgentCity in one named tab right away (inside the click, so pop-up blockers allow it);
        // sending again reuses that tab instead of opening a new one.
        window.open("../AgentCity/index.html", "agentcity-tab");

        sendToAgentCityButton.disabled = true;
        sendToAgentCityStatus.textContent = "Sending…";

        const saved = await Shared.queues.orders.add(order);

        if (!saved) {
            sendToAgentCityButton.disabled = false;
            sendToAgentCityStatus.textContent =
                "Could not send the task. Start the app with node server.js (or open it with Live Server) and try again.";
            return;
        }

        window.foodLabLastOrderId = order.id;
        sendToAgentCityStatus.textContent =
            `✅ ${recipe.name} was sent to AgentCity. The restaurant chef can now receive this task.`;
        sendToAgentCityButton.textContent = "✅ Sent — change servings to send again";
    });

    // Ask Chef Luca (Claude, through server.js)
    const chefForm = document.getElementById("chef-form");
    const chefInput = document.getElementById("chef-input");
    const chefAnswer = document.getElementById("chef-answer");
    const chefSend = document.getElementById("chef-send");

    async function askChef(question) {
        const servings = Number(document.getElementById("servings").value);
        const multiplier = servings / recipe.servings;
        chefSend.disabled = true;
        chefAnswer.hidden = false;
        chefAnswer.innerHTML = "";
        const wait = document.createElement("span");
        wait.className = "spinner";
        chefAnswer.append(wait, document.createTextNode("Luca is thinking…"));
        try {
            const data = await Shared.ai("/api/chef", {
                task: "ask",
                recipe: recipe.name,
                servings: servings,
                question: question,
                ingredients: recipe.ingredients.map(function (item) {
                    return `${formatAmount(Number((item.amount * multiplier).toFixed(2)))} ${item.unit || ""} ${item.name}`.replace(/\s+/g, " ");
                })
            });
            chefAnswer.textContent = "👨‍🍳 " + data.reply;
        } catch (error) {
            chefAnswer.textContent = "⚠️ " + error.message;
        }
        chefSend.disabled = false;
    }

    chefForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const question = chefInput.value.trim();
        if (question) askChef(question);
    });

    document.querySelectorAll(".chef-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
            chefInput.value = chip.dataset.question;
            if (chip.dataset.ask === "now") askChef(chip.dataset.question);
            else { chefInput.focus(); chefInput.setSelectionRange(chefInput.value.indexOf("___"), chefInput.value.indexOf("___") + 3); }
        });
    });

    function updateRecipe(servings) {
        const multiplier = servings / recipe.servings;

        document.getElementById("serving-display").textContent = servings;

        document.querySelectorAll(".ingredient-amount").forEach(function (item) {
            const index = Number(item.dataset.index);

            item.textContent = formatAmount(
                recipe.ingredients[index].amount * multiplier
            );
        });

        const nutrition = calculateNutrition(
            recipe.ingredients.map(function (ingredient) {
                return {
                    ...ingredient,
                    amount: ingredient.amount * multiplier
                };
            })
        );

        const display = document.getElementById("nutrition-display");

        if (!nutrition.hasNutritionData) {
            display.innerHTML =
                "<span>Nutrition data has not been added for this recipe yet.</span>";
            return;
        }

        const perServing = {
            calories: nutrition.calories / servings,
            protein: nutrition.protein / servings,
            carbs: nutrition.carbs / servings,
            fat: nutrition.fat / servings,
            fibre: nutrition.fibre / servings
        };

        display.innerHTML = `
            <span>🔥 ${Math.round(perServing.calories)} kcal</span>
            <span>💪 ${perServing.protein.toFixed(1)}g protein</span>
            <span>🍚 ${perServing.carbs.toFixed(1)}g carbs</span>
            <span>🥑 ${perServing.fat.toFixed(1)}g fat</span>
            <span>🌾 ${perServing.fibre.toFixed(1)}g fibre</span>
        `;
    }

    document.getElementById("servings").addEventListener("change", function () {
        if (sendToAgentCityButton.disabled) {
            sendToAgentCityButton.disabled = false;
            sendToAgentCityButton.textContent = "🏙️ Send updated order to AgentCity";
        }
        updateRecipe(Number(this.value));
    });

    // Ingredient lock: cooking instructions remain hidden until all ingredients are checked.
    const ingredientCheckboxes = recipeContent.querySelectorAll(".ingredient-check");
    const cookingInstructions = document.getElementById("cooking-instructions");
    const cookingLockMessage = document.getElementById("cooking-lock-message");

    function updateIngredientUnlock() {
        const allIngredientsChecked =
            ingredientCheckboxes.length > 0 &&
            Array.from(ingredientCheckboxes).every(checkbox => checkbox.checked);

        cookingInstructions.hidden = !allIngredientsChecked;
        cookingLockMessage.hidden = allIngredientsChecked;
    }

    ingredientCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", updateIngredientUnlock);
    });

    updateIngredientUnlock();

    const timers = window.foodLabTimers;

    function stopTimer(timerId) {
        const timer = timers.get(timerId);

        if (timer && timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
    }

    function updateTimerButtons(timerId, running) {
        const startButton = recipeContent.querySelector(
            `.timer-start[data-timer-id="${timerId}"]`
        );

        const pauseButton = recipeContent.querySelector(
            `.timer-pause[data-timer-id="${timerId}"]`
        );

        if (!startButton || !pauseButton) return;

        startButton.disabled = running;
        pauseButton.disabled = !running;
        pauseButton.textContent = "Pause";
    }

    function startTimer(timerId) {
        const timer = timers.get(timerId);

        if (!timer || timer.interval || timer.remaining <= 0) return;

        const status = document.getElementById(`${timerId}-status`);
        const startButton = recipeContent.querySelector(
            `.timer-start[data-timer-id="${timerId}"]`
        );

        status.textContent = "Timer running…";
        updateTimerButtons(timerId, true);

        timer.interval = setInterval(function () {
            timer.remaining -= 1;

            const display = document.getElementById(timerId);

            if (display) {
                display.textContent = formatTimer(Math.max(0, timer.remaining));
            }

            if (timer.remaining <= 0) {
                stopTimer(timerId);
                updateTimerButtons(timerId, false);

                if (startButton) {
                    startButton.textContent = "Finished";
                    startButton.disabled = true;
                }

                status.textContent = "⏰ Time is up! Check your food.";
            }
        }, 1000);
    }

    recipe.steps.forEach(function (step, index) {
        const timerId = `foodlab-timer-${index}`;
        const seconds = step.minutes * 60;

        timers.set(timerId, {
            remaining: seconds,
            interval: null,
            originalSeconds: seconds
        });

        const startButton = recipeContent.querySelector(
            `.timer-start[data-timer-id="${timerId}"]`
        );

        const pauseButton = recipeContent.querySelector(
            `.timer-pause[data-timer-id="${timerId}"]`
        );

        const resetButton = recipeContent.querySelector(
            `.timer-reset[data-timer-id="${timerId}"]`
        );

        startButton.addEventListener("click", function () {
            startTimer(timerId);
        });

        pauseButton.addEventListener("click", function () {
            const timer = timers.get(timerId);

            if (!timer) return;

            stopTimer(timerId);
            updateTimerButtons(timerId, false);

            document.getElementById(`${timerId}-status`).textContent =
                "Timer paused. Select Resume to continue.";

            startButton.textContent = "Resume";
        });

        resetButton.addEventListener("click", function () {
            stopTimer(timerId);

            const timer = timers.get(timerId);
            timer.remaining = timer.originalSeconds;

            document.getElementById(timerId).textContent =
                formatTimer(timer.originalSeconds);

            document.getElementById(`${timerId}-status`).textContent = "";

            startButton.textContent = "Start";
            startButton.disabled = false;

            updateTimerButtons(timerId, false);
        });
    });

    const stepCheckboxes = recipeContent.querySelectorAll(".cooking-step-check");
    const foodReadyButton = document.getElementById("food-ready-button");
    const cookingProgress = document.getElementById("cooking-progress");
    const foodReadyMessage = document.getElementById("food-ready-message");

    function updateCookingProgress() {
        const completed = recipeContent.querySelectorAll(
            ".cooking-step-check:checked"
        ).length;

        cookingProgress.textContent =
            `${completed} of ${stepCheckboxes.length} steps completed`;

        foodReadyButton.disabled = completed !== stepCheckboxes.length;

        if (completed !== stepCheckboxes.length) {
            foodReadyMessage.hidden = true;
        }
    }

    stepCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", updateCookingProgress);
    });

    foodReadyButton.addEventListener("click", function () {
        const completed = recipeContent.querySelectorAll(
            ".cooking-step-check:checked"
        ).length;

        if (completed !== stepCheckboxes.length) return;

        foodReadyMessage.hidden = false;
        markLastOrderDone();
        foodReadyMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    });

    // Shopping list and cooking history
    const cookedBefore = countCooked(recipeId);
    document.getElementById("cooked-count").textContent = cookedBefore > 0
        ? `👨‍🍳 You have cooked this ${cookedBefore} time${cookedBefore === 1 ? "" : "s"}.`
        : "";

    document.getElementById("add-to-shopping").addEventListener("click", function () {
        const servings = Number(document.getElementById("servings").value);
        const added = addToShoppingList(recipe, servings);
        document.getElementById("shopping-status").textContent = added === null
            ? "Could not save the shopping list in this browser."
            : `✅ Added ${added} ingredient${added === 1 ? "" : "s"} for ${servings} serving${servings === 1 ? "" : "s"}.`;
    });

    let cookedLogged = false;
    foodReadyButton.addEventListener("click", function () {
        if (cookedLogged || foodReadyButton.disabled) return;
        cookedLogged = true;
        logCooked(recipeId, recipe, Number(document.getElementById("servings").value));
        const count = countCooked(recipeId);
        document.getElementById("cooked-count").textContent =
            `👨‍🍳 You have cooked this ${count} time${count === 1 ? "" : "s"}. Saved to Cooking History.`;
    });

    updateCookingProgress();
    updateRecipe(recipe.servings);

    document.querySelectorAll(".recipes-section").forEach(section => section.hidden = true);
    recipeDetail.hidden = false;
    recipeDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", function (event) {
    const recipeButton = event.target.closest(".recipe-button");

    if (recipeButton) {
        openRecipe(recipeButton.dataset.recipe);
        return;
    }

    const categoryButton = event.target.closest(".category");

    if (categoryButton) {
        document.querySelectorAll(".category").forEach(function (button) {
            button.classList.remove("active");
        });

        categoryButton.classList.add("active");
        renderRecipes();
    }
});

document.getElementById("back-button").addEventListener("click", function () {
    if (window.foodLabTimers) {
        window.foodLabTimers.forEach(function (timer) {
            if (timer.interval) clearInterval(timer.interval);
        });

        window.foodLabTimers.clear();
    }

    recipeDetail.hidden = true;
    document.querySelectorAll(".recipes-section").forEach(section => section.hidden = false);

    document.querySelector(".recipes-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

document.getElementById("search-form").addEventListener("submit", function (event) {
    event.preventDefault();
    renderRecipes();

    document.querySelector(".recipes-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

searchInput.addEventListener("input", renderRecipes);

const maxTimeFilter = document.getElementById("max-time");
const difficultyFilter = document.getElementById("difficulty-filter");
const sortRecipes = document.getElementById("sort-recipes");
const resetFiltersButton = document.getElementById("reset-filters");

if (maxTimeFilter) maxTimeFilter.addEventListener("change", renderRecipes);
if (difficultyFilter) difficultyFilter.addEventListener("change", renderRecipes);
if (sortRecipes) sortRecipes.addEventListener("change", renderRecipes);

if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", function () {
        searchInput.value = "";

        if (maxTimeFilter) maxTimeFilter.value = "all";
        if (difficultyFilter) difficultyFilter.value = "all";
        if (sortRecipes) sortRecipes.value = "default";

        document.querySelectorAll(".category").forEach(function (button) {
            button.classList.toggle(
                "active",
                button.dataset.category === "All"
            );
        });

        renderRecipes();
    });
}

// Card name and time come from the recipes object, so they cannot drift apart.
recipeGrid.querySelectorAll(".recipe-card").forEach(function (card) {
    const recipe = recipes[card.querySelector(".recipe-button")?.dataset.recipe];
    if (!recipe) return;
    card.dataset.time = recipe.time;
    card.querySelector("h3").textContent = recipe.name;
    card.querySelector(".recipe-meta").textContent = `${recipe.time} min · ${card.dataset.difficulty}`;
});

renderRecipes();

/* FoodLab favorites */
const FAVORITES_KEY = "foodlab-favorites";

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch (error) {
        return [];
    }
}



function updateFavoriteButtons() {
    const favorites = getFavorites();

    document.querySelectorAll(".favorite-button").forEach(function (button) {
        const recipeId = button.dataset.favorite;
        const isFavorite = favorites.includes(recipeId);

        button.textContent = isFavorite ? "♥" : "♡";
        button.classList.toggle("is-favorite", isFavorite);
        button.setAttribute("aria-pressed", String(isFavorite));
        button.setAttribute(
            "aria-label",
            isFavorite ? "Remove from favorites" : "Add to favorites"
        );
    });

    const favoritesGrid = document.getElementById("favorites-grid");
    const favoritesEmpty = document.getElementById("favorites-empty");
    const favoritesCount = document.getElementById("favorites-count");

    if (!favoritesGrid || !favoritesEmpty || !favoritesCount) return;

    favoritesGrid.innerHTML = "";

    favorites.forEach(function (recipeId) {
        const originalButton = document.querySelector(
            `.recipe-button[data-recipe="${recipeId}"]`
        );
        const originalCard = originalButton?.closest(".recipe-card");

        if (!originalCard) return;

        const card = originalCard.cloneNode(true);

        // Make sure saved recipes are visible in Favorites.
        card.hidden = false;

        const heart = card.querySelector(".favorite-button");

        if (heart) {
            heart.textContent = "♥";
            heart.classList.add("is-favorite");
            heart.setAttribute("aria-pressed", "true");
            heart.setAttribute("aria-label", "Remove from favorites");
        }

        favoritesGrid.appendChild(card);
    });

    const count = favoritesGrid.children.length;

    favoritesCount.textContent =
        `${count} recipe${count === 1 ? "" : "s"}`;

    favoritesEmpty.hidden = count > 0;
}

document.addEventListener("click", function (event) {
    const button = event.target.closest(".favorite-button");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const recipeId = button.dataset.favorite;
    if (!recipeId) return;

    const favorites = getFavorites();
    const index = favorites.indexOf(recipeId);

    if (index === -1) {
        favorites.push(recipeId);
    } else {
        favorites.splice(index, 1);
    }

    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
        console.error("Could not save favorites:", error);
    }

    updateFavoriteButtons();
});

updateFavoriteButtons();
/* AgentCity two-way link (uses the shared orders queue) */
function showOrderStatus(list) {
    const box = document.getElementById("agentcity-send-status");
    if (!box || !window.foodLabLastOrderId) return;
    const orders = Array.isArray(list) ? list : Shared.queues.orders.list();
    const order = orders.find(o => o.id === window.foodLabLastOrderId);
    box.textContent = order
        ? `🏙️ AgentCity status: ${order.status} (${location.host})`
        : "This order was cleared in AgentCity.";
}

function markLastOrderDone() {
    if (!window.foodLabLastOrderId) return;
    Shared.queues.orders.markDone(window.foodLabLastOrderId).then(function () { showOrderStatus(); });
}

Shared.queues.orders.subscribe(showOrderStatus);


/* Shopping list + cooking history (shown on kitchen.html) */
const SHOPPING_KEY = "foodlab-shopping";
const HISTORY_KEY = "foodlab-history";

function readStoredList(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

// Adds a recipe's ingredients (scaled to the chosen servings). Returns how many were added, or null if saving failed.
function addToShoppingList(recipe, servings) {
    return Shared.addToShoppingList(recipe, servings);
}

function logCooked(recipeId, recipe, servings) {
    const history = readStoredList(HISTORY_KEY);
    history.push({ recipeId: recipeId, name: recipe.name, servings: servings, cookedAt: new Date().toISOString() });

    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-200)));
    } catch (error) {}
}

function countCooked(recipeId) {
    return readStoredList(HISTORY_KEY).filter(entry => entry.recipeId === recipeId).length;
}

// Deep link from Cooking History: index.html#cook=omelette opens that recipe.
(function openRecipeFromLink() {
    const match = location.hash.match(/^#cook=(.+)$/);
    if (!match) return;
    const recipeId = decodeURIComponent(match[1]);
    if (recipes[recipeId]) openRecipe(recipeId);
})();
