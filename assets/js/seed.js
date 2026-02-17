// RappiWAO — Datos de ejemplo (productos físicos) para correr sin backend
import { id, nowISO } from './util.js';

export function createSeedDB(){
  const createdAt = nowISO();

  // Usuarios
  const adminId = id('usr');
  const techOwnerId = id('usr');
  const homeOwnerId = id('usr');
  const fitOwnerId  = id('usr');
  const customerId  = id('usr');

  const users = [
    {
      id: adminId,
      role: 'admin',
      status: 'active',
      name: 'Admin RappiWAO',
      email: 'admin@rappiwao.com',
      password: 'Admin123!',
      createdAt,
    },
    {
      id: techOwnerId,
      role: 'store',
      status: 'active',
      name: 'TechZone Owner',
      email: 'tech@store.com',
      password: 'Store123!',
      createdAt,
    },
    {
      id: homeOwnerId,
      role: 'store',
      status: 'active',
      name: 'Casa & Cocina Owner',
      email: 'hogar@store.com',
      password: 'Store123!',
      createdAt,
    },
    {
      id: fitOwnerId,
      role: 'store',
      status: 'active',
      name: 'FitnessPro Owner',
      email: 'fitness@store.com',
      password: 'Store123!',
      createdAt,
    },
    {
      id: customerId,
      role: 'customer',
      status: 'active',
      name: 'Juan Cliente',
      email: 'juan@cliente.com',
      password: 'Cliente123!',
      createdAt,
    },
  ];

  // Tiendas
  const techStoreId = id('sto');
  const homeStoreId = id('sto');
  const fitStoreId  = id('sto');

  const stores = [
    {
      id: techStoreId,
      ownerUserId: techOwnerId,
      name: 'TechZone',
      description: 'Tecnología para tu día a día: audífonos, relojes inteligentes, accesorios y más.',
      logoUrl: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=500&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=60',
      address: 'Calle 12 #34-56',
      phone: '+57 300 000 0001',
      isActive: true,
      createdAt,
    },
    {
      id: homeStoreId,
      ownerUserId: homeOwnerId,
      name: 'Casa & Cocina',
      description: 'Todo para tu hogar: cocina, organización, decoración y limpieza.',
      logoUrl: 'https://images.unsplash.com/photo-1556911073-52527ac437f5?auto=format&fit=crop&w=500&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=60',
      address: 'Avenida 7 #10-20',
      phone: '+57 300 000 0002',
      isActive: true,
      createdAt,
    },
    {
      id: fitStoreId,
      ownerUserId: fitOwnerId,
      name: 'FitnessPro',
      description: 'Entrena en casa: mancuernas, bandas, mats, accesorios y bienestar.',
      logoUrl: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=500&q=60',
      bannerUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=60',
      address: 'Carrera 50 #22-10',
      phone: '+57 300 000 0003',
      isActive: true,
      createdAt,
    },
  ];

  // Productos físicos
  const products = [
    // TechZone
    mkProduct(techStoreId, 'Audífonos Bluetooth Pro', 'Electrónica', 149900, 40,
      'Audífonos inalámbricos con micrófono, estuche de carga y cancelación de ruido básica.',
      ['https://images.unsplash.com/photo-1518441310736-5c2b8f9e4b0b?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.18, dimensionsCm: '8x6x4', shipping: 'Envío 24–48h' }
    ),
    mkProduct(techStoreId, 'Smartwatch Deportivo', 'Electrónica', 219900, 25,
      'Reloj inteligente con monitoreo de ritmo cardíaco, pasos y notificaciones.',
      ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.09, dimensionsCm: '6x6x4', shipping: 'Envío 24–72h' }
    ),
    mkProduct(techStoreId, 'Cargador USB-C 30W', 'Electrónica', 59900, 120,
      'Cargador rápido 30W compatible con celulares y tablets (cable no incluido).',
      ['https://images.unsplash.com/photo-1582719478185-2d46b998c1a4?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.12, dimensionsCm: '6x4x3', shipping: 'Envío 24–48h' }
    ),
    mkProduct(techStoreId, 'Teclado Mecánico Compacto', 'Oficina', 289900, 18,
      'Teclado mecánico 60% con switches táctiles, ideal para trabajo y gaming.',
      ['https://images.unsplash.com/photo-1541140134513-85a161dc4a00?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.85, dimensionsCm: '30x12x4', shipping: 'Envío 2–4 días' }
    ),

    // Casa & Cocina
    mkProduct(homeStoreId, 'Licuadora 2L Potente', 'Hogar', 199900, 22,
      'Licuadora de 2 litros, cuchillas de acero inoxidable y 3 velocidades.',
      ['https://images.unsplash.com/photo-1585238342028-4b3a0c44b77b?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 2.8, dimensionsCm: '20x20x40', shipping: 'Envío 2–5 días' }
    ),
    mkProduct(homeStoreId, 'Set de Sartenes Antiadherentes', 'Hogar', 179900, 30,
      'Set de 3 sartenes antiadherentes (20/24/28 cm). Apto para estufa.',
      ['https://images.unsplash.com/photo-1540408052024-45b7b12f2f1d?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 1.9, dimensionsCm: '35x30x12', shipping: 'Envío 2–4 días' }
    ),
    mkProduct(homeStoreId, 'Organizador de Cocina (Bambú)', 'Hogar', 69900, 55,
      'Organizador de cubiertos y utensilios en bambú, ajustable.',
      ['https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.95, dimensionsCm: '45x35x6', shipping: 'Envío 24–72h' }
    ),
    mkProduct(homeStoreId, 'Set de Toallas Premium', 'Hogar', 89900, 40,
      'Set de 4 toallas suaves de alta absorción. Ideal para baño.',
      ['https://images.unsplash.com/photo-1616627985089-8eade9bd6c3d?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 1.2, dimensionsCm: '35x28x12', shipping: 'Envío 24–72h' }
    ),

    // FitnessPro
    mkProduct(fitStoreId, 'Mancuernas Ajustables (Par)', 'Deportes', 349900, 12,
      'Par de mancuernas ajustables para entrenamiento en casa. Incluye discos.',
      ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 12.0, dimensionsCm: '40x20x20', shipping: 'Envío 3–7 días' }
    ),
    mkProduct(fitStoreId, 'Banda Elástica de Resistencia', 'Deportes', 39900, 90,
      'Banda elástica para fuerza, movilidad y calentamiento. Resistencia media.',
      ['https://images.unsplash.com/photo-1599058917765-3b0c1a6889b0?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.20, dimensionsCm: '25x10x5', shipping: 'Envío 24–48h' }
    ),
    mkProduct(fitStoreId, 'Mat de Yoga Antideslizante', 'Deportes', 79900, 45,
      'Mat de yoga con textura antideslizante y correa de transporte.',
      ['https://images.unsplash.com/photo-1599447292182-45f2a960c532?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 1.1, dimensionsCm: '65x12x12', shipping: 'Envío 24–72h' }
    ),
    mkProduct(fitStoreId, 'Botella Térmica 750ml', 'Deportes', 49900, 80,
      'Botella térmica de acero inoxidable, mantiene frío/caliente por horas.',
      ['https://images.unsplash.com/photo-1526401281623-6aa8b5e7e4d3?auto=format&fit=crop&w=1200&q=60'],
      { weightKg: 0.38, dimensionsCm: '8x8x28', shipping: 'Envío 24–48h' }
    ),
  ];

  // Pedido de ejemplo (para permitir reseñas)
  const orderId = id('ord');
  const orderItems = [
    snapshotItem(products[0], 1),
    snapshotItem(products[4], 1),
    snapshotItem(products[9], 2),
  ];
  const total = orderItems.reduce((sum, it) => sum + it.priceSnapshot * it.qty, 0);

  const orders = [
    {
      id: orderId,
      userId: customerId,
      status: 'completed',
      createdAt,
      currency: 'COP',
      total,
      shippingAddress: 'Calle 1 #2-3, Bogotá',
      paymentMethod: 'contraentrega',
      notes: 'Pedido demo',
      items: orderItems,
    }
  ];

  // Reseña de ejemplo
  const reviews = [
    {
      id: id('rev'),
      type: 'product',
      targetId: products[0].id,
      productId: products[0].id,
      storeId: products[0].storeId,
      userId: customerId,
      orderId,
      rating: 5,
      comment: 'Excelente sonido y batería. Llegó rápido.',
      createdAt,
      updatedAt: createdAt,
      storeReply: {
        comment: '¡Gracias por tu compra! Nos alegra que te haya gustado.',
        repliedAt: createdAt,
        storeUserId: techOwnerId
      },
      isHidden: false
    }
  ];

  const db = {
    meta: {
      version: '1.0',
      siteName: 'RappiWAO',
      createdAt,
      updatedAt: createdAt
    },
    users,
    stores,
    storeApplications: [],
    products,
    carts: {},
    orders,
    reviews,
    settings: {
      allowGuestBrowse: true,
      currency: 'COP',
      storeRegistrationPolicy: {
        requiredFields: ['legalName','taxId','docUrl','address','phone','termsAccepted'],
        note: 'En esta demo no se valida documentación real; el Admin aprueba/rechaza manualmente.'
      }
    }
  };

  return db;
}

function mkProduct(storeId, name, category, price, stock, description, images, extra){
  const createdAt = nowISO();
  return {
    id: id('prd'),
    storeId,
    name,
    description,
    category,
    price,
    currency: 'COP',
    stock,
    images,
    weightKg: extra?.weightKg ?? null,
    dimensionsCm: extra?.dimensionsCm ?? null,
    shipping: extra?.shipping ?? 'Envío estándar',
    isActive: true,
    createdAt,
    updatedAt: createdAt
  };
}

function snapshotItem(product, qty){
  return {
    productId: product.id,
    storeId: product.storeId,
    nameSnapshot: product.name,
    priceSnapshot: product.price,
    qty
  };
}
