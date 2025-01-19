DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT for SQLite
    user_id TEXT UNIQUE NOT NULL
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT for SQLite
    user_id INTEGER NOT NULL, 
    name TEXT NOT NULL,
    expiry_date TEXT NOT NULL,  -- Use TEXT for date format in SQLite
    quantity INTEGER,
    weight REAL,
    calories REAL,
    protein REAL, 
    carbs REAL,
    fat REAL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stub insert statements:
INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Zucchini Green', '2023-11-08', NULL, 0.778, 17, 1.2, 3.1, 0.3);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Banana Cavendish', '2023-11-03', NULL, 0.442, 89, 1.1, 22.8, 0.3);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Potatoes Brushed', '2023-11-11', NULL, 1.328, 77, 2.0, 17.6, 0.1);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Broccoli', '2023-11-06', NULL, 0.808, 34, 2.8, 6.6, 0.4);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Brussel Sprouts', '2023-11-07', NULL, 0.322, 43, 3.4, 8.9, 0.3);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Grapes Green', '2023-11-05', NULL, 1.174, 69, 0.7, 18.1, 0.2);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Peas Snow', '2023-11-04', NULL, 0.218, 42, 3.0, 7.5, 0.2);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Tomatoes Grape', '2023-11-07', 2, NULL, 18, 0.9, 3.9, 0.2);

INSERT INTO items (user_id, name, expiry_date, quantity, weight, calories, protein, carbs, fat) 
VALUES (1, 'Lettuce Iceberg', '2023-11-05', 2, NULL, 14, 0.9, 2.9, 0.1);


