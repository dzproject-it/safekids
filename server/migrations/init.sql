-- ============================================================
-- Script unifié : Initialisation de la base de données SafeKids
-- ============================================================

-- 1. Produits
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)    NOT NULL,
  category    VARCHAR(50)     NOT NULL CHECK (category IN ('girl', 'boy', 'unisex', 'adult', 'medical')),
  price       DECIMAL(10, 2)  NOT NULL,
  old_price   DECIMAL(10, 2)  DEFAULT NULL,
  badge       VARCHAR(50)     DEFAULT NULL,
  popularity  INTEGER         DEFAULT 0,
  image       TEXT,
  colors      TEXT[]          NOT NULL DEFAULT '{}',
  sizes       TEXT[]          NOT NULL DEFAULT '{}',
  description TEXT,
  features    TEXT[]          NOT NULL DEFAULT '{}',
  stock       INTEGER         DEFAULT 0,
  created_at  TIMESTAMP       DEFAULT NOW()
);

-- Unicité sur le nom de produit
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_name ON products(name);

-- 2. Profils QR Code (données personnelles)
CREATE TABLE IF NOT EXISTS qr_profiles (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER  REFERENCES products(id) ON DELETE SET NULL,
  qr_type     VARCHAR(20) NOT NULL
              CHECK (qr_type IN ('contact', 'medical', 'text', 'link')),
  payload     JSONB    NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

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

-- 3. Commandes
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  status           VARCHAR(50)    NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount     DECIMAL(10, 2) NOT NULL,
  customer_email   VARCHAR(255)   DEFAULT NULL,
  customer_name    VARCHAR(255)   DEFAULT NULL,
  qr_profile_id   INTEGER        REFERENCES qr_profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMP      DEFAULT NOW()
);

-- 4. Lignes de commande
CREATE TABLE IF NOT EXISTS order_items (
  id               SERIAL PRIMARY KEY,
  order_id         INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       INTEGER        REFERENCES products(id) ON DELETE SET NULL,
  product_name     VARCHAR(255)   NOT NULL,
  unit_price       DECIMAL(10, 2) NOT NULL,
  quantity         INTEGER        NOT NULL CHECK (quantity > 0),
  color            VARCHAR(100)   DEFAULT NULL,
  size             VARCHAR(20)    DEFAULT NULL
);

-- ============================================================
-- Données initiales (seed)
-- ============================================================

INSERT INTO products (name, category, price, old_price, badge, popularity, image, colors, sizes, description, features, stock)
VALUES
(
  'Bracelet QR Aventure Fille', 'girl', 24.99, 29.99, 'PROMO', 95,
  'https://readdy.ai/api/search-image?query=Modern%20pink%20silicone%20bracelet%20for%20girls%20with%20integrated%20QR%20code%20chip%2C%20product%20photography%20on%20soft%20pink%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20clean%20aesthetic%2C%20safety%20wearable%20technology%20for%20children%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod1&orientation=portrait',
  ARRAY['Rose', 'Violet', 'Corail'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Bracelet en silicone doux et résistant avec QR Code intégré. Parfait pour les activités quotidiennes et les sorties.',
  ARRAY['Résistant à l''eau', 'Hypoallergénique', 'Ajustable', 'QR Code personnalisable'],
  45
),
(
  'Bracelet QR Sport Garçon', 'boy', 24.99, NULL, NULL, 88,
  'https://readdy.ai/api/search-image?query=Modern%20blue%20silicone%20bracelet%20for%20boys%20with%20integrated%20QR%20code%20chip%2C%20product%20photography%20on%20soft%20blue%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20clean%20aesthetic%2C%20safety%20wearable%20technology%20for%20children%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod2&orientation=portrait',
  ARRAY['Bleu', 'Vert', 'Noir'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Conçu pour les jeunes sportifs actifs. Résiste aux chocs et à l''eau pour accompagner toutes les aventures.',
  ARRAY['Ultra résistant', 'Respirant', 'Léger', 'QR Code sécurisé'],
  38
),
(
  'Bracelet QR Classique Unisexe', 'unisex', 22.99, NULL, NULL, 80,
  'https://readdy.ai/api/search-image?query=Modern%20yellow%20and%20white%20silicone%20bracelet%20unisex%20design%20with%20integrated%20QR%20code%20chip%2C%20product%20photography%20on%20soft%20yellow%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20clean%20aesthetic%2C%20safety%20wearable%20technology%20for%20children%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod3&orientation=portrait',
  ARRAY['Jaune', 'Blanc', 'Gris'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Design épuré et universel. Convient à tous les enfants pour une sécurité discrète et efficace.',
  ARRAY['Design neutre', 'Confortable', 'Durable', 'Facile à programmer'],
  52
),
(
  'Bracelet QR Princesse', 'girl', 27.99, 34.99, 'PROMO', 92,
  'https://readdy.ai/api/search-image?query=Elegant%20glittery%20purple%20silicone%20bracelet%20for%20girls%20with%20QR%20code%2C%20decorated%20with%20small%20star%20charms%2C%20product%20photography%20on%20soft%20lavender%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20for%20children%2C%20bright%20studio%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod4&orientation=portrait',
  ARRAY['Violet', 'Rose Pâle', 'Doré'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Édition spéciale Princesse avec détails brillants et charms étoiles. Pour les petites filles qui aiment briller tout en restant en sécurité.',
  ARRAY['Charms décoratifs', 'Brillant sécurisé', 'Hypoallergénique', 'QR Code discret'],
  30
),
(
  'Bracelet QR Super-Héros', 'boy', 26.99, NULL, 'NOUVEAU', 90,
  'https://readdy.ai/api/search-image?query=Bold%20red%20and%20black%20silicone%20bracelet%20for%20boys%20with%20superhero%20design%20and%20QR%20code%20chip%2C%20product%20photography%20on%20dark%20red%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20technology%20for%20children%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod5&orientation=portrait',
  ARRAY['Rouge', 'Noir', 'Bleu Marine'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Pour les petits super-héros du quotidien ! Design audacieux avec motifs graphiques et QR Code intégré ultra-résistant.',
  ARRAY['Design super-héros', 'Résistant aux chocs', 'Imperméable', 'QR Code renforcé'],
  25
),
(
  'Bracelet QR Nature', 'unisex', 23.99, 27.99, 'PROMO', 75,
  'https://readdy.ai/api/search-image?query=Green%20eco-friendly%20silicone%20bracelet%20with%20leaf%20pattern%20and%20QR%20code%20chip%2C%20product%20photography%20on%20soft%20green%20gradient%20background%2C%20nature%20inspired%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20for%20children%2C%20bright%20studio%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod6&orientation=portrait',
  ARRAY['Vert Forêt', 'Vert Menthe', 'Beige'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Inspiré par la nature, ce bracelet éco-responsable est fabriqué à partir de silicone recyclé. Idéal pour les enfants amoureux de l''environnement.',
  ARRAY['Éco-responsable', 'Silicone recyclé', 'Motifs nature', 'QR Code personnalisable'],
  40
),
(
  'Bracelet QR Arc-en-Ciel', 'girl', 25.99, NULL, 'NOUVEAU', 97,
  'https://readdy.ai/api/search-image?query=Colorful%20rainbow%20silicone%20bracelet%20for%20children%20with%20QR%20code%20chip%2C%20multicolor%20gradient%20design%2C%20product%20photography%20on%20white%20background%20with%20soft%20rainbow%20light%2C%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod7&orientation=portrait',
  ARRAY['Arc-en-Ciel', 'Pastel', 'Néon'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Le bracelet le plus coloré de notre collection ! Dégradé arc-en-ciel unique pour les enfants qui aiment la couleur et la joie.',
  ARRAY['Couleurs vives', 'Design unique', 'Résistant', 'QR Code intégré'],
  18
),
(
  'Bracelet QR Astronaute', 'boy', 28.99, 32.99, 'PROMO', 85,
  'https://readdy.ai/api/search-image?query=Space%20themed%20dark%20navy%20silicone%20bracelet%20for%20boys%20with%20stars%20and%20rocket%20motifs%20and%20QR%20code%20chip%2C%20product%20photography%20on%20deep%20space%20gradient%20background%2C%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20technology%20for%20children%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod8&orientation=portrait',
  ARRAY['Bleu Nuit', 'Gris Argent', 'Noir Cosmos'],
  ARRAY['XS', 'S', 'M', 'L'],
  'Pour les futurs explorateurs de l''espace ! Motifs étoiles et fusées sur fond nuit profonde. Un bracelet qui fait rêver tout en assurant la sécurité.',
  ARRAY['Motifs espace', 'Phosphorescent', 'Résistant', 'QR Code lumineux'],
  22
),
(
  'Bracelet QR Élégance Adulte', 'adult', 32.99, 39.99, 'NOUVEAU', 88,
  'https://readdy.ai/api/search-image?query=Elegant%20minimalist%20dark%20leather%20and%20silicone%20bracelet%20for%20adults%20with%20discreet%20QR%20code%20chip%2C%20product%20photography%20on%20charcoal%20gradient%20background%2C%20luxury%20style%2C%20high%20quality%2C%20clean%20aesthetic%2C%20safety%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod9&orientation=portrait',
  ARRAY['Noir', 'Marron', 'Gris Anthracite'],
  ARRAY['M', 'L', 'XL'],
  'Bracelet élégant en silicone mat avec finitions cuir pour adultes. QR Code discret, parfait pour un usage quotidien professionnel ou personnel.',
  ARRAY['Design adulte', 'Finitions cuir', 'QR Code discret', 'Résistant à l''eau'],
  35
),
(
  'Bracelet QR Sport Adulte', 'adult', 29.99, NULL, NULL, 82,
  'https://readdy.ai/api/search-image?query=Sporty%20black%20and%20grey%20silicone%20fitness%20bracelet%20for%20adults%20with%20QR%20code%20chip%2C%20product%20photography%20on%20dark%20grey%20gradient%20background%2C%20athletic%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod10&orientation=portrait',
  ARRAY['Noir', 'Gris', 'Bleu Marine'],
  ARRAY['M', 'L', 'XL'],
  'Bracelet sportif conçu pour les adultes actifs. Léger, résistant à la transpiration et aux chocs sportifs.',
  ARRAY['Ultra léger', 'Anti-transpiration', 'Ajustable', 'QR Code sécurisé'],
  40
),
(
  'Bracelet QR Voyage Adulte', 'adult', 34.99, NULL, 'NOUVEAU', 78,
  'https://readdy.ai/api/search-image?query=Premium%20tan%20and%20silver%20silicone%20travel%20bracelet%20for%20adults%20with%20QR%20code%20chip%2C%20product%20photography%20on%20warm%20beige%20gradient%20background%2C%20travel%20inspired%20minimalist%20style%2C%20high%20quality%2C%20safety%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod11&orientation=portrait',
  ARRAY['Beige', 'Argent', 'Bleu Ciel'],
  ARRAY['M', 'L', 'XL'],
  'Idéal pour les voyageurs. Programmez vos informations de passeport, hôtel et contacts d''urgence dans le QR Code pour voyager en toute sérénité.',
  ARRAY['Multi-langues', 'Données voyage', 'Résistant', 'QR Code crypté'],
  28
),
(
  'Bracelet QR Santé Essentiel', 'medical', 26.99, 31.99, 'PROMO', 94,
  'https://readdy.ai/api/search-image?query=Medical%20white%20and%20red%20silicone%20health%20bracelet%20with%20medical%20cross%20symbol%20and%20QR%20code%20chip%2C%20product%20photography%20on%20clean%20white%20gradient%20background%2C%20healthcare%20minimalist%20style%2C%20high%20quality%2C%20medical%20alert%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod12&orientation=portrait',
  ARRAY['Blanc', 'Rouge Médical', 'Bleu Clair'],
  ARRAY['S', 'M', 'L', 'XL'],
  'Bracelet médical essentiel avec symbole croix de santé. Encodez traitements, allergies et contacts d''urgence pour une prise en charge rapide.',
  ARRAY['Symbole médical', 'Données de santé', 'Hypoallergénique', 'QR Code médical'],
  50
),
(
  'Bracelet QR Diabète', 'medical', 28.99, NULL, 'NOUVEAU', 90,
  'https://readdy.ai/api/search-image?query=Medical%20blue%20and%20white%20silicone%20diabetes%20alert%20bracelet%20with%20QR%20code%20chip%20and%20medical%20symbol%2C%20product%20photography%20on%20soft%20blue%20gradient%20background%2C%20healthcare%20minimalist%20style%2C%20high%20quality%2C%20medical%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod13&orientation=portrait',
  ARRAY['Bleu Ciel', 'Blanc', 'Gris Perle'],
  ARRAY['S', 'M', 'L', 'XL'],
  'Spécialement conçu pour les personnes diabétiques. Permet aux secouristes d''accéder instantanément aux informations médicales vitales.',
  ARRAY['Alerte diabète', 'Données glycémie', 'Confortable 24h/24', 'QR Code urgence'],
  32
),
(
  'Bracelet QR Allergies Sévères', 'medical', 27.99, 32.99, 'PROMO', 87,
  'https://readdy.ai/api/search-image?query=Medical%20orange%20and%20white%20silicone%20allergy%20alert%20bracelet%20with%20QR%20code%20chip%20and%20warning%20symbol%2C%20product%20photography%20on%20soft%20orange%20gradient%20background%2C%20healthcare%20minimalist%20style%2C%20high%20quality%2C%20medical%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod14&orientation=portrait',
  ARRAY['Orange Alerte', 'Blanc', 'Jaune'],
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  'Bracelet d''alerte pour les personnes souffrant d''allergies sévères. Couleur vive facilement repérable en situation d''urgence.',
  ARRAY['Alerte allergies', 'Haute visibilité', 'Toutes tailles', 'QR Code détaillé'],
  42
),
(
  'Bracelet QR Seniors', 'medical', 25.99, NULL, NULL, 85,
  'https://readdy.ai/api/search-image?query=Comfortable%20soft%20grey%20and%20white%20silicone%20medical%20bracelet%20for%20elderly%20seniors%20with%20QR%20code%20chip%2C%20product%20photography%20on%20soft%20grey%20gradient%20background%2C%20healthcare%20comfort%20minimalist%20style%2C%20high%20quality%2C%20medical%20wearable%20technology%2C%20bright%20lighting%2C%20professional%20e-commerce%20photo&width=400&height=500&seq=prod15&orientation=portrait',
  ARRAY['Gris Clair', 'Blanc', 'Beige'],
  ARRAY['M', 'L', 'XL'],
  'Conçu pour les seniors avec un confort optimal. Fermeture facile, silicone extra-doux et QR Code contenant dossier médical complet.',
  ARRAY['Confort senior', 'Fermeture facile', 'Extra-doux', 'Dossier médical complet'],
  38
)
ON CONFLICT DO NOTHING;
