function getCart() {
  const raw = localStorage.getItem('cart');
  return raw ? JSON.parse(raw) : { restaurant_id: null, items: [] };
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product, qty) {
  let cart = getCart();
  if (cart.restaurant_id && cart.restaurant_id !== product.restaurant_id) {
    if (!confirm('Ya tienes productos de otro restaurante en el carrito. ¿Deseas limpiar el carrito y agregar este?')) {
      return;
    }
    cart = { restaurant_id: null, items: [] };
  }
  cart.restaurant_id = product.restaurant_id;
  const existing = cart.items.find(it => it.product_id === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.items.push({ product_id: product.id, name: product.name, price: product.price, quantity: qty });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  cart.items = cart.items.filter(i => i.product_id !== productId);
  if (cart.items.length === 0) cart.restaurant_id = null;
  saveCart(cart);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.items.reduce((acc, it) => acc + it.quantity, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = count;
}

async function checkout() {
  const u = currentUser();
  if (!u) { window.location.href = 'login.php'; return; }
  const cart = getCart();
  if (!cart.restaurant_id || cart.items.length === 0) {
    alert('Carrito vacío'); return;
  }
  try {
    const payload = {
      restaurant_id: cart.restaurant_id,
      items: cart.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    };
    const res = await apiPost('/orders', payload);
    alert('Orden creada. Total: $' + res.total);
    localStorage.removeItem('cart');
    window.location.href = 'orders.php';
  } catch (e) {
    alert('Error al crear la orden: ' + (e.message || e));
  }
}

document.addEventListener('DOMContentLoaded', updateCartCount);
