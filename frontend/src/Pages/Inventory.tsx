import React, { useState, useEffect } from "react";
import axios from "axios";

interface InventoryItem {
    item: string;
    expiry: string;
    amount: string;         // Displayed amount (e.g., "5" or "0.77 kg")
    amountNumeric: number;  // Numerical value for sorting
}

type InventoryTuple = [string, string, number | null, number | null]; // [item, expiry, quantity, weight]

const ViewInventory: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [sortBy, setSortBy] = useState<"item" | "amount" | "expiry">("item");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchInventory = async () => {
            const userID = localStorage.getItem("userId");

            if (!userID) {
                console.error("User ID is missing. Cannot fetch inventory.");
                setError("User ID is missing. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get("https://nwhacks25.onrender.com/inventory", {
                    params: { user_ID: userID },
                });

                let data = response.data;

                if (typeof data === "string") {
                    data = JSON.parse(data);
                }

                if (Array.isArray(data)) {
                    const transformedInventory: InventoryItem[] = data.map((tuple: any[]) => {
                        const [item, expiry, quantity, weight] = tuple as InventoryTuple;

                        let amount = "N/A";
                        let amountNumeric = 0;

                        if (quantity !== null) {
                            amount = quantity.toString();
                            amountNumeric = Number(quantity);
                        } else if (weight !== null) {
                            amount = `${weight} kg`;
                            amountNumeric = Number(weight);
                        }

                        return {
                            item: String(item),
                            expiry: String(expiry),
                            amount,
                            amountNumeric,
                        };
                    });

                    setInventory(transformedInventory);
                }
            } catch (error) {
                console.error("Error fetching inventory:", error);
                setError("Failed to fetch inventory. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Highlight items close to expiry
    const isCloseToExpiry = (expiry: string): boolean => {
        const currentDate = new Date();
        const expiryDate = new Date(expiry);
        const diffInMs = expiryDate.getTime() - currentDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return diffInDays <= 7; // Highlight items expiring within 7 days
    };

    // Sorting function
    const handleSort = (criteria: "item" | "amount" | "expiry") => {
        const sortedInventory = [...inventory].sort((a, b) => {
            if (criteria === "amount") {
                return a.amountNumeric - b.amountNumeric;
            }
            if (criteria === "expiry") {
                const aDate = new Date(a.expiry).getTime();
                const bDate = new Date(b.expiry).getTime();
                return aDate - bDate;
            }
            return a.item.localeCompare(b.item);
        });
        setSortBy(criteria);
        setInventory(sortedInventory);
    };

    if (loading) {
        return (
            <div className="loading">
                <h1>Loading inventory...</h1>
            </div>
        );
    }

    return (
        <div className="view-inventory">
            <h1 className="view-inventory__title">Your Pantry</h1>

            {error && (
                <div className="view-inventory__error">
                    <p>{error}</p>
                </div>
            )}

            <div className="view-inventory__controls">
                <label htmlFor="sortBy" className="view-inventory__label">
                    Sort By:
                </label>
                <select
                    id="sortBy"
                    className="view-inventory__dropdown"
                    value={sortBy}
                    onChange={(e) =>
                        handleSort(e.target.value as "item" | "amount" | "expiry")
                    }
                >
                    <option value="item">Item</option>
                    <option value="amount">Amount</option>
                    <option value="expiry">Expiry</option>
                </select>
            </div>

            {inventory.length > 0 ? (
                <table className="view-inventory__table">
                    <thead>
                    <tr className="view-inventory__header-row">
                        <th className="view-inventory__header-cell">Item</th>
                        <th className="view-inventory__header-cell">Amount</th>
                        <th className="view-inventory__header-cell">Expiry</th>
                    </tr>
                    </thead>
                    <tbody>
                    {inventory.map((invItem, index) => (
                        <tr
                            key={index}
                            className={`view-inventory__row ${
                                isCloseToExpiry(invItem.expiry)
                                    ? "view-inventory__row--close-to-expiry"
                                    : ""
                            }`}
                        >
                            <td className="view-inventory__cell">{invItem.item}</td>
                            <td className="view-inventory__cell">{invItem.amount}</td>
                            <td className="view-inventory__cell">{invItem.expiry}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                !error && <p>No inventory items available.</p>
            )}
        </div>
    );
};

export default ViewInventory;
