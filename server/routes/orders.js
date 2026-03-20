import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// Validation email basique (RFC 5322 simplifié)
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

// POST /api/orders — crée une commande avec ses lignes
router.post('/', async (req, res) => {
  const { items, totalAmount, customerEmail, customerName, qrProfile } = req.body;

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: 'Le panier est vide ou trop volumineux' });
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0 || totalAmount > 999999) {
    return res.status(400).json({ error: 'Montant total invalide' });
  }

  if (customerEmail && (typeof customerEmail !== 'string' || !EMAIL_RE.test(customerEmail))) {
    return res.status(400).json({ error: 'Email invalide' });
  }

  if (customerName && (typeof customerName !== 'string' || customerName.length > 255)) {
    return res.status(400).json({ error: 'Nom trop long (255 max)' });
  }

  for (const item of items) {
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || item.quantity > 9999) {
      return res.status(400).json({ error: 'Quantité invalide' });
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0 || item.unitPrice > 999999) {
      return res.status(400).json({ error: 'Prix unitaire invalide' });
    }
    if (item.name && (typeof item.name !== 'string' || item.name.length > 500)) {
      return res.status(400).json({ error: 'Nom de produit trop long' });
    }
  }

  if (qrProfile?.payload && JSON.stringify(qrProfile.payload).length > 10240) {
    return res.status(413).json({ error: 'Payload QR trop volumineux (10 Ko max)' });
  }

  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error('DB indisponible pour création de commande :', err.message);
    return res.status(503).json({ error: 'Service temporairement indisponible' });
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
