import React, { useState } from "react";

interface Recipe {
    id: number;
    name: string;
    expiry: string; // Use a string for placeholder; ideally, this would be a Date type.
    ingredients: string[];
    instructions: string;
}

const UserRecipesPage: React.FC = () => {
    // Dummy recipes data
    const [recipes] = useState<Recipe[]>([
        {
            id: 1,
            name: "Spaghetti Bolognese",
            expiry: "2025-01-25",
            ingredients: ["Spaghetti", "Ground Beef", "Tomato Sauce", "Onions", "Garlic"],
            instructions: "Cook spaghetti, prepare sauce with beef, mix, and serve.",
        },
        {
            id: 2,
            name: "Chicken Curry",
            expiry: "2025-01-20",
            ingredients: ["Chicken", "Curry Powder", "Coconut Milk", "Onions", "Garlic"],
            instructions: "Cook chicken, add spices and coconut milk, simmer, and serve.",
        },
        {
            id: 3,
            name: "Vegetable Stir Fry",
            expiry: "2025-01-22",
            ingredients: ["Broccoli", "Carrots", "Soy Sauce", "Ginger", "Garlic"],
            instructions: "Stir-fry vegetables, add sauce, and serve with rice.",
        },
    ]);

    // State for tracking expanded recipes
    const [expandedRecipeId, setExpandedRecipeId] = useState<number | null>(null);

    // Sort recipes by expiry date
    const sortedRecipes = [...recipes].sort(
        (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()
    );

    // Toggle recipe expansion
    const toggleExpand = (id: number) => {
        setExpandedRecipeId(expandedRecipeId === id ? null : id);
    };

    return (
        <div className="user-recipes">
            <h1 className="user-recipes__title">Your Recipes</h1>
            <ul className="user-recipes__list">
                {sortedRecipes.map((recipe) => (
                    <li key={recipe.id} className="user-recipes__list-item">
                        <div
                            className="user-recipes__header"
                            onClick={() => toggleExpand(recipe.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <span>{recipe.name + " "}</span>
                            <span>(Expires: {recipe.expiry})</span>
                        </div>
                        {expandedRecipeId === recipe.id && (
                            <div className="user-recipes__details">
                                <h3>Ingredients:</h3>
                                <ul>
                                    {recipe.ingredients.map((ingredient, index) => (
                                        <li key={index}>{ingredient}</li>
                                    ))}
                                </ul>
                                <h3>Instructions:</h3>
                                <p>{recipe.instructions}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserRecipesPage;
