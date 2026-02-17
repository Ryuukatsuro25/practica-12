import { query } from '../db/mysql.js';

// GET /by-restaurant/:id
export async function getReviewsByRestaurant(req, res) {
  try {
    const restaurantId = Number(req.params.id);

    const rows = await query(
      `SELECT r.id,
              r.restaurant_id,
              r.user_id,
              r.rating,
              r.comment,
              r.created_at,
              u.username,
              u.name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.restaurant_id = ?
       ORDER BY r.created_at DESC`,
      [restaurantId]
    );

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// GET /summary/:id
export async function getSummaryByRestaurant(req, res) {
  try {
    const restaurantId = Number(req.params.id);

    const [row] = await query(
      `SELECT
          COUNT(*)    AS total_reviews,
          AVG(rating) AS average_rating
       FROM reviews
       WHERE restaurant_id = ?`,
      [restaurantId]
    );

    res.json(row || { total_reviews: 0, average_rating: null });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// POST /  (body: { restaurant_id, rating, comment } + user en JWT vía gateway)
export async function createReview(req, res) {
  try {
    const userId = req.user?.id || req.body.user_id;
    const { restaurant_id, rating, comment } = req.body || {};

    if (!userId || !restaurant_id || !rating) {
      return res.status(400).json({
        error: 'userId, restaurant_id y rating son obligatorios',
      });
    }

    const result = await query(
      `INSERT INTO reviews (restaurant_id, user_id, rating, comment, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [restaurant_id, userId, rating, comment || null]
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
