// RappiWAO — Operaciones de Tienda (owner)
import { loadDB, saveDB } from './storage.js';
import { id, nowISO } from './util.js';

export function getMyStore(ownerUserId){
  const db = loadDB();
  return db.stores.find(s => s.ownerUserId === ownerUserId) || null;
}

export function updateMyStore(ownerUserId, patch){
  const db = loadDB();
  const s = db.stores.find(x => x.ownerUserId === ownerUserId);
  if(!s) return { ok:false, error:'No tienes tienda asociada (¿aún no aprobada?).' };

  if(typeof patch.name === 'string') s.name = patch.name.trim();
  if(typeof patch.description === 'string') s.description = patch.description.trim();
  if(typeof patch.logoUrl === 'string') s.logoUrl = patch.logoUrl.trim();
  if(typeof patch.bannerUrl === 'string') s.bannerUrl = patch.bannerUrl.trim();
  if(typeof patch.address === 'string') s.address = patch.address.trim();
  if(typeof patch.phone === 'string') s.phone = patch.phone.trim();
  saveDB(db);
  return { ok:true };
}

export function listMyProducts(ownerUserId){
  const db = loadDB();
  const s = db.stores.find(st => st.ownerUserId === ownerUserId);
  if(!s) return [];
  return db.products
    .filter(p => p.storeId === s.id)
    .sort((a,b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export function createMyProduct(ownerUserId, { name, description, category, price, stock, imagesCsv, weightKg, dimensionsCm, shipping, isActive=true }){
  const db = loadDB();
  const store = db.stores.find(s => s.ownerUserId === ownerUserId);
  if(!store) return { ok:false, error:'No tienes tienda asociada.' };

  const createdAt = nowISO();
  const product = {
    id: id('prd'),
    storeId: store.id,
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

export function updateMyProduct(ownerUserId, productId, patch){
  const db = loadDB();
  const store = db.stores.find(s => s.ownerUserId === ownerUserId);
  if(!store) return { ok:false, error:'No tienes tienda asociada.' };

  const p = db.products.find(x => x.id === productId);
  if(!p) return { ok:false, error:'Producto no encontrado.' };
  if(p.storeId !== store.id) return { ok:false, error:'No puedes editar productos de otras tiendas.' };

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

export function deleteMyProduct(ownerUserId, productId){
  const db = loadDB();
  const store = db.stores.find(s => s.ownerUserId === ownerUserId);
  if(!store) return { ok:false, error:'No tienes tienda asociada.' };

  const p = db.products.find(x => x.id === productId);
  if(!p) return { ok:false, error:'Producto no encontrado.' };
  if(p.storeId !== store.id) return { ok:false, error:'No puedes borrar productos de otras tiendas.' };

  db.products = db.products.filter(x => x.id !== productId);
  saveDB(db);
  return { ok:true };
}
