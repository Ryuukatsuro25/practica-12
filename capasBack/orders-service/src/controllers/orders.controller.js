import { query, tx } from '../db/mysql.js';
import jwt from 'jsonwebtoken';

function userFromReq(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  return jwt.verify(token, process.env.JWT_SECRET);
}

export async function createOrder(req, res) {
  try {
    const { restaurant_id, items } = req.body; // items: [{product_id, quantity}]
    const user = userFromReq(req);

    const result = await tx(async (exec) => {
      const ids = (items || []).map((i) => i.product_id);
      if (!ids.length) throw new Error('Sin items');

      // IN dinámico con placeholders ?
      const placeholders = ids.map(() => '?').join(',');
      const products = await exec(
        `SELECT id, price FROM products WHERE id IN (${placeholders})`,
        ids
      );

      const priceMap = Object.fromEntries(products.map((p) => [p.id, +p.price]));
      let total = 0;
      for (const it of items) {
        total += (priceMap[it.product_id] || 0) * it.quantity;
      }

      const o = await exec(
        'INSERT INTO orders (user_id, restaurant_id, status, total_amount) VALUES (?, ?, \'recibido\', ?)',
        [user.id, restaurant_id, total]
      );

      for (const it of items) {
        await exec(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [o.insertId, it.product_id, it.quantity, priceMap[it.product_id] || 0]
        );
      }

      return { id: o.insertId, total };
    });

    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function myOrders(req, res) {
  try {
    const user = userFromReq(req);
    const rows = await query(
      'SELECT * FROM v_orders_for_client WHERE user_id=:id ORDER BY created_at DESC',
      { id: user.id }
    );
    res.json(rows);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
