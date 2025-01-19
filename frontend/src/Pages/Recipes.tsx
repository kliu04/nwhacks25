import React, { useState, useEffect } from "react";
import axios from "axios";

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
                const response = await axios.get("https://nwhacks25.onrender.com/generate_recipes", {
                    params: { user_ID: userID },
                });
                console.log("API Response:", response.data);

                if (response.data && Array.isArray(response.data.recipes)) {
                    console.log("Recipes Array:", response.data.recipes);
                    console.log("Recipes Length:", response.data.recipes.length);
                    setRecipes(response.data.recipes);
                } else {
                    console.error("Unexpected API response structure:", response.data);
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
        console.log("Updated recipes length:", recipes.length);
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
