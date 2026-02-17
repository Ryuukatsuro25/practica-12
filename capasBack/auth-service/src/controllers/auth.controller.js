const JWT_SECRET = process.env.JWT_SECRET || 'uao_super_secret';

import { query } from '../db/mysql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ========================================
// Registro de cliente normal
// POST /auth/register
// Body: { name, username, email, password }
// ========================================
export async function register(req, res) {
  try {
    const { name, username, email, password } = req.body || {};

    if (!name || !username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Nombre, usuario, email y contraseña son obligatorios' });
    }

    // comprobar si ya existe usuario o email
    const existing = await query(
      `SELECT id FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username, email]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: 'El usuario o email ya existe. Usa otro.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, username, email, password, role, restaurant_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, username, email, hashed, 'client', null]
    );

    res.status(201).json({ ok: true, user_id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

// ========================================
// Registro de restaurante + propietario
// POST /auth/register-restaurant
// Body:
// {
//   owner_name, username, email, password,
//   restaurant_name, restaurant_description, logo_url
// }
// ========================================
export async function registerRestaurant(req, res) {
  try {
    const {
      owner_name,
      username,
      email,
      password,
      restaurant_name,
      restaurant_description,
      logo_url,
    } = req.body || {};

    if (!owner_name || !username || !email || !password || !restaurant_name) {
      return res.status(400).json({
        error:
          'owner_name, username, email, password y restaurant_name son obligatorios',
      });
    }

    const existing = await query(
      `SELECT id FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username, email]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: 'El usuario o email ya existe. Usa otro.' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1) Crear restaurante
    const restaurantResult = await query(
      `INSERT INTO restaurants (name, description, logo_url)
       VALUES (?, ?, ?)`,
      [restaurant_name, restaurant_description || null, logo_url || null]
    );

    const restaurant_id = restaurantResult.insertId;

    // 2) Crear usuario propietario asociado a ese restaurante
    const userResult = await query(
      `INSERT INTO users (name, username, email, password, role, restaurant_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [owner_name, username, email, hashed, 'restaurant_owner', restaurant_id]
    );

    res.status(201).json({
      ok: true,
      restaurant_id,
      user_id: userResult.insertId,
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}

// ========================================
// Login
// POST /auth/login
// Body admite varias formas:
//   { username, password }
//   { email, password }
//   { correo, pass }
// ========================================
export async function login(req, res) {
  try {
    console.log('BODY LOGIN:', req.body);

    const username = req.body.username || req.body.user || null;
    const email = req.body.email || req.body.correo || null;
    const password = req.body.password || req.body.pass || null;

    const usernameOrEmail = username || email;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        error: 'Usuario/email y contraseña son obligatorios',
      });
    }

    const rows = await query(
      `SELECT *
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [usernameOrEmail, usernameOrEmail]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Acepta contraseña hasheada o en texto plano en la BD
    let ok = false;
    if (user.password && user.password.startsWith('$2')) {
      ok = await bcrypt.compare(password, user.password);
    } else {
      ok = password === user.password;
    }

    if (!ok) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
    restaurant_id: user.restaurant_id,
    name: user.name,
  },
  JWT_SECRET,
  { expiresIn: '8h' }
);


    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        restaurant_id: user.restaurant_id,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}
