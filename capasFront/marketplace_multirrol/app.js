/*
  Marketplace Multirrol (prototipo)
  - Sin backend: todo se guarda en localStorage como JSON.
  - Roles: admin, store, customer, visitor (no logueado)
  - Registro de tienda: store_pending -> aprobado por admin -> store
*/

(() => {
  'use strict';

  const STORAGE_KEY = 'cuentica_marketplace_state_v1';
  const SESSION_KEY = 'cuentica_marketplace_session_v1';
  const VERSION = '1.0.0';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const fmtMoney = (value, currency='COP') => {
    try{
      return new Intl.NumberFormat('es-CO', { style:'currency', currency }).format(value);
    }catch{
      return `$${Number(value||0).toFixed(2)}`;
    }
  };

  const nowISO = () => new Date().toISOString();
  const uid = (prefix='id') => `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  const escapeHtml = (str) => String(str ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const toast = (msg) => {
    const t = $('#toast');
    if(!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { t.style.opacity = '0'; }, 1600);
  };

  const seedState = () => {
    const store1Id = uid('store');
    const store2Id = uid('store');
    const store3Id = uid('store');
    const store4Id = uid('store');

    const adminId = uid('user');
    const storeUser1Id = uid('user');
    const storeUser2Id = uid('user');
    const storeUser3Id = uid('user');
    const storeUser4Id = uid('user');
    const customerId = uid('user');

    const products = [
      {
        id: uid('prod'),
        storeId: store1Id,
        name: 'Kit de Envío Express',
        price: 49990,
        currency: 'COP',
        stock: 30,
        description: 'Empaque seguro y guía de envío para despachos rápidos.',
        tags: ['Envíos','Logística','Popular'],
        active: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: uid('prod'),
        storeId: store2Id,
        name: 'Plantilla de Catálogo Premium',
        price: 19000,
        currency: 'COP',
        stock: 999,
        description: 'Plantilla editable para publicar productos con estilo.',
        tags: ['Diseño','Catálogo','Digital'],
        active: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: uid('prod'),
        storeId: store3Id,
        name: 'Suscripción Atención 24/7',
        price: 29900,
        currency: 'COP',
        stock: 999,
        description: 'Soporte para tiendas con respuesta prioritaria.',
        tags: ['Soporte','Suscripción','Pro'],
        active: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
      {
        id: uid('prod'),
        storeId: store4Id,
        name: 'Pack Fotos de Producto',
        price: 75000,
        currency: 'COP',
        stock: 20,
        description: '20 fotos optimizadas para e-commerce (fondo limpio).',
        tags: ['Fotografía','E-commerce','Mejora ventas'],
        active: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },
    ];

    const storeRegistrationSteps = [
      'Envío de documentación legal',
      'Validación por parte del administrador',
      'Aceptación de términos y condiciones',
      'Activación de la tienda en la plataforma',
    ];

    return {
      meta: {
        version: VERSION,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      },

      // Especificación / descripción (guardada también como JSON en cache)
      spec: {
        titulo: 'Marketplace Multirrol con Gestión Centralizada',
        resumen: 'Ecosistema digital de comercio electrónico que conecta administradores, tiendas y clientes con permisos diferenciados.',
        perfiles: [
          {
            perfil: 'Administrador',
            descripcion: 'Control total de la plataforma.',
            capacidades: [
              'Gestionar usuarios: crear, modificar, eliminar y visualizar cuentas.',
              'Supervisar tiendas: acceder y editar información, productos y precios.',
              'Moderar contenido: editar/eliminar calificaciones, comentarios y respuestas.',
              'Configuración global: estructura, políticas y aspectos técnicos/de negocio.',
            ],
          },
          {
            perfil: 'Tienda',
            descripcion: 'Gestión autónoma de su propio espacio comercial.',
            capacidades: [
              'Personalizar escaparate: catálogo, precios, eliminación de artículos.',
              'Interacción: ver y responder reseñas 1–5 estrellas.',
              'Privacidad: solo su información; sin acceso a otras tiendas/clientes.',
            ],
          },
          {
            perfil: 'Cliente',
            descripcion: 'Experiencia de compra completa y participativa.',
            capacidades: [
              'Carrito universal multi-tienda (requiere registro).',
              'Reseñas post-compra (1–5 estrellas + comentario).',
              'Historial y perfil; ver respuestas de tiendas.',
            ],
          },
          {
            perfil: 'Visitante',
            descripcion: 'Modo exploración.',
            capacidades: [
              'Navegar productos y tiendas.',
              'No puede agregar al carrito, comprar ni dejar reseñas sin registrarse.',
            ],
          },
        ],
        registro_tiendas: {
          nota: 'Proceso para garantizar calidad y veracidad de vendedores.',
          pasos_sugeridos: storeRegistrationSteps,
        },
      },

      settings: {
        brandName: 'Marketplace Multirrol',
        currency: 'COP',
        policies: {
          storeRegistration: storeRegistrationSteps,
          reviews: {
            minRating: 1,
            maxRating: 5,
            onlyVerifiedPurchases: true,
          },
        },
      },

      users: [
        {
          id: adminId,
          role: 'admin',
          name: 'Administrador Demo',
          email: 'admin@demo.com',
          password: 'admin123',
          createdAt: nowISO(),
          active: true,
        },
        {
          id: storeUser1Id,
          role: 'store',
          storeId: store1Id,
          name: 'LogiPro (Tienda)',
          email: 'logipro@demo.com',
          password: 'store123',
          createdAt: nowISO(),
          active: true,
        },
        {
          id: storeUser2Id,
          role: 'store',
          storeId: store2Id,
          name: 'DesignHub (Tienda)',
          email: 'designhub@demo.com',
          password: 'store123',
          createdAt: nowISO(),
          active: true,
        },
        {
          id: storeUser3Id,
          role: 'store',
          storeId: store3Id,
          name: 'SupportNow (Tienda)',
          email: 'supportnow@demo.com',
          password: 'store123',
          createdAt: nowISO(),
          active: true,
        },
        {
          id: storeUser4Id,
          role: 'store',
          storeId: store4Id,
          name: 'StudioPix (Tienda)',
          email: 'studiopix@demo.com',
          password: 'store123',
          createdAt: nowISO(),
          active: true,
        },
        {
          id: customerId,
          role: 'customer',
          name: 'Cliente Demo',
          email: 'cliente@demo.com',
          password: 'cliente123',
          createdAt: nowISO(),
          active: true,
          profile: {
            phone: '',
            address: '',
          }
        }
      ],

      stores: [
        {
          id: store1Id,
          name: 'LogiPro',
          legalName: 'LogiPro S.A.S.',
          taxId: '900000001',
          email: 'logipro@demo.com',
          phone: '',
          address: '',
          description: 'Soluciones de envío y logística para tu e-commerce.',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        },
        {
          id: store2Id,
          name: 'DesignHub',
          legalName: 'DesignHub S.A.S.',
          taxId: '900000002',
          email: 'designhub@demo.com',
          phone: '',
          address: '',
          description: 'Plantillas y recursos digitales para publicar con estilo.',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        },
        {
          id: store3Id,
          name: 'SupportNow',
          legalName: 'SupportNow S.A.S.',
          taxId: '900000003',
          email: 'supportnow@demo.com',
          phone: '',
          address: '',
          description: 'Atención al cliente y soporte para tiendas.',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        },
        {
          id: store4Id,
          name: 'StudioPix',
          legalName: 'StudioPix S.A.S.',
          taxId: '900000004',
          email: 'studiopix@demo.com',
          phone: '',
          address: '',
          description: 'Fotografía de producto optimizada para ventas.',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        }
      ],

      products,
      storeApplications: [],
      reviews: [],
      orders: [],
      carts: {},
      auditLog: [],
    };
  };

  const loadJSON = (key) => {
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      return JSON.parse(raw);
    }catch{
      return null;
    }
  };

  const saveJSON = (key, obj) => {
    localStorage.setItem(key, JSON.stringify(obj));
  };

  let state = loadJSON(STORAGE_KEY);
  if(!state){
    state = seedState();
    saveJSON(STORAGE_KEY, state);
  }

  let session = loadJSON(SESSION_KEY) || { userId: null };

  const saveState = () => {
    state.meta.updatedAt = nowISO();
    saveJSON(STORAGE_KEY, state);
  };

  const saveSession = () => saveJSON(SESSION_KEY, session);

  const getUserById = (id) => state.users.find(u => u.id === id);
  const getStoreById = (id) => state.stores.find(s => s.id === id);
  const getProductById = (id) => state.products.find(p => p.id === id);

  const currentUser = () => session?.userId ? getUserById(session.userId) : null;
  const role = () => currentUser()?.role || 'visitor';

  const log = (action, details={}) => {
    state.auditLog.push({ id: uid('log'), at: nowISO(), actorUserId: session.userId, role: role(), action, details });
    if(state.auditLog.length > 2500) state.auditLog.splice(0, state.auditLog.length - 2500);
  };

  const setHash = (path) => {
    if(!path.startsWith('/')) path = '/' + path;
    location.hash = '#' + path;
  };

  const parseHash = () => {
    const h = (location.hash || '#/').slice(1);
    const [path, queryStr] = h.split('?');
    const query = {};
    if(queryStr){
      for(const part of queryStr.split('&')){
        const [k,v] = part.split('=');
        if(!k) continue;
        query[decodeURIComponent(k)] = decodeURIComponent(v||'');
      }
    }
    return { path: path || '/', query };
  };

  const matchRoute = (path, pattern) => {
    const a = path.split('/').filter(Boolean);
    const b = pattern.split('/').filter(Boolean);
    if(a.length !== b.length) return null;
    const params = {};
    for(let i=0;i<a.length;i++){
      if(b[i].startsWith(':')) params[b[i].slice(1)] = a[i];
      else if(a[i] !== b[i]) return null;
    }
    return params;
  };

  const getCart = (userId) => {
    if(!userId) return { items: [] };
    if(!state.carts[userId]) state.carts[userId] = { items: [] };
    return state.carts[userId];
  };

  const cartItemCount = () => {
    const u = currentUser();
    if(!u || u.role !== 'customer') return 0;
    return getCart(u.id).items.reduce((acc, it) => acc + (it.qty||0), 0);
  };

  const ensureCustomer = () => {
    if(role() !== 'customer'){
      toast('Debes iniciar sesión como cliente para continuar.');
      setHash('/login');
      return false;
    }
    return true;
  };

  const ensureAdmin = () => {
    if(role() !== 'admin'){
      toast('Acceso restringido (solo administrador).');
      setHash('/');
      return false;
    }
    return true;
  };

  const ensureStore = () => {
    if(role() !== 'store'){
      toast('Acceso restringido (solo tienda).');
      setHash('/');
      return false;
    }
    return true;
  };

  const visibleReviews = (user) => {
    if(user?.role === 'admin') return state.reviews;
    return state.reviews.filter(r => !r.moderation?.hidden);
  };

  const avgRating = (reviews) => {
    const rs = reviews.filter(r => typeof r.rating === 'number');
    if(!rs.length) return null;
    return rs.reduce((a,r)=>a+r.rating,0) / rs.length;
  };

  const renderStars = (value, { clickable=false, name='', selected=0 } = {}) => {
    const v = Math.max(0, Math.min(5, Number(value||0)));
    const sel = Number(selected||0);
    const stars = [];
    for(let i=1;i<=5;i++){
      const finalFilled = clickable ? (i <= sel) : (i <= v);
      const cls = ['star', finalFilled?'filled':'', clickable?'clickable':''].filter(Boolean).join(' ');
      const attrs = clickable ? ` data-action="set-rating" data-name="${escapeHtml(name)}" data-value="${i}" aria-label="${i} estrellas" role="button" tabindex="0"` : '';
      stars.push(`<span class="${cls}" ${attrs}></span>`);
    }
    return `<span class="stars" aria-label="${v.toFixed(1)} de 5">${stars.join('')}</span>`;
  };

  const formatDate = (iso) => {
    try{
      const d = new Date(iso);
      return d.toLocaleString('es-CO', { year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    }catch{
      return iso;
    }
  };

  const computeStoreStats = (storeId) => {
    const rev = visibleReviews(currentUser()).filter(r => r.targetType==='store' && r.storeId===storeId);
    const avg = avgRating(rev);
    return { count: rev.length, avg };
  };

  const computeProductStats = (productId) => {
    const rev = visibleReviews(currentUser()).filter(r => r.targetType==='product' && r.productId===productId);
    const avg = avgRating(rev);
    return { count: rev.length, avg };
  };

  const userHasPurchasedProduct = (userId, productId) => {
    return state.orders.some(o => o.userId === userId && o.items.some(it => it.productId === productId));
  };

  const userHasOrderedFromStore = (userId, storeId) => {
    return state.orders.some(o => o.userId === userId && o.items.some(it => it.storeId === storeId));
  };

  const setNavActive = () => {
    const { path } = parseHash();
    $$('#nav .chip').forEach(ch => {
      const target = ch.getAttribute('data-nav') || '';
      ch.classList.toggle('active', target === path);
    });
  };

  const renderNav = () => {
    const u = currentUser();
    const r = role();

    const items = [];
    items.push({ label:'Inicio', to:'/' });
    items.push({ label:'Tiendas', to:'/stores' });
    items.push({ label:`Carrito (${cartItemCount()})`, to:'/cart', show: r==='customer' });
    items.push({ label:'Mis pedidos', to:'/orders', show: r==='customer' });
    items.push({ label:'Mi perfil', to:'/profile', show: r==='customer' });
    items.push({ label:'Panel Tienda', to:'/store-panel', show: r==='store' });
    items.push({ label:'Panel Admin', to:'/admin', show: r==='admin' });
    items.push({ label:'Ingresar', to:'/login', show: r==='visitor' });
    items.push({ label:'Registrarse', to:'/register', show: r==='visitor' });

    const html = items
      .filter(it => it.show !== false)
      .map(it => `<button class="chip" data-nav="${it.to}" type="button">${escapeHtml(it.label)}</button>`)
      .join('');

    $('#nav').innerHTML = html;

    // Brand
    $('#brandTitle').textContent = state.settings.brandName || 'Marketplace Multirrol';
    $('#brandSubtitle').textContent = u ? `${u.name} · Rol: ${u.role}` : 'Visitante · Explora sin registrarte';

    setNavActive();
  };

  const downloadText = (filename, content, mime='application/json') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  // ---------- Render pages ----------

  const renderHome = () => {
    const featured = state.products.filter(p => p.active).slice(0, 6);
    const stores = state.stores.filter(s => s.active).slice(0, 6);

    const storeCards = stores.map(s => {
      const stats = computeStoreStats(s.id);
      const ratingHtml = stats.avg ? `${renderStars(stats.avg)} <span class="small">(${stats.count})</span>` : `<span class="small">Sin reseñas</span>`;
      return `
        <div class="tile">
          <div class="row" style="justify-content:space-between; align-items:flex-start">
            <div>
              <p class="title" style="margin:0">${escapeHtml(s.name)}</p>
              <div class="small">${escapeHtml(s.description || '')}</div>
            </div>
            <div>${ratingHtml}</div>
          </div>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/store/${s.id}">Ver tienda</button>
            <span class="badge">Activa</span>
          </div>
        </div>
      `;
    }).join('');

    const productCards = featured.map(p => {
      const store = getStoreById(p.storeId);
      const stats = computeProductStats(p.id);
      const ratingHtml = stats.avg ? `${renderStars(stats.avg)} <span class="small">(${stats.count})</span>` : `<span class="small">Sin reseñas</span>`;
      return `
        <div class="tile">
          <p class="title" style="margin:0">${escapeHtml(p.name)}</p>
          <div class="meta">
            <span class="badge">${escapeHtml(store?.name || 'Tienda')}</span>
            <span class="price">${fmtMoney(p.price, p.currency || state.settings.currency)}</span>
          </div>
          <div style="margin-top:8px">${ratingHtml}</div>
          <div class="small" style="margin-top:8px">${escapeHtml(p.description || '')}</div>
          <div class="pills">${(p.tags||[]).slice(0,3).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/product/${p.id}">Ver producto</button>
            <button class="button primary" data-action="add-to-cart" data-product-id="${p.id}">Agregar</button>
          </div>
        </div>
      `;
    }).join('');

    const u = currentUser();
    const roleBadge = {
      admin: `<span class="badge"><img src="./assets/admin.svg" alt="" style="width:16px;height:16px"> Admin</span>`,
      store: `<span class="badge"><img src="./assets/store.svg" alt="" style="width:16px;height:16px"> Tienda</span>`,
      customer: `<span class="badge"><img src="./assets/customer.svg" alt="" style="width:16px;height:16px"> Cliente</span>`,
      visitor: `<span class="badge"><img src="./assets/visitor.svg" alt="" style="width:16px;height:16px"> Visitante</span>`,
    }[role()] || '';

    return `
      <div class="grid two">
        <div class="card">
          <div class="row" style="justify-content:space-between">
            <div>
              <div class="badge">Tema: Minimalista moderno</div>
              <h1 class="h1">${escapeHtml(state.settings.brandName)}</h1>
              <p class="lead">${escapeHtml(state.spec?.titulo || 'Marketplace Multirrol')} · ${escapeHtml(state.spec?.resumen || '')}</p>
            </div>
            <div class="row" style="align-items:flex-start">
              ${roleBadge}
              ${u ? `<button class="button" data-action="logout">Cerrar sesión</button>` : ''}
            </div>
          </div>

          <div class="section-title">
            <h2>Accesos rápidos</h2>
            <span class="badge">Prototipo (localStorage)</span>
          </div>

          <div class="row">
            ${role()==='visitor' ? `
              <button class="button primary" data-action="go" data-to="/login">Ingresar</button>
              <button class="button" data-action="go" data-to="/register">Registrarse (Cliente)</button>
              <button class="button" data-action="go" data-to="/register-store">Registrar Tienda</button>
            ` : ''}
            ${role()==='customer' ? `
              <button class="button primary" data-action="go" data-to="/stores">Explorar tiendas</button>
              <button class="button" data-action="go" data-to="/cart">Ver carrito</button>
              <button class="button" data-action="go" data-to="/orders">Mis pedidos</button>
            ` : ''}
            ${role()==='store' ? `
              <button class="button primary" data-action="go" data-to="/store-panel">Panel de tienda</button>
            ` : ''}
            ${role()==='admin' ? `
              <button class="button primary" data-action="go" data-to="/admin">Panel administrador</button>
            ` : ''}
          </div>

          <div class="section-title">
            <h2>Tiendas destacadas</h2>
            <span class="badge">${stores.length}</span>
          </div>
          <div class="cards">${storeCards || `<div class="notice">No hay tiendas para mostrar.</div>`}</div>

          <div class="section-title">
            <h2>Productos destacados</h2>
            <span class="badge">${featured.length}</span>
          </div>
          <div class="cards">${productCards || `<div class="notice">No hay productos para mostrar.</div>`}</div>

          <div class="section-title">
            <h2>Perfiles y permisos</h2>
            <span class="badge">Resumen</span>
          </div>
          <table class="table" aria-label="Tabla de roles">
            <thead><tr><th>Perfil</th><th>Capacidades</th></tr></thead>
            <tbody>
              ${(state.spec?.perfiles || []).map(p => `
                <tr>
                  <td><b>${escapeHtml(p.perfil)}</b></td>
                  <td class="small">${escapeHtml((p.capacidades||[]).join(' · '))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="section-title">
            <h2>Credenciales demo</h2>
            <span class="badge">Para probar</span>
          </div>

          <div class="notice">
            <div class="small"><b>Admin</b>: <span class="inline">admin@demo.com</span> / <span class="inline">admin123</span></div>
            <div class="small" style="margin-top:6px"><b>Cliente</b>: <span class="inline">cliente@demo.com</span> / <span class="inline">cliente123</span></div>
            <div class="small" style="margin-top:6px"><b>Tienda</b>: <span class="inline">logipro@demo.com</span> (o cualquier tienda @demo.com) / <span class="inline">store123</span></div>
          </div>

          <div class="section-title">
            <h2>Registro de tiendas</h2>
            <span class="badge">Flujo</span>
          </div>
          <ol class="small" style="margin:0; padding-left:18px">
            ${(state.settings.policies.storeRegistration||[]).map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>

          <div class="section-title">
            <h2>Sobre este prototipo</h2>
            <span class="badge">Importante</span>
          </div>
          <div class="small">
            Todo se guarda en <b>localStorage</b>. No hay seguridad real: es una maqueta funcional para validar flujo y pantallas.
          </div>

          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/stores">Ver tiendas</button>
            <button class="button" data-action="go" data-to="/register-store">Registrar tienda</button>
          </div>
        </div>
      </div>
    `;
  };

  const renderLogin = () => {
    const u = currentUser();
    if(u){
      return `
        <div class="card">
          <h1 class="h1">Ya iniciaste sesión</h1>
          <p class="lead">Estás autenticado como <b>${escapeHtml(u.name)}</b> (${escapeHtml(u.role)}).</p>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="logout">Cerrar sesión</button>
            <button class="button primary" data-action="go" data-to="/">Ir al inicio</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="grid two">
        <div class="card">
          <h1 class="h1">Ingresar</h1>
          <p class="lead">Accede como Administrador, Tienda o Cliente.</p>
          <div class="hr"></div>
          <form class="form" data-form="login">
            <div>
              <label>Email</label>
              <input class="input" name="email" type="email" required placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label>Contraseña</label>
              <input class="input" name="password" type="password" required placeholder="••••••••" />
            </div>
            <button class="button primary" type="submit">Entrar</button>
          </form>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/register">Crear cuenta (Cliente)</button>
            <button class="button" data-action="go" data-to="/register-store">Registrar Tienda</button>
          </div>
        </div>

        <div class="card">
          <div class="section-title"><h2>Tips</h2><span class="badge">Demo</span></div>
          <div class="small">
            Si es tu primera vez, usa las credenciales demo del inicio.
            <div class="hr"></div>
            Si registras una tienda, quedará <b>pendiente</b> hasta que el admin la apruebe.
          </div>
        </div>
      </div>
    `;
  };

  const renderRegisterCustomer = () => {
    if(currentUser()){
      return `
        <div class="card">
          <h1 class="h1">Ya tienes sesión</h1>
          <p class="lead">Cierra sesión para registrar una cuenta nueva.</p>
          <div class="hr"></div>
          <button class="button" data-action="logout">Cerrar sesión</button>
        </div>
      `;
    }

    return `
      <div class="grid two">
        <div class="card">
          <h1 class="h1">Registro de Cliente</h1>
          <p class="lead">Crea tu cuenta para comprar, tener historial y dejar reseñas.</p>
          <div class="hr"></div>

          <form class="form" data-form="register-customer">
            <div>
              <label>Nombre</label>
              <input class="input" name="name" required placeholder="Tu nombre" />
            </div>
            <div class="two">
              <div>
                <label>Email</label>
                <input class="input" name="email" type="email" required placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label>Contraseña</label>
                <input class="input" name="password" type="password" required minlength="6" placeholder="mín. 6 caracteres" />
              </div>
            </div>
            <button class="button primary" type="submit">Crear cuenta</button>
          </form>

          <div class="hr"></div>
          <div class="small">¿Ya tienes cuenta? <a href="#/login">Ingresa aquí</a></div>
        </div>

        <div class="card">
          <div class="section-title"><h2>Visitante vs Cliente</h2><span class="badge">Reglas</span></div>
          <ul class="small" style="margin:0; padding-left:18px">
            <li>Visitante: solo explora.</li>
            <li>Cliente: agrega al carrito, compra y reseña post-compra.</li>
          </ul>
        </div>
      </div>
    `;
  };

  const renderRegisterStore = () => {
    if(currentUser()){
      return `
        <div class="card">
          <h1 class="h1">Ya tienes sesión</h1>
          <p class="lead">Cierra sesión para registrar una tienda nueva.</p>
          <div class="hr"></div>
          <button class="button" data-action="logout">Cerrar sesión</button>
        </div>
      `;
    }

    return `
      <div class="grid two">
        <div class="card">
          <h1 class="h1">Registro de Tienda</h1>
          <p class="lead">Tu solicitud quedará en revisión. El administrador debe aprobarla.</p>
          <div class="hr"></div>

          <form class="form" data-form="register-store">
            <div>
              <label>Nombre de la tienda</label>
              <input class="input" name="storeName" required placeholder="Mi Tienda" />
            </div>
            <div class="two">
              <div>
                <label>Razón social</label>
                <input class="input" name="legalName" required placeholder="Mi Tienda S.A.S." />
              </div>
              <div>
                <label>NIT / ID tributario</label>
                <input class="input" name="taxId" required placeholder="900000000" />
              </div>
            </div>
            <div class="two">
              <div>
                <label>Email (login)</label>
                <input class="input" name="email" type="email" required placeholder="tienda@correo.com" />
              </div>
              <div>
                <label>Contraseña</label>
                <input class="input" name="password" type="password" required minlength="6" placeholder="mín. 6 caracteres" />
              </div>
            </div>
            <div class="two">
              <div>
                <label>Teléfono</label>
                <input class="input" name="phone" placeholder="Opcional" />
              </div>
              <div>
                <label>Dirección</label>
                <input class="input" name="address" placeholder="Opcional" />
              </div>
            </div>
            <div>
              <label>Documentación (notas)</label>
              <textarea name="docs" rows="3" placeholder="Ej: Cámara de comercio, RUT, cédula representante, etc."></textarea>
            </div>
            <div class="row">
              <input type="checkbox" id="terms" name="terms" required />
              <label for="terms" style="text-transform:none; letter-spacing:0; font-size:12px; font-weight:700">
                Acepto términos y condiciones.
              </label>
            </div>
            <button class="button primary" type="submit">Enviar solicitud</button>
          </form>
        </div>

        <div class="card">
          <div class="section-title"><h2>Proceso</h2><span class="badge">Sugerido</span></div>
          <ol class="small" style="margin:0; padding-left:18px">
            ${(state.settings.policies.storeRegistration||[]).map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
          <div class="hr"></div>
          <div class="notice">
            <div class="small"><b>Nota</b>: En un sistema real, la documentación se subiría como archivos. Aquí se guarda como texto para el prototipo.</div>
          </div>
        </div>
      </div>
    `;
  };

  const renderStoresList = () => {
    const { query } = parseHash();
    const q = (query.q || '').trim().toLowerCase();

    const stores = state.stores
      .filter(s => s.active)
      .filter(s => !q || s.name.toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q));

    const cards = stores.map(s => {
      const stats = computeStoreStats(s.id);
      const ratingHtml = stats.avg ? `${renderStars(stats.avg)} <span class="small">(${stats.count})</span>` : `<span class="small">Sin reseñas</span>`;
      return `
        <div class="tile">
          <div class="row" style="justify-content:space-between; align-items:flex-start">
            <div>
              <p class="title" style="margin:0">${escapeHtml(s.name)}</p>
              <div class="small">${escapeHtml(s.description || '')}</div>
            </div>
            <div>${ratingHtml}</div>
          </div>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/store/${s.id}">Ver tienda</button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <div>
            <h1 class="h1">Tiendas</h1>
            <p class="lead">Explora tiendas registradas en el marketplace.</p>
          </div>
          <div class="row">
            <button class="button" data-action="go" data-to="/register-store">Registrar tienda</button>
          </div>
        </div>

        <div class="hr"></div>

        <div class="row" style="align-items:flex-end">
          <div style="flex:1">
            <label>Buscar</label>
            <input class="input" placeholder="Nombre o descripción" value="${escapeHtml(query.q||'')}" data-action="search-stores" />
          </div>
          <div>
            <button class="button" data-action="clear-search" data-where="stores">Limpiar</button>
          </div>
        </div>

        <div class="section-title"><h2>Resultados</h2><span class="badge">${stores.length}</span></div>
        <div class="cards">${cards || `<div class="notice">No se encontraron tiendas.</div>`}</div>
      </div>
    `;
  };

  const renderStoreDetail = (storeId) => {
    const store = getStoreById(storeId);
    if(!store) return `<div class="card"><h1 class="h1">Tienda no encontrada</h1><button class="button" data-action="go" data-to="/stores">Volver</button></div>`;

    const products = state.products.filter(p => p.storeId === storeId && p.active);

    const productCards = products.map(p => {
      const stats = computeProductStats(p.id);
      const ratingHtml = stats.avg ? `${renderStars(stats.avg)} <span class="small">(${stats.count})</span>` : `<span class="small">Sin reseñas</span>`;
      return `
        <div class="tile">
          <p class="title" style="margin:0">${escapeHtml(p.name)}</p>
          <div class="meta">
            <span class="price">${fmtMoney(p.price, p.currency || state.settings.currency)}</span>
            <span class="badge">Stock: ${escapeHtml(p.stock)}</span>
          </div>
          <div style="margin-top:8px">${ratingHtml}</div>
          <div class="small" style="margin-top:8px">${escapeHtml(p.description || '')}</div>
          <div class="pills">${(p.tags||[]).slice(0,3).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('')}</div>
          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/product/${p.id}">Ver</button>
            <button class="button primary" data-action="add-to-cart" data-product-id="${p.id}">Agregar</button>
          </div>
        </div>
      `;
    }).join('');

    const reviews = visibleReviews(currentUser()).filter(r => r.targetType==='store' && r.storeId === storeId);
    const stats = computeStoreStats(storeId);

    const reviewList = reviews
      .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
      .map(r => renderReviewCard(r))
      .join('');

    const canReview = role()==='customer' && userHasOrderedFromStore(currentUser().id, storeId);

    const reviewForm = role()==='customer' ? (canReview ? `
      <div class="tile">
        <p class="title" style="margin:0">Dejar reseña (tienda)</p>
        <div class="small">Solo disponible si compraste en esta tienda.</div>
        <div class="hr"></div>
        <form class="form" data-form="add-review" data-target-type="store" data-store-id="${storeId}">
          <div>
            <label>Calificación</label>
            <div class="row">
              <div data-rating="reviewRating" data-selected="0">${renderStars(0,{clickable:true,name:'reviewRating',selected:0})}</div>
              <span class="badge" id="ratingLabel">0/5</span>
            </div>
            <input type="hidden" name="rating" value="0" />
          </div>
          <div>
            <label>Comentario</label>
            <textarea name="comment" rows="3" required placeholder="¿Cómo fue tu experiencia?"></textarea>
          </div>
          <button class="button primary" type="submit">Publicar reseña</button>
        </form>
      </div>
    ` : `
      <div class="notice">
        <div class="small"><b>Reseñas post-compra</b>: Para reseñar esta tienda, primero debes realizar una compra aquí.</div>
      </div>
    `) : '';

    return `
      <div class="grid two">
        <div class="card">
          <div class="row" style="justify-content:space-between; align-items:flex-start">
            <div>
              <h1 class="h1">${escapeHtml(store.name)}</h1>
              <p class="lead">${escapeHtml(store.description || '')}</p>
              <div class="small" style="margin-top:10px">
                <b>Contacto</b>: ${escapeHtml(store.email || '—')} · ${escapeHtml(store.phone || '—')}
              </div>
              <div class="small">
                <b>Dirección</b>: ${escapeHtml(store.address || '—')}
              </div>
            </div>
            <div style="text-align:right">
              <div>${stats.avg ? renderStars(stats.avg) : ''}</div>
              <div class="small">${stats.count ? `${stats.count} reseña(s)` : 'Sin reseñas'}</div>
              <div style="margin-top:10px">
                <button class="button" data-action="go" data-to="/stores">Volver</button>
              </div>
            </div>
          </div>

          <div class="section-title"><h2>Productos</h2><span class="badge">${products.length}</span></div>
          <div class="cards">${productCards || `<div class="notice">Esta tienda no tiene productos.</div>`}</div>
        </div>

        <div class="card">
          <div class="section-title"><h2>Reseñas de la tienda</h2><span class="badge">${reviews.length}</span></div>
          ${reviewForm}
          <div class="hr"></div>
          <div style="display:grid; gap:10px">
            ${reviewList || `<div class="notice">Aún no hay reseñas.</div>`}
          </div>
        </div>
      </div>
    `;
  };

  const renderProductDetail = (productId) => {
    const p = getProductById(productId);
    if(!p) return `<div class="card"><h1 class="h1">Producto no encontrado</h1><button class="button" data-action="go" data-to="/">Volver</button></div>`;
    const store = getStoreById(p.storeId);

    const stats = computeProductStats(productId);
    const reviews = visibleReviews(currentUser()).filter(r => r.targetType==='product' && r.productId === productId);

    const reviewList = reviews
      .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
      .map(r => renderReviewCard(r))
      .join('');

    const canReview = role()==='customer' && userHasPurchasedProduct(currentUser().id, productId);

    const reviewForm = role()==='customer' ? (canReview ? `
      <div class="tile">
        <p class="title" style="margin:0">Dejar reseña (producto)</p>
        <div class="small">Solo disponible si compraste este producto.</div>
        <div class="hr"></div>
        <form class="form" data-form="add-review" data-target-type="product" data-product-id="${productId}" data-store-id="${p.storeId}">
          <div>
            <label>Calificación</label>
            <div class="row">
              <div data-rating="reviewRating" data-selected="0">${renderStars(0,{clickable:true,name:'reviewRating',selected:0})}</div>
              <span class="badge" id="ratingLabel">0/5</span>
            </div>
            <input type="hidden" name="rating" value="0" />
          </div>
          <div>
            <label>Comentario</label>
            <textarea name="comment" rows="3" required placeholder="¿Qué te pareció el producto?"></textarea>
          </div>
          <button class="button primary" type="submit">Publicar reseña</button>
        </form>
      </div>
    ` : `
      <div class="notice">
        <div class="small"><b>Reseñas post-compra</b>: Para reseñar este producto, primero debes comprarlo.</div>
      </div>
    `) : '';

    return `
      <div class="grid two">
        <div class="card">
          <div class="row" style="justify-content:space-between; align-items:flex-start">
            <div>
              <h1 class="h1">${escapeHtml(p.name)}</h1>
              <p class="lead">${escapeHtml(p.description || '')}</p>
              <div class="row" style="margin-top:10px">
                <span class="badge">Tienda: <a href="#/store/${p.storeId}">${escapeHtml(store?.name || '—')}</a></span>
                <span class="badge">Stock: ${escapeHtml(p.stock)}</span>
                <span class="badge">${escapeHtml((p.tags||[]).join(' · ') || 'Sin tags')}</span>
              </div>
            </div>
            <div style="text-align:right">
              <div class="price" style="font-size:18px">${fmtMoney(p.price, p.currency || state.settings.currency)}</div>
              <div style="margin-top:6px">${stats.avg ? renderStars(stats.avg) : ''}</div>
              <div class="small">${stats.count ? `${stats.count} reseña(s)` : 'Sin reseñas'}</div>
              <div style="margin-top:10px" class="row">
                <button class="button" data-action="go" data-to="/store/${p.storeId}">Ver tienda</button>
                <button class="button primary" data-action="add-to-cart" data-product-id="${p.id}">Agregar al carrito</button>
              </div>
            </div>
          </div>

          <div class="hr"></div>
          <div class="small">ID producto: <span class="inline">${escapeHtml(p.id)}</span></div>
        </div>

        <div class="card">
          <div class="section-title"><h2>Reseñas del producto</h2><span class="badge">${reviews.length}</span></div>
          ${reviewForm}
          <div class="hr"></div>
          <div style="display:grid; gap:10px">
            ${reviewList || `<div class="notice">Aún no hay reseñas.</div>`}
          </div>
        </div>
      </div>
    `;
  };

  const renderCart = () => {
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      return `
        <div class="card">
          <h1 class="h1">Carrito</h1>
          <p class="lead">Debes iniciar sesión como cliente para usar el carrito.</p>
          <div class="hr"></div>
          <button class="button primary" data-action="go" data-to="/login">Ingresar</button>
        </div>
      `;
    }

    const cart = getCart(u.id);
    const items = cart.items
      .map(it => {
        const p = getProductById(it.productId);
        if(!p) return null;
        const store = getStoreById(p.storeId);
        return {
          ...it,
          product: p,
          store,
          subtotal: (p.price||0) * (it.qty||0),
        };
      })
      .filter(Boolean);

    const total = items.reduce((a,i)=>a+i.subtotal,0);

    const rows = items.map(i => `
      <tr>
        <td>
          <b>${escapeHtml(i.product.name)}</b>
          <div class="small">Tienda: ${escapeHtml(i.store?.name || '—')}</div>
        </td>
        <td>${fmtMoney(i.product.price, i.product.currency || state.settings.currency)}</td>
        <td style="width:160px">
          <div class="row" style="gap:6px">
            <button class="button" data-action="cart-qty" data-product-id="${i.productId}" data-delta="-1">-</button>
            <span class="badge">${escapeHtml(i.qty)}</span>
            <button class="button" data-action="cart-qty" data-product-id="${i.productId}" data-delta="1">+</button>
          </div>
        </td>
        <td>${fmtMoney(i.subtotal, i.product.currency || state.settings.currency)}</td>
        <td style="width:110px">
          <button class="button danger" data-action="cart-remove" data-product-id="${i.productId}">Quitar</button>
        </td>
      </tr>
    `).join('');

    const grouped = (() => {
      const map = new Map();
      for(const i of items){
        const sid = i.product.storeId;
        if(!map.has(sid)) map.set(sid, { store: i.store, items: [] });
        map.get(sid).items.push(i);
      }
      return Array.from(map.values());
    })();

    const summary = grouped.map(g => {
      const subtotal = g.items.reduce((a,i)=>a+i.subtotal,0);
      return `<div class="small">• ${escapeHtml(g.store?.name || 'Tienda')} — ${fmtMoney(subtotal, state.settings.currency)}</div>`;
    }).join('');

    return `
      <div class="grid two">
        <div class="card">
          <h1 class="h1">Carrito universal</h1>
          <p class="lead">Puedes mezclar productos de múltiples tiendas en un solo carrito.</p>

          <div class="section-title"><h2>Ítems</h2><span class="badge">${items.length}</span></div>

          ${items.length ? `
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          ` : `<div class="notice"><div class="small">Tu carrito está vacío.</div></div>`}

          <div class="hr"></div>
          <div class="row">
            <button class="button" data-action="go" data-to="/stores">Seguir comprando</button>
            <button class="button" data-action="cart-clear">Vaciar carrito</button>
          </div>
        </div>

        <div class="card">
          <div class="section-title"><h2>Resumen</h2><span class="badge">Total</span></div>
          <div class="kpi">
            <div class="label">Total</div>
            <div class="value">${fmtMoney(total, state.settings.currency)}</div>
          </div>
          <div class="hr"></div>
          <div class="small"><b>Por tienda</b></div>
          <div style="margin-top:8px">${summary || '<div class="small">—</div>'}</div>

          <div class="hr"></div>
          <button class="button primary" ${items.length? '' : 'disabled'} data-action="checkout">Realizar compra</button>

          <div class="hr"></div>
          <div class="notice">
            <div class="small">En este prototipo la compra es simulada: crea un pedido y habilita reseñas post-compra.</div>
          </div>
        </div>
      </div>
    `;
  };

  const renderOrders = () => {
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      return `
        <div class="card">
          <h1 class="h1">Mis pedidos</h1>
          <p class="lead">Debes iniciar sesión como cliente.</p>
          <div class="hr"></div>
          <button class="button primary" data-action="go" data-to="/login">Ingresar</button>
        </div>
      `;
    }

    const orders = state.orders
      .filter(o => o.userId === u.id)
      .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));

    const cards = orders.map(o => {
      const stores = Array.from(new Set(o.items.map(i => i.storeId)))
        .map(sid => getStoreById(sid)?.name || 'Tienda')
        .join(', ');
      const total = o.total || o.items.reduce((a,i)=>a+(i.price*i.qty),0);
      return `
        <div class="tile">
          <div class="row" style="justify-content:space-between">
            <div>
              <p class="title" style="margin:0">Pedido ${escapeHtml(o.id)}</p>
              <div class="small">${formatDate(o.createdAt)} · Tiendas: ${escapeHtml(stores)}</div>
            </div>
            <div style="text-align:right">
              <div class="price">${fmtMoney(total, state.settings.currency)}</div>
              <div class="small">Estado: ${escapeHtml(o.status || 'placed')}</div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="small"><b>Ítems</b></div>
          <ul class="small" style="margin:8px 0 0; padding-left:18px">
            ${o.items.map(it => {
              const store = getStoreById(it.storeId);
              return `<li>${escapeHtml(it.name)} · ${escapeHtml(store?.name||'Tienda')} · ${it.qty} x ${fmtMoney(it.price, state.settings.currency)}</li>`;
            }).join('')}
          </ul>
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="row" style="justify-content:space-between">
          <div>
            <h1 class="h1">Mis pedidos</h1>
            <p class="lead">Historial de compras y base para reseñas post-compra.</p>
          </div>
          <div class="row">
            <button class="button" data-action="go" data-to="/stores">Comprar</button>
          </div>
        </div>

        <div class="section-title"><h2>Listado</h2><span class="badge">${orders.length}</span></div>
        <div style="display:grid; gap:12px">
          ${cards || `<div class="notice"><div class="small">Aún no tienes pedidos. Ve a <a href="#/stores">tiendas</a> y compra.</div></div>`}
        </div>
      </div>
    `;
  };

  const renderProfile = () => {
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      return `
        <div class="card">
          <h1 class="h1">Perfil</h1>
          <p class="lead">Debes iniciar sesión como cliente.</p>
          <div class="hr"></div>
          <button class="button primary" data-action="go" data-to="/login">Ingresar</button>
        </div>
      `;
    }

    const profile = u.profile || { phone:'', address:'' };

    return `
      <div class="grid two">
        <div class="card">
          <h1 class="h1">Mi perfil</h1>
          <p class="lead">Actualiza tus datos. (Se guarda en localStorage)</p>
          <div class="hr"></div>
          <form class="form" data-form="update-profile">
            <div>
              <label>Nombre</label>
              <input class="input" name="name" required value="${escapeHtml(u.name)}" />
            </div>
            <div class="two">
              <div>
                <label>Teléfono</label>
                <input class="input" name="phone" value="${escapeHtml(profile.phone||'')}" />
              </div>
              <div>
                <label>Dirección</label>
                <input class="input" name="address" value="${escapeHtml(profile.address||'')}" />
              </div>
            </div>
            <button class="button primary" type="submit">Guardar</button>
          </form>
          <div class="hr"></div>
          <button class="button" data-action="logout">Cerrar sesión</button>
        </div>

        <div class="card">
          <div class="section-title"><h2>Mis reseñas</h2><span class="badge">${state.reviews.filter(r=>r.userId===u.id).length}</span></div>
          <div class="small">Tus reseñas pueden recibir respuesta de la tienda. El administrador puede moderarlas.</div>
          <div class="hr"></div>
          <div style="display:grid; gap:10px">
            ${state.reviews
              .filter(r => r.userId === u.id)
              .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
              .map(r => renderReviewCard(r, { compact:true }))
              .join('') || `<div class="notice"><div class="small">Aún no has dejado reseñas.</div></div>`}
          </div>
        </div>
      </div>
    `;
  };

  // Admin + Store panels reuse from previous version (kept as-is for functionality)

  const renderAdmin = (query={}) => {
    if(!ensureAdmin()) return '';

    const tab = query.tab || 'dashboard';

    const kpi = {
      users: state.users.length,
      stores: state.stores.length,
      products: state.products.length,
      orders: state.orders.length,
      reviews: state.reviews.length,
      pending: state.storeApplications.filter(a=>a.status==='pending').length,
    };

    const tabs = [
      ['dashboard','Dashboard'],
      ['users','Usuarios'],
      ['stores','Tiendas'],
      ['applications','Solicitudes'],
      ['products','Productos'],
      ['reviews','Reseñas'],
      ['settings','Configuración'],
      ['audit','Auditoría'],
    ];

    const tabButtons = tabs.map(([k,label]) => {
      const active = k===tab ? 'active' : '';
      return `<button class="chip ${active}" data-action="admin-tab" data-tab="${k}" type="button">${escapeHtml(label)}</button>`;
    }).join('');

    const dashboard = () => `
      <div class="row">
        <div class="kpi"><div class="label">Usuarios</div><div class="value">${kpi.users}</div></div>
        <div class="kpi"><div class="label">Tiendas</div><div class="value">${kpi.stores}</div></div>
        <div class="kpi"><div class="label">Productos</div><div class="value">${kpi.products}</div></div>
        <div class="kpi"><div class="label">Pedidos</div><div class="value">${kpi.orders}</div></div>
        <div class="kpi"><div class="label">Reseñas</div><div class="value">${kpi.reviews}</div></div>
        <div class="kpi"><div class="label">Solicitudes Pendientes</div><div class="value">${kpi.pending}</div></div>
      </div>
      <div class="hr"></div>
      <div class="notice">
        <div class="small"><b>Control total</b>: desde aquí puedes crear/editar/eliminar usuarios, aprobar tiendas, moderar reseñas y ajustar configuración global.</div>
      </div>
    `;

    const usersTable = () => {
      const rows = state.users
        .slice()
        .sort((a,b)=> (a.role||'').localeCompare(b.role||''))
        .map(u => {
          const store = u.storeId ? getStoreById(u.storeId) : null;
          return `
            <tr>
              <td><b>${escapeHtml(u.name)}</b><div class="small">${escapeHtml(u.email)}</div></td>
              <td>${escapeHtml(u.role)}</td>
              <td class="small">${store ? escapeHtml(store.name) : '—'}</td>
              <td class="small">${u.active ? '<span class="pill green">Activo</span>' : '<span class="pill red">Inactivo</span>'}</td>
              <td>
                <div class="row">
                  <button class="button" data-action="admin-edit-user" data-user-id="${u.id}">Editar</button>
                  <button class="button danger" data-action="admin-delete-user" data-user-id="${u.id}">Eliminar</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Usuarios</h2>
            <div class="small">Crear / modificar / eliminar cuentas (admin, tienda, cliente).</div>
          </div>
          <button class="button primary" data-action="admin-new-user">Crear usuario</button>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Usuario</th><th>Rol</th><th>Tienda</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No hay usuarios.</td></tr>'}</tbody>
        </table>
      `;
    };

    const storesTable = () => {
      const rows = state.stores
        .slice()
        .sort((a,b)=> a.name.localeCompare(b.name))
        .map(s => {
          const owner = state.users.find(u => u.role==='store' && u.storeId === s.id);
          return `
            <tr>
              <td><b>${escapeHtml(s.name)}</b><div class="small">${escapeHtml(s.legalName||'')}</div></td>
              <td class="small">${escapeHtml(s.taxId||'')}</td>
              <td class="small">${escapeHtml(owner?.email || '—')}</td>
              <td class="small">${s.active ? '<span class="pill green">Activa</span>' : '<span class="pill red">Inactiva</span>'}</td>
              <td>
                <div class="row">
                  <button class="button" data-action="admin-edit-store" data-store-id="${s.id}">Editar</button>
                  <button class="button" data-action="admin-manage-store-products" data-store-id="${s.id}">Productos</button>
                  <button class="button danger" data-action="admin-toggle-store" data-store-id="${s.id}">${s.active ? 'Desactivar' : 'Activar'}</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Tiendas</h2>
            <div class="small">Supervisar y editar información, productos y precios de cualquier tienda.</div>
          </div>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Tienda</th><th>NIT</th><th>Cuenta</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No hay tiendas.</td></tr>'}</tbody>
        </table>
      `;
    };

    const applicationsTable = () => {
      const rows = state.storeApplications
        .slice()
        .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
        .map(a => {
          const pill = a.status==='pending' ? '<span class="pill gray">Pendiente</span>' : (a.status==='approved' ? '<span class="pill green">Aprobada</span>' : '<span class="pill red">Rechazada</span>');
          return `
            <tr>
              <td><b>${escapeHtml(a.storeName)}</b><div class="small">${escapeHtml(a.legalName)} · NIT ${escapeHtml(a.taxId)}</div></td>
              <td class="small">${escapeHtml(a.email)}</td>
              <td class="small">${formatDate(a.createdAt)}</td>
              <td>${pill}</td>
              <td>
                <div class="row">
                  <button class="button" data-action="admin-view-application" data-app-id="${a.id}">Ver</button>
                  ${a.status==='pending' ? `
                    <button class="button primary" data-action="admin-approve-application" data-app-id="${a.id}">Aprobar</button>
                    <button class="button danger" data-action="admin-reject-application" data-app-id="${a.id}">Rechazar</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Solicitudes de tienda</h2>
            <div class="small">Validación por parte del administrador.</div>
          </div>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Tienda</th><th>Email</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No hay solicitudes.</td></tr>'}</tbody>
        </table>
      `;
    };

    const productsTable = () => {
      const rows = state.products
        .slice()
        .sort((a,b)=> (a.storeId||'').localeCompare(b.storeId||''))
        .map(p => {
          const store = getStoreById(p.storeId);
          return `
            <tr>
              <td><b>${escapeHtml(p.name)}</b><div class="small">${escapeHtml(store?.name||'')}</div></td>
              <td>${fmtMoney(p.price, p.currency||state.settings.currency)}</td>
              <td class="small">${escapeHtml(p.stock)}</td>
              <td class="small">${p.active ? '<span class="pill green">Activo</span>' : '<span class="pill red">Inactivo</span>'}</td>
              <td>
                <div class="row">
                  <button class="button" data-action="admin-edit-product" data-product-id="${p.id}">Editar</button>
                  <button class="button danger" data-action="admin-toggle-product" data-product-id="${p.id}">${p.active ? 'Desactivar' : 'Activar'}</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Productos</h2>
            <div class="small">Acceso global: puedes editar precio/info de cualquier producto.</div>
          </div>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No hay productos.</td></tr>'}</tbody>
        </table>
      `;
    };

    const reviewsModeration = () => {
      const rows = state.reviews
        .slice()
        .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
        .map(r => {
          const author = getUserById(r.userId);
          const store = getStoreById(r.storeId);
          const target = r.targetType==='product' ? (getProductById(r.productId)?.name || 'Producto') : 'Tienda';
          const hidden = !!r.moderation?.hidden;
          return `
            <tr>
              <td>
                <b>${escapeHtml(target)}</b>
                <div class="small">Tienda: ${escapeHtml(store?.name||'—')}</div>
              </td>
              <td>${renderStars(r.rating)}</td>
              <td class="small">${escapeHtml(author?.email || '—')}</td>
              <td class="small">${formatDate(r.createdAt)}</td>
              <td class="small">${hidden ? '<span class="pill red">Oculta</span>' : '<span class="pill green">Visible</span>'}</td>
              <td>
                <div class="row">
                  <button class="button" data-action="admin-edit-review" data-review-id="${r.id}">Editar</button>
                  <button class="button" data-action="admin-toggle-review" data-review-id="${r.id}">${hidden ? 'Mostrar' : 'Ocultar'}</button>
                  <button class="button danger" data-action="admin-delete-review" data-review-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Moderación de reseñas</h2>
            <div class="small">Revisar/editar/eliminar calificaciones, comentarios y respuestas.</div>
          </div>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Objetivo</th><th>Rating</th><th>Autor</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="6">No hay reseñas.</td></tr>'}</tbody>
        </table>
      `;
    };

    const settingsPanel = () => {
      return `
        <h2 class="h2">Configuración global</h2>
        <div class="small">Cambios en estructura/políticas/aspectos técnicos de negocio (prototipo).</div>
        <div class="hr"></div>
        <form class="form" data-form="admin-settings">
          <div>
            <label>Nombre de la marca</label>
            <input class="input" name="brandName" value="${escapeHtml(state.settings.brandName)}" required />
          </div>
          <div>
            <label>Moneda</label>
            <select name="currency">
              ${['COP','USD','EUR','MXN','ARS','CLP'].map(c => `<option value="${c}" ${c===state.settings.currency?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <button class="button primary" type="submit">Guardar configuración</button>
        </form>
        <div class="hr"></div>
        <div class="notice"><div class="small">Tip: exporta el JSON desde el header para respaldar el estado.</div></div>
      `;
    };

    const auditPanel = () => {
      const rows = state.auditLog
        .slice(-200)
        .reverse()
        .map(e => {
          const actor = e.actorUserId ? getUserById(e.actorUserId) : null;
          return `<tr><td class="small">${formatDate(e.at)}</td><td class="small">${escapeHtml(actor?.email || '—')} (${escapeHtml(e.role)})</td><td class="small">${escapeHtml(e.action)}</td><td class="small">${escapeHtml(JSON.stringify(e.details||{}))}</td></tr>`;
        }).join('');

      return `
        <h2 class="h2">Auditoría (simple)</h2>
        <div class="small">Registro local de acciones (solo prototipo).</div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Fecha</th><th>Actor</th><th>Acción</th><th>Detalle</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="4">Sin eventos.</td></tr>'}</tbody>
        </table>
      `;
    };

    const contentByTab = {
      dashboard,
      users: usersTable,
      stores: storesTable,
      applications: applicationsTable,
      products: productsTable,
      reviews: reviewsModeration,
      settings: settingsPanel,
      audit: auditPanel,
    };

    return `
      <div class="card">
        <div class="row" style="justify-content:space-between; align-items:flex-start">
          <div>
            <h1 class="h1">Panel de Administración</h1>
            <p class="lead">Control total de la plataforma.</p>
          </div>
          <div class="row">
            <button class="button" data-action="logout">Cerrar sesión</button>
          </div>
        </div>

        <div class="hr"></div>
        <div class="nav" style="gap:8px">${tabButtons}</div>
        <div class="hr"></div>

        ${contentByTab[tab] ? contentByTab[tab]() : '<div class="notice">Tab inválida.</div>'}
      </div>
    `;
  };

  const renderStorePanel = (query={}) => {
    if(!ensureStore()) return '';
    const u = currentUser();
    const store = getStoreById(u.storeId);
    if(!store){
      return `
        <div class="card">
          <h1 class="h1">Tienda no asociada</h1>
          <p class="lead">Tu usuario de tienda no tiene storeId.</p>
        </div>
      `;
    }

    const tab = query.tab || 'dashboard';

    const tabs = [
      ['dashboard','Dashboard'],
      ['products','Productos'],
      ['orders','Pedidos'],
      ['reviews','Reseñas'],
      ['profile','Perfil tienda'],
    ];

    const tabButtons = tabs.map(([k,label]) => {
      const active = k===tab ? 'active' : '';
      return `<button class="chip ${active}" data-action="store-tab" data-tab="${k}" type="button">${escapeHtml(label)}</button>`;
    }).join('');

    const storeProducts = state.products.filter(p => p.storeId === store.id);
    const storeOrders = state.orders.filter(o => o.items.some(it => it.storeId === store.id));
    const storeReviews = state.reviews.filter(r => r.storeId === store.id);

    const dashboard = () => `
      <div class="row">
        <div class="kpi"><div class="label">Productos</div><div class="value">${storeProducts.length}</div></div>
        <div class="kpi"><div class="label">Pedidos</div><div class="value">${storeOrders.length}</div></div>
        <div class="kpi"><div class="label">Reseñas</div><div class="value">${storeReviews.length}</div></div>
      </div>
      <div class="hr"></div>
      <div class="notice"><div class="small">Solo ves y editas la información de <b>tu tienda</b>.</div></div>
    `;

    const productsPanel = () => {
      const rows = storeProducts
        .slice()
        .sort((a,b)=> (a.createdAt||'').localeCompare(b.createdAt||''))
        .map(p => `
          <tr>
            <td><b>${escapeHtml(p.name)}</b><div class="small">${escapeHtml(p.description||'')}</div></td>
            <td>${fmtMoney(p.price, p.currency||state.settings.currency)}</td>
            <td class="small">${escapeHtml(p.stock)}</td>
            <td class="small">${p.active ? '<span class="pill green">Activo</span>' : '<span class="pill red">Inactivo</span>'}</td>
            <td>
              <div class="row">
                <button class="button" data-action="store-edit-product" data-product-id="${p.id}">Editar</button>
                <button class="button danger" data-action="store-delete-product" data-product-id="${p.id}">Eliminar</button>
              </div>
            </td>
          </tr>
        `).join('');

      return `
        <div class="row" style="justify-content:space-between">
          <div>
            <h2 class="h2">Productos</h2>
            <div class="small">Crea/modifica/precios/elimina artículos.</div>
          </div>
          <button class="button primary" data-action="store-new-product">Nuevo producto</button>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">No tienes productos.</td></tr>'}</tbody>
        </table>
      `;
    };

    const ordersPanel = () => {
      const cards = storeOrders
        .slice()
        .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
        .map(o => {
          const items = o.items.filter(it => it.storeId === store.id);
          const subtotal = items.reduce((a,it)=>a+(it.price*it.qty),0);
          const status = o.perStoreStatus?.[store.id] || 'new';
          return `
            <div class="tile">
              <div class="row" style="justify-content:space-between">
                <div>
                  <p class="title" style="margin:0">Pedido ${escapeHtml(o.id)}</p>
                  <div class="small">${formatDate(o.createdAt)} · Cliente: ${escapeHtml(getUserById(o.userId)?.email || '—')}</div>
                </div>
                <div style="text-align:right">
                  <div class="price">${fmtMoney(subtotal, state.settings.currency)}</div>
                  <div class="small">Estado tienda: <span class="inline">${escapeHtml(status)}</span></div>
                </div>
              </div>
              <div class="hr"></div>
              <ul class="small" style="margin:0; padding-left:18px">
                ${items.map(it => `<li>${escapeHtml(it.name)} · ${it.qty} x ${fmtMoney(it.price, state.settings.currency)}</li>`).join('')}
              </ul>
              <div class="hr"></div>
              <div class="row">
                <button class="button" data-action="store-order-status" data-order-id="${o.id}" data-status="processing">Procesando</button>
                <button class="button" data-action="store-order-status" data-order-id="${o.id}" data-status="ready">Listo</button>
                <button class="button" data-action="store-order-status" data-order-id="${o.id}" data-status="completed">Completado</button>
              </div>
            </div>
          `;
        }).join('');

      return `
        <h2 class="h2">Pedidos</h2>
        <div class="small">Solo ves pedidos que incluyan ítems de tu tienda.</div>
        <div class="hr"></div>
        <div style="display:grid; gap:12px">
          ${cards || `<div class="notice"><div class="small">Aún no tienes pedidos.</div></div>`}
        </div>
      `;
    };

    const reviewsPanel = () => {
      const reviews = visibleReviews(currentUser()).filter(r => r.storeId === store.id);
      const cards = reviews
        .slice()
        .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''))
        .map(r => renderReviewCard(r, { allowReply:true }))
        .join('');

      return `
        <h2 class="h2">Reseñas</h2>
        <div class="small">Puedes responder a reseñas de tus productos o de tu tienda.</div>
        <div class="hr"></div>
        <div style="display:grid; gap:10px">
          ${cards || `<div class="notice"><div class="small">Aún no hay reseñas.</div></div>`}
        </div>
      `;
    };

    const profilePanel = () => {
      return `
        <h2 class="h2">Perfil de tienda</h2>
        <div class="small">Edita la información visible de tu tienda.</div>
        <div class="hr"></div>
        <form class="form" data-form="store-update-profile">
          <div>
            <label>Nombre comercial</label>
            <input class="input" name="name" required value="${escapeHtml(store.name)}" />
          </div>
          <div>
            <label>Descripción</label>
            <textarea name="description" rows="3">${escapeHtml(store.description||'')}</textarea>
          </div>
          <div class="two">
            <div>
              <label>Email contacto</label>
              <input class="input" name="email" type="email" value="${escapeHtml(store.email||'')}" />
            </div>
            <div>
              <label>Teléfono</label>
              <input class="input" name="phone" value="${escapeHtml(store.phone||'')}" />
            </div>
          </div>
          <div>
            <label>Dirección</label>
            <input class="input" name="address" value="${escapeHtml(store.address||'')}" />
          </div>
          <button class="button primary" type="submit">Guardar</button>
        </form>
      `;
    };

    const contentByTab = {
      dashboard,
      products: productsPanel,
      orders: ordersPanel,
      reviews: reviewsPanel,
      profile: profilePanel,
    };

    return `
      <div class="card">
        <div class="row" style="justify-content:space-between; align-items:flex-start">
          <div>
            <h1 class="h1">Panel de Tienda</h1>
            <p class="lead">${escapeHtml(store.name)} · Gestión autónoma</p>
          </div>
          <div class="row">
            <button class="button" data-action="logout">Cerrar sesión</button>
          </div>
        </div>

        <div class="hr"></div>
        <div class="nav" style="gap:8px">${tabButtons}</div>
        <div class="hr"></div>

        ${contentByTab[tab] ? contentByTab[tab]() : '<div class="notice">Tab inválida.</div>'}
      </div>
    `;
  };

  const renderReviewCard = (r, { compact=false, allowReply=false } = {}) => {
    const user = getUserById(r.userId);
    const store = getStoreById(r.storeId);
    const product = r.productId ? getProductById(r.productId) : null;

    const hidden = !!r.moderation?.hidden;
    const hiddenNotice = hidden ? `<span class="pill red">Oculta</span>` : `<span class="pill green">Visible</span>`;

    const targetLabel = r.targetType === 'product'
      ? `Producto: <a href="#/product/${escapeHtml(r.productId)}">${escapeHtml(product?.name || 'Producto')}</a>`
      : `Tienda: <a href="#/store/${escapeHtml(r.storeId)}">${escapeHtml(store?.name || 'Tienda')}</a>`;

    const reply = r.reply?.text ? `
      <div class="hr"></div>
      <div class="notice">
        <div class="small"><b>Respuesta de la tienda</b> · ${formatDate(r.reply.createdAt)}</div>
        <div class="small" style="margin-top:6px">${escapeHtml(r.reply.text)}</div>
      </div>
    ` : '';

    const canStoreReply = role()==='store' && allowReply && currentUser()?.storeId === r.storeId;

    const replyForm = (canStoreReply && !r.reply?.text) ? `
      <div class="hr"></div>
      <form class="form" data-form="reply-review" data-review-id="${r.id}">
        <div>
          <label>Responder</label>
          <textarea name="reply" rows="2" required placeholder="Respuesta pública a la reseña"></textarea>
        </div>
        <button class="button primary" type="submit">Enviar respuesta</button>
      </form>
    ` : '';

    const adminTools = role()==='admin' ? `
      <div class="hr"></div>
      <div class="row">
        ${hiddenNotice}
        <button class="button" data-action="admin-edit-review" data-review-id="${r.id}">Editar</button>
        <button class="button" data-action="admin-toggle-review" data-review-id="${r.id}">${hidden ? 'Mostrar' : 'Ocultar'}</button>
        <button class="button danger" data-action="admin-delete-review" data-review-id="${r.id}">Eliminar</button>
      </div>
    ` : '';

    const mainText = hidden && role()!=='admin'
      ? `<div class="small"><i>Reseña oculta por moderación.</i></div>`
      : `<div class="small">${escapeHtml(r.comment||'')}</div>`;

    return `
      <div class="tile">
        <div class="row" style="justify-content:space-between; align-items:flex-start">
          <div>
            <div class="small">${targetLabel}</div>
            <div class="small">Por: ${escapeHtml(user?.email || '—')} · ${formatDate(r.createdAt)}</div>
          </div>
          <div>${renderStars(r.rating)}</div>
        </div>
        <div style="margin-top:8px">${mainText}</div>
        ${reply}
        ${replyForm}
        ${adminTools}
      </div>
    `;
  };

  const renderNotFound = () => `
    <div class="card">
      <h1 class="h1">Página no encontrada</h1>
      <p class="lead">La ruta solicitada no existe.</p>
      <div class="hr"></div>
      <button class="button primary" data-action="go" data-to="/">Ir al inicio</button>
    </div>
  `;

  const renderPendingStore = (u) => {
    const app = state.storeApplications.find(a => a.userId === u.id);
    const status = app?.status || 'pending';
    const pill = status==='pending' ? '<span class="pill gray">Pendiente</span>' : (status==='approved' ? '<span class="pill green">Aprobada</span>' : '<span class="pill red">Rechazada</span>');
    return `
      <div class="card">
        <h1 class="h1">Solicitud de tienda</h1>
        <p class="lead">Tu cuenta está en proceso de aprobación.</p>
        <div class="hr"></div>
        <div class="row">
          <span class="badge">Estado: ${pill}</span>
          <span class="badge">Email: ${escapeHtml(u.email)}</span>
        </div>
        <div class="hr"></div>
        <div class="small">
          Cuando el administrador apruebe tu solicitud, podrás acceder al <b>Panel de Tienda</b> y gestionar tu catálogo.
        </div>
        <div class="hr"></div>
        <button class="button" data-action="logout">Cerrar sesión</button>
      </div>
    `;
  };

  const render = () => {
    $('#storageKey').textContent = STORAGE_KEY;
    renderNav();

    const app = $('#app');
    const { path, query } = parseHash();

    const u = currentUser();
    if(u?.role === 'store_pending'){
      app.innerHTML = renderPendingStore(u);
      return;
    }

    const routes = [
      ['/', () => renderHome()],
      ['/login', () => renderLogin()],
      ['/register', () => renderRegisterCustomer()],
      ['/register-store', () => renderRegisterStore()],
      ['/stores', () => renderStoresList()],
      ['/store/:id', (p) => renderStoreDetail(p.id)],
      ['/product/:id', (p) => renderProductDetail(p.id)],
      ['/cart', () => renderCart()],
      ['/orders', () => renderOrders()],
      ['/profile', () => renderProfile()],
      ['/admin', () => renderAdmin(query)],
      ['/store-panel', () => renderStorePanel(query)],
    ];

    for(const [pattern, fn] of routes){
      const params = matchRoute(path, pattern);
      if(params){
        app.innerHTML = fn(params);
        setNavActive();
        return;
      }
    }

    app.innerHTML = renderNotFound();
    setNavActive();
  };

  // ---------- Actions ----------

  const doLogin = ({ email, password }) => {
    const user = state.users.find(u => (u.email||'').toLowerCase() === String(email||'').toLowerCase());
    if(!user || user.password !== password){
      toast('Credenciales inválidas.');
      return;
    }
    if(!user.active){
      toast('Usuario inactivo.');
      return;
    }
    session.userId = user.id;
    saveSession();
    log('auth.login', { userId: user.id });
    toast('Sesión iniciada.');
    setHash('/');
  };

  const doLogout = () => {
    if(session.userId){
      log('auth.logout', { userId: session.userId });
    }
    session.userId = null;
    saveSession();
    toast('Sesión cerrada.');
    setHash('/');
  };

  const addToCart = (productId) => {
    const u = currentUser();
    if(!u || u.role !== 'customer'){
      toast('Inicia sesión como cliente para agregar al carrito.');
      setHash('/login');
      return;
    }
    const p = getProductById(productId);
    if(!p || !p.active){
      toast('Producto no disponible.');
      return;
    }
    if(p.stock <= 0){
      toast('Sin stock.');
      return;
    }
    const cart = getCart(u.id);
    const existing = cart.items.find(it => it.productId === productId);
    if(existing){
      existing.qty = Math.min((existing.qty||0) + 1, 99);
    }else{
      cart.items.push({ productId, qty: 1 });
    }
    saveState();
    log('cart.add', { productId });
    toast('Agregado al carrito.');
    renderNav();
  };

  const changeCartQty = (productId, delta) => {
    const u = currentUser();
    if(!u || u.role !== 'customer') return;
    const cart = getCart(u.id);
    const it = cart.items.find(i => i.productId === productId);
    if(!it) return;
    it.qty = Math.max(1, Math.min(99, (it.qty||1) + delta));
    saveState();
    log('cart.qty', { productId, qty: it.qty });
    render();
    renderNav();
  };

  const removeFromCart = (productId) => {
    const u = currentUser();
    if(!u || u.role !== 'customer') return;
    const cart = getCart(u.id);
    cart.items = cart.items.filter(i => i.productId !== productId);
    saveState();
    log('cart.remove', { productId });
    toast('Producto removido.');
    render();
    renderNav();
  };

  const clearCart = () => {
    const u = currentUser();
    if(!u || u.role !== 'customer') return;
    state.carts[u.id] = { items: [] };
    saveState();
    log('cart.clear', {});
    toast('Carrito vacío.');
    render();
    renderNav();
  };

  const checkout = () => {
    if(!ensureCustomer()) return;
    const u = currentUser();
    const cart = getCart(u.id);
    if(!cart.items.length){
      toast('Tu carrito está vacío.');
      return;
    }

    // Snapshot items
    const items = [];
    for(const it of cart.items){
      const p = getProductById(it.productId);
      if(!p || !p.active) continue;
      const qty = Math.max(1, Math.min(it.qty||1, 99));
      if(p.stock >= qty){
        p.stock -= qty;
      }else{
        toast(`Stock insuficiente para: ${p.name}`);
        return;
      }
      items.push({
        productId: p.id,
        storeId: p.storeId,
        name: p.name,
        price: p.price,
        qty,
      });
    }

    if(!items.length){
      toast('No hay ítems válidos para comprar.');
      return;
    }

    const orderId = uid('order');
    const total = items.reduce((a,i)=>a+(i.price*i.qty),0);

    const perStoreStatus = {};
    for(const sid of new Set(items.map(i=>i.storeId))){
      perStoreStatus[sid] = 'new';
    }

    state.orders.push({
      id: orderId,
      userId: u.id,
      createdAt: nowISO(),
      status: 'placed',
      perStoreStatus,
      items,
      total,
    });

    state.carts[u.id] = { items: [] };

    saveState();
    log('order.create', { orderId, total });
    toast('Compra realizada (simulada).');
    setHash('/orders');
  };

  const addReview = ({ targetType, storeId, productId, rating, comment }) => {
    if(!ensureCustomer()) return;
    const u = currentUser();

    rating = Number(rating||0);
    if(!(rating >= state.settings.policies.reviews.minRating && rating <= state.settings.policies.reviews.maxRating)){
      toast('Selecciona una calificación (1–5).');
      return;
    }

    const requires = state.settings.policies.reviews.onlyVerifiedPurchases;
    if(requires){
      if(targetType==='product' && !userHasPurchasedProduct(u.id, productId)){
        toast('Solo puedes reseñar productos comprados.');
        return;
      }
      if(targetType==='store' && !userHasOrderedFromStore(u.id, storeId)){
        toast('Solo puedes reseñar tiendas donde compraste.');
        return;
      }
    }

    const review = {
      id: uid('rev'),
      targetType,
      storeId,
      productId: targetType==='product' ? productId : null,
      userId: u.id,
      rating,
      comment: String(comment||'').trim(),
      createdAt: nowISO(),
      moderation: { hidden: false, edited: false },
      reply: null,
    };

    if(!review.comment){
      toast('Escribe un comentario.');
      return;
    }

    state.reviews.push(review);
    saveState();
    log('review.create', { reviewId: review.id, targetType, storeId, productId });
    toast('Reseña publicada.');
    render();
  };

  const replyReview = ({ reviewId, reply }) => {
    if(!ensureStore()) return;
    const u = currentUser();
    const r = state.reviews.find(x => x.id === reviewId);
    if(!r){ toast('Reseña no encontrada.'); return; }
    if(r.storeId !== u.storeId){ toast('No puedes responder reseñas de otra tienda.'); return; }
    if(r.reply?.text){ toast('Esta reseña ya tiene respuesta.'); return; }

    const text = String(reply||'').trim();
    if(!text){ toast('Escribe una respuesta.'); return; }

    r.reply = { text, byStoreUserId: u.id, createdAt: nowISO() };
    saveState();
    log('review.reply', { reviewId });
    toast('Respuesta publicada.');
    render();
  };

  const storeUpdateProfile = ({ name, description, email, phone, address }) => {
    if(!ensureStore()) return;
    const u = currentUser();
    const store = getStoreById(u.storeId);
    if(!store) return;
    store.name = String(name||'').trim();
    store.description = String(description||'').trim();
    store.email = String(email||'').trim();
    store.phone = String(phone||'').trim();
    store.address = String(address||'').trim();
    store.updatedAt = nowISO();
    saveState();
    log('store.update', { storeId: store.id });
    toast('Tienda actualizada.');
    renderNav();
    render();
  };

  const storeSetOrderStatus = ({ orderId, status }) => {
    if(!ensureStore()) return;
    const u = currentUser();
    const o = state.orders.find(x => x.id === orderId);
    if(!o){ toast('Pedido no encontrado.'); return; }
    if(!o.items.some(it => it.storeId === u.storeId)){
      toast('No puedes modificar pedidos de otra tienda.');
      return;
    }
    o.perStoreStatus = o.perStoreStatus || {};
    o.perStoreStatus[u.storeId] = status;
    saveState();
    log('order.store_status', { orderId, storeId: u.storeId, status });
    toast('Estado actualizado.');
    render();
  };

  const updateCustomerProfile = ({ name, phone, address }) => {
    if(!ensureCustomer()) return;
    const u = currentUser();
    u.name = String(name||'').trim();
    u.profile = u.profile || {};
    u.profile.phone = String(phone||'').trim();
    u.profile.address = String(address||'').trim();
    saveState();
    log('customer.profile_update', { userId: u.id });
    toast('Perfil guardado.');
    renderNav();
    render();
  };

  const registerCustomer = ({ name, email, password }) => {
    const e = String(email||'').trim().toLowerCase();
    if(state.users.some(u => (u.email||'').toLowerCase() === e)){
      toast('Ese email ya está registrado.');
      return;
    }
    const user = {
      id: uid('user'),
      role: 'customer',
      name: String(name||'').trim(),
      email: e,
      password: String(password||''),
      createdAt: nowISO(),
      active: true,
      profile: { phone:'', address:'' },
    };
    state.users.push(user);
    saveState();
    log('auth.register_customer', { userId: user.id });
    session.userId = user.id;
    saveSession();
    toast('Cuenta creada.');
    setHash('/');
  };

  const registerStore = ({ storeName, legalName, taxId, email, password, phone, address, docs }) => {
    const e = String(email||'').trim().toLowerCase();
    if(state.users.some(u => (u.email||'').toLowerCase() === e)){
      toast('Ese email ya está registrado.');
      return;
    }

    const userId = uid('user');
    const user = {
      id: userId,
      role: 'store_pending',
      name: String(storeName||'').trim() + ' (Pendiente)',
      email: e,
      password: String(password||''),
      createdAt: nowISO(),
      active: true,
      storeId: null,
    };
    const app = {
      id: uid('app'),
      userId,
      storeName: String(storeName||'').trim(),
      legalName: String(legalName||'').trim(),
      taxId: String(taxId||'').trim(),
      email: e,
      phone: String(phone||'').trim(),
      address: String(address||'').trim(),
      docs: String(docs||'').trim(),
      status: 'pending',
      createdAt: nowISO(),
      decidedAt: null,
      decidedBy: null,
    };

    state.users.push(user);
    state.storeApplications.push(app);
    saveState();
    log('auth.register_store', { userId, appId: app.id });

    session.userId = userId;
    saveSession();
    toast('Solicitud enviada.');
    setHash('/');
  };

  // Admin/store tab helpers
  const adminSetTab = (tab) => setHash(`/admin?tab=${encodeURIComponent(tab)}`);
  const storeSetTab = (tab) => setHash(`/store-panel?tab=${encodeURIComponent(tab)}`);

  // Admin prompts
  const promptUserEdit = (userId=null) => {
    if(!ensureAdmin()) return;

    const isNew = !userId;
    const user = userId ? getUserById(userId) : { role:'customer', active:true, name:'', email:'', password:'', storeId:null };

    const name = prompt('Nombre:', user.name || '');
    if(name === null) return;

    const email = prompt('Email:', user.email || '');
    if(email === null) return;

    const password = prompt('Contraseña (se guarda en texto - prototipo):', isNew ? '' : user.password || '');
    if(password === null) return;

    const roleInput = prompt('Rol (admin | store | customer):', user.role || 'customer');
    if(roleInput === null) return;

    const roleNorm = roleInput.trim();
    if(!['admin','store','customer'].includes(roleNorm)){
      toast('Rol inválido.');
      return;
    }

    let storeId = user.storeId || null;
    if(roleNorm === 'store'){
      const storeName = prompt('Nombre de la tienda (si ya existe, escribe igual; si no, se crea):', user.storeId ? (getStoreById(user.storeId)?.name || '') : '');
      if(storeName === null) return;
      const match = state.stores.find(s => s.name.toLowerCase() === storeName.trim().toLowerCase());
      if(match){
        storeId = match.id;
      }else{
        const newStore = {
          id: uid('store'),
          name: storeName.trim() || 'Nueva tienda',
          legalName: storeName.trim() ? `${storeName.trim()} S.A.S.` : 'Nueva tienda S.A.S.',
          taxId: '',
          email: email.trim().toLowerCase(),
          phone: '',
          address: '',
          description: '',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        state.stores.push(newStore);
        storeId = newStore.id;
      }
    }

    const activeStr = prompt('¿Activo? (si/no):', user.active ? 'si' : 'no');
    if(activeStr === null) return;
    const active = activeStr.trim().toLowerCase().startsWith('s');

    if(isNew){
      const e = email.trim().toLowerCase();
      if(state.users.some(u => (u.email||'').toLowerCase() === e)){
        toast('Ese email ya está registrado.');
        return;
      }
      state.users.push({
        id: uid('user'),
        role: roleNorm,
        name: name.trim(),
        email: e,
        password,
        createdAt: nowISO(),
        active,
        storeId,
      });
      log('admin.user_create', { email: email.trim().toLowerCase(), role: roleNorm });
      toast('Usuario creado.');
    }else{
      user.name = name.trim();
      user.email = email.trim().toLowerCase();
      user.password = password;
      user.role = roleNorm;
      user.active = active;
      user.storeId = storeId;
      log('admin.user_update', { userId });
      toast('Usuario actualizado.');
    }

    saveState();
    render();
  };

  const adminDeleteUser = (userId) => {
    if(!ensureAdmin()) return;
    const user = getUserById(userId);
    if(!user) return;
    if(!confirm(`Eliminar usuario ${user.email}?`)) return;

    if(user.id === session.userId){
      toast('No puedes eliminar tu propia cuenta.');
      return;
    }

    state.users = state.users.filter(u => u.id !== userId);
    delete state.carts[userId];
    saveState();
    log('admin.user_delete', { userId });
    toast('Usuario eliminado.');
    render();
  };

  const adminEditStore = (storeId) => {
    if(!ensureAdmin()) return;
    const store = getStoreById(storeId);
    if(!store) return;

    const name = prompt('Nombre comercial:', store.name);
    if(name === null) return;
    const desc = prompt('Descripción:', store.description || '');
    if(desc === null) return;
    const email = prompt('Email contacto:', store.email || '');
    if(email === null) return;
    const phone = prompt('Teléfono:', store.phone || '');
    if(phone === null) return;
    const address = prompt('Dirección:', store.address || '');
    if(address === null) return;

    store.name = name.trim();
    store.description = desc.trim();
    store.email = email.trim();
    store.phone = phone.trim();
    store.address = address.trim();
    store.updatedAt = nowISO();

    saveState();
    log('admin.store_update', { storeId });
    toast('Tienda actualizada.');
    render();
  };

  const adminToggleStore = (storeId) => {
    if(!ensureAdmin()) return;
    const store = getStoreById(storeId);
    if(!store) return;
    store.active = !store.active;
    store.updatedAt = nowISO();
    saveState();
    log('admin.store_toggle', { storeId, active: store.active });
    toast(store.active ? 'Tienda activada.' : 'Tienda desactivada.');
    render();
  };

  const adminEditProduct = (productId) => {
    if(!ensureAdmin()) return;
    const p = getProductById(productId);
    if(!p) return;

    const name = prompt('Nombre:', p.name);
    if(name === null) return;
    const priceStr = prompt('Precio (numérico):', String(p.price||0));
    if(priceStr === null) return;
    const stockStr = prompt('Stock (numérico):', String(p.stock||0));
    if(stockStr === null) return;
    const desc = prompt('Descripción:', p.description || '');
    if(desc === null) return;

    p.name = name.trim();
    p.price = Number(priceStr||0);
    p.stock = Math.max(0, Number(stockStr||0));
    p.description = desc.trim();
    p.updatedAt = nowISO();

    saveState();
    log('admin.product_update', { productId });
    toast('Producto actualizado.');
    render();
  };

  const adminToggleProduct = (productId) => {
    if(!ensureAdmin()) return;
    const p = getProductById(productId);
    if(!p) return;
    p.active = !p.active;
    p.updatedAt = nowISO();
    saveState();
    log('admin.product_toggle', { productId, active: p.active });
    toast(p.active ? 'Producto activado.' : 'Producto desactivado.');
    render();
  };

  const adminEditReview = (reviewId) => {
    if(!ensureAdmin()) return;
    const r = state.reviews.find(x => x.id === reviewId);
    if(!r) return;

    const ratingStr = prompt('Rating (1-5):', String(r.rating||0));
    if(ratingStr === null) return;
    const comment = prompt('Comentario:', r.comment || '');
    if(comment === null) return;
    const reply = r.reply?.text ? prompt('Respuesta de tienda (editar / borrar):', r.reply.text) : null;

    const rating = Number(ratingStr||0);
    if(!(rating>=1 && rating<=5)){
      toast('Rating inválido.');
      return;
    }

    r.rating = rating;
    r.comment = comment.trim();
    r.moderation = r.moderation || {};
    r.moderation.edited = true;
    r.moderation.editedAt = nowISO();

    if(reply !== null){
      if(reply.trim()){
        r.reply = r.reply || {};
        r.reply.text = reply.trim();
        r.reply.createdAt = r.reply.createdAt || nowISO();
        r.reply.editedAt = nowISO();
      }else{
        r.reply = null;
      }
    }

    saveState();
    log('admin.review_edit', { reviewId });
    toast('Reseña actualizada.');
    render();
  };

  const adminToggleReview = (reviewId) => {
    if(!ensureAdmin()) return;
    const r = state.reviews.find(x => x.id === reviewId);
    if(!r) return;
    r.moderation = r.moderation || { hidden:false };
    r.moderation.hidden = !r.moderation.hidden;
    r.moderation.hiddenAt = nowISO();
    saveState();
    log('admin.review_toggle', { reviewId, hidden: r.moderation.hidden });
    toast(r.moderation.hidden ? 'Reseña oculta.' : 'Reseña visible.');
    render();
  };

  const adminDeleteReview = (reviewId) => {
    if(!ensureAdmin()) return;
    const r = state.reviews.find(x => x.id === reviewId);
    if(!r) return;
    if(!confirm('Eliminar reseña definitivamente?')) return;
    state.reviews = state.reviews.filter(x => x.id !== reviewId);
    saveState();
    log('admin.review_delete', { reviewId });
    toast('Reseña eliminada.');
    render();
  };

  const adminApproveApplication = (appId) => {
    if(!ensureAdmin()) return;
    const app = state.storeApplications.find(a => a.id === appId);
    if(!app) return;
    if(app.status !== 'pending') return;

    const storeId = uid('store');
    const store = {
      id: storeId,
      name: app.storeName,
      legalName: app.legalName,
      taxId: app.taxId,
      email: app.email,
      phone: app.phone,
      address: app.address,
      description: '',
      active: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    state.stores.push(store);

    const user = getUserById(app.userId);
    if(user){
      user.role = 'store';
      user.storeId = storeId;
      user.name = `${store.name} (Tienda)`;
    }

    app.status = 'approved';
    app.decidedAt = nowISO();
    app.decidedBy = session.userId;

    saveState();
    log('admin.application_approve', { appId, storeId });
    toast('Solicitud aprobada.');
    render();
  };

  const adminRejectApplication = (appId) => {
    if(!ensureAdmin()) return;
    const app = state.storeApplications.find(a => a.id === appId);
    if(!app) return;
    if(app.status !== 'pending') return;

    app.status = 'rejected';
    app.decidedAt = nowISO();
    app.decidedBy = session.userId;

    const user = getUserById(app.userId);
    if(user){
      user.active = false;
    }

    saveState();
    log('admin.application_reject', { appId });
    toast('Solicitud rechazada (usuario inactivado).');
    render();
  };

  const adminViewApplication = (appId) => {
    if(!ensureAdmin()) return;
    const app = state.storeApplications.find(a => a.id === appId);
    if(!app) return;
    const details = `Solicitud ${app.id}\n\nTienda: ${app.storeName}\nRazón social: ${app.legalName}\nNIT: ${app.taxId}\nEmail: ${app.email}\nTeléfono: ${app.phone}\nDirección: ${app.address}\n\nDocs: ${app.docs || '(vacío)'}\n\nEstado: ${app.status}`;
    alert(details);
  };

  const adminSettingsSave = ({ brandName, currency }) => {
    if(!ensureAdmin()) return;
    state.settings.brandName = String(brandName||'').trim() || state.settings.brandName;
    state.settings.currency = String(currency||'COP').trim() || 'COP';
    saveState();
    log('admin.settings_update', { brandName: state.settings.brandName, currency: state.settings.currency });
    toast('Configuración guardada.');
    renderNav();
    render();
  };

  // Store product CRUD (prompts)
  const storeNewOrEditProduct = (productId=null) => {
    if(!ensureStore()) return;
    const u = currentUser();
    const storeId = u.storeId;
    const isNew = !productId;
    const p = productId ? getProductById(productId) : { name:'', price:0, stock:0, description:'', tags:[] };
    if(productId && p.storeId !== storeId){
      toast('No puedes editar productos de otra tienda.');
      return;
    }

    const name = prompt('Nombre del producto:', p.name || '');
    if(name === null) return;
    const priceStr = prompt('Precio (numérico):', String(p.price||0));
    if(priceStr === null) return;
    const stockStr = prompt('Stock (numérico):', String(p.stock||0));
    if(stockStr === null) return;
    const desc = prompt('Descripción:', p.description || '');
    if(desc === null) return;
    const tagsStr = prompt('Tags (separados por coma):', (p.tags||[]).join(', '));
    if(tagsStr === null) return;

    if(isNew){
      state.products.push({
        id: uid('prod'),
        storeId,
        name: name.trim(),
        price: Number(priceStr||0),
        currency: state.settings.currency,
        stock: Math.max(0, Number(stockStr||0)),
        description: desc.trim(),
        tags: tagsStr.split(',').map(t=>t.trim()).filter(Boolean),
        active: true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
      log('store.product_create', { storeId });
      toast('Producto creado.');
    }else{
      p.name = name.trim();
      p.price = Number(priceStr||0);
      p.stock = Math.max(0, Number(stockStr||0));
      p.description = desc.trim();
      p.tags = tagsStr.split(',').map(t=>t.trim()).filter(Boolean);
      p.updatedAt = nowISO();
      log('store.product_update', { productId });
      toast('Producto actualizado.');
    }

    saveState();
    render();
  };

  const storeDeleteProduct = (productId) => {
    if(!ensureStore()) return;
    const u = currentUser();
    const p = getProductById(productId);
    if(!p) return;
    if(p.storeId !== u.storeId){ toast('No puedes eliminar productos de otra tienda.'); return; }
    if(!confirm('Eliminar este producto?')) return;

    state.products = state.products.filter(x => x.id !== productId);
    saveState();
    log('store.product_delete', { productId });
    toast('Producto eliminado.');
    render();
  };

  const adminManageStoreProducts = (storeId) => {
    setHash(`/store/${storeId}`);
    toast('Como admin, puedes editar productos desde la tabla de Productos.');
  };

  // Header export/import/reset
  const exportState = () => {
    downloadText(`marketplace_state_${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(state, null, 2));
    toast('JSON exportado.');
  };

  const importStateFromFile = async (file) => {
    if(!file) return;
    try{
      const text = await file.text();
      const obj = JSON.parse(text);
      if(!obj || typeof obj !== 'object') throw new Error('Invalid JSON');
      if(!obj.users || !obj.stores || !obj.products) throw new Error('Faltan campos requeridos (users/stores/products).');

      state = obj;
      saveJSON(STORAGE_KEY, state);
      toast('JSON importado.');
      log('state.import', { size: text.length });
      render();
    }catch(err){
      console.error(err);
      toast('Error al importar JSON.');
      alert('No se pudo importar el JSON. Verifica el archivo.');
    }
  };

  const resetAll = () => {
    if(!confirm('Esto borrará el estado del marketplace (localStorage). ¿Continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    state = seedState();
    session = { userId: null };
    saveJSON(STORAGE_KEY, state);
    saveJSON(SESSION_KEY, session);
    toast('Cache limpiado.');
    setHash('/');
    render();
  };

  // ---------- Events ----------

  document.addEventListener('click', (e) => {
    const navBtn = e.target.closest('[data-nav]');
    if(navBtn){
      const to = navBtn.getAttribute('data-nav');
      if(to) setHash(to);
      return;
    }

    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');

    if(action === 'go'){
      const to = btn.getAttribute('data-to');
      if(to) setHash(to);
      return;
    }

    switch(action){
      case 'logout':
        doLogout();
        break;

      case 'add-to-cart':
        addToCart(btn.getAttribute('data-product-id'));
        break;

      case 'cart-qty':
        changeCartQty(btn.getAttribute('data-product-id'), Number(btn.getAttribute('data-delta')||0));
        break;

      case 'cart-remove':
        removeFromCart(btn.getAttribute('data-product-id'));
        break;

      case 'cart-clear':
        clearCart();
        break;

      case 'checkout':
        checkout();
        break;

      case 'admin-tab':
        adminSetTab(btn.getAttribute('data-tab'));
        break;

      case 'store-tab':
        storeSetTab(btn.getAttribute('data-tab'));
        break;

      case 'admin-new-user':
        promptUserEdit(null);
        break;

      case 'admin-edit-user':
        promptUserEdit(btn.getAttribute('data-user-id'));
        break;

      case 'admin-delete-user':
        adminDeleteUser(btn.getAttribute('data-user-id'));
        break;

      case 'admin-edit-store':
        adminEditStore(btn.getAttribute('data-store-id'));
        break;

      case 'admin-toggle-store':
        adminToggleStore(btn.getAttribute('data-store-id'));
        break;

      case 'admin-manage-store-products':
        adminManageStoreProducts(btn.getAttribute('data-store-id'));
        break;

      case 'admin-edit-product':
        adminEditProduct(btn.getAttribute('data-product-id'));
        break;

      case 'admin-toggle-product':
        adminToggleProduct(btn.getAttribute('data-product-id'));
        break;

      case 'admin-edit-review':
        adminEditReview(btn.getAttribute('data-review-id'));
        break;

      case 'admin-toggle-review':
        adminToggleReview(btn.getAttribute('data-review-id'));
        break;

      case 'admin-delete-review':
        adminDeleteReview(btn.getAttribute('data-review-id'));
        break;

      case 'admin-approve-application':
        adminApproveApplication(btn.getAttribute('data-app-id'));
        break;

      case 'admin-reject-application':
        adminRejectApplication(btn.getAttribute('data-app-id'));
        break;

      case 'admin-view-application':
        adminViewApplication(btn.getAttribute('data-app-id'));
        break;

      case 'store-new-product':
        storeNewOrEditProduct(null);
        break;

      case 'store-edit-product':
        storeNewOrEditProduct(btn.getAttribute('data-product-id'));
        break;

      case 'store-delete-product':
        storeDeleteProduct(btn.getAttribute('data-product-id'));
        break;

      case 'store-order-status':
        storeSetOrderStatus({
          orderId: btn.getAttribute('data-order-id'),
          status: btn.getAttribute('data-status'),
        });
        break;

      default:
        break;
    }
  });

  // Star rating click handling
  document.addEventListener('click', (e) => {
    const star = e.target.closest('[data-action="set-rating"]');
    if(!star) return;

    const value = Number(star.getAttribute('data-value')||0);
    const form = star.closest('form');
    if(!form) return;

    const input = form.querySelector('input[name="rating"]');
    if(input) input.value = String(value);

    const container = star.closest('[data-rating]');
    if(container){
      container.setAttribute('data-selected', String(value));
      container.innerHTML = renderStars(0, { clickable:true, name:'reviewRating', selected:value });
    }

    const label = form.querySelector('#ratingLabel');
    if(label) label.textContent = `${value}/5`;
  });

  // Search store input
  document.addEventListener('input', (e) => {
    const input = e.target.closest('[data-action="search-stores"]');
    if(!input) return;
    const q = input.value || '';
    setHash(`/stores?q=${encodeURIComponent(q)}`);
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="clear-search"]');
    if(!btn) return;
    const where = btn.getAttribute('data-where');
    if(where === 'stores') setHash('/stores');
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form]');
    if(!form) return;
    e.preventDefault();

    const formName = form.getAttribute('data-form');
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    if(formName === 'login'){
      doLogin({ email: data.email, password: data.password });
      return;
    }

    if(formName === 'register-customer'){
      registerCustomer({ name: data.name, email: data.email, password: data.password });
      return;
    }

    if(formName === 'register-store'){
      registerStore({
        storeName: data.storeName,
        legalName: data.legalName,
        taxId: data.taxId,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
        docs: data.docs,
      });
      return;
    }

    if(formName === 'add-review'){
      const targetType = form.getAttribute('data-target-type');
      const storeId = form.getAttribute('data-store-id');
      const productId = form.getAttribute('data-product-id');
      addReview({
        targetType,
        storeId,
        productId,
        rating: data.rating,
        comment: data.comment,
      });
      form.reset();
      return;
    }

    if(formName === 'reply-review'){
      replyReview({ reviewId: form.getAttribute('data-review-id'), reply: data.reply });
      form.reset();
      return;
    }

    if(formName === 'store-update-profile'){
      storeUpdateProfile(data);
      return;
    }

    if(formName === 'update-profile'){
      updateCustomerProfile(data);
      return;
    }

    if(formName === 'admin-settings'){
      adminSettingsSave(data);
      return;
    }
  });

  // Header buttons
  $('#btnExport').addEventListener('click', exportState);
  $('#btnReset').addEventListener('click', resetAll);

  $('#fileImport').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    importStateFromFile(file);
    e.target.value = '';
  });

  window.addEventListener('hashchange', render);

  // Init
  if(!location.hash) location.hash = '#/';
  render();

})();
