// RappiWAO — App principal (SPA sin frameworks)
import { loadDB, saveDB, resetDB, exportDB, importDBFromFile } from './storage.js';
import { currentUser, login, logout, registerCustomer, registerStoreApplication, requireLogin } from './auth.js';
import { getPath, matchRoute, navigate } from './router.js';
import { escapeHTML, formatMoneyCOP, clamp } from './util.js';
import { toast, renderStars, renderStarPicker, confirmDialog, scrollToTop } from './ui.js';
import {
  listStores, getStore, listProducts, getProduct, listCategories,
  cartExpanded, cartAddItem, cartUpdateQty, cartRemoveItem, checkout, listOrdersByUser,
  listOrdersForStoreOwner, markOrderStatus,
  getReviewsForTarget, avgRatingForTarget, createReview, replyToReview,
  adminModerateReview, getStoreByOwnerUserId
} from './marketplace.js';
import {
  listUsers, createUser, updateUser, deleteUser,
  listStoreApplications, approveStoreApplication, rejectStoreApplication,
  adminUpsertStore, adminCreateProduct, adminUpdateProduct, adminDeleteProduct
} from './admin.js';
import {
  getMyStore, updateMyStore, listMyProducts,
  createMyProduct, updateMyProduct, deleteMyProduct
} from './store.js';

const state = {
  productsQuery: '',
  productsCategory: '',
  adminTab: 'users', // users | storeApps | stores | products | reviews | settings
  storeTab: 'products', // products | orders | reviews | profile
};

function init(){
  loadDB(); // asegura seed
  render();
  window.addEventListener('hashchange', () => render());
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('change', onChange);

  // Tip: registra service worker solo si existe (no es obligatorio)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function render(){
  renderNav();
  renderRoute();
}

function renderNav(){
  const nav = document.getElementById('nav');
  if(!nav) return;

  const u = currentUser();
  const links = [];

  const common = [
    ['Inicio', '#/'],
    ['Tiendas', '#/stores'],
    ['Productos', '#/products']
  ];
  for(const [label, href] of common){
    links.push(`<a href="${href}">${escapeHTML(label)}</a>`);
  }

  if(u?.role === 'customer'){
    const c = cartExpanded(u.id);
    const count = c.items.reduce((s, it) => s + it.qty, 0);
    links.push(`<a href="#/cart">Carrito${count ? ` (${count})` : ''}</a>`);
    links.push(`<a href="#/orders">Mis pedidos</a>`);
    links.push(`<a href="#/profile">Mi perfil</a>`);
  }

  if(u?.role === 'store'){
    links.push(`<a href="#/store-dashboard">Panel Tienda</a>`);
  }

  if(u?.role === 'store_pending'){
    links.push(`<a href="#/store-application">Mi solicitud</a>`);
  }

  if(u?.role === 'admin'){
    links.push(`<a href="#/admin">Panel Admin</a>`);
  }

  if(!u){
    links.push(`<a href="#/login">Login</a>`);
  } else {
    links.push(`<button data-action="logout">Salir</button>`);
  }

  nav.innerHTML = links.join('');
}

function renderRoute(){
  const app = document.getElementById('app');
  if(!app) return;

  const route = matchRoute(getPath());
  const u = currentUser();

  if(route.name === 'home') app.innerHTML = viewHome();
  else if(route.name === 'stores') app.innerHTML = viewStores();
  else if(route.name === 'store') app.innerHTML = viewStore(route.params[0]);
  else if(route.name === 'products') app.innerHTML = viewProducts();
  else if(route.name === 'product') app.innerHTML = viewProduct(route.params[0]);
  else if(route.name === 'cart') app.innerHTML = viewCart();
  else if(route.name === 'login') app.innerHTML = viewLogin();
  else if(route.name === 'registerCustomer') app.innerHTML = viewRegisterCustomer();
  else if(route.name === 'registerStore') app.innerHTML = viewRegisterStore();
  else if(route.name === 'profile') app.innerHTML = viewProfile();
  else if(route.name === 'orders') app.innerHTML = viewOrders();
  else if(route.name === 'admin') app.innerHTML = viewAdmin();
  else if(route.name === 'storeDashboard') app.innerHTML = viewStoreDashboard();
  else if(route.name === 'storeApplication') app.innerHTML = viewStoreApplication();
  else app.innerHTML = viewNotFound();

  // Enfoca el main (accesibilidad)
  scrollToTop();

  // Enforce auth on some routes (por UI — no seguridad real)
  const needs = new Set(['cart','profile','orders','admin','storeDashboard','storeApplication']);
  if(needs.has(route.name) && !u){
    toast('Inicia sesión', 'Debes iniciar sesión para ver esta sección.', 'warn');
    navigate('#/login');
    return;
  }
  if(route.name === 'admin' && u && u.role !== 'admin'){
    toast('Acceso denegado', 'Solo el Administrador puede entrar aquí.', 'danger');
    navigate('#/');
    return;
  }
  if(route.name === 'storeDashboard' && u && u.role !== 'store'){
    toast('Acceso denegado', 'Solo Tiendas aprobadas pueden entrar al panel.', 'danger');
    navigate('#/');
    return;
  }
  if(route.name === 'storeApplication' && u && u.role !== 'store_pending'){
    toast('No aplica', 'Esta sección es para solicitudes de tienda en revisión.', 'warn');
    navigate('#/');
    return;
  }
}

function viewHome(){
  const db = loadDB();
  const stores = listStores();
  const products = listProducts().slice(0, 8);

  const kpiProducts = db.products.filter(p => p.isActive).length;
  const kpiStores = db.stores.filter(s => s.isActive).length;
  const kpiOrders = db.orders.length;

  const u = currentUser();

  return `
  <section class="hero">
    <div class="card hero__panel">
      <div class="card__inner">
        <div class="badge">Marketplace Multirrol · Admin / Tienda / Cliente / Visitante</div>
        <h1 class="hero__title">RappiWAO</h1>
        <p class="hero__lead">
          Plataforma tipo marketplace con <strong>carrito universal</strong> (varias tiendas en un solo pedido),
          <strong>reseñas 1–5 estrellas</strong>, respuestas de tienda y <strong>moderación</strong> del administrador.
          <br /><br />
          En esta versión, <strong>toda la información se guarda en el navegador</strong> como JSON en <code>localStorage</code>
          (sin backend) para que puedas desplegarlo en Vercel como sitio estático.
        </p>

        <div class="hero__cta">
          <a class="btn btn--primary" href="#/products">Explorar productos</a>
          <a class="btn" href="#/stores">Ver tiendas</a>
          ${!u ? `<a class="btn" href="#/login">Iniciar sesión</a>` : ``}
          ${!u ? `<a class="btn btn--ghost" href="#/register-customer">Registrarme (cliente)</a>` : ``}
        </div>

        <div class="kpis">
          <div class="kpi">
            <div class="kpi__num">${kpiStores}</div>
            <div class="kpi__label">Tiendas activas</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">${kpiProducts}</div>
            <div class="kpi__label">Productos físicos</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">${kpiOrders}</div>
            <div class="kpi__label">Pedidos (demo)</div>
          </div>
        </div>

        <hr class="sep" />
        <div class="hint">
          <strong>Credenciales de demo:</strong><br/>
          Admin: <code>admin@rappiwao.com</code> · <code>Admin123!</code><br/>
          Tienda: <code>tech@store.com</code> / <code>hogar@store.com</code> / <code>fitness@store.com</code> · <code>Store123!</code><br/>
          Cliente: <code>juan@cliente.com</code> · <code>Cliente123!</code>
        </div>
      </div>
    </div>

    <div class="card hero__panel">
      <div class="card__inner">
        <h2 class="card__title">Accesos por perfil</h2>
        <div class="list">
          <div class="kpi">
            <div class="kpi__num">Administrador</div>
            <div class="kpi__label">Gestión total · usuarios · tiendas · moderación · configuración</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">Tienda</div>
            <div class="kpi__label">Catálogo propio · precios · stock · respuesta a reseñas · pedidos por tienda</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">Cliente</div>
            <div class="kpi__label">Carrito universal · compras · historial · reseñas post-compra</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">Visitante</div>
            <div class="kpi__label">Modo exploración (sin carrito / compras / reseñas)</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <hr class="sep" />

  <section class="grid">
    <div class="col-12">
      <div class="row">
        <h2 style="margin:0;">Destacados</h2>
        <a href="#/products" class="btn btn--ghost">Ver todo</a>
      </div>
    </div>

    ${products.map(p => productCard(p)).join('')}
  </section>

  <hr class="sep" />

  <section class="grid">
    <div class="col-12">
      <div class="row">
        <h2 style="margin:0;">Tiendas</h2>
        <a href="#/stores" class="btn btn--ghost">Explorar</a>
      </div>
    </div>

    ${stores.slice(0, 6).map(s => storeCard(s)).join('')}
  </section>
  `;
}

function viewStores(){
  const stores = listStores();
  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">Tiendas</h1>
      <p class="card__subtitle">Explora tiendas registradas (modo visitante permitido).</p>
    </div>
  </section>

  <div style="height:14px;"></div>

  <section class="grid">
    ${stores.map(s => storeCard(s)).join('')}
  </section>
  `;
}

function viewStore(storeId){
  const store = getStore(storeId);
  if(!store) return viewNotFound();

  const products = listProducts({ storeId: store.id });
  const u = currentUser();

  const rating = avgRatingForTarget({ type:'store', targetId: store.id });
  const storeReviews = getReviewsForTarget({ type:'store', targetId: store.id });

  return `
  <section class="card">
    <div class="card__inner">
      <div class="row" style="align-items:flex-start;">
        <div style="display:flex; gap:12px; align-items:center;">
          <img src="${escapeHTML(store.logoUrl)}" alt="" style="width:56px; height:56px; border-radius:14px; object-fit:cover; border:1px solid var(--border);" />
          <div>
            <h1 class="card__title" style="margin-bottom:6px;">${escapeHTML(store.name)}</h1>
            <div class="mini">${escapeHTML(store.description)}</div>
            <div style="margin-top:8px;">${renderStars(Math.round(rating.avg))} <span class="mini">(${rating.count} reseñas de tienda)</span></div>
          </div>
        </div>
        <div class="pills">
          <a class="btn btn--ghost" href="#/stores">← Volver</a>
        </div>
      </div>

      <hr class="sep" />

      <div class="grid">
        <div class="col-6">
          <div class="badge">Dirección</div>
          <div style="margin-top:8px;">${escapeHTML(store.address || '-')}</div>
        </div>
        <div class="col-6">
          <div class="badge">Contacto</div>
          <div style="margin-top:8px;">${escapeHTML(store.phone || '-')}</div>
        </div>
      </div>
    </div>
  </section>

  <div style="height:14px;"></div>

  <section class="grid">
    <div class="col-12">
      <div class="row">
        <h2 style="margin:0;">Productos de ${escapeHTML(store.name)}</h2>
        <a href="#/products" class="btn btn--ghost">Ver todos los productos</a>
      </div>
    </div>
    ${products.length ? products.map(p => productCard(p)).join('') : `
      <div class="col-12">
        <div class="card"><div class="card__inner">
          <p class="card__subtitle">Esta tienda aún no tiene productos activos.</p>
        </div></div>
      </div>
    `}
  </section>

  <hr class="sep" />

  <section class="grid">
    <div class="col-12">
      <h2 style="margin:0;">Reseñas de tienda</h2>
      <p class="mini" style="margin-top:6px;">Solo clientes que compraron en la tienda pueden calificar.</p>
    </div>

    <div class="col-6">
      ${u?.role === 'customer'
        ? reviewForm({ type:'store', targetId: store.id })
        : `<div class="card"><div class="card__inner"><p class="card__subtitle">Inicia sesión como <strong>cliente</strong> para dejar reseñas.</p></div></div>`
      }
    </div>

    <div class="col-6">
      <div class="card">
        <div class="card__inner">
          <h3 class="card__title">Últimas reseñas</h3>
          ${storeReviews.length ? storeReviews.map(r => reviewCard(r)).join('<hr class="sep" />') : `<p class="card__subtitle">Aún no hay reseñas para esta tienda.</p>`}
        </div>
      </div>
    </div>
  </section>
  `;
}

function viewProducts(){
  const categories = listCategories();
  const products = listProducts({ query: state.productsQuery, category: state.productsCategory });

  return `
  <section class="card">
    <div class="card__inner">
      <div class="row">
        <div>
          <h1 class="card__title">Productos</h1>
          <p class="card__subtitle">Productos físicos disponibles en múltiples tiendas.</p>
        </div>
        <div class="pills">
          <a class="btn btn--ghost" href="#/cart">Ir al carrito</a>
        </div>
      </div>

      <form class="form" data-form="product-filters" style="margin-top:10px;">
        <div class="grid">
          <div class="col-6 field">
            <label>Buscar</label>
            <input name="q" placeholder="Ej: audífonos, licuadora, yoga..." value="${escapeHTML(state.productsQuery)}" />
          </div>
          <div class="col-6 field">
            <label>Categoría</label>
            <select name="cat">
              <option value="">Todas</option>
              ${categories.map(c => `<option value="${escapeHTML(c)}" ${c===state.productsCategory?'selected':''}>${escapeHTML(c)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="row" style="justify-content:flex-end;">
          <button class="btn btn--ghost" type="button" data-action="clear-product-filters">Limpiar</button>
          <button class="btn btn--primary" type="submit">Aplicar</button>
        </div>
      </form>
    </div>
  </section>

  <div style="height:14px;"></div>

  <section class="grid">
    ${products.length ? products.map(p => productCard(p)).join('') : `
      <div class="col-12"><div class="card"><div class="card__inner">
        <p class="card__subtitle">No se encontraron productos con esos filtros.</p>
      </div></div></div>
    `}
  </section>
  `;
}

function viewProduct(productId){
  const p = getProduct(productId);
  if(!p) return viewNotFound();

  const store = getStore(p.storeId);
  const u = currentUser();
  const reviews = getReviewsForTarget({ type:'product', targetId: p.id });
  const rating = avgRatingForTarget({ type:'product', targetId: p.id });

  const img = (p.images && p.images[0]) || store?.logoUrl || '';
  return `
  <section class="card">
    <div class="card__inner">
      <div class="row" style="align-items:flex-start;">
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <img src="${escapeHTML(img)}" alt="" style="width:140px; height:110px; border-radius:14px; object-fit:cover; border:1px solid var(--border);" />
          <div>
            <h1 class="card__title">${escapeHTML(p.name)}</h1>
            <div class="mini">Tienda: <a href="#/store/${escapeHTML(store?.id || '')}" style="color:var(--link); text-decoration:none;">${escapeHTML(store?.name || '—')}</a></div>
            <div style="margin-top:8px;">${renderStars(Math.round(rating.avg))} <span class="mini">(${rating.count} reseñas)</span></div>
            <div style="margin-top:10px;" class="price">${formatMoneyCOP(p.price)}</div>
            <div class="mini" style="margin-top:6px;">Stock: ${p.stock} · Envío: ${escapeHTML(p.shipping || '—')}</div>
          </div>
        </div>
        <div class="pills">
          <a class="btn btn--ghost" href="#/products">← Volver</a>
        </div>
      </div>

      <hr class="sep" />
      <div class="grid">
        <div class="col-8">
          <h3 style="margin:0 0 8px;">Descripción</h3>
          <div class="mini" style="line-height:1.6;">${escapeHTML(p.description)}</div>
          <div style="height:12px;"></div>
          <div class="badge">Detalles físicos</div>
          <div class="mini" style="margin-top:8px;">Peso: ${p.weightKg ?? '—'} kg · Dimensiones: ${escapeHTML(p.dimensionsCm ?? '—')} cm</div>
        </div>
        <div class="col-4">
          <div class="card" style="background: rgba(22,26,36,.25);">
            <div class="card__inner">
              <h3 class="card__title">Comprar</h3>
              ${u?.role === 'customer'
                ? `
                  <div class="field">
                    <label>Cantidad</label>
                    <input type="number" min="1" max="999" value="1" data-qty-input="${escapeHTML(p.id)}" />
                  </div>
                  <div class="actions">
                    <button class="btn btn--primary" data-action="add-to-cart" data-product-id="${escapeHTML(p.id)}">Agregar al carrito</button>
                    <a class="btn btn--ghost" href="#/cart">Ver carrito</a>
                  </div>
                `
                : `
                  <p class="card__subtitle">Para comprar necesitas iniciar sesión como <strong>cliente</strong>.</p>
                  <div class="actions">
                    <a class="btn btn--primary" href="#/login">Iniciar sesión</a>
                    <a class="btn btn--ghost" href="#/register-customer">Registrarme</a>
                  </div>
                `
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <hr class="sep" />

  <section class="grid">
    <div class="col-6">
      ${u?.role === 'customer'
        ? reviewForm({ type:'product', targetId: p.id })
        : `<div class="card"><div class="card__inner"><p class="card__subtitle">Inicia sesión como <strong>cliente</strong> para dejar reseñas.</p></div></div>`
      }
    </div>

    <div class="col-6">
      <div class="card">
        <div class="card__inner">
          <h3 class="card__title">Reseñas del producto</h3>
          ${reviews.length ? reviews.map(r => reviewCard(r)).join('<hr class="sep" />') : `<p class="card__subtitle">Aún no hay reseñas para este producto.</p>`}
        </div>
      </div>
    </div>
  </section>
  `;
}

function viewCart(){
  const u = requireLogin();
  if(!u) return '';

  if(u.role !== 'customer'){
    return `
      <section class="card"><div class="card__inner">
        <h1 class="card__title">Carrito</h1>
        <p class="card__subtitle">El carrito universal está disponible solo para <strong>clientes</strong>.</p>
      </div></section>
    `;
  }

  const cart = cartExpanded(u.id);

  const groups = groupBy(cart.items, it => it.storeId);
  const groupHtml = Object.entries(groups).map(([storeId, items]) => {
    const storeName = items[0]?.storeName || 'Tienda';
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

    return `
      <div class="card" style="margin-bottom:14px;">
        <div class="card__inner">
          <div class="row">
            <div>
              <h3 style="margin:0;">${escapeHTML(storeName)}</h3>
              <div class="mini">Subtotal: <strong>${formatMoneyCOP(subtotal)}</strong></div>
            </div>
            <a class="btn btn--ghost" href="#/store/${escapeHTML(storeId)}">Ver tienda</a>
          </div>

          <div style="height:12px;"></div>

          <table class="table">
            <thead><tr>
              <th>Producto</th>
              <th style="width:110px;">Precio</th>
              <th style="width:110px;">Cantidad</th>
              <th style="width:110px;">Total</th>
              <th style="width:110px;"></th>
            </tr></thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td>
                    <div style="display:flex; gap:10px; align-items:center;">
                      <img src="${escapeHTML(it.image || '')}" alt="" style="width:44px; height:34px; object-fit:cover; border-radius:10px; border:1px solid var(--border);" />
                      <div>
                        <div style="font-weight:850;">${escapeHTML(it.name)}</div>
                        <div class="mini">Stock: ${it.stock}</div>
                      </div>
                    </div>
                  </td>
                  <td>${formatMoneyCOP(it.price)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value="${it.qty}"
                      style="width:90px;"
                      data-action="cart-qty"
                      data-product-id="${escapeHTML(it.productId)}"
                    />
                  </td>
                  <td><strong>${formatMoneyCOP(it.price * it.qty)}</strong></td>
                  <td>
                    <button class="btn btn--danger" data-action="cart-remove" data-product-id="${escapeHTML(it.productId)}">Quitar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');

  return `
  <section class="card">
    <div class="card__inner">
      <div class="row">
        <div>
          <h1 class="card__title">Carrito universal</h1>
          <p class="card__subtitle">Puedes comprar productos de múltiples tiendas en un solo pedido.</p>
        </div>
        <div class="pills">
          <button class="btn btn--ghost" data-action="cart-clear">Vaciar carrito</button>
        </div>
      </div>
    </div>
  </section>

  <div style="height:14px;"></div>

  ${cart.items.length ? groupHtml : `
    <section class="card"><div class="card__inner">
      <p class="card__subtitle">Tu carrito está vacío. Explora productos y agrega lo que necesites.</p>
      <div class="actions">
        <a class="btn btn--primary" href="#/products">Explorar productos</a>
      </div>
    </div></section>
  `}

  <div style="height:14px;"></div>

  <section class="card">
    <div class="card__inner">
      <div class="row">
        <h2 style="margin:0;">Resumen</h2>
        <div class="price">${formatMoneyCOP(cart.total)}</div>
      </div>

      <hr class="sep" />

      <form class="form" data-form="checkout">
        <div class="field">
          <label>Dirección de entrega</label>
          <input name="address" required placeholder="Ej: Calle 123 #45-67, Bogotá" />
        </div>
        <div class="grid">
          <div class="col-6 field">
            <label>Método de pago</label>
            <select name="payment">
              <option value="contraentrega">Contraentrega</option>
              <option value="transferencia">Transferencia (demo)</option>
            </select>
          </div>
          <div class="col-6 field">
            <label>Notas</label>
            <input name="notes" placeholder="Opcional" />
          </div>
        </div>
        <div class="row" style="justify-content:flex-end;">
          <button class="btn btn--primary" type="submit" ${cart.items.length ? '' : 'disabled'}>Realizar pedido</button>
        </div>
      </form>

      <p class="hint" style="margin-top:10px;">
        En esta demo, el pedido se guarda en localStorage. No hay pasarela real.
      </p>
    </div>
  </section>
  `;
}

function viewOrders(){
  const u = requireLogin();
  if(!u) return '';

  if(u.role !== 'customer'){
    return `
      <section class="card"><div class="card__inner">
        <h1 class="card__title">Pedidos</h1>
        <p class="card__subtitle">Solo los <strong>clientes</strong> tienen historial de compras.</p>
      </div></section>
    `;
  }

  const orders = listOrdersByUser(u.id);
  const db = loadDB();
  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">Mis pedidos</h1>
      <p class="card__subtitle">Historial de compras (guardado en tu navegador).</p>
    </div>
  </section>

  <div style="height:14px;"></div>

  ${orders.length ? orders.map(o => {
    return `
      <section class="card" style="margin-bottom:14px;">
        <div class="card__inner">
          <div class="row">
            <div>
              <div class="badge">Pedido</div>
              <div style="margin-top:8px; font-weight:900;">${escapeHTML(o.id)}</div>
              <div class="mini">Estado: <strong>${escapeHTML(o.status)}</strong> · ${escapeHTML((o.createdAt||'').slice(0,10))}</div>
            </div>
            <div class="price">${formatMoneyCOP(o.total)}</div>
          </div>

          <hr class="sep" />

          <table class="table">
            <thead><tr><th>Producto</th><th style="width:120px;">Precio</th><th style="width:80px;">Qty</th><th style="width:130px;">Acción</th></tr></thead>
            <tbody>
              ${(o.items||[]).map(it => {
                const p = db.products.find(pp => pp.id === it.productId) || null;
                const already = db.reviews.some(r => r.userId === u.id && r.type === 'product' && r.targetId === it.productId);
                return `
                <tr>
                  <td>${escapeHTML(it.nameSnapshot)}</td>
                  <td>${formatMoneyCOP(it.priceSnapshot)}</td>
                  <td>${it.qty}</td>
                  <td>
                    <a class="btn btn--ghost" href="#/product/${escapeHTML(it.productId)}">Ver</a>
                    ${already ? `<span class="mini">Reseñado</span>` : ``}
                  </td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }).join('') : `
    <section class="card"><div class="card__inner">
      <p class="card__subtitle">Aún no tienes pedidos. Ve a productos para comprar.</p>
      <div class="actions"><a class="btn btn--primary" href="#/products">Explorar productos</a></div>
    </div></section>
  `}
  `;
}

function viewLogin(){
  const u = currentUser();
  if(u){
    return `
      <section class="card"><div class="card__inner">
        <h1 class="card__title">Ya tienes sesión</h1>
        <p class="card__subtitle">Estás logueado como <strong>${escapeHTML(u.name)}</strong> (${escapeHTML(u.role)}).</p>
        <div class="actions">
          <a class="btn btn--primary" href="#/">Ir al inicio</a>
          <button class="btn btn--ghost" data-action="logout">Salir</button>
        </div>
      </div></section>
    `;
  }

  return `
  <section class="grid">
    <div class="col-6">
      <div class="card"><div class="card__inner">
        <h1 class="card__title">Iniciar sesión</h1>
        <p class="card__subtitle">Accede como Administrador, Tienda o Cliente.</p>

        <form class="form" data-form="login">
          <div class="field">
            <label>Email</label>
            <input name="email" type="email" required placeholder="tu@email.com" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input name="password" type="password" required placeholder="••••••••" />
          </div>
          <div class="row" style="justify-content:flex-end;">
            <button class="btn btn--primary" type="submit">Entrar</button>
          </div>
        </form>

        <hr class="sep" />
        <div class="actions">
          <a class="btn btn--ghost" href="#/register-customer">Registrarme como cliente</a>
          <a class="btn btn--ghost" href="#/register-store">Registrar tienda</a>
        </div>

        <p class="hint" style="margin-top:10px;">
          En esta demo, las credenciales se guardan sin cifrar en localStorage. No usar en producción.
        </p>
      </div></div>
    </div>

    <div class="col-6">
      <div class="card"><div class="card__inner">
        <h2 class="card__title">¿Qué puedo hacer según mi perfil?</h2>
        <div class="list">
          <div class="kpi">
            <div class="kpi__num">Admin</div>
            <div class="kpi__label">Gestiona usuarios, tiendas, productos, reseñas y solicitudes.</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">Tienda</div>
            <div class="kpi__label">Gestiona su catálogo y responde reseñas de su tienda/productos.</div>
          </div>
          <div class="kpi">
            <div class="kpi__num">Cliente</div>
            <div class="kpi__label">Carrito universal, compra y reseñas post-compra.</div>
          </div>
        </div>
      </div></div>
    </div>
  </section>
  `;
}

function viewRegisterCustomer(){
  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">Registro de Cliente</h1>
      <p class="card__subtitle">Crea tu cuenta para agregar productos al carrito y comprar.</p>

      <form class="form" data-form="register-customer">
        <div class="grid">
          <div class="col-6 field">
            <label>Nombre</label>
            <input name="name" required placeholder="Tu nombre" />
          </div>
          <div class="col-6 field">
            <label>Email</label>
            <input name="email" type="email" required placeholder="tu@email.com" />
          </div>
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input name="password" type="password" required placeholder="Mínimo 6 caracteres (demo)" />
        </div>
        <div class="row" style="justify-content:flex-end;">
          <button class="btn btn--primary" type="submit">Crear cuenta</button>
        </div>
      </form>
    </div>
  </section>
  `;
}

function viewRegisterStore(){
  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">Registro de Tienda</h1>
      <p class="card__subtitle">
        Para garantizar la calidad de vendedores, el registro como tienda requiere una solicitud y aprobación del Administrador.
        En esta demo se simula el proceso.
      </p>

      <form class="form" data-form="register-store">
        <div class="grid">
          <div class="col-6 field">
            <label>Nombre del propietario</label>
            <input name="ownerName" required placeholder="Nombre del responsable" />
          </div>
          <div class="col-6 field">
            <label>Email de acceso</label>
            <input name="email" type="email" required placeholder="tienda@email.com" />
          </div>
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input name="password" type="password" required placeholder="Contraseña" />
        </div>

        <hr class="sep" />
        <div class="grid">
          <div class="col-6 field">
            <label>Nombre comercial de la tienda</label>
            <input name="storeName" required placeholder="Ej: Mi Tienda S.A.S" />
          </div>
          <div class="col-6 field">
            <label>Razón social</label>
            <input name="legalName" required placeholder="Nombre legal" />
          </div>
          <div class="col-6 field">
            <label>NIT / Tax ID</label>
            <input name="taxId" required placeholder="Ej: 900123456-7" />
          </div>
          <div class="col-6 field">
            <label>URL de documento (demo)</label>
            <input name="docUrl" required placeholder="Ej: https://drive.google.com/..." />
          </div>
          <div class="col-6 field">
            <label>Dirección</label>
            <input name="address" required placeholder="Dirección de la tienda" />
          </div>
          <div class="col-6 field">
            <label>Teléfono</label>
            <input name="phone" required placeholder="+57 300..." />
          </div>
        </div>

        <div class="field">
          <label style="display:flex; gap:10px; align-items:center;">
            <input type="checkbox" name="terms" />
            Acepto términos y condiciones (demo)
          </label>
        </div>

        <div class="row" style="justify-content:flex-end;">
          <button class="btn btn--primary" type="submit">Enviar solicitud</button>
        </div>
      </form>

      <p class="hint" style="margin-top:10px;">
        Flujo: visitante envía solicitud → Admin aprueba/rechaza → si aprueba, el usuario pasa a rol <code>store</code>.
      </p>
    </div>
  </section>
  `;
}

function viewProfile(){
  const u = requireLogin();
  if(!u) return '';

  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">Mi perfil</h1>
      <p class="card__subtitle">Actualiza tu información (guardada en localStorage).</p>

      <form class="form" data-form="profile">
        <div class="grid">
          <div class="col-6 field">
            <label>Nombre</label>
            <input name="name" required value="${escapeHTML(u.name)}" />
          </div>
          <div class="col-6 field">
            <label>Email (solo lectura)</label>
            <input disabled value="${escapeHTML(u.email)}" />
          </div>
        </div>
        <div class="field">
          <label>Nueva contraseña (opcional)</label>
          <input name="password" type="password" placeholder="Dejar vacío para no cambiar" />
        </div>
        <div class="row" style="justify-content:flex-end;">
          <button class="btn btn--primary" type="submit">Guardar cambios</button>
        </div>
      </form>

      <hr class="sep" />
      <div class="actions">
        <button class="btn btn--danger" data-action="reset-db">Reiniciar DB (demo)</button>
      </div>
      <p class="hint" style="margin-top:10px;">
        Reiniciar DB borra la sesión y restaura datos de ejemplo.
      </p>
    </div>
  </section>
  `;
}

function viewStoreApplication(){
  const u = requireLogin();
  if(!u) return '';
  const db = loadDB();
  const app = db.storeApplications.find(a => a.userId === u.id) || null;
  if(!app){
    return `
      <section class="card"><div class="card__inner">
        <h1 class="card__title">Solicitud de tienda</h1>
        <p class="card__subtitle">No encontramos tu solicitud. Si quieres registrar una tienda, vuelve al formulario.</p>
        <div class="actions"><a class="btn btn--primary" href="#/register-store">Registrar tienda</a></div>
      </div></section>
    `;
  }

  const badge = app.status === 'pending'
    ? `<span class="badge">⏳ En revisión</span>`
    : app.status === 'approved'
      ? `<span class="badge">✅ Aprobada</span>`
      : `<span class="badge">⛔ Rechazada</span>`;

  return `
    <section class="card"><div class="card__inner">
      <div class="row">
        <div>
          <h1 class="card__title">Mi solicitud</h1>
          <p class="card__subtitle">Estado: ${badge}</p>
        </div>
        <div class="pills">
          ${app.status === 'approved' ? `<a class="btn btn--primary" href="#/store-dashboard">Ir al panel tienda</a>` : ''}
        </div>
      </div>

      <hr class="sep" />

      <table class="table">
        <tbody>
          <tr><th>Nombre tienda</th><td>${escapeHTML(app.storeName)}</td></tr>
          <tr><th>Razón social</th><td>${escapeHTML(app.legalName)}</td></tr>
          <tr><th>NIT/Tax</th><td>${escapeHTML(app.taxId)}</td></tr>
          <tr><th>Documento</th><td><a href="${escapeHTML(app.docUrl)}" target="_blank" rel="noreferrer" style="color:var(--link); text-decoration:none;">Ver URL</a></td></tr>
          <tr><th>Dirección</th><td>${escapeHTML(app.address)}</td></tr>
          <tr><th>Teléfono</th><td>${escapeHTML(app.phone)}</td></tr>
          <tr><th>Enviado</th><td>${escapeHTML(app.submittedAt?.slice(0,19).replace('T',' ') || '')}</td></tr>
          ${app.reviewedAt ? `<tr><th>Revisado</th><td>${escapeHTML(app.reviewedAt?.slice(0,19).replace('T',' ') || '')}</td></tr>` : ''}
          ${app.notes ? `<tr><th>Notas</th><td>${escapeHTML(app.notes)}</td></tr>` : ''}
        </tbody>
      </table>
    </div></section>
  `;
}

function viewAdmin(){
  const u = requireLogin();
  if(!u) return '';
  if(u.role !== 'admin') return '';

  const pills = [
    ['users','Usuarios'],
    ['storeApps','Solicitudes Tienda'],
    ['stores','Tiendas'],
    ['products','Productos'],
    ['reviews','Reseñas'],
    ['settings','Config']
  ].map(([key,label]) => `
    <button class="pill" data-action="admin-tab" data-tab="${key}" aria-selected="${state.adminTab===key?'true':'false'}">${escapeHTML(label)}</button>
  `).join('');

  return `
  <section class="card">
    <div class="card__inner">
      <div class="row">
        <div>
          <h1 class="card__title">Panel Administrador</h1>
          <p class="card__subtitle">Control total de la plataforma (en esta demo, todo en localStorage).</p>
        </div>
        <div class="pills">${pills}</div>
      </div>

      <hr class="sep" />
      ${state.adminTab === 'users' ? adminUsersView() : ''}
      ${state.adminTab === 'storeApps' ? adminStoreAppsView() : ''}
      ${state.adminTab === 'stores' ? adminStoresView() : ''}
      ${state.adminTab === 'products' ? adminProductsView() : ''}
      ${state.adminTab === 'reviews' ? adminReviewsView() : ''}
      ${state.adminTab === 'settings' ? adminSettingsView() : ''}
    </div>
  </section>
  `;
}

function adminUsersView(){
  const users = listUsers();
  return `
    <h2 style="margin:0 0 8px;">Usuarios</h2>
    <p class="mini">Crear, modificar, eliminar y visualizar cuentas (admin/tienda/cliente).</p>

    <hr class="sep" />

    <form class="form" data-form="admin-create-user">
      <div class="grid">
        <div class="col-3 field">
          <label>Rol</label>
          <select name="role">
            <option value="customer">customer</option>
            <option value="store">store</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="col-3 field">
          <label>Nombre</label>
          <input name="name" required />
        </div>
        <div class="col-3 field">
          <label>Email</label>
          <input name="email" type="email" required />
        </div>
        <div class="col-3 field">
          <label>Contraseña</label>
          <input name="password" required />
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn btn--primary" type="submit">Crear usuario</button>
      </div>
    </form>

    <hr class="sep" />

    <table class="table">
      <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th style="width:270px;">Acciones</th></tr></thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${escapeHTML(u.name)}</td>
            <td>${escapeHTML(u.email)}</td>
            <td><code>${escapeHTML(u.role)}</code></td>
            <td>${escapeHTML(u.status)}</td>
            <td>
              <button class="btn btn--ghost" data-action="admin-user-edit" data-user-id="${escapeHTML(u.id)}">Editar</button>
              <button class="btn btn--danger" data-action="admin-user-delete" data-user-id="${escapeHTML(u.id)}">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="hint" style="margin-top:10px;">
      Nota: si eliminas un usuario tienda, también se elimina su tienda (demo).
    </p>
  `;
}

function adminStoreAppsView(){
  const apps = listStoreApplications();
  const db = loadDB();
  return `
    <h2 style="margin:0 0 8px;">Solicitudes de Tienda</h2>
    <p class="mini">Proceso: solicitud → aprobación/rechazo por Admin.</p>

    <hr class="sep" />

    ${apps.length ? `
      <table class="table">
        <thead><tr><th>Tienda</th><th>Dueño</th><th>Estado</th><th>Enviado</th><th style="width:310px;">Acciones</th></tr></thead>
        <tbody>
          ${apps.map(a => {
            const user = db.users.find(u => u.id === a.userId);
            return `
              <tr>
                <td>${escapeHTML(a.storeName)}</td>
                <td>${escapeHTML(user?.email || '—')}</td>
                <td><code>${escapeHTML(a.status)}</code></td>
                <td>${escapeHTML((a.submittedAt||'').slice(0,10))}</td>
                <td>
                  <button class="btn btn--ok" data-action="admin-app-approve" data-app-id="${escapeHTML(a.id)}" ${a.status!=='pending'?'disabled':''}>Aprobar</button>
                  <button class="btn btn--danger" data-action="admin-app-reject" data-app-id="${escapeHTML(a.id)}" ${a.status!=='pending'?'disabled':''}>Rechazar</button>
                  <button class="btn btn--ghost" data-action="admin-app-view" data-app-id="${escapeHTML(a.id)}">Ver</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    ` : `<p class="card__subtitle">No hay solicitudes aún.</p>`}
  `;
}

function adminStoresView(){
  const stores = listStores({ includeInactive: true });
  return `
    <h2 style="margin:0 0 8px;">Tiendas</h2>
    <p class="mini">Supervisar tiendas y editar información.</p>

    <hr class="sep" />

    <table class="table">
      <thead><tr><th>Nombre</th><th>Estado</th><th>Owner</th><th style="width:280px;">Acciones</th></tr></thead>
      <tbody>
        ${stores.map(s => `
          <tr>
            <td>${escapeHTML(s.name)}</td>
            <td>${s.isActive ? 'Activa' : 'Inactiva'}</td>
            <td><code>${escapeHTML(s.ownerUserId)}</code></td>
            <td>
              <a class="btn btn--ghost" href="#/store/${escapeHTML(s.id)}">Ver</a>
              <button class="btn btn--ghost" data-action="admin-store-edit" data-store-id="${escapeHTML(s.id)}">Editar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function adminProductsView(){
  const db = loadDB();
  const stores = db.stores.slice();
  const products = db.products.slice().sort((a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||''));
  return `
    <h2 style="margin:0 0 8px;">Productos</h2>
    <p class="mini">Crear/modificar/eliminar productos de cualquier tienda.</p>

    <hr class="sep" />

    <form class="form" data-form="admin-create-product">
      <div class="grid">
        <div class="col-4 field">
          <label>Tienda</label>
          <select name="storeId">
            ${stores.map(s => `<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)}</option>`).join('')}
          </select>
        </div>
        <div class="col-4 field">
          <label>Nombre</label>
          <input name="name" required />
        </div>
        <div class="col-4 field">
          <label>Categoría</label>
          <input name="category" placeholder="Ej: Hogar, Electrónica..." required />
        </div>
        <div class="col-4 field">
          <label>Precio (COP)</label>
          <input name="price" type="number" min="0" required />
        </div>
        <div class="col-4 field">
          <label>Stock</label>
          <input name="stock" type="number" min="0" required />
        </div>
        <div class="col-4 field">
          <label>Imágenes (URLs separadas por coma)</label>
          <input name="imagesCsv" placeholder="https://... , https://..." />
        </div>
        <div class="col-6 field">
          <label>Descripción</label>
          <textarea name="description"></textarea>
        </div>
        <div class="col-6 field">
          <label>Envío</label>
          <input name="shipping" placeholder="Ej: Envío 24–48h" />
        </div>
        <div class="col-3 field">
          <label>Peso (kg)</label>
          <input name="weightKg" type="number" min="0" step="0.01" />
        </div>
        <div class="col-3 field">
          <label>Dimensiones (cm)</label>
          <input name="dimensionsCm" placeholder="Ej: 10x20x5" />
        </div>
        <div class="col-3 field">
          <label>Activo</label>
          <select name="isActive">
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn btn--primary" type="submit">Crear producto</button>
      </div>
    </form>

    <hr class="sep" />

    <table class="table">
      <thead><tr><th>Producto</th><th>Tienda</th><th>Precio</th><th>Stock</th><th>Activo</th><th style="width:260px;">Acciones</th></tr></thead>
      <tbody>
        ${products.map(p => {
          const s = stores.find(x => x.id === p.storeId);
          return `
            <tr>
              <td>${escapeHTML(p.name)}</td>
              <td>${escapeHTML(s?.name || '—')}</td>
              <td>${formatMoneyCOP(p.price)}</td>
              <td>${p.stock}</td>
              <td>${p.isActive ? 'Sí' : 'No'}</td>
              <td>
                <a class="btn btn--ghost" href="#/product/${escapeHTML(p.id)}">Ver</a>
                <button class="btn btn--ghost" data-action="admin-product-edit" data-product-id="${escapeHTML(p.id)}">Editar</button>
                <button class="btn btn--danger" data-action="admin-product-delete" data-product-id="${escapeHTML(p.id)}">Eliminar</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function adminReviewsView(){
  const db = loadDB();
  const reviews = db.reviews.slice().sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));
  return `
    <h2 style="margin:0 0 8px;">Reseñas</h2>
    <p class="mini">Moderación: ocultar, mostrar, editar o eliminar reseñas.</p>

    <hr class="sep" />

    ${reviews.length ? `
      <table class="table">
        <thead><tr><th>Tipo</th><th>Rating</th><th>Comentario</th><th>Hidden</th><th style="width:360px;">Acciones</th></tr></thead>
        <tbody>
          ${reviews.map(r => `
            <tr>
              <td><code>${escapeHTML(r.type)}</code></td>
              <td>${renderStars(r.rating)}</td>
              <td>${escapeHTML(r.comment)}</td>
              <td>${r.isHidden ? 'Sí' : 'No'}</td>
              <td>
                <button class="btn btn--ghost" data-action="admin-review-hide" data-review-id="${escapeHTML(r.id)}">${r.isHidden ? 'Mostrar' : 'Ocultar'}</button>
                <button class="btn btn--ghost" data-action="admin-review-edit" data-review-id="${escapeHTML(r.id)}">Editar</button>
                <button class="btn btn--danger" data-action="admin-review-delete" data-review-id="${escapeHTML(r.id)}">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `<p class="card__subtitle">No hay reseñas.</p>`}
  `;
}

function adminSettingsView(){
  const db = loadDB();
  return `
    <h2 style="margin:0 0 8px;">Configuración global</h2>
    <p class="mini">Ajustes simples (demo).</p>

    <hr class="sep" />

    <form class="form" data-form="admin-settings">
      <div class="grid">
        <div class="col-6 field">
          <label>Nombre del sitio</label>
          <input name="siteName" value="${escapeHTML(db.meta?.siteName || 'RappiWAO')}" />
        </div>
        <div class="col-6 field">
          <label>Moneda</label>
          <input disabled value="COP" />
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn btn--primary" type="submit">Guardar</button>
      </div>
    </form>

    <hr class="sep" />

    <div class="actions">
      <button class="btn btn--danger" data-action="reset-db">Reiniciar DB (demo)</button>
      <button class="btn btn--ghost" data-action="export-db">Exportar DB</button>
    </div>

    <p class="hint" style="margin-top:10px;">
      Recomendación: usa Exportar/Importar para mover la DB entre navegadores.
    </p>
  `;
}

function viewStoreDashboard(){
  const u = requireLogin();
  if(!u) return '';
  if(u.role !== 'store') return '';

  const pills = [
    ['products','Productos'],
    ['orders','Pedidos'],
    ['reviews','Reseñas'],
    ['profile','Perfil Tienda']
  ].map(([key,label]) => `
    <button class="pill" data-action="store-tab" data-tab="${key}" aria-selected="${state.storeTab===key?'true':'false'}">${escapeHTML(label)}</button>
  `).join('');

  const store = getMyStore(u.id);

  return `
  <section class="card">
    <div class="card__inner">
      <div class="row">
        <div>
          <h1 class="card__title">Panel de Tienda</h1>
          <p class="card__subtitle">${escapeHTML(store?.name || '—')} · Gestión autónoma (solo tu tienda).</p>
        </div>
        <div class="pills">${pills}</div>
      </div>

      <hr class="sep" />
      ${state.storeTab === 'products' ? storeProductsView(u.id) : ''}
      ${state.storeTab === 'orders' ? storeOrdersView(u.id) : ''}
      ${state.storeTab === 'reviews' ? storeReviewsView(u.id) : ''}
      ${state.storeTab === 'profile' ? storeProfileView(u.id) : ''}
    </div>
  </section>
  `;
}

function storeProductsView(ownerId){
  const products = listMyProducts(ownerId);
  return `
    <h2 style="margin:0 0 8px;">Mis productos</h2>
    <p class="mini">Crea/edita/elimina tu catálogo. Solo tu tienda.</p>

    <hr class="sep" />

    <form class="form" data-form="store-create-product">
      <div class="grid">
        <div class="col-6 field"><label>Nombre</label><input name="name" required /></div>
        <div class="col-6 field"><label>Categoría</label><input name="category" required placeholder="Ej: Deportes" /></div>
        <div class="col-6 field"><label>Precio (COP)</label><input name="price" type="number" min="0" required /></div>
        <div class="col-6 field"><label>Stock</label><input name="stock" type="number" min="0" required /></div>
        <div class="col-12 field"><label>Imágenes (URLs separadas por coma)</label><input name="imagesCsv" /></div>
        <div class="col-12 field"><label>Descripción</label><textarea name="description"></textarea></div>
        <div class="col-6 field"><label>Envío</label><input name="shipping" placeholder="Ej: Envío 24–48h" /></div>
        <div class="col-3 field"><label>Peso (kg)</label><input name="weightKg" type="number" min="0" step="0.01" /></div>
        <div class="col-3 field"><label>Dimensiones (cm)</label><input name="dimensionsCm" placeholder="Ej: 10x20x5" /></div>
        <div class="col-3 field"><label>Activo</label>
          <select name="isActive"><option value="true">Sí</option><option value="false">No</option></select>
        </div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn btn--primary" type="submit">Crear</button>
      </div>
    </form>

    <hr class="sep" />

    <table class="table">
      <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Activo</th><th style="width:260px;">Acciones</th></tr></thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${escapeHTML(p.name)}</td>
            <td>${formatMoneyCOP(p.price)}</td>
            <td>${p.stock}</td>
            <td>${p.isActive ? 'Sí' : 'No'}</td>
            <td>
              <a class="btn btn--ghost" href="#/product/${escapeHTML(p.id)}">Ver</a>
              <button class="btn btn--ghost" data-action="store-product-edit" data-product-id="${escapeHTML(p.id)}">Editar</button>
              <button class="btn btn--danger" data-action="store-product-delete" data-product-id="${escapeHTML(p.id)}">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function storeOrdersView(ownerId){
  const orders = listOrdersForStoreOwner(ownerId);
  const db = loadDB();
  const store = getMyStore(ownerId);

  return `
    <h2 style="margin:0 0 8px;">Pedidos de mi tienda</h2>
    <p class="mini">Solo ves pedidos con productos de <strong>${escapeHTML(store?.name || 'tu tienda')}</strong>.</p>

    <hr class="sep" />

    ${orders.length ? orders.map(o => `
      <div class="card" style="margin-bottom:14px;">
        <div class="card__inner">
          <div class="row">
            <div>
              <div class="badge">Pedido</div>
              <div style="margin-top:8px; font-weight:900;">${escapeHTML(o.id)}</div>
              <div class="mini">Estado: <strong>${escapeHTML(o.status)}</strong> · ${escapeHTML((o.createdAt||'').slice(0,10))}</div>
              <div class="mini">Entrega: ${escapeHTML(o.shippingAddress || '—')}</div>
            </div>
            <div class="pills">
              <button class="btn btn--ok" data-action="store-order-status" data-order-id="${escapeHTML(o.id)}" data-status="completed">Marcar completado</button>
              <button class="btn btn--danger" data-action="store-order-status" data-order-id="${escapeHTML(o.id)}" data-status="cancelled">Cancelar</button>
            </div>
          </div>

          <hr class="sep" />

          <table class="table">
            <thead><tr><th>Producto</th><th style="width:110px;">Precio</th><th style="width:80px;">Qty</th></tr></thead>
            <tbody>
              ${(o.items||[]).map(it => `
                <tr>
                  <td>${escapeHTML(it.nameSnapshot)}</td>
                  <td>${formatMoneyCOP(it.priceSnapshot)}</td>
                  <td>${it.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('') : `<p class="card__subtitle">Aún no tienes pedidos.</p>`}
  `;
}

function storeReviewsView(ownerId){
  const db = loadDB();
  const store = getMyStore(ownerId);
  const storeId = store?.id;
  const reviews = db.reviews
    .filter(r => !r.isHidden)
    .filter(r => r.storeId === storeId)
    .sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));

  return `
    <h2 style="margin:0 0 8px;">Reseñas de mi tienda</h2>
    <p class="mini">Puedes responder reseñas de tu tienda y de tus productos.</p>

    <hr class="sep" />

    ${reviews.length ? reviews.map(r => `
      <div class="card" style="margin-bottom:14px;">
        <div class="card__inner">
          <div class="row" style="align-items:flex-start;">
            <div>
              <div class="badge">${escapeHTML(r.type)}</div>
              <div style="margin-top:8px;">${renderStars(r.rating)}</div>
              <div style="margin-top:8px;">${escapeHTML(r.comment)}</div>
              ${r.productId ? `<div class="mini" style="margin-top:8px;">Producto: <a href="#/product/${escapeHTML(r.productId)}" style="color:var(--link); text-decoration:none;">ver</a></div>` : ''}
            </div>
            <div class="pills">
              <a class="btn btn--ghost" href="${r.type==='store' ? `#/store/${escapeHTML(storeId)}` : `#/product/${escapeHTML(r.productId)}` }">Abrir</a>
            </div>
          </div>

          <hr class="sep" />

          ${r.storeReply
            ? `<div class="badge">Respuesta</div><div style="margin-top:8px;">${escapeHTML(r.storeReply.comment)}</div>`
            : `
              <form class="form" data-form="store-reply" data-review-id="${escapeHTML(r.id)}">
                <div class="field">
                  <label>Responder</label>
                  <textarea name="comment" required placeholder="Tu respuesta..."></textarea>
                </div>
                <div class="row" style="justify-content:flex-end;">
                  <button class="btn btn--primary" type="submit">Enviar respuesta</button>
                </div>
              </form>
            `
          }
        </div>
      </div>
    `).join('') : `<p class="card__subtitle">Aún no hay reseñas.</p>`}
  `;
}

function storeProfileView(ownerId){
  const store = getMyStore(ownerId);
  if(!store){
    return `<p class="card__subtitle">No tienes tienda asociada.</p>`;
  }

  return `
    <h2 style="margin:0 0 8px;">Perfil de la tienda</h2>
    <p class="mini">Actualiza información visible para clientes.</p>

    <hr class="sep" />

    <form class="form" data-form="store-profile">
      <div class="grid">
        <div class="col-6 field"><label>Nombre</label><input name="name" required value="${escapeHTML(store.name)}" /></div>
        <div class="col-6 field"><label>Teléfono</label><input name="phone" value="${escapeHTML(store.phone || '')}" /></div>
        <div class="col-12 field"><label>Descripción</label><textarea name="description">${escapeHTML(store.description || '')}</textarea></div>
        <div class="col-6 field"><label>Logo URL</label><input name="logoUrl" value="${escapeHTML(store.logoUrl || '')}" /></div>
        <div class="col-6 field"><label>Banner URL</label><input name="bannerUrl" value="${escapeHTML(store.bannerUrl || '')}" /></div>
        <div class="col-12 field"><label>Dirección</label><input name="address" value="${escapeHTML(store.address || '')}" /></div>
      </div>
      <div class="row" style="justify-content:flex-end;">
        <button class="btn btn--primary" type="submit">Guardar</button>
      </div>
    </form>
  `;
}

function viewNotFound(){
  return `
  <section class="card">
    <div class="card__inner">
      <h1 class="card__title">404</h1>
      <p class="card__subtitle">Página no encontrada.</p>
      <div class="actions">
        <a class="btn btn--primary" href="#/">Ir al inicio</a>
        <a class="btn btn--ghost" href="#/products">Ver productos</a>
      </div>
    </div>
  </section>
  `;
}

/* ------------------------------ Componentes ------------------------------ */

function storeCard(s){
  const rating = avgRatingForTarget({ type:'store', targetId: s.id });
  const productsCount = listProducts({ storeId: s.id }).length;

  return `
    <div class="col-4">
      <div class="card store-card">
        <div class="card__media">
          <img src="${escapeHTML(s.logoUrl || s.bannerUrl || '')}" alt="" loading="lazy" />
        </div>
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <div>
            <div style="font-weight:900; font-size:16px;">${escapeHTML(s.name)}</div>
            <div class="mini">${escapeHTML(s.description || '')}</div>
          </div>
          <div style="text-align:right;">
            ${renderStars(Math.round(rating.avg))}
            <div class="mini">${rating.count} reseñas</div>
          </div>
        </div>
        <div class="actions">
          <a class="btn btn--primary" href="#/store/${escapeHTML(s.id)}">Ver tienda</a>
          <span class="badge">${productsCount} productos</span>
        </div>
      </div>
    </div>
  `;
}

function productCard(p){
  const store = getStore(p.storeId);
  const rating = avgRatingForTarget({ type:'product', targetId: p.id });
  const img = (p.images && p.images[0]) || store?.logoUrl || '';

  return `
    <div class="col-3">
      <div class="card product-card">
        <div class="card__media">
          <img src="${escapeHTML(img)}" alt="" loading="lazy" />
        </div>
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
          <div>
            <div style="font-weight:900;">${escapeHTML(p.name)}</div>
            <div class="mini">${escapeHTML(store?.name || '—')}</div>
          </div>
          <div style="text-align:right;">
            ${renderStars(Math.round(rating.avg))}
            <div class="mini">${rating.count}</div>
          </div>
        </div>

        <div style="margin-top:10px;" class="price">${formatMoneyCOP(p.price)}</div>
        <div class="mini">Stock: ${p.stock} · ${escapeHTML(p.category)}</div>

        <div class="actions">
          <a class="btn btn--ghost" href="#/product/${escapeHTML(p.id)}">Ver</a>
          <button class="btn btn--primary" data-action="quick-add" data-product-id="${escapeHTML(p.id)}">+ Carrito</button>
        </div>
      </div>
    </div>
  `;
}

function reviewCard(r){
  const db = loadDB();
  const user = db.users.find(u => u.id === r.userId);
  const who = user?.name || user?.email || 'Cliente';

  return `
    <div>
      <div class="row" style="align-items:flex-start;">
        <div>
          <div style="font-weight:900;">${escapeHTML(who)}</div>
          <div class="mini">${escapeHTML((r.createdAt||'').slice(0,10))}</div>
        </div>
        <div>${renderStars(r.rating)}</div>
      </div>
      <div style="margin-top:8px;">${escapeHTML(r.comment)}</div>
      ${r.storeReply ? `
        <div style="margin-top:12px; padding:12px; border:1px solid var(--border); border-radius:12px; background: rgba(22,26,36,.35);">
          <div class="badge">Respuesta de tienda</div>
          <div style="margin-top:8px;">${escapeHTML(r.storeReply.comment)}</div>
        </div>
      ` : ''}
    </div>
  `;
}

function reviewForm({ type, targetId }){
  return `
    <div class="card">
      <div class="card__inner">
        <h3 class="card__title">Dejar reseña</h3>
        <p class="card__subtitle">Solo disponible después de una compra.</p>
        <form class="form" data-form="review" data-review-type="${escapeHTML(type)}" data-target-id="${escapeHTML(targetId)}">
          <div class="field">
            <label>Calificación</label>
            ${renderStarPicker({ name: 'rating', value: 5 })}
          </div>
          <div class="field">
            <label>Comentario</label>
            <textarea name="comment" required placeholder="Cuéntanos tu experiencia..."></textarea>
          </div>
          <div class="row" style="justify-content:flex-end;">
            <button class="btn btn--primary" type="submit">Publicar</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function groupBy(arr, keyFn){
  const out = {};
  for(const it of arr){
    const k = keyFn(it);
    out[k] = out[k] || [];
    out[k].push(it);
  }
  return out;
}

/* ------------------------------ Eventos ------------------------------ */

async function onClick(e){
  const btn = e.target.closest('[data-action]');
  if(!btn) return;

  const action = btn.getAttribute('data-action');

  if(action === 'logout'){
    logout();
    render();
    navigate('#/');
    return;
  }

  if(action === 'reset-db'){
    const ok = await confirmDialog({ title:'Reiniciar DB', msg:'Esto borrará tus cambios y restaurará datos de ejemplo. ¿Continuar?', okText:'Sí, reiniciar', cancelText:'Cancelar' });
    if(ok){
      resetDB();
      render();
      navigate('#/');
    }
    return;
  }

  if(action === 'export-db'){
    exportDB();
    return;
  }

  if(action === 'quick-add'){
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      toast('Solo clientes', 'Inicia sesión como cliente para agregar al carrito.', 'warn');
      navigate('#/login');
      return;
    }
    const productId = btn.getAttribute('data-product-id');
    const res = cartAddItem(u.id, productId, 1);
    if(res.ok){ toast('Agregado', 'Producto agregado al carrito.', 'ok'); renderNav(); }
    else toast('Error', res.error || 'No se pudo agregar.', 'danger');
    return;
  }

  if(action === 'add-to-cart'){
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      toast('Solo clientes', 'Inicia sesión como cliente para comprar.', 'warn');
      navigate('#/login');
      return;
    }
    const productId = btn.getAttribute('data-product-id');
    const qtyEl = document.querySelector(`[data-qty-input="${CSS.escape(productId)}"]`);
    const qty = qtyEl ? Number(qtyEl.value || 1) : 1;
    const res = cartAddItem(u.id, productId, qty);
    if(res.ok){ toast('Agregado', 'Producto agregado al carrito.', 'ok'); renderNav(); }
    else toast('Error', res.error || 'No se pudo agregar.', 'danger');
    return;
  }

  if(action === 'cart-remove'){
    const u = currentUser();
    if(!u) return;
    const productId = btn.getAttribute('data-product-id');
    cartRemoveItem(u.id, productId);
    toast('Eliminado', 'Producto eliminado del carrito.', 'ok');
    render();
    return;
  }

  if(action === 'cart-clear'){
    const u = currentUser();
    if(!u) return;
    const ok = await confirmDialog({ title:'Vaciar carrito', msg:'¿Eliminar todos los items del carrito?', okText:'Vaciar', cancelText:'Cancelar' });
    if(ok){
      const { cartClear } = await import('./marketplace.js');
      cartClear(u.id);
      toast('Listo', 'Carrito vacío.', 'ok');
      render();
    }
    return;
  }

  if(action === 'clear-product-filters'){
    state.productsQuery = '';
    state.productsCategory = '';
    render();
    return;
  }

  if(action === 'admin-tab'){
    state.adminTab = btn.getAttribute('data-tab');
    render();
    return;
  }

  if(action === 'store-tab'){
    state.storeTab = btn.getAttribute('data-tab');
    render();
    return;
  }

  // Admin actions
  if(action === 'admin-user-delete'){
    const userId = btn.getAttribute('data-user-id');
    const ok = await confirmDialog({ title:'Eliminar usuario', msg:'¿Eliminar este usuario? (demo: también elimina tienda si aplica)', okText:'Eliminar', cancelText:'Cancelar' });
    if(ok){
      deleteUser(userId);
      toast('Eliminado', 'Usuario eliminado.', 'ok');
      render();
    }
    return;
  }

  if(action === 'admin-user-edit'){
    const userId = btn.getAttribute('data-user-id');
    const db = loadDB();
    const u = db.users.find(x => x.id === userId);
    if(!u) return;
    const role = prompt('Nuevo rol (admin/store/customer/store_pending):', u.role) || u.role;
    const status = prompt('Estado (active/disabled):', u.status) || u.status;
    const name = prompt('Nombre:', u.name) || u.name;
    const password = prompt('Contraseña (dejar vacío para no cambiar):', '') || '';
    updateUser(userId, { role, status, name, password: password || undefined });
    toast('Actualizado', 'Usuario actualizado.', 'ok');
    render();
    return;
  }

  if(action === 'admin-app-approve'){
    const appId = btn.getAttribute('data-app-id');
    const admin = currentUser();
    const ok = await confirmDialog({ title:'Aprobar tienda', msg:'¿Aprobar esta solicitud y crear la tienda?', okText:'Aprobar', cancelText:'Cancelar' });
    if(ok){
      const res = approveStoreApplication({ appId, adminUserId: admin.id });
      if(res.ok){ toast('Aprobada', 'Tienda creada y usuario actualizado a role=store.', 'ok'); render(); }
      else toast('Error', res.error || 'No se pudo aprobar.', 'danger');
    }
    return;
  }

  if(action === 'admin-app-reject'){
    const appId = btn.getAttribute('data-app-id');
    const admin = currentUser();
    const notes = prompt('Motivo / notas (opcional):', '') || '';
    const ok = await confirmDialog({ title:'Rechazar solicitud', msg:'¿Rechazar esta solicitud?', okText:'Rechazar', cancelText:'Cancelar' });
    if(ok){
      const res = rejectStoreApplication({ appId, adminUserId: admin.id, notes });
      if(res.ok){ toast('Rechazada', 'Solicitud rechazada.', 'ok'); render(); }
      else toast('Error', res.error || 'No se pudo rechazar.', 'danger');
    }
    return;
  }

  if(action === 'admin-app-view'){
    const appId = btn.getAttribute('data-app-id');
    const db = loadDB();
    const a = db.storeApplications.find(x => x.id === appId);
    if(!a) return;
    alert(JSON.stringify(a, null, 2));
    return;
  }

  if(action === 'admin-store-edit'){
    const storeId = btn.getAttribute('data-store-id');
    const db = loadDB();
    const s = db.stores.find(x => x.id === storeId);
    if(!s) return;
    const name = prompt('Nombre tienda:', s.name) || s.name;
    const description = prompt('Descripción:', s.description || '') ?? s.description;
    const phone = prompt('Teléfono:', s.phone || '') ?? s.phone;
    const address = prompt('Dirección:', s.address || '') ?? s.address;
    const logoUrl = prompt('Logo URL:', s.logoUrl || '') ?? s.logoUrl;
    const bannerUrl = prompt('Banner URL:', s.bannerUrl || '') ?? s.bannerUrl;
    const activeStr = prompt('Activa? (true/false):', String(!!s.isActive)) || String(!!s.isActive);
    const isActive = activeStr === 'true';
    adminUpsertStore(storeId, { name, description, phone, address, logoUrl, bannerUrl, isActive });
    toast('Actualizada', 'Tienda actualizada.', 'ok');
    render();
    return;
  }

  if(action === 'admin-product-delete'){
    const productId = btn.getAttribute('data-product-id');
    const ok = await confirmDialog({ title:'Eliminar producto', msg:'¿Eliminar este producto?', okText:'Eliminar', cancelText:'Cancelar' });
    if(ok){
      adminDeleteProduct(productId);
      toast('Eliminado', 'Producto eliminado.', 'ok');
      render();
    }
    return;
  }

  if(action === 'admin-product-edit'){
    const productId = btn.getAttribute('data-product-id');
    const db = loadDB();
    const p = db.products.find(x => x.id === productId);
    if(!p) return;

    const name = prompt('Nombre:', p.name) || p.name;
    const category = prompt('Categoría:', p.category) || p.category;
    const price = prompt('Precio:', String(p.price)) || String(p.price);
    const stock = prompt('Stock:', String(p.stock)) || String(p.stock);
    const imagesCsv = prompt('Imágenes (URLs separadas por coma):', (p.images || []).join(', ')) ?? (p.images || []).join(', ');
    const description = prompt('Descripción:', p.description || '') ?? p.description;
    const shipping = prompt('Envío:', p.shipping || '') ?? p.shipping;
    const weightKg = prompt('Peso (kg):', p.weightKg ?? '') ?? p.weightKg;
    const dimensionsCm = prompt('Dimensiones (cm):', p.dimensionsCm ?? '') ?? p.dimensionsCm;
    const activeStr = prompt('Activo? (true/false):', String(!!p.isActive)) || String(!!p.isActive);

    const res = adminUpdateProduct(productId, {
      name, category, price, stock, imagesCsv, description, shipping,
      weightKg, dimensionsCm, isActive: activeStr === 'true'
    });
    if(res.ok){ toast('Actualizado', 'Producto actualizado.', 'ok'); render(); }
    else toast('Error', res.error || 'No se pudo actualizar.', 'danger');
    return;
  }

  if(action === 'admin-review-hide'){
    const reviewId = btn.getAttribute('data-review-id');
    const admin = currentUser();
    const db = loadDB();
    const r = db.reviews.find(x => x.id === reviewId);
    if(!r) return;
    const res = adminModerateReview({ adminUserId: admin.id, reviewId, action: r.isHidden ? 'unhide' : 'hide' });
    if(res.ok){ toast('Listo', r.isHidden ? 'Reseña visible.' : 'Reseña oculta.', 'ok'); render(); }
    else toast('Error', res.error || 'No se pudo moderar.', 'danger');
    return;
  }

  if(action === 'admin-review-delete'){
    const reviewId = btn.getAttribute('data-review-id');
    const admin = currentUser();
    const ok = await confirmDialog({ title:'Eliminar reseña', msg:'¿Eliminar esta reseña definitivamente?', okText:'Eliminar', cancelText:'Cancelar' });
    if(ok){
      const res = adminModerateReview({ adminUserId: admin.id, reviewId, action:'delete' });
      if(res.ok){ toast('Eliminada', 'Reseña eliminada.', 'ok'); render(); }
      else toast('Error', res.error || 'No se pudo eliminar.', 'danger');
    }
    return;
  }

  if(action === 'admin-review-edit'){
    const reviewId = btn.getAttribute('data-review-id');
    const admin = currentUser();
    const comment = prompt('Nuevo comentario:', '') || '';
    if(!comment.trim()){
      toast('Cancelado', 'No se cambió el comentario.', 'warn');
      return;
    }
    const res = adminModerateReview({ adminUserId: admin.id, reviewId, action:'edit', payload:{ comment } });
    if(res.ok){ toast('Editada', 'Reseña actualizada.', 'ok'); render(); }
    else toast('Error', res.error || 'No se pudo editar.', 'danger');
    return;
  }

  // Store actions
  if(action === 'store-product-delete'){
    const productId = btn.getAttribute('data-product-id');
    const u = currentUser();
    const ok = await confirmDialog({ title:'Eliminar producto', msg:'¿Eliminar este producto de tu catálogo?', okText:'Eliminar', cancelText:'Cancelar' });
    if(ok){
      const res = deleteMyProduct(u.id, productId);
      if(res.ok){ toast('Eliminado', 'Producto eliminado.', 'ok'); render(); }
      else toast('Error', res.error || 'No se pudo eliminar.', 'danger');
    }
    return;
  }

  if(action === 'store-product-edit'){
    const productId = btn.getAttribute('data-product-id');
    const u = currentUser();
    const db = loadDB();
    const p = db.products.find(x => x.id === productId);
    if(!p) return;

    const name = prompt('Nombre:', p.name) || p.name;
    const category = prompt('Categoría:', p.category) || p.category;
    const price = prompt('Precio:', String(p.price)) || String(p.price);
    const stock = prompt('Stock:', String(p.stock)) || String(p.stock);
    const imagesCsv = prompt('Imágenes (URLs separadas por coma):', (p.images || []).join(', ')) ?? (p.images || []).join(', ');
    const description = prompt('Descripción:', p.description || '') ?? p.description;
    const shipping = prompt('Envío:', p.shipping || '') ?? p.shipping;
    const weightKg = prompt('Peso (kg):', p.weightKg ?? '') ?? p.weightKg;
    const dimensionsCm = prompt('Dimensiones (cm):', p.dimensionsCm ?? '') ?? p.dimensionsCm;
    const activeStr = prompt('Activo? (true/false):', String(!!p.isActive)) || String(!!p.isActive);

    const res = updateMyProduct(u.id, productId, {
      name, category, price, stock, imagesCsv, description, shipping,
      weightKg, dimensionsCm, isActive: activeStr === 'true'
    });
    if(res.ok){ toast('Actualizado', 'Producto actualizado.', 'ok'); render(); }
    else toast('Error', res.error || 'No se pudo actualizar.', 'danger');
    return;
  }

  if(action === 'store-order-status'){
    const u = currentUser();
    const orderId = btn.getAttribute('data-order-id');
    const status = btn.getAttribute('data-status');
    const ok = await confirmDialog({ title:'Cambiar estado', msg:`¿Cambiar estado del pedido a "${status}"?`, okText:'Sí', cancelText:'Cancelar' });
    if(ok){
      // Tienda puede cambiar estado en esta demo
      const res = markOrderStatus({ orderId, status });
      if(res.ok){ toast('Actualizado', 'Estado del pedido actualizado.', 'ok'); render(); }
      else toast('Error', res.error || 'No se pudo actualizar.', 'danger');
    }
    return;
  }
}

async function onSubmit(e){
  const form = e.target;
  const type = form.getAttribute('data-form');
  if(!type) return;

  e.preventDefault();

  if(type === 'login'){
    const fd = new FormData(form);
    const user = login(fd.get('email'), fd.get('password'));
    if(user){
      render();
      // redirección simple por rol
      if(user.role === 'admin') navigate('#/admin');
      else if(user.role === 'store') navigate('#/store-dashboard');
      else if(user.role === 'store_pending') navigate('#/store-application');
      else navigate('#/');
    }
    return;
  }

  if(type === 'register-customer'){
    const fd = new FormData(form);
    const user = registerCustomer({
      name: fd.get('name'),
      email: fd.get('email'),
      password: fd.get('password')
    });
    if(user){
      navigate('#/login');
    }
    return;
  }

  if(type === 'register-store'){
    const fd = new FormData(form);
    const res = registerStoreApplication({
      ownerName: fd.get('ownerName'),
      email: fd.get('email'),
      password: fd.get('password'),
      storeName: fd.get('storeName'),
      legalName: fd.get('legalName'),
      taxId: fd.get('taxId'),
      docUrl: fd.get('docUrl'),
      address: fd.get('address'),
      phone: fd.get('phone'),
      termsAccepted: fd.get('terms') === 'on'
    });
    if(res){
      navigate('#/login');
    }
    return;
  }

  if(type === 'product-filters'){
    const fd = new FormData(form);
    state.productsQuery = String(fd.get('q') || '').trim();
    state.productsCategory = String(fd.get('cat') || '').trim();
    render();
    return;
  }

  if(type === 'checkout'){
    const u = currentUser();
    if(!u || u.role !== 'customer') return;
    const cart = cartExpanded(u.id);
    if(!cart.items.length){
      toast('Carrito vacío', 'Agrega productos antes de comprar.', 'warn');
      return;
    }
    const fd = new FormData(form);
    const res = checkout({
      userId: u.id,
      shippingAddress: fd.get('address'),
      paymentMethod: fd.get('payment'),
      notes: fd.get('notes')
    });
    if(res.ok){
      toast('Pedido creado', `Pedido ${res.order.id} guardado en tu navegador.`, 'ok');
      renderNav();
      navigate('#/orders');
    } else {
      toast('Error', res.error || 'No se pudo completar.', 'danger');
    }
    return;
  }

  if(type === 'review'){
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      toast('Solo clientes', 'Inicia sesión como cliente.', 'warn');
      return;
    }
    const fd = new FormData(form);
    const rating = fd.get('rating');
    const comment = fd.get('comment');
    const reviewType = form.getAttribute('data-review-type');
    const targetId = form.getAttribute('data-target-id');

    const res = createReview({ userId: u.id, type: reviewType, targetId, rating, comment });
    if(res.ok){
      toast('Gracias', 'Tu reseña fue publicada.', 'ok');
      render();
    } else {
      toast('No se pudo publicar', res.error || 'Revisa requisitos post-compra.', 'danger');
    }
    return;
  }

  if(type === 'profile'){
    const u = currentUser();
    if(!u) return;
    const db = loadDB();
    const user = db.users.find(x => x.id === u.id);
    const fd = new FormData(form);
    user.name = String(fd.get('name') || '').trim();
    const pw = String(fd.get('password') || '').trim();
    if(pw) user.password = pw;
    saveDB(db);
    toast('Guardado', 'Perfil actualizado.', 'ok');
    render();
    return;
  }

  if(type === 'admin-create-user'){
    const fd = new FormData(form);
    const res = createUser({
      role: fd.get('role'),
      name: fd.get('name'),
      email: fd.get('email'),
      password: fd.get('password')
    });
    if(res.ok){
      toast('Creado', 'Usuario creado.', 'ok');
      form.reset();
      render();
    } else {
      toast('Error', res.error || 'No se pudo crear.', 'danger');
    }
    return;
  }

  if(type === 'admin-create-product'){
    const fd = new FormData(form);
    const res = adminCreateProduct({
      storeId: fd.get('storeId'),
      name: fd.get('name'),
      description: fd.get('description'),
      category: fd.get('category'),
      price: fd.get('price'),
      stock: fd.get('stock'),
      imagesCsv: fd.get('imagesCsv'),
      weightKg: fd.get('weightKg'),
      dimensionsCm: fd.get('dimensionsCm'),
      shipping: fd.get('shipping'),
      isActive: fd.get('isActive') === 'true'
    });
    if(res.ok){
      toast('Creado', 'Producto creado.', 'ok');
      form.reset();
      render();
    } else {
      toast('Error', res.error || 'No se pudo crear.', 'danger');
    }
    return;
  }

  if(type === 'admin-settings'){
    const db = loadDB();
    const fd = new FormData(form);
    db.meta.siteName = String(fd.get('siteName') || 'RappiWAO').trim() || 'RappiWAO';
    saveDB(db);
    toast('Guardado', 'Configuración actualizada.', 'ok');
    render();
    return;
  }

  if(type === 'store-create-product'){
    const u = currentUser();
    if(!u || u.role !== 'store') return;

    const fd = new FormData(form);
    const res = createMyProduct(u.id, {
      name: fd.get('name'),
      description: fd.get('description'),
      category: fd.get('category'),
      price: fd.get('price'),
      stock: fd.get('stock'),
      imagesCsv: fd.get('imagesCsv'),
      weightKg: fd.get('weightKg'),
      dimensionsCm: fd.get('dimensionsCm'),
      shipping: fd.get('shipping'),
      isActive: fd.get('isActive') === 'true'
    });
    if(res.ok){
      toast('Creado', 'Producto agregado a tu tienda.', 'ok');
      form.reset();
      render();
    } else {
      toast('Error', res.error || 'No se pudo crear.', 'danger');
    }
    return;
  }

  if(type === 'store-profile'){
    const u = currentUser();
    if(!u || u.role !== 'store') return;
    const fd = new FormData(form);
    const res = updateMyStore(u.id, {
      name: fd.get('name'),
      phone: fd.get('phone'),
      description: fd.get('description'),
      logoUrl: fd.get('logoUrl'),
      bannerUrl: fd.get('bannerUrl'),
      address: fd.get('address')
    });
    if(res.ok){
      toast('Guardado', 'Perfil de tienda actualizado.', 'ok');
      render();
    } else {
      toast('Error', res.error || 'No se pudo guardar.', 'danger');
    }
    return;
  }

  if(type === 'store-reply'){
    const u = currentUser();
    if(!u || u.role !== 'store') return;
    const reviewId = form.getAttribute('data-review-id');
    const fd = new FormData(form);
    const res = replyToReview({ storeOwnerUserId: u.id, reviewId, comment: fd.get('comment') });
    if(res.ok){
      toast('Enviada', 'Respuesta publicada.', 'ok');
      render();
    } else {
      toast('Error', res.error || 'No se pudo responder.', 'danger');
    }
    return;
  }
}

function onChange(e){
  const el = e.target;
  if(el && el.matches('input[data-action="cart-qty"]')){
    const u = currentUser();
    if(!u) return;
    const productId = el.getAttribute('data-product-id');
    const qty = Number(el.value || 1);
    cartUpdateQty(u.id, productId, qty);
    render();
    return;
  }

  if(el && el.matches('input[data-action="import-db"]')){
    const file = el.files?.[0];
    if(!file) return;
    importDBFromFile(file).then(() => render());
    el.value = '';
  }
}

init();
