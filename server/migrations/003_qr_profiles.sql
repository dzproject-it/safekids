-- ==============================================================
-- Migration 003 : Profils QR Code (données personnelles)
-- ==============================================================

CREATE TABLE IF NOT EXISTS qr_profiles (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER  REFERENCES products(id) ON DELETE SET NULL,
  qr_type     VARCHAR(20) NOT NULL
              CHECK (qr_type IN ('contact', 'medical', 'text', 'link')),
  -- payload stocke les données dans un JSONB sécurisé
  -- (ne jamais exposer ce champ sans authentification)
  payload     JSONB    NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Index pour récupérer rapidement le profil depuis un product_id
CREATE INDEX IF NOT EXISTS idx_qr_profiles_product_id ON qr_profiles(product_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qr_profiles_updated_at ON qr_profiles;
CREATE TRIGGER trg_qr_profiles_updated_at
  BEFORE UPDATE ON qr_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
