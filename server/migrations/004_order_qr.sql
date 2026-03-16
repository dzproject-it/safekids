-- ==============================================================
-- Migration 004 : Liaison commandes ↔ profils QR Code
-- ==============================================================

-- Lier chaque commande à un profil QR Code
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS qr_profile_id INTEGER REFERENCES qr_profiles(id) ON DELETE SET NULL;

-- Stocker la couleur et la taille dans chaque ligne de commande
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS color VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS size  VARCHAR(20)  DEFAULT NULL;
