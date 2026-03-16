-- ============================================================
-- Migration 001 : Initialisation de la base de données QrKids
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)    NOT NULL,
  category    VARCHAR(50)     NOT NULL CHECK (category IN ('girl', 'boy', 'unisex')),
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
)
ON CONFLICT DO NOTHING;
