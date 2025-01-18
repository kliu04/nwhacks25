import React, { useState } from "react";
import {Link} from "react-router-dom";

interface Item {
    id: number; // Unique identifier for items
    name: string;
    quantity: number;
    expiry: string; // Use a string for placeholder; ideally, this would be a Date type.
}

const ConfirmationPage: React.FC = () => {
    // Placeholder for parsed receipt data
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: "Milk", quantity: 1, expiry: "2025-01-01" },
        { id: 2, name: "Eggs", quantity: 12, expiry: "2025-01-10" },
        { id: 3, name: "Bread", quantity: 2, expiry: "2025-01-15" },
    ]);

    const [newItem, setNewItem] = useState<Item>({
        id: Date.now(),
        name: "",
        quantity: 1,
        expiry: "",
    });

    // Handle item additions
    const handleAddItem = () => {
        if (newItem.name && newItem.expiry) {
            setItems((prev) => [...prev, newItem]);
            setNewItem({ id: Date.now(), name: "", quantity: 1, expiry: "" });
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
              {item.name} - {item.quantity} (Expires: {item.expiry})
            </span>
                        <button
                            className="confirmation-page__edit-button"
                            onClick={() =>
                                handleUpdateItem(item.id, {
                                    name: prompt("Enter new name:", item.name) || item.name,
                                    quantity: parseInt(prompt("Enter new quantity:", item.quantity.toString()) || item.quantity.toString(), 10),
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
                    type="number"
                    placeholder="Quantity"
                    value={newItem.quantity}
                    onChange={(e) =>
                        setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) })
                    }
                />
                <input
                    type="date"
                    value={newItem.expiry}
                    onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
                />
                <button onClick={handleAddItem}>Add Item</button>
            </div>
            <Link to="/">
                Finish and Go Home
            </Link>
        </div>
    );
};

export default ConfirmationPage;
