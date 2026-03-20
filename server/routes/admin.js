import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// ── Middleware auth admin simple (token en header) ──────────────────────────
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}

router.use(requireAdmin);

// ── GET /api/admin/orders — Liste paginée des commandes ─────────────────────
router.get('/orders', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const status = req.query.status || null;
  const search = req.query.search || null;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      params.push(status);
      where += ` AND o.status = $${params.length}`;
    }

    if (search && search.length <= 255) {
      const searchClean = search.trim();
      const idNum = parseInt(searchClean, 10);
      if (!isNaN(idNum) && String(idNum) === searchClean) {
        params.push(idNum);
        where += ` AND o.id = $${params.length}`;
      } else {
        params.push(`%${searchClean}%`);
        where += ` AND (o.customer_name ILIKE $${params.length} OR o.customer_email ILIKE $${params.length})`;
      }
    }

    // Count total
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM orders o ${where}`,
      params,
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // Fetch orders with item count
    const orderParams = [...params, limit, offset];
    const { rows: orders } = await pool.query(
      `SELECT o.*, 
              COALESCE(SUM(oi.quantity), 0) AS item_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${orderParams.length - 1} OFFSET $${orderParams.length}`,
      orderParams,
    );

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        status: o.status,
        totalAmount: parseFloat(o.total_amount),
        customerEmail: o.customer_email,
        customerName: o.customer_name,
        itemCount: parseInt(o.item_count, 10),
        createdAt: o.created_at,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /api/admin/orders :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/admin/orders/:id — Détail complet d'une commande ───────────────
router.get('/orders/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

  try {
    const { rows: [order] } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    const { rows: items } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
      [id],
    );

    let qrProfile = null;
    if (order.qr_profile_id) {
      const { rows: [qr] } = await pool.query(
        'SELECT * FROM qr_profiles WHERE id = $1',
        [order.qr_profile_id],
      );
      qrProfile = qr ? { id: qr.id, qrType: qr.qr_type, payload: qr.payload } : null;
    }

    res.json({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      qrProfile,
      createdAt: order.created_at,
      items: items.map((i) => ({
        id: i.id,
        productId: i.product_id,
        name: i.product_name,
        unitPrice: parseFloat(i.unit_price),
        quantity: i.quantity,
        color: i.color,
        size: i.size,
      })),
    });
  } catch (err) {
    console.error(`GET /api/admin/orders/${id} :`, err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── PATCH /api/admin/orders/:id/status — Modifier le statut ─────────────────
const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

router.patch('/orders/:id/status', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID invalide' });

  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs possibles : ${VALID_STATUSES.join(', ')}` });
  }

  try {
    const { rows: [order] } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    res.json({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`PATCH /api/admin/orders/${id}/status :`, err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── GET /api/admin/stats — Statistiques globales ────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const { rows: [stats] } = await pool.query(`
      SELECT 
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed,
        COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0) AS total_revenue
      FROM orders
    `);

    res.json({
      totalOrders: parseInt(stats.total_orders, 10),
      pending: parseInt(stats.pending, 10),
      confirmed: parseInt(stats.confirmed, 10),
      shipped: parseInt(stats.shipped, 10),
      delivered: parseInt(stats.delivered, 10),
      cancelled: parseInt(stats.cancelled, 10),
      totalRevenue: parseFloat(stats.total_revenue),
    });
  } catch (err) {
    console.error('GET /api/admin/stats :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
