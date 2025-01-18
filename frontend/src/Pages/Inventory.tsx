import React, { useState } from "react";

interface InventoryItem {
    item: string;
    quantity: number;
    expiry: string; // Use a date format for real data
}

const ViewInventory: React.FC = () => {
    // Placeholder inventory data
    const [inventory, setInventory] = useState<InventoryItem[]>([
        { item: "Apples", quantity: 5, expiry: "2025-01-31" },
        { item: "Bananas", quantity: 3, expiry: "2025-01-25" },
        { item: "Rice", quantity: 1, expiry: "2026-12-01" },
        { item: "Milk", quantity: 2, expiry: "2025-01-20" },
    ]);

    // State to manage sorting
    const [sortBy, setSortBy] = useState<"item" | "quantity" | "expiry">("item");

    // Function to handle sorting
    const handleSort = (criteria: "item" | "quantity" | "expiry") => {
        const sortedInventory = [...inventory].sort((a, b) => {
            if (criteria === "quantity") {
                return a.quantity - b.quantity;
            }
            if (criteria === "expiry") {
                return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
            }
            return a.item.localeCompare(b.item);
        });
        setSortBy(criteria);
        setInventory(sortedInventory);
    };

    return (
        <div className="view-inventory">
            <h1 className="view-inventory__title">Your Pantry</h1>
            <div className="view-inventory__controls">
                <label htmlFor="sortBy" className="view-inventory__label">
                    Sort By:
                </label>
                <select
                    id="sortBy"
                    className="view-inventory__dropdown"
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as "item" | "quantity" | "expiry")}
                >
                    <option value="item">Item</option>
                    <option value="quantity">Quantity</option>
                    <option value="expiry">Expiry</option>
                </select>
            </div>
            <table className="view-inventory__table">
                <thead>
                <tr className="view-inventory__header-row">
                    <th className="view-inventory__header-cell">Item</th>
                    <th className="view-inventory__header-cell">Quantity</th>
                    <th className="view-inventory__header-cell">Expiry</th>
                </tr>
                </thead>
                <tbody>
                {inventory.map((item, index) => (
                    <tr key={index} className="view-inventory__row">
                        <td className="view-inventory__cell">{item.item}</td>
                        <td className="view-inventory__cell">{item.quantity}</td>
                        <td className="view-inventory__cell">{item.expiry}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ViewInventory;
