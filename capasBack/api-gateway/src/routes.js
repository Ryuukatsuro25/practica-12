const JWT_SECRET = process.env.JWT_SECRET || 'uao_super_secret';

import { Router } from 'express';
import jwt from 'jsonwebtoken';

const r = Router();

// Puertos de los microservicios
const AUTH = 4001;
const USERS = 4002;
const RESTS = 4003;
const PROD = 4004;
const ORD = 4005;
const REV = 4006;

// ---------------- Helper ----------------
const call = async (port, path, method = 'GET', body = null, req = null) => {
  const url = `http://localhost:${port}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (req?.headers?.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const options = { method, headers };
  if (body !== null && body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const resp = await fetch(url, options);
  const text = await resp.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { status: resp.status, ok: resp.ok, data };
};

const proxy = (handler) => async (req, res) => {
  try {
    const result = await handler(req, res);
    if (!result) {
      return res.status(500).json({ error: 'Respuesta vacía del servicio' });
    }
    res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Error en API Gateway:', err);
    res.status(502).json({ error: 'Servicio interno no disponible' });
  }
};

// ------------- Auth middleware ----------
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';

  console.log('Authorization recibido:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  // Soportar "Bearer <token>" o solo "<token>"
  const parts = authHeader.split(' ');
  const token =
    parts.length === 2 && /^Bearer$/i.test(parts[0])
      ? parts[1]
      : authHeader;

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    console.error('Error verificando JWT:', e.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// =============== AUTH ===================

r.post(
  '/auth/register',
  proxy((req) => call(AUTH, '/register', 'POST', req.body, req))
);

r.post(
  '/auth/register-restaurant',
  proxy((req) =>
    call(AUTH, '/register-restaurant', 'POST', req.body, req)
  )
);

r.post(
  '/auth/login',
  proxy((req) => call(AUTH, '/login', 'POST', req.body, req))
);

// =============== USERS ==================

r.get(
  '/users/me',
  requireAuth,
  proxy((req) => call(USERS, '/me', 'GET', null, req))
);

// ============ RESTAURANTS ==============

r.get(
  '/restaurants',
  proxy((req) => {
    const qs = new URLSearchParams(req.query).toString();
    const path = qs ? `/?${qs}` : '/';
    return call(RESTS, path, 'GET', null, req);
  })
);

r.get(
  '/restaurants/:id',
  proxy((req) => call(RESTS, `/${req.params.id}`, 'GET', null, req))
);

r.post(
  '/restaurants',
  requireAuth,
  proxy((req) => call(RESTS, '/', 'POST', req.body, req))
);

// ============== PRODUCTS ===============

r.get(
  '/restaurants/:id/products',
  proxy((req) =>
    call(PROD, `/by-restaurant/${req.params.id}`, 'GET', null, req)
  )
);

r.get(
  '/public/restaurants/:id/products',
  proxy((req) =>
    call(PROD, `/by-restaurant/${req.params.id}`, 'GET', null, req)
  )
);

r.post(
  '/products',
  requireAuth,
  proxy((req) => call(PROD, '/', 'POST', req.body, req))
);

// =============== ORDERS =================

r.post(
  '/orders',
  requireAuth,
  proxy((req) => call(ORD, '/', 'POST', req.body, req))
);

r.get(
  '/orders/my',
  requireAuth,
  proxy((req) => call(ORD, '/my', 'GET', null, req))
);

r.get(
  '/my/orders',
  requireAuth,
  proxy((req) => call(ORD, '/my', 'GET', null, req))
);

// =============== REVIEWS ================

r.get(
  '/restaurants/:id/reviews',
  proxy((req) =>
    call(REV, `/by-restaurant/${req.params.id}`, 'GET', null, req)
  )
);

r.get(
  '/restaurants/:id/reviews/summary',
  proxy((req) =>
    call(REV, `/summary/${req.params.id}`, 'GET', null, req)
  )
);

r.post(
  '/restaurants/:id/reviews',
  requireAuth,
  proxy((req) => {
    const body = {
      ...req.body,
      restaurant_id: Number(req.params.id),
    };
    return call(REV, '/', 'POST', body, req);
  })
);

r.post(
  '/reviews',
  requireAuth,
  proxy((req) => call(REV, '/', 'POST', req.body, req))
);

export default r;
