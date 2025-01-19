import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Recipes.css"; // Import the updated CSS

interface Recipe {
    name: string;
    ingredients: string[];
    steps: string[];
    requiresExtra: boolean;
}

const UserRecipesPage: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

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
                    {
                        params: { user_ID: userID },
                    }
                );

                console.log("Raw API Response:", response.data);
                console.log("Type of response.data:", typeof response.data);

                // Manually parse if it's a string, otherwise use directly
                let data: any;
                if (typeof response.data === "string") {
                    try {
                        data = JSON.parse(response.data);
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError);
                        setRecipes([]);
                        return;
                    }
                } else {
                    data = response.data;
                }

                // Ensure the parsed 'data' has a 'recipes' array
                if (data && data.recipes && Array.isArray(data.recipes)) {
                    console.log("Recipes Array:", data.recipes);
                    setRecipes(data.recipes);
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

    useEffect(() => {
        console.log("Updated recipes data:", recipes);
    }, [recipes]);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
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
            <ul className="user-recipes__list">
                {recipes.length > 0 ? (
                    recipes.map((recipe, index) => (
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
                                    <h3>Steps:</h3>
                                    <ol>
                                        {recipe.steps.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
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
