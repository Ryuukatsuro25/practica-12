// RappiWAO — Operaciones de administrador (demo)
import { loadDB, saveDB } from './storage.js';
import { id, nowISO } from './util.js';

export function listUsers(){
  const db = loadDB();
  return db.users.slice().sort((a,b) => (a.createdAt||'').localeCompare(b.createdAt||''));
}

export function getUser(userId){
  const db = loadDB();
  return db.users.find(u => u.id === userId) || null;
}

export function createUser({ role, name, email, password }){
  const db = loadDB();
  const normalized = String(email).toLowerCase().trim();
  if(db.users.some(u => u.email.toLowerCase() === normalized)){
    return { ok:false, error:'Ya existe un usuario con ese email.' };
  }
  const user = {
    id: id('usr'),
    role,
    status: 'active',
    name: String(name).trim(),
    email: normalized,
    password: String(password),
    createdAt: nowISO(),
  };
  db.users.push(user);
  saveDB(db);
  return { ok:true, user };
}

export function updateUser(userId, patch){
  const db = loadDB();
  const u = db.users.find(x => x.id === userId);
  if(!u) return { ok:false, error:'Usuario no encontrado.' };
  if(patch.role) u.role = patch.role;
  if(patch.status) u.status = patch.status;
  if(typeof patch.name === 'string') u.name = patch.name.trim();
  if(typeof patch.password === 'string' && patch.password) u.password = patch.password;
  saveDB(db);
  return { ok:true };
}

export function deleteUser(userId){
  const db = loadDB();
  db.users = db.users.filter(u => u.id !== userId);
  // Limpieza básica (mantener historial, pero desasociar)
  db.stores = db.stores.filter(s => s.ownerUserId !== userId);
  saveDB(db);
  return { ok:true };
}

export function listStoreApplications(){
  const db = loadDB();
  return db.storeApplications
    .slice()
    .sort((a,b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
}

export function approveStoreApplication({ appId, adminUserId }){
  const db = loadDB();
  const admin = db.users.find(u => u.id === adminUserId);
  if(!admin || admin.role !== 'admin') return { ok:false, error:'No autorizado.' };

  const app = db.storeApplications.find(a => a.id === appId);
  if(!app) return { ok:false, error:'Solicitud no encontrada.' };
  if(app.status !== 'pending') return { ok:false, error:'La solicitud ya fue revisada.' };

  const user = db.users.find(u => u.id === app.userId);
  if(!user) return { ok:false, error:'Usuario de la solicitud no encontrado.' };

  // Crear tienda y activar rol store
  user.role = 'store';
  const store = {
    id: id('sto'),
    ownerUserId: user.id,
    name: app.storeName,
    description: 'Nueva tienda en RappiWAO (pendiente de completar perfil).',
    logoUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60',
    bannerUrl: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=60',
    address: app.address,
    phone: app.phone,
    isActive: true,
    createdAt: nowISO(),
  };

  db.stores.push(store);
  app.status = 'approved';
  app.reviewedAt = nowISO();
  app.reviewerUserId = adminUserId;

  saveDB(db);
  return { ok:true, store };
}

export function rejectStoreApplication({ appId, adminUserId, notes='' }){
  const db = loadDB();
  const admin = db.users.find(u => u.id === adminUserId);
  if(!admin || admin.role !== 'admin') return { ok:false, error:'No autorizado.' };

  const app = db.storeApplications.find(a => a.id === appId);
  if(!app) return { ok:false, error:'Solicitud no encontrada.' };
  if(app.status !== 'pending') return { ok:false, error:'La solicitud ya fue revisada.' };

  app.status = 'rejected';
  app.reviewedAt = nowISO();
  app.reviewerUserId = adminUserId;
  app.notes = String(notes || '').trim();

  saveDB(db);
  return { ok:true };
}

export function adminUpsertStore(storeId, patch){
  const db = loadDB();
  const s = db.stores.find(x => x.id === storeId);
  if(!s) return { ok:false, error:'Tienda no encontrada.' };
  if(typeof patch.name === 'string') s.name = patch.name.trim();
  if(typeof patch.description === 'string') s.description = patch.description.trim();
  if(typeof patch.logoUrl === 'string') s.logoUrl = patch.logoUrl.trim();
  if(typeof patch.bannerUrl === 'string') s.bannerUrl = patch.bannerUrl.trim();
  if(typeof patch.address === 'string') s.address = patch.address.trim();
  if(typeof patch.phone === 'string') s.phone = patch.phone.trim();
  if(typeof patch.isActive === 'boolean') s.isActive = patch.isActive;
  saveDB(db);
  return { ok:true };
}

export function adminCreateProduct({ storeId, name, description, category, price, stock, imagesCsv, weightKg, dimensionsCm, shipping, isActive=true }){
  const db = loadDB();
  const store = db.stores.find(s => s.id === storeId);
  if(!store) return { ok:false, error:'Tienda no encontrada.' };

  const createdAt = nowISO();
  const product = {
    id: id('prd'),
    storeId,
    name: String(name).trim(),
    description: String(description || '').trim(),
    category: String(category || 'General').trim(),
    price: Number(price || 0),
    currency: 'COP',
    stock: Number(stock || 0),
    images: String(imagesCsv || '').split(',').map(s => s.trim()).filter(Boolean),
    weightKg: weightKg ? Number(weightKg) : null,
    dimensionsCm: dimensionsCm ? String(dimensionsCm).trim() : null,
    shipping: shipping ? String(shipping).trim() : 'Envío estándar',
    isActive: Boolean(isActive),
    createdAt,
    updatedAt: createdAt
  };
  db.products.push(product);
  saveDB(db);
  return { ok:true, product };
}

export function adminUpdateProduct(productId, patch){
  const db = loadDB();
  const p = db.products.find(x => x.id === productId);
  if(!p) return { ok:false, error:'Producto no encontrado.' };

  if(typeof patch.name === 'string') p.name = patch.name.trim();
  if(typeof patch.description === 'string') p.description = patch.description.trim();
  if(typeof patch.category === 'string') p.category = patch.category.trim();
  if(patch.price != null) p.price = Number(patch.price);
  if(patch.stock != null) p.stock = Number(patch.stock);
  if(typeof patch.imagesCsv === 'string') p.images = patch.imagesCsv.split(',').map(s => s.trim()).filter(Boolean);
  if(patch.weightKg != null) p.weightKg = patch.weightKg === '' ? null : Number(patch.weightKg);
  if(typeof patch.dimensionsCm === 'string') p.dimensionsCm = patch.dimensionsCm.trim() || null;
  if(typeof patch.shipping === 'string') p.shipping = patch.shipping.trim();
  if(typeof patch.isActive === 'boolean') p.isActive = patch.isActive;

  p.updatedAt = nowISO();
  saveDB(db);
  return { ok:true };
}

export function adminDeleteProduct(productId){
  const db = loadDB();
  db.products = db.products.filter(p => p.id !== productId);
  saveDB(db);
  return { ok:true };
}
