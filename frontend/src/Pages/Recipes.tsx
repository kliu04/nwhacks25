import React, { useState, useEffect } from "react";
// import axios from "axios";

/**
 * This interface matches the structure of the recipes
 * your API will return (based on the JSON you provided).
 */
interface Recipe {
    name: string;
    ingredients: string[];
    steps: string[];
    requiresExtra: boolean;
}

/**
 * Hard-coded dummy data that resembles what the API will return.
 * Once the API is ready, you can remove or comment this out.
 */
const DUMMY_RECIPES: Recipe[] = [
    {
        name: "Zucchini and Broccoli Stir Fry",
        ingredients: [
            "3 Zucchini Green",
            "2 Broccoli heads",
            "Olive oil",
            "Salt",
            "Pepper",
            "Garlic",
        ],
        steps: [
            "Wash and slice the zucchini and broccoli.",
            "Heat olive oil in a pan over medium heat.",
            "Add crushed garlic and sauté for 1 minute.",
            "Add the sliced zucchini and stir fry for 3-4 minutes.",
            "Add the broccoli and cook for another 5 minutes until both vegetables are tender.",
            "Season with salt and pepper to taste.",
            "Serve as a side dish or main course.",
        ],
        requiresExtra: true,
    },
    {
        name: "Banana Pancakes",
        ingredients: [
            "2 Banana Cavendish",
            "1 cup Flour",
            "1 cup Milk",
            "1 Egg",
            "1 tsp Baking powder",
            "Butter",
        ],
        steps: [
            "Mash the bananas in a bowl.",
            "Add flour, baking powder, milk, and the egg to the mashed bananas and mix until a smooth batter forms.",
            "Heat a skillet over medium heat and add a small amount of butter.",
            "Pour small amounts of batter onto the skillet forming pancakes.",
            "Cook until bubbles form on the surface, then flip and cook until golden brown on both sides.",
            "Serve the pancakes warm.",
        ],
        requiresExtra: true,
    },
    {
        name: "Mashed Potatoes",
        ingredients: [
            "1.3 kg Potatoes Brushed",
            "Butter",
            "Salt",
            "Milk",
        ],
        steps: [
            "Peel and cube the potatoes.",
            "Boil the potatoes in salted water until they are tender.",
            "Drain the potatoes and return them to the pot.",
            "Mash the potatoes with butter, adding milk until you reach the desired consistency.",
            "Season with salt to taste and serve.",
        ],
        requiresExtra: true,
    },
];

const UserRecipesPage: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    useEffect(() => {
        /**
         * WHEN BACKEND IS READY:
         * 1. Uncomment the axios call below.
         * 2. Remove (or comment out) the setRecipes(DUMMY_RECIPES) line.
         */

        // axios.get("/api/recipes")
        //   .then((response) => {
        //     // Assuming response.data has the form: { recipes: Recipe[] }
        //     setRecipes(response.data.recipes);
        //   })
        //   .catch((error) => {
        //     console.error("Failed to fetch recipes:", error);
        //   });

        // For now, use dummy data
        setRecipes(DUMMY_RECIPES);
    }, []);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="user-recipes">
            <h1 className="user-recipes__title">Your Recipes</h1>
            <ul className="user-recipes__list">
                {recipes.map((recipe, index) => (
                    <li key={index} className="user-recipes__list-item">
                        <div
                            className="user-recipes__header"
                            onClick={() => toggleExpand(index)}
                            style={{ cursor: "pointer" }}
                        >
                            <span>{recipe.name}</span>
                        </div>
                        {expandedIndex === index && (
                            <div className="user-recipes__details">
                                <h3>Ingredients:</h3>
                                <ul>
                                    {recipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx}>{ingredient}</li>
                                    ))}
                                </ul>
                                <h3>Instructions:</h3>
                                <ol>
                                    {recipe.steps.map((step, idx) => (
                                        <li key={idx}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserRecipesPage;
