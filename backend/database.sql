DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT for SQLite
    google_id TEXT UNIQUE NOT NULL
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT for SQLite
    user_id INTEGER NOT NULL, 
    name TEXT NOT NULL,
    expiry_date TEXT NOT NULL,  -- Use TEXT for date format in SQLite
    quantity INTEGER,
    weight REAL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stub insert statements:
INSERT INTO users (google_id) VALUES ("12345678");

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Zucchini Green', '2023-11-08', 5, NULL);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Banana Cavendish', '2023-11-03', 7, NULL);
