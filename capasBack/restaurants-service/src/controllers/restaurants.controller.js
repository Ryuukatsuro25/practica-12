import { query } from '../db/mysql.js';

export async function list(req, res) {
  try {
    const rows = await query(
      'SELECT r.*, v.avg_rating, v.reviews_count, v.stars_5 ' +
      'FROM restaurants r ' +
      'LEFT JOIN v_restaurant_rating_summary v ON v.restaurant_id = r.id ' +
      'WHERE r.is_active = 1 ' +
      'ORDER BY r.created_at DESC'
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getOne(req, res) {
  try {
    const { id } = req.params;
    const rows = await query(
      'SELECT r.*, v.avg_rating, v.reviews_count, v.stars_5 ' +
      'FROM restaurants r ' +
      'LEFT JOIN v_restaurant_rating_summary v ON v.restaurant_id = r.id ' +
      'WHERE r.id=:id',
      { id }
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const { name, description, logo_url } = req.body;
    const result = await query(
      'INSERT INTO restaurants (name, description, logo_url) VALUES (:name, :description, :logo_url)',
      { name, description, logo_url }
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
