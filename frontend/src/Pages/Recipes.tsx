import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Recipes.css"; // Import the updated CSS

interface Recipe {
    name: string;
    ingredients: string[];
    steps: string[];
    requiresExtra: boolean;
    // Updated macro fields as numbers (floats)
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

const UserRecipesPage: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [makeMessage, setMakeMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipes = async () => {
            const userID = localStorage.getItem("userId");
            if (!userID) {
                console.error("User ID is missing. Cannot fetch recipes.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    "https://nwhacks25.onrender.com/generate_recipes",
                    { params: { user_ID: userID } }
                );

                let data: any;
                // If backend returns stringified JSON, parse it
                if (typeof response.data === "string") {
                    try {
                        data = JSON.parse(response.data);
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError);
                        setRecipes([]);
                        setLoading(false);
                        return;
                    }
                } else {
                    data = response.data;
                }

                if (data && data.recipes && Array.isArray(data.recipes)) {
                    // Optional: Validate and ensure macros are numbers
                    const validatedRecipes: Recipe[] = data.recipes.map((recipe: any) => ({
                        name: recipe.name,
                        ingredients: recipe.ingredients,
                        steps: recipe.steps,
                        requiresExtra: recipe.requiresExtra,
                        calories: typeof recipe.calories === "number" ? recipe.calories : parseFloat(recipe.calories),
                        protein: typeof recipe.protein === "number" ? recipe.protein : parseFloat(recipe.protein),
                        carbs: typeof recipe.carbs === "number" ? recipe.carbs : parseFloat(recipe.carbs),
                        fats: typeof recipe.fats === "number" ? recipe.fats : parseFloat(recipe.fats),
                    }));
                    console.log(data.recipes.protein);
                    setRecipes(validatedRecipes);
                } else {
                    console.error("Unexpected API response structure:", data);
                    setRecipes([]);
                }
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    /**
     * Sends a POST request (with query params) to subtract ingredients from inventory, as an example.
     * The server must handle 'ingredients' as JSON if needed.
     */
    const handleMake = async (recipe: Recipe) => {
        setMakeMessage(null);

        const userID = localStorage.getItem("userId");
        if (!userID) {
            console.error("Cannot make recipe: User ID missing from localStorage.");
            setMakeMessage("Error: Please log in first.");
            return;
        }

        try {
            const response = await axios.post(
                "https://nwhacks25.onrender.com/subtract",
                null, // No request body
                {
                    params: {
                        user_ID: userID,
                        // JSON-stringify the array of ingredients if server needs it in that format:
                        ingredients: JSON.stringify(recipe.ingredients),
                    },
                }
            );
            console.log("Make Recipe Response:", response.data);
            setMakeMessage(`Successfully made "${recipe.name}"!`);
        } catch (error) {
            console.error("Error making recipe:", error);
            setMakeMessage(`Failed to make "${recipe.name}". Please try again later.`);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <h1>Loading recipes...</h1>
            </div>
        );
    }

    return (
        <div className="user-recipes">
            <h1 className="user-recipes__title">Your Recipes</h1>

            {/* Display any success/error message from "Make" action */}
            {makeMessage && <p className="make-message">{makeMessage}</p>}

            <ul className="user-recipes__list">
                {recipes.length > 0 ? (
                    recipes.map((recipe, index) => (
                        <li key={index} className="user-recipes__list-item">
                            <div
                                className="user-recipes__header clickable"
                                onClick={() => toggleExpand(index)}
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

                                    <h3>Steps:</h3>
                                    <ol>
                                        {recipe.steps.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>

                                    {/* Display macros */}
                                    <h3>Macros:</h3>
                                    <ul>
                                        <li>Calories: {recipe.calories.toFixed(2)} kcal</li>
                                        <li>Protein: {recipe.protein.toFixed(2)} g</li>
                                        <li>Carbs: {recipe.carbs.toFixed(2)} g</li>
                                        <li>Fats: {recipe.fats.toFixed(2)} g</li>
                                    </ul>

                                    <button
                                        className="make-recipe-button"
                                        onClick={() => handleMake(recipe)}
                                    >
                                        Make
                                    </button>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <p>No recipes available. Please try again later.</p>
                )}
            </ul>
        </div>
    );
};

export default UserRecipesPage;
