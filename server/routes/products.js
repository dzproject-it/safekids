import { Router } from 'express';
import pool from '../db.js';
import { mockProducts } from '../mockData.js';

const router = Router();

// Convertit une ligne PostgreSQL (snake_case) en objet frontend (camelCase)
function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    oldPrice: row.old_price ? parseFloat(row.old_price) : null,
    badge: row.badge,
    popularity: row.popularity,
    image: row.image,
    colors: row.colors,
    sizes: row.sizes,
    description: row.description,
    features: row.features,
    stock: row.stock,
  };
}

// Filtre + tri sur les données mock (reproduit la logique SQL)
function filterMock(products, { category, sort, size } = {}) {
  let result = [...products];
  if (category && category !== 'all') result = result.filter((p) => p.category === category);
  if (size && size !== 'all') result = result.filter((p) => p.sizes.includes(size));
  switch (sort) {
    case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'new':        result.sort((a, b) => (b.badge === 'NOUVEAU' ? 1 : 0) - (a.badge === 'NOUVEAU' ? 1 : 0) || b.popularity - a.popularity); break;
    default:           result.sort((a, b) => b.popularity - a.popularity);
  }
  return result;
}

// GET /api/products — liste tous les produits
// Query params optionnels : category, sort, size
router.get('/', async (req, res) => {
  try {
    const { category, sort, size } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (size && size !== 'all') {
      params.push(size);
      query += ` AND $${params.length} = ANY(sizes)`;
    }

    switch (sort) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'new':
        query += " ORDER BY (badge = 'NOUVEAU') DESC, popularity DESC";
        break;
      default:
        query += ' ORDER BY popularity DESC';
    }

    const { rows } = await pool.query(query, params);
    res.json(rows.map(mapProduct));
  } catch (err) {
    console.warn('DB indisponible, utilisation des données mock :', err.message);
    res.json(filterMock(mockProducts, req.query));
  }
});

// GET /api/products/:id — détail d'un produit
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    res.json(mapProduct(rows[0]));
  } catch (err) {
    console.warn(`DB indisponible, utilisation des données mock pour id=${id} :`, err.message);
    const product = mockProducts.find((p) => p.id === id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(product);
  }
});

export default router;
