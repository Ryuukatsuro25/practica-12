import { query } from '../db/mysql.js';
import jwt from 'jsonwebtoken';

export async function me(req, res) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /,'');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = (await query(`SELECT id, name, username, email, role, restaurant_id, created_at
                               FROM users WHERE id=:id`, { id: payload.id }))[0];
    res.json(user);
  } catch (e) {
    res.status(401).json({error:'Token inválido'});
  }
}
