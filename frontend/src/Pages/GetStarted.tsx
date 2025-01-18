import React, { useState } from "react";
import { Link } from "react-router-dom";

const GetStarted: React.FC = () => {
    const commonPantryItems = [
        "Salt",
        "Pepper",
        "Sugar",
        "Flour",
        "Oil",
        "Rice",
        "Pasta",
        "Beans",
        "Vinegar",
        "Spices (e.g., cinnamon, paprika)",
    ];

    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const handleCheckboxChange = (item: string) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(item)
                ? prevSelected.filter((i) => i !== item) // Remove if already selected
                : [...prevSelected, item] // Add if not selected
        );
    };

    return (
        <div className="get-started">
            <h1 className="get-started__title">Get Started</h1>
            <p className="get-started__subtitle">Select any common pantry items you already have:</p>
            <ul className="get-started__list">
                {commonPantryItems.map((item) => (
                    <li key={item} className="get-started__list-item">
                        <label>
                            <input
                                type="checkbox"
                                value={item}
                                checked={selectedItems.includes(item)}
                                onChange={() => handleCheckboxChange(item)}
                            />
                            {item}
                        </label>
                    </li>
                ))}
            </ul>
            <div className="get-started__actions">
                <Link to="/upload-receipt" className="get-started__skip-button">
                    Continue
                </Link>
            </div>
        </div>
    );
};

export default GetStarted;
