import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const migrations = ['001_init.sql', '002_orders.sql', '003_qr_profiles.sql', '004_order_qr.sql'];

try {
  for (const file of migrations) {
    const sql = readFileSync(join(__dirname, file), 'utf8');
    await pool.query(sql);
    console.log(`✓ ${file} exécuté.`);
  }
  console.log('Toutes les migrations ont été appliquées.');
} catch (err) {
  console.error('Erreur lors de la migration :', err.message);
} finally {
  await pool.end();
}
