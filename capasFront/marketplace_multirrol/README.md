# Marketplace Multirrol (Prototipo funcional)

Este proyecto es una **plataforma funcional (frontend)** del marketplace multirrol con:

- **Administrador**: control total (usuarios, tiendas, productos, reseñas, configuración)
- **Tienda**: gestión autónoma de su catálogo, pedidos de su tienda y respuestas a reseñas
- **Cliente**: carrito universal multi-tienda, compra simulada, historial y reseñas post-compra
- **Visitante**: modo exploración (sin carrito, compras ni reseñas)

> Importante: **todo se guarda en el cache del navegador (localStorage) como JSON**.
> Es un prototipo/maqueta para validar flujo y pantallas. No hay seguridad real.

---

## Cómo ejecutar

1. Abre `index.html` en tu navegador.
2. Si tu navegador limita el uso de `localStorage` en `file://`, abre un servidor local:

```bash
cd marketplace_multirrol
python -m http.server 8000
```

Luego entra a `http://localhost:8000`.

---

## Credenciales demo

- **Admin**: `admin@demo.com` / `admin123`
- **Cliente**: `cliente@demo.com` / `cliente123`
- **Tienda**: `logipro@demo.com` (o cualquier tienda `@demo.com`) / `store123`

---

## Flujo de tienda (registro + aprobación)

1. Menú: **Registrar Tienda**
2. Se crea una cuenta con rol `store_pending` y una solicitud en estado `pending`
3. El **Admin** entra a **Panel Admin → Solicitudes** y aprueba
4. La cuenta pasa a rol `store` y ya puede entrar al **Panel Tienda**

---

## Dónde se guarda el estado

- **Estado**: `cuentica_marketplace_state_v1`
- **Sesión**: `cuentica_marketplace_session_v1`

Puedes:
- **Exportar JSON** (botón del header)
- **Importar JSON** (botón del header)
- **Limpiar cache** (reinicia al estado semilla)

---

## Nota sobre reseñas

- Rating 1 a 5 estrellas
- En este prototipo, por defecto solo se permite reseñar **post-compra** (producto o tienda)
- La tienda puede responder
- El admin puede editar/ocultar/eliminar reseñas y respuestas

---

## Estructura

- `index.html`
- `styles.css`
- `app.js`
- `assets/` (logo e íconos de roles)

