import { query } from '../config/db.js';

// Get category by name (used when creating ticket)
export async function getCategoryIdByName(name) {
  const { rows } = await query('SELECT id FROM categories WHERE name=$1', [name]);
  return rows[0]?.id || null;
}

// Optional helper: list all categories
export async function listCategories() {
  const { rows } = await query('SELECT * FROM categories ORDER BY name');
  return rows;
}

// Optional helper: create a category if not exists
export async function createCategory(name) {
  const { rows } = await query(
    'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
    [name]
  );
  return rows[0] || null;
}