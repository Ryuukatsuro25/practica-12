const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('token');
}

function setSession({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function currentUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; }
}

async function apiGet(path) {
  const headers = {};
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const r = await fetch(`${API_BASE}${path}`, { headers });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiPost(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const r = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiPut(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const r = await fetch(`${API_BASE}${path}`, { method: 'PUT', headers, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiPatch(path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const r = await fetch(`${API_BASE}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function guardAuth(required = true) {
  const u = currentUser();
  if (required && !u) {
    window.location.href = 'login.php';
  }
  return u;
}

function requireRole(...roles) {
  const u = guardAuth(true);
  if (!roles.includes(u?.role)) {
    alert('No autorizado');
    window.location.href = 'index.html';
  }
}

function navUserInfo() {
  const u = currentUser();
  const badge = u ? `<span class="badge bg-secondary badge-role">${u.role}</span>` : '';
  const name = u ? `Hola, ${u.name}` : 'Invitado';
  const navUser = document.getElementById('navUser');
  if (navUser) navUser.innerHTML = `${name} ${badge}`;
  const logout = document.getElementById('btnLogout');
  const login = document.getElementById('btnLogin');
  if (logout) logout.classList.toggle('d-none', !u);
  if (login) login.classList.toggle('d-none', !!u);

  document.querySelectorAll('[data-role]').forEach(el => {
    const r = el.getAttribute('data-role');
    el.style.display = (u && u.role === r) ? '' : 'none';
  });
}
