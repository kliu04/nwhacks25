import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
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

    // We'll use this state to display any success or error messages
    // when "Make" is clicked for a specific recipe
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
                const response = await axios.get("https://nwhacks25.onrender.com/generate_recipes", {
                    params: { user_ID: userID },
                });

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

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    /**
     * Sends a POST request to a dummy endpoint, passing user_ID and ingredients as query params.
     * Replace "https://dummyapi.com/make" with your actual endpoint.
     */
    const handleMake = async (recipe: Recipe) => {
        // Clear any previous make-message
        setMakeMessage(null);

        const userID = localStorage.getItem("userId");
        if (!userID) {
            console.error("Cannot make recipe: User ID missing from localStorage.");
            setMakeMessage("Error: Please log in first.");
            return;
        }

        try {
            // We send a POST request with no body, but params in the config
            const response = await axios.post(
                "https://nwhacks25.onrender.com/subtract",
                null, // No request body
                {
                    params: {
                        user_ID: userID,
                        // We can pass the entire array directly. The server must handle array query params.
                        // If needed, consider joining them into a string, e.g. ingredients: recipe.ingredients.join(",")
                        ingredients: recipe.ingredients,
                    },
                }
            );
            console.log(recipe.ingredients);
            console.log("User ID" + userID);
            console.log("Make Recipe Response:", response.data);
            setMakeMessage(`Successfully made "${recipe.name}"!`);
        } catch (error) {
            console.error("Error making recipe:", error);

            // Decide how best to show the user this error; for now, a simple message:
            setMakeMessage(`Failed to make "${recipe.name}". Please try again later.`);
        } finally {
            console.log(recipe.ingredients);
            console.log("User ID" + userID);
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

            {/* Display a success/error message after "Make" is clicked */}
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

                                    {/* "Make" button to post user_ID and the recipe's ingredients as query params */}
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
