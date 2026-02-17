function renderCart() {
  const cart = getCart();
  const cont = document.getElementById('cartContainer');
  if (!cart.items.length) {
    cont.innerHTML = '<div class="alert alert-info">Tu carrito está vacío.</div>';
    return;
  }
  let total = 0;
  const rows = cart.items.map(i => {
    const line = i.quantity * Number(i.price);
    total += line;
    return `<tr>
      <td>${i.name}</td>
      <td>$${Number(i.price).toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${i.quantity}" class="form-control form-control-sm qty-input" data-id="${i.product_id}">
      </td>
      <td class="text-end">$${line.toFixed(2)}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-rm="${i.product_id}">Quitar</button></td>
    </tr>`;
  }).join('');
  cont.innerHTML = `<table class="table">
    <thead><tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th class="text-end">Subtotal</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><th colspan="3" class="text-end">Total</th><th class="text-end">$${total.toFixed(2)}</th><th></th></tr></tfoot>
  </table>
  <div class="d-flex justify-content-between">
    <button class="btn btn-outline-secondary" id="btnClear">Vaciar</button>
    <button class="btn btn-success" id="btnCheckout">Finalizar pedido</button>
  </div>`;

  cont.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const id = Number(inp.getAttribute('data-id'));
      const cart = getCart();
      const item = cart.items.find(i => i.product_id === id);
      item.quantity = Math.max(1, Number(inp.value) || 1);
      saveCart(cart);
      renderCart();
    });
  });

  cont.addEventListener('click', (e) => {
    const rm = e.target.getAttribute('data-rm');
    if (rm) {
      removeFromCart(Number(rm));
      renderCart();
    }
    if (e.target.id === 'btnClear') {
      localStorage.removeItem('cart');
      renderCart();
    }
    if (e.target.id === 'btnCheckout') {
      checkout();
    }
  });
}

document.addEventListener('DOMContentLoaded', renderCart);
