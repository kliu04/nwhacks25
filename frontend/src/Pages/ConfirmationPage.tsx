import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ConfirmationPage.css"; // Import the updated CSS

interface Item {
    id: number; // Unique identifier for items
    name: string;
    amount: string;
    expiry: string;
}

const ConfirmationPage: React.FC = () => {
    // Placeholder for parsed receipt data
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        fetchItems();
    }, []);

    const pushItems = async () => {
        const userID = localStorage.getItem("userId");
        try {
            console.log(JSON.stringify(items));
            await axios.post(
                "https://nwhacks25.vercel.app/inventory",
                null, // Empty body
                {
                    params: {
                        user_ID: userID, // Send user_ID as a query parameter
                        items: JSON.stringify(items)
                    },
                }
            );

        } catch (e) {

        }

    }

    const fetchItems = async () => {
        const userID = localStorage.getItem("userId");
        try {
            const response = await axios.get("https://nwhacks25.onrender.com/inventory", {
                params: { user_ID: userID },
            });

            console.log(response);

            if (Array.isArray(response.data)) {
                setItems(response.data.map((item) => {
                    return {
                        id: Math.random(),
                        name: item[0],
                        amount: item[2] || item[3],
                        expiry: item[1]

                    }
                }
                ))
            }
            else {
                console.log("Bad response");
            }
        } catch (e) {
            console.log("Bad request");
        }
    };

    const [newItem, setNewItem] = useState<Item>({
        id: Date.now(),
        name: "",
        amount: "",
        expiry: "",
    });

    // Handle item additions
    const handleAddItem = () => {
        if (newItem.name && newItem.expiry) {
            setItems((prev) => [...prev, newItem]);
            setNewItem({ id: Date.now(), name: "", amount: "", expiry: "" });
        } else {
            alert("Please enter valid item details.");
        }
    };

    // Handle item updates
    const handleUpdateItem = (id: number, updatedItem: Partial<Item>) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
        );
    };

    // Handle item removal
    const handleRemoveItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="confirmation-page">
            <h1 className="confirmation-page__title">Confirm Your Items</h1>
            <ul className="confirmation-page__list">
                {items.map((item) => (
                    <li key={item.id} className="confirmation-page__list-item">
                        <span>
                            {item.name} - {item.amount} (Expires: {item.expiry})
                        </span>
                        <button
                            className="confirmation-page__edit-button"
                            onClick={() =>
                                handleUpdateItem(item.id, {
                                    name: prompt("Enter new name:", item.name) || item.name,
                                    amount: prompt("Enter new quantity:", item.amount) || item.amount,
                                    expiry: prompt("Enter new expiry date (YYYY-MM-DD):", item.expiry) || item.expiry,
                                })
                            }
                        >
                            Edit
                        </button>
                        <button
                            className="confirmation-page__remove-button"
                            onClick={() => handleRemoveItem(item.id)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <div className="confirmation-page__add-item">
                <h2>Add Missing Item</h2>
                <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Amount (number or kg)"
                    value={newItem.amount}
                    onChange={(e) =>
                        setNewItem({ ...newItem, amount: e.target.value })
                    }
                />
                <input
                    type="date"
                    value={newItem.expiry}
                    onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
                />
                <button onClick={handleAddItem}>Add Item</button>
            </div>
            <Link to="/" onClick={pushItems}>
                Finish and Go Home
            </Link>
        </div>
    );
};

export default ConfirmationPage;
