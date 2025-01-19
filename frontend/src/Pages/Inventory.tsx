import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inventory.css"; // <--- Create and import your Inventory.css
import expirationIcon from "./icons/expiration.png";

interface InventoryItem {
  item: string;
  expiry: string;
  amount: string;         // Displayed amount (e.g., "5" or "0.77 kg")
  amountNumeric: number;  // Numerical value for sorting
}

const getExpiryClass = (expiry: string) => {
  const expiryDate = new Date(expiry).getTime();
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (expiryDate - now <= 0) return "expired";
  if (expiryDate - now <= oneWeek) return "expiry-soon";
  return "expiry-week";
};

type InventoryTuple = [string, string, number | null, number | null];

const ViewInventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sortBy, setSortBy] = useState<"item" | "amount" | "expiry">("item");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchInventory = async () => {
            // Retrieve user_ID from localStorage
            const userID = localStorage.getItem("userId"); // Ensure this key matches how you store it

            if (!userID) {
                console.error("User ID is missing. Cannot fetch inventory.");
                setError("User ID is missing. Please log in.");
                setLoading(false);
                return;
            }

            try {
                // Make GET request with user_ID as a query parameter
                const response = await axios.get("https://nwhacks25.onrender.com/inventory", {
                    params: { user_ID: userID },
                    // If your API requires headers (e.g., for authentication), include them here
                    // headers: {
                    //     'Authorization': `Bearer ${token}`,
                    // },
                });

                console.log("API Response:", response.data);
                console.log("Type of response.data:", typeof response.data);

                let data: any;

                // Parse response data if it's a string
                if (typeof response.data === "string") {
                    try {
                        data = JSON.parse(response.data);
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError);
                        setError("Failed to parse inventory data.");
                        setInventory([]);
                        setLoading(false);
                        return;
                    }
                } else {
                    data = response.data;
                }

                // Check if data is an array (array of tuples)
                if (Array.isArray(data)) {
                    const transformedInventory: InventoryItem[] = data.map((tuple: any[], index: number) => {
                        // Ensure each tuple has at least 4 elements
                        if (tuple.length < 4) {
                            console.warn(`Tuple at index ${index} is incomplete:`, tuple);
                            return {
                                item: "Unknown Item",
                                expiry: "Unknown",
                                amount: "N/A",
                                amountNumeric: 0,
                            };
                        }

                        const [item, expiry, quantity, weight] = tuple as InventoryTuple;

                        let amount = "N/A";
                        let amountNumeric = 0;

                        if (quantity !== null && quantity !== undefined) {
                            amount = quantity.toString();
                            amountNumeric = Number(quantity);
                        } else if (weight !== null && weight !== undefined) {
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
                // Handle case where data is wrapped inside an object (e.g., { inventory: [...] })
                else if (data.inventory && Array.isArray(data.inventory)) {
                    const transformedInventory: InventoryItem[] = data.inventory.map((tuple: any[], index: number) => {
                        if (tuple.length < 4) {
                            console.warn(`Tuple at index ${index} is incomplete:`, tuple);
                            return {
                                item: "Unknown Item",
                                expiry: "Unknown",
                                amount: "N/A",
                                amountNumeric: 0,
                            };
                        }

                        const [item, expiry, quantity, weight] = tuple as InventoryTuple;

                        let amount = "N/A";
                        let amountNumeric = 0;

                        if (quantity !== null && quantity !== undefined) {
                            amount = quantity.toString();
                            amountNumeric = Number(quantity);
                        } else if (weight !== null && weight !== undefined) {
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
                else {
                    console.error("Unexpected API response structure:", data);
                    setError("Unexpected response structure from the server.");
                    setInventory([]);
                }

            } catch (error) {
                console.error("Error fetching inventory:", error);
                setError("Failed to fetch inventory. Please try again later.");
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };

    fetchInventory();
  }, []);

    // Sorting function updated to handle amount
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
            // Default to sorting by item name
            return a.item.localeCompare(b.item);
        });
        setSortBy(criteria);
        setInventory(sortedInventory);
    };

    // Loading state
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

            {/* Display error message if any */}
            {error && (
                <div className="view-inventory__error">
                    <p>{error}</p>
                </div>
            )}

            {/* Sorting Controls */}
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

            {/* Inventory Table */}
            {inventory.length > 0 ? (
                <table className="view-inventory__table">
                    <thead>
                    <tr className="view-inventory__header-row">
                        <th className="view-inventory__header-cell"> Item Name</th>
                        <th className="view-inventory__header-cell">Quantity</th>
                        <th className="view-inventory__header-cell">Best Before Data</th>
                    </tr>
                    </thead>
                    <tbody>
                    {inventory.map((invItem, index) => (
                        <tr key={index} className="view-inventory__row">
                            <td className="view-inventory__cell">{invItem.item}</td>
                            <td className="view-inventory__cell">{invItem.amount}</td>
                            {/* <td className="view-inventory__cell${getExpiryClass(
                                invItem.expiry )}">{invItem.expiry}</td> */}
                                <td className={"view-inventory__cell " + getExpiryClass(invItem.expiry)}>{invItem.expiry} <img src={expirationIcon} alt="test" /></td>
                                              
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

export default ViewInventory; // or "export default Inventory;" if you rename the component
