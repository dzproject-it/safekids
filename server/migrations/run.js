import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const sql = readFileSync(join(__dirname, 'init.sql'), 'utf8');
  await pool.query(sql);
  console.log('✓ init.sql exécuté.');
} catch (err) {
  console.error('Erreur lors de la migration :', err.message);
} finally {
  await pool.end();
}
