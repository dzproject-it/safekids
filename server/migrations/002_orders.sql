-- ==============================================================
-- Migration 002 : Tables commandes
-- ==============================================================

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  status           VARCHAR(50)    NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount     DECIMAL(10, 2) NOT NULL,
  customer_email   VARCHAR(255)   DEFAULT NULL,
  customer_name    VARCHAR(255)   DEFAULT NULL,
  created_at       TIMESTAMP      DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER        REFERENCES products(id) ON DELETE SET NULL,
  product_name     VARCHAR(255)   NOT NULL,
  unit_price       DECIMAL(10, 2) NOT NULL,
  quantity         INTEGER        NOT NULL CHECK (quantity > 0)
);
