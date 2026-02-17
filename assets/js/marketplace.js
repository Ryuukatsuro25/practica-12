// RappiWAO — Marketplace core (productos, carrito, pedidos, reseñas)
import { loadDB, saveDB } from './storage.js';
import { id, nowISO, clamp } from './util.js';

export function listStores({ includeInactive=false } = {}){
  const db = loadDB();
  const stores = db.stores.slice();
  return includeInactive ? stores : stores.filter(s => s.isActive);
}

export function getStore(storeId){
  const db = loadDB();
  return db.stores.find(s => s.id === storeId) || null;
}

export function listProducts({ storeId=null, query='', category='' } = {}){
  const db = loadDB();
  let items = db.products.filter(p => p.isActive);

  if(storeId) items = items.filter(p => p.storeId === storeId);
  if(category) items = items.filter(p => p.category === category);
  if(query){
    const q = String(query).toLowerCase().trim();
    items = items.filter(p => (p.name + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q));
  }
  return items;
}

export function getProduct(productId){
  const db = loadDB();
  return db.products.find(p => p.id === productId) || null;
}

export function listCategories(){
  const db = loadDB();
  const set = new Set(db.products.filter(p => p.isActive).map(p => p.category));
  return Array.from(set).sort((a,b) => a.localeCompare(b, 'es'));
}

export function getStoreByOwnerUserId(ownerUserId){
  const db = loadDB();
  return db.stores.find(s => s.ownerUserId === ownerUserId) || null;
}

export function getReviewsForTarget({ type, targetId }){
  const db = loadDB();
  return db.reviews
    .filter(r => !r.isHidden)
    .filter(r => r.type === type && r.targetId === targetId)
    .sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getAllReviews({ includeHidden=false } = {}){
  const db = loadDB();
  const all = includeHidden ? db.reviews.slice() : db.reviews.filter(r => !r.isHidden);
  return all.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function avgRatingForTarget({ type, targetId }){
  const reviews = getReviewsForTarget({ type, targetId });
  if(!reviews.length) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
  return { avg: sum / reviews.length, count: reviews.length };
}

export function cartGet(userId){
  const db = loadDB();
  const cart = db.carts?.[userId] || { items: [], updatedAt: null };
  // Normaliza
  cart.items = (cart.items || []).filter(it => it.productId && it.qty > 0);
  return cart;
}

export function cartSet(userId, cart){
  const db = loadDB();
  db.carts = db.carts || {};
  db.carts[userId] = { items: cart.items || [], updatedAt: nowISO() };
  saveDB(db);
}

export function cartAddItem(userId, productId, qty=1){
  const db = loadDB();
  const product = db.products.find(p => p.id === productId && p.isActive);
  if(!product) return { ok:false, error:'Producto no disponible.' };

  const cart = cartGet(userId);
  const found = cart.items.find(i => i.productId === productId);
  const newQty = clamp((found?.qty || 0) + Number(qty || 1), 1, 999);
  if(found) found.qty = newQty;
  else cart.items.push({ productId, qty: newQty });

  cartSet(userId, cart);
  return { ok:true };
}

export function cartUpdateQty(userId, productId, qty){
  const cart = cartGet(userId);
  const n = Number(qty);
  cart.items = cart.items.map(it => it.productId === productId ? ({...it, qty: clamp(n, 1, 999)}) : it);
  cartSet(userId, cart);
  return { ok:true };
}

export function cartRemoveItem(userId, productId){
  const cart = cartGet(userId);
  cart.items = cart.items.filter(it => it.productId !== productId);
  cartSet(userId, cart);
  return { ok:true };
}

export function cartClear(userId){
  cartSet(userId, { items: [] });
  return { ok:true };
}

export function cartExpanded(userId){
  const db = loadDB();
  const cart = cartGet(userId);

  const items = cart.items.map(it => {
    const p = db.products.find(pp => pp.id === it.productId);
    if(!p) return null;
    const store = db.stores.find(s => s.id === p.storeId) || null;
    return {
      productId: p.id,
      name: p.name,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      qty: it.qty,
      storeId: p.storeId,
      storeName: store?.name || 'Tienda',
      image: (p.images && p.images[0]) || null
    };
  }).filter(Boolean);

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  return { items, total, currency: 'COP' };
}

export function checkout({ userId, shippingAddress, paymentMethod='contraentrega', notes='' }){
  const db = loadDB();
  const cart = cartGet(userId);
  if(!cart.items.length) return { ok:false, error:'Tu carrito está vacío.' };

  // Validar stock
  for(const it of cart.items){
    const p = db.products.find(pp => pp.id === it.productId && pp.isActive);
    if(!p) return { ok:false, error:'Un producto del carrito ya no está disponible.' };
    if(p.stock < it.qty) return { ok:false, error:`Stock insuficiente para "${p.name}". Disponible: ${p.stock}` };
  }

  // Crear order snapshot
  const orderId = id('ord');
  const createdAt = nowISO();
  const items = cart.items.map(it => {
    const p = db.products.find(pp => pp.id === it.productId);
    return {
      productId: p.id,
      storeId: p.storeId,
      nameSnapshot: p.name,
      priceSnapshot: p.price,
      qty: it.qty
    };
  });

  const total = items.reduce((sum, it) => sum + it.priceSnapshot * it.qty, 0);

  // Descontar stock
  for(const it of cart.items){
    const p = db.products.find(pp => pp.id === it.productId);
    p.stock = Math.max(0, Number(p.stock) - Number(it.qty));
    p.updatedAt = createdAt;
  }

  const order = {
    id: orderId,
    userId,
    status: 'placed', // placed | completed | cancelled
    createdAt,
    currency: 'COP',
    total,
    shippingAddress: String(shippingAddress || '').trim(),
    paymentMethod,
    notes: String(notes || '').trim(),
    items
  };

  db.orders.push(order);
  // limpiar carrito
  db.carts = db.carts || {};
  db.carts[userId] = { items: [], updatedAt: createdAt };
  saveDB(db);

  return { ok:true, order };
}

export function listOrdersByUser(userId){
  const db = loadDB();
  return db.orders
    .filter(o => o.userId === userId)
    .sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function listOrdersForStoreOwner(storeOwnerUserId){
  const db = loadDB();
  const store = db.stores.find(s => s.ownerUserId === storeOwnerUserId);
  if(!store) return [];

  const storeId = store.id;
  const orders = db.orders
    .filter(o => (o.items || []).some(it => it.storeId === storeId))
    .map(o => ({
      ...o,
      items: (o.items || []).filter(it => it.storeId === storeId)
    }))
    .sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return orders;
}

export function markOrderStatus({ orderId, status }){
  const db = loadDB();
  const o = db.orders.find(x => x.id === orderId);
  if(!o) return { ok:false, error:'Pedido no encontrado.' };
  o.status = status;
  saveDB(db);
  return { ok:true };
}

export function userHasPurchasedProduct(userId, productId){
  const db = loadDB();
  return db.orders.some(o =>
    o.userId === userId &&
    (o.status === 'placed' || o.status === 'completed') &&
    (o.items || []).some(it => it.productId === productId)
  );
}

export function userHasPurchasedFromStore(userId, storeId){
  const db = loadDB();
  return db.orders.some(o =>
    o.userId === userId &&
    (o.status === 'placed' || o.status === 'completed') &&
    (o.items || []).some(it => it.storeId === storeId)
  );
}

export function userAlreadyReviewed({ userId, type, targetId }){
  const db = loadDB();
  return db.reviews.some(r => r.userId === userId && r.type === type && r.targetId === targetId);
}

export function createReview({ userId, type, targetId, rating, comment }){
  const db = loadDB();
  const r = clamp(Number(rating || 0), 1, 5);
  const text = String(comment || '').trim();
  if(text.length < 3) return { ok:false, error:'El comentario es muy corto.' };

  // Reglas post-compra
  if(type === 'product'){
    if(!userHasPurchasedProduct(userId, targetId)) return { ok:false, error:'Solo puedes calificar productos que hayas comprado.' };
  }
  if(type === 'store'){
    if(!userHasPurchasedFromStore(userId, targetId)) return { ok:false, error:'Solo puedes calificar tiendas donde hayas comprado.' };
  }
  if(userAlreadyReviewed({ userId, type, targetId })) return { ok:false, error:'Ya dejaste una reseña para este elemento.' };

  let storeId = null;
  let productId = null;
  if(type === 'product'){
    const p = db.products.find(pp => pp.id === targetId);
    if(!p) return { ok:false, error:'Producto no encontrado.' };
    productId = p.id;
    storeId = p.storeId;
  } else if(type === 'store'){
    const s = db.stores.find(ss => ss.id === targetId);
    if(!s) return { ok:false, error:'Tienda no encontrada.' };
    storeId = s.id;
  } else {
    return { ok:false, error:'Tipo de reseña inválido.' };
  }

  const createdAt = nowISO();
  const review = {
    id: id('rev'),
    type,
    targetId,
    productId,
    storeId,
    userId,
    rating: r,
    comment: text,
    createdAt,
    updatedAt: createdAt,
    storeReply: null,
    isHidden: false
  };

  db.reviews.push(review);
  saveDB(db);
  return { ok:true, review };
}

export function replyToReview({ storeOwnerUserId, reviewId, comment }){
  const db = loadDB();
  const store = db.stores.find(s => s.ownerUserId === storeOwnerUserId);
  if(!store) return { ok:false, error:'No tienes tienda asociada.' };

  const review = db.reviews.find(r => r.id === reviewId);
  if(!review) return { ok:false, error:'Reseña no encontrada.' };
  if(review.storeId !== store.id) return { ok:false, error:'No puedes responder reseñas de otras tiendas.' };

  const text = String(comment || '').trim();
  if(text.length < 2) return { ok:false, error:'La respuesta es muy corta.' };

  review.storeReply = {
    comment: text,
    repliedAt: nowISO(),
    storeUserId: storeOwnerUserId
  };
  review.updatedAt = nowISO();
  saveDB(db);

  return { ok:true };
}

export function adminModerateReview({ adminUserId, reviewId, action, payload }){
  const db = loadDB();
  const admin = db.users.find(u => u.id === adminUserId);
  if(!admin || admin.role !== 'admin') return { ok:false, error:'No autorizado.' };

  const review = db.reviews.find(r => r.id === reviewId);
  if(!review) return { ok:false, error:'Reseña no encontrada.' };

  if(action === 'hide'){ review.isHidden = true; }
  if(action === 'unhide'){ review.isHidden = false; }
  if(action === 'delete'){
    db.reviews = db.reviews.filter(r => r.id !== reviewId);
  }
  if(action === 'edit'){
    const text = String(payload?.comment || '').trim();
    if(text.length < 3) return { ok:false, error:'Comentario demasiado corto.' };
    review.comment = text;
    review.updatedAt = nowISO();
  }
  saveDB(db);
  return { ok:true };
}
