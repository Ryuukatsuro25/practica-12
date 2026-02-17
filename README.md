# RappiWAO (HTML/CSS/JS) — Marketplace Multirrol (Demo sin Backend)

Este proyecto es una **versión 100% estática** (deploy friendly para **Vercel**) de un marketplace multirrol:

- **Administrador**: control total (usuarios, tiendas, productos, reseñas, solicitudes, configuración).
- **Tienda**: gestiona *solo su propio* catálogo y responde reseñas.
- **Cliente**: carrito universal (productos de múltiples tiendas), pedidos, reseñas post-compra.
- **Visitante**: navegación de exploración (sin carrito / compras / reseñas).

✅ **Persistencia:** toda la información se guarda en el navegador como **JSON en `localStorage`** (además de cache de assets con Service Worker opcional).

> ⚠️ Importante: esto es una DEMO educativa. No hay seguridad real (contraseñas en claro, sin backend).

---

## Credenciales de demo (seed)

- **Admin**  
  Email: `admin@rappiwao.com`  
  Password: `Admin123!`

- **Tiendas**  
  `tech@store.com` / `hogar@store.com` / `fitness@store.com`  
  Password: `Store123!`

- **Cliente**  
  Email: `juan@cliente.com`  
  Password: `Cliente123!`

---

## Deploy en Vercel (GitHub)

1. Crea un repositorio y sube este proyecto.
2. En Vercel: **Add New → Project → Import Git Repository**
3. Framework preset: **Other**
4. Build command: **None**
5. Output directory: **/** (root)

El archivo `vercel.json` incluye una regla para que cualquier ruta sirva `index.html` (SPA). Los assets reales se sirven por `filesystem`.

---

## Datos en navegador (localStorage)

- DB: `localStorage["RappiWAO_DB_V1"]`
- Sesión: `localStorage["RappiWAO_SESSION_V1"]`

En el footer hay botones:
- **Exportar DB**: descarga el JSON completo
- **Importar DB**: carga el JSON y reemplaza la DB local

---

## Funcionalidades clave

- Carrito universal (cliente)
- Checkout (crea pedido y descuenta stock)
- Reseñas 1–5 estrellas post-compra
- Respuestas de tienda a reseñas
- Moderación de reseñas por Admin (ocultar/mostrar/editar/eliminar)
- Registro de tienda con **proceso de aprobación** (Admin)

---

## Estructura

- `index.html`: shell de la SPA
- `assets/css/styles.css`: estilos
- `assets/js/*`: módulos JS (sin bundler)
- `sw.js`: cache offline de assets (opcional)

---

## Nota sobre “backend”

Como pediste que **toda la info se guarde en cache/navegador**, este repo es **front-only**.
Si luego quieres volver a un backend real (API/DB), se puede:
- reemplazar `localStorage` por API REST
- o agregar funciones serverless en `/api` para Vercel
