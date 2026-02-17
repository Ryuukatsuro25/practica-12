import { query } from '../db/mysql.js';

export async function byRestaurant(req, res) {
  try {
    const { id } = req.params; // restaurant_id
    const rows = await query(
      'SELECT * FROM products WHERE restaurant_id=:id AND is_available=1',
      { id }
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function create(req, res) {
  try {
    const { restaurant_id, name, description, price, stock, image_url } = req.body;
    const result = await query(
      'INSERT INTO products (restaurant_id, name, description, price, stock, image_url) ' +
      'VALUES (:restaurant_id, :name, :description, :price, :stock, :image_url)',
      { restaurant_id, name, description, price, stock, image_url }
    );
    res.json({ id: result.insertId });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
