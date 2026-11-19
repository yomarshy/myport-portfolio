// FoodLab recipe data. Shared by the recipe pages (script.js) and "What can I cook?" (pantry.js).
const recipes = {
    "chicken-curry": {
        name: "Indian Chicken Curry",
        category: "Chicken",
        image: "ASSET/CURRY MASALA/food curry 5.webp",
        description: "Rich, comforting curry for your first cooking adventure.",
        time: 40,
        servings: 2,
        ingredients: [
            { name: "Boneless chicken", amount: 300, unit: "g", nutrition: { calories: 120, protein: 22.5, carbs: 0, fat: 2.6, fibre: 0 } },
            { name: "Onion", amount: 100, unit: "g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7 } },
            { name: "Tomato", amount: 150, unit: "g", nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fibre: 1.2 } },
            { name: "Cooking oil", amount: 15, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
            { name: "Ginger-garlic paste", amount: 10, unit: "g", nutrition: { calories: 80, protein: 3, carbs: 17, fat: 0.5, fibre: 2 } },
            { name: "Curry powder", amount: 2, unit: "tsp", nutrition: { calories: 325, protein: 14, carbs: 56, fat: 14, fibre: 33 } },
            { name: "Salt", amount: 0.5, unit: "tsp" },
            { name: "Water", amount: 150, unit: "ml" }
        ],
        steps: [
            { title: "Heat the oil", instruction: "Place a pan over medium heat. Add the oil and warm it for 30–60 seconds until it shimmers slightly. Do not let it smoke.", minutes: 1, heat: "Medium" },
            { title: "Soften the onion", instruction: "Add the chopped onion. Cook for 4–5 minutes, stirring regularly, until softened and lightly golden.", minutes: 5, heat: "Medium" },
            { title: "Cook the aromatics", instruction: "Add ginger-garlic paste and curry powder. Stir continuously for 30–60 seconds until fragrant. Reduce the heat if the spices begin to burn.", minutes: 1, heat: "Low-medium" },
            { title: "Cook the tomatoes", instruction: "Add the chopped tomatoes. Cook for 4–6 minutes, stirring occasionally, until soft and pulpy.", minutes: 5, heat: "Medium" },
            { title: "Add the chicken", instruction: "Add the chicken pieces and stir to coat them with the masala. Cook for 3–4 minutes, turning the pieces so they cook evenly on the outside.", minutes: 4, heat: "Medium" },
            { title: "Simmer until cooked", instruction: "Add water and salt. Bring to a gentle boil, then cover and simmer for about 10–15 minutes, stirring occasionally. The thickest chicken pieces must reach 74°C internally.", minutes: 12, heat: "Low-medium" },
            { title: "Finish and serve", instruction: "Taste the gravy and adjust the salt if needed. Turn off the heat and let the curry rest for 2 minutes before serving.", minutes: 2, heat: "Off" }
        ]
    },

    "paneer-curry": {
        name: "Paneer Curry",
        category: "Vegetarian",
        image: "ASSET/PANEER/paneer 5.webp",
        description: "A creamy Indian dish made with paneer and spices.",
        time: 30,
        servings: 2,
        
ingredients: [
    { name: "Paneer", amount: 200, unit: "g", nutrition: { calories: 265, protein: 18, carbs: 3, fat: 20, fibre: 0 } },
    { name: "Onion", amount: 100, unit: "g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7 } },
    { name: "Tomato", amount: 150, unit: "g", nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fibre: 1.2 } },
    { name: "Cooking oil", amount: 15, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
    { name: "Curry powder", amount: 1, unit: "tsp", nutrition: { calories: 325, protein: 14, carbs: 56, fat: 14, fibre: 33 } },
    { name: "Water", amount: 100, unit: "ml" }
],

      
        steps: [
            { title: "Heat the oil", instruction: "Warm the oil in a pan for about 1 minute until it shimmers slightly, without smoking.", minutes: 1, heat: "Medium" },
            { title: "Soften the onion", instruction: "Add chopped onion. Cook for 4–5 minutes, stirring regularly, until soft and lightly golden.", minutes: 5, heat: "Medium" },
            { title: "Cook the masala", instruction: "Add chopped tomatoes and curry powder. Cook for 5–7 minutes, stirring until the tomatoes soften and form a thick sauce.", minutes: 6, heat: "Medium" },
            { title: "Prepare the gravy", instruction: "Add water and stir well. Bring to a gentle simmer for 2–3 minutes so the flavours combine.", minutes: 3, heat: "Low-medium" },
            { title: "Add the paneer", instruction: "Add paneer cubes gently. Simmer for 3–5 minutes, stirring carefully to keep the cubes intact and heat them through.", minutes: 4, heat: "Low" },
            { title: "Finish and serve", instruction: "Taste the gravy, adjust seasoning if needed, and turn off the heat. Serve warm.", minutes: 1, heat: "Off" }
        ]
    },

    "omelette": {
        name: "Simple Egg Omelette",
        category: "Egg",
        image: "ASSET/omelette/omelette 4.webp",
        description: "A quick beginner-friendly meal with everyday ingredients.",
        time: 10,
        servings: 1,
        
ingredients: [
    { name: "Eggs", amount: 2, unit: "pieces", nutrition: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fibre: 0 } },
    { name: "Onion", amount: 30, unit: "g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fibre: 1.7 } },
    { name: "Cooking oil", amount: 5, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
    { name: "Salt", amount: 1, unit: "pinch" }
],

     
        steps: [
            { title: "Beat the eggs", instruction: "Crack the eggs into a bowl. Beat with a fork for 30–45 seconds until the yolks and whites are combined.", minutes: 1, heat: "Off" },
            { title: "Season the mixture", instruction: "Add the chopped onion and salt. Mix well so the onion is evenly distributed.", minutes: 1, heat: "Off" },
            { title: "Warm the pan", instruction: "Heat the oil in a non-stick pan for about 1 minute. Tilt the pan to spread the oil across the surface.", minutes: 1, heat: "Medium-low" },
            { title: "Cook the omelette", instruction: "Pour in the egg mixture. Cook for 2–3 minutes until the edges set. Fold or flip carefully, then cook for another 1–2 minutes until the eggs are fully set with no runny egg remaining.", minutes: 4, heat: "Low-medium" }
        ]
    },

    "fish-fry": {
        name: "Spiced Fish Fry",
        category: "Fish",
        image: "ASSET/fish/fish 4.webp",
        description: "Fish coated in spices and cooked until golden.",
        time: 25,
        servings: 2,
        
ingredients: [
    { name: "Fish fillets", amount: 300, unit: "g", nutrition: { calories: 90, protein: 20, carbs: 0, fat: 1.3, fibre: 0 } },
    { name: "Cooking oil", amount: 15, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
    { name: "Chilli powder", amount: 1, unit: "tsp", nutrition: { calories: 282, protein: 13.5, carbs: 49.7, fat: 14.3, fibre: 34.8 } },
    { name: "Lemon juice", amount: 1, unit: "tbsp", nutrition: { calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fibre: 0.3 } },
    { name: "Salt", amount: 0.5, unit: "tsp" }
],

       
        steps: [
            { title: "Prepare the fish", instruction: "Pat the fish dry with paper towels. Dry surfaces help the spice coating stick and the fish brown more evenly.", minutes: 2, heat: "Off" },
            { title: "Mix the marinade", instruction: "Combine chilli powder, lemon juice and salt in a bowl. Stir until a thick, spreadable mixture forms.", minutes: 1, heat: "Off" },
            { title: "Coat the fish", instruction: "Rub the spice mixture over both sides of the fish. Refrigerate for about 10 minutes while the flavours develop.", minutes: 10, heat: "Off" },
            { title: "Heat the pan", instruction: "Warm the oil until hot but not smoking. Carefully place the fish in the pan, leaving space between pieces.", minutes: 2, heat: "Medium" },
            { title: "Fry until cooked", instruction: "Cook for approximately 3–5 minutes per side, depending on thickness. Turn gently when the first side is golden. The fish should reach 63°C internally and flake easily.", minutes: 8, heat: "Medium" }
        ]
    },

    "fried-rice": {
        name: "Vegetable Fried Rice",
        category: "Vegetarian",
        image: "ASSET/veg fried rice/veg 5.webp",
        description: "A colorful rice dish using vegetables and simple seasonings.",
        time: 20,
        servings: 2,
        
ingredients: [
    { name: "Cooked rice", amount: 300, unit: "g", nutrition: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fibre: 0.4 } },
    { name: "Mixed vegetables", amount: 150, unit: "g", nutrition: { calories: 65, protein: 3.1, carbs: 12, fat: 0.3, fibre: 4.2 } },
    { name: "Cooking oil", amount: 15, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
    { name: "Soy sauce", amount: 1, unit: "tbsp", nutrition: { calories: 53, protein: 8, carbs: 5.6, fat: 0.6, fibre: 0.8 } }
],

       
        steps: [
            { title: "Prepare the ingredients", instruction: "Wash and chop the vegetables into small, even pieces. Use cooked rice that has been cooled safely and refrigerated promptly if prepared earlier.", minutes: 3, heat: "Off" },
            { title: "Heat the pan", instruction: "Warm the oil in a wok or large pan until it shimmers. Keep the vegetables ready because the next step cooks quickly.", minutes: 1, heat: "Medium-high" },
            { title: "Stir-fry the vegetables", instruction: "Add the vegetables and stir frequently for 4–6 minutes until tender but slightly crisp. Reduce the heat if they begin to burn.", minutes: 5, heat: "Medium-high" },
            { title: "Add rice and soy sauce", instruction: "Add the cooked rice and soy sauce. Break up clumps and toss gently so the sauce coats the rice evenly.", minutes: 2, heat: "Medium-high" },
            { title: "Finish the rice", instruction: "Stir-fry for another 2–3 minutes until the rice is steaming hot throughout. Serve immediately.", minutes: 3, heat: "Medium-high" }
        ]
    },

    "grilled-chicken": {
        name: "Simple Grilled Chicken",
        category: "Chicken",
        image: "ASSET/grilled chicken/grilled 4.webp",
        description: "A protein-rich meal with a simple spice marinade.",
        time: 35,
        servings: 2,
        
ingredients: [
    { name: "Chicken", amount: 300, unit: "g", nutrition: { calories: 120, protein: 22.5, carbs: 0, fat: 2.6, fibre: 0 } },
    { name: "Olive oil", amount: 15, unit: "ml", nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0 } },
    { name: "Lemon juice", amount: 1, unit: "tbsp", nutrition: { calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fibre: 0.3 } },
    { name: "Black pepper", amount: 1, unit: "tsp", nutrition: { calories: 251, protein: 10.4, carbs: 64, fat: 3.3, fibre: 25.3 } },
    { name: "Salt", amount: 0.5, unit: "tsp" }
],

        
        steps: [
            { title: "Mix the marinade", instruction: "Combine olive oil, lemon juice, black pepper and salt in a bowl. Stir until evenly mixed.", minutes: 1, heat: "Off" },
            { title: "Marinate the chicken", instruction: "Coat the chicken evenly. For more flavour, refrigerate for at least 15 minutes. Keep raw chicken and its utensils separate from ready-to-eat food.", minutes: 15, heat: "Off" },
            { title: "Preheat the oven or grill", instruction: "Preheat the oven to 200°C, or prepare your grill according to its instructions. Lightly oil the cooking surface if appropriate.", minutes: 5, heat: "200°C oven or medium grill" },
            { title: "Cook the chicken", instruction: "Arrange the chicken in a single layer and turn as needed. Cooking time depends on thickness and equipment; verify 74°C internally in the thickest part.", minutes: 15, heat: "Medium or 200°C oven" },
            { title: "Rest and serve", instruction: "Transfer the chicken to a clean plate and rest for 3–5 minutes. Never reuse a plate or utensils that held raw chicken without washing them.", minutes: 4, heat: "Off" }
        ]
    }
};
