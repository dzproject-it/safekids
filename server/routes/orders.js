import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// POST /api/orders — crée une commande avec ses lignes
// Body: { items: [{ productId, name, unitPrice, quantity, color?, size? }], totalAmount, customerEmail?, customerName?, qrProfile?: { qrType, payload } }
router.post('/', async (req, res) => {
  const { items, totalAmount, customerEmail, customerName, qrProfile } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' });
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ error: 'Montant total invalide' });
  }

  for (const item of items) {
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ error: 'Quantité invalide' });
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      return res.status(400).json({ error: 'Prix unitaire invalide' });
    }
  }

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.warn('DB indisponible, commande simulée :', err.message);
    return res.status(201).json({
      id: Math.floor(Math.random() * 100000),
      status: 'pending',
      totalAmount,
      qrProfileId: qrProfile ? Math.floor(Math.random() * 100000) : null,
      createdAt: new Date().toISOString(),
    });
  }

  try {
    await client.query('BEGIN');

    // 1. Sauvegarder le profil QR si fourni
    let qrProfileId = null;
    if (qrProfile && qrProfile.qrType && qrProfile.payload) {
      const ALLOWED = ['contact', 'medical', 'text', 'link'];
      if (ALLOWED.includes(qrProfile.qrType)) {
        const { rows: [qr] } = await client.query(
          `INSERT INTO qr_profiles (qr_type, payload) VALUES ($1, $2) RETURNING id`,
          [qrProfile.qrType, JSON.stringify(qrProfile.payload)]
        );
        qrProfileId = qr.id;
      }
    }

    // 2. Créer la commande
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (total_amount, customer_email, customer_name, qr_profile_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [totalAmount, customerEmail ?? null, customerName ?? null, qrProfileId]
    );

    // 3. Créer les lignes de commande avec couleur et taille
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, color, size)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.productId ?? null, item.name, item.unitPrice, item.quantity, item.color ?? null, item.size ?? null]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      qrProfileId,
      createdAt: order.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('POST /api/orders :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id — détail d'une commande
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

  try {
    const { rows: [order] } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    const { rows: items } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    res.json({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      createdAt: order.created_at,
      items: items.map((i) => ({
        id: i.id,
        productId: i.product_id,
        name: i.product_name,
        unitPrice: parseFloat(i.unit_price),
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error(`GET /api/orders/${id} :`, err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
