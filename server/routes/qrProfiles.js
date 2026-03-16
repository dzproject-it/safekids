import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const ALLOWED_TYPES = ['contact', 'medical', 'text', 'link'];

// POST /api/qr-profiles — sauvegarde ou met à jour un profil QR
// Body: { productId?, qrType, payload }
router.post('/', async (req, res) => {
  const { productId, qrType, payload } = req.body;

  if (!ALLOWED_TYPES.includes(qrType)) {
    return res.status(400).json({ error: 'Type QR invalide' });
  }
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Payload manquant' });
  }

  try {
    // Si un productId est fourni et qu'un profil existe déjà → on le met à jour
    if (productId) {
      const existing = await pool.query(
        'SELECT id FROM qr_profiles WHERE product_id = $1',
        [productId]
      );
      if (existing.rows.length > 0) {
        const { rows: [updated] } = await pool.query(
          `UPDATE qr_profiles
           SET qr_type = $1, payload = $2
           WHERE product_id = $3
           RETURNING id, qr_type, updated_at`,
          [qrType, JSON.stringify(payload), productId]
        );
        return res.json({ id: updated.id, qrType: updated.qr_type, updatedAt: updated.updated_at });
      }
    }

    // Sinon → création
    const { rows: [created] } = await pool.query(
      `INSERT INTO qr_profiles (product_id, qr_type, payload)
       VALUES ($1, $2, $3)
       RETURNING id, qr_type, created_at`,
      [productId ?? null, qrType, JSON.stringify(payload)]
    );
    res.status(201).json({ id: created.id, qrType: created.qr_type, createdAt: created.created_at });
  } catch (err) {
    console.warn('DB indisponible, profil QR simulé :', err.message);
    // Mode mock : réponse simulée
    res.status(201).json({
      id: Math.floor(Math.random() * 100000),
      qrType,
      createdAt: new Date().toISOString(),
    });
  }
});

// GET /api/qr-profiles/:id — récupère un profil par son id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

  try {
    const { rows: [row] } = await pool.query(
      'SELECT id, product_id, qr_type, payload, created_at, updated_at FROM qr_profiles WHERE id = $1',
      [id]
    );
    if (!row) return res.status(404).json({ error: 'Profil introuvable' });

    res.json({
      id: row.id,
      productId: row.product_id,
      qrType: row.qr_type,
      payload: row.payload,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error(`GET /api/qr-profiles/${id} :`, err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/qr-profiles/by-product/:productId — récupère le profil lié à un produit
router.get('/by-product/:productId', async (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) return res.status(400).json({ error: 'ID produit invalide' });

  try {
    const { rows: [row] } = await pool.query(
      'SELECT id, product_id, qr_type, payload, updated_at FROM qr_profiles WHERE product_id = $1',
      [productId]
    );
    if (!row) return res.status(404).json({ error: 'Aucun profil pour ce produit' });

    res.json({
      id: row.id,
      productId: row.product_id,
      qrType: row.qr_type,
      payload: row.payload,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error(`GET /api/qr-profiles/by-product/${productId} :`, err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
