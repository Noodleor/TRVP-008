CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR NOT NULL,
    menu_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR CHECK (type IN ('salad', 'starter', 'main cource', 'drink', 'dessert')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_dishes (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
    dish_id INTEGER REFERENCES dishes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO dishes (name, type)
VALUES
  ('cofee', 'drink'),
  ('water', 'drink'),
  ('cesar', 'salad'),
  ('green', 'salad'),
  ('potato', 'main cource'),
  ('meat', 'main cource'),
  ('soup1', 'starter'),
  ('soup2', 'starter'),
  ('ice cream', 'dessert'),
  ('pie', 'dessert');

