DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,  -- Store Google Account ID
    -- email VARCHAR(255) UNIQUE NOT NULL,      -- Store user email (for Gmail login)
    -- username VARCHAR(255) NOT NULL           -- Optionally store the username
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                    -- Foreign key referencing users table
    name VARCHAR(255) NOT NULL,               -- Item name
    expiry_date DATE NOT NULL,               -- Item expiry date
    quantity INT,                   -- Item quantity
    weight REAL,                    -- or item weight
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
