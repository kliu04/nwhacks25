DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS items;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- Use AUTOINCREMENT for SQLite
    gmail TEXT UNIQUE NOT NULL
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
INSERT INTO users (gmail) VALUES ("axuotaku@gmail.com");

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Zucchini Green', '2023-11-08', NULL, 0.778);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Banana Cavendish', '2023-11-03', NULL, 0.442);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Potatoes Brushed', '2023-11-11', NULL, 1.328);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Broccoli', '2023-11-06', NULL, 0.808);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Brussel Sprouts', '2023-11-07', NULL, 0.322);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Grapes Green', '2023-11-05', NULL, 1.174);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Peas Snow', '2023-11-04', NULL, 0.218);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Tomatoes Grape', '2023-11-07', 2, NULL);

INSERT INTO items (user_id, name, expiry_date, quantity, weight) 
VALUES (1, 'Lettuce Iceberg', '2023-11-05', 2, NULL);


