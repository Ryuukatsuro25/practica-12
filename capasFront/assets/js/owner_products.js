document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  requireRole('restaurant_owner');
  const u = currentUser();
  const rid = Number(u?.restaurant_id);
  const tableBody = document.getElementById('prodRows');
  const form = document.getElementById('formNewP');

  if (!rid) {
    document.getElementById('ownerProducts').innerHTML = '<div class="alert alert-warning">No tiene un restaurante asignado.</div>';
    return;
  }

  async function load() {
    try {
      const prods = await apiGet(`/restaurants/${rid}/products`);
      if (!Array.isArray(prods) || !prods.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Sin productos</td></tr>';
        return;
      }
      tableBody.innerHTML = prods.map(p => `
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>$${Number(p.price).toFixed(2)}</td>
          <td>${p.stock}</td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${p.is_available ? 'checked' : ''} data-toggle="${p.id}">
            </div>
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-edit='${JSON.stringify({id:p.id, name:p.name, price:p.price, stock:p.stock}).replace(/"/g,'&quot;')}'>
              Editar
            </button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-danger">Error cargando productos</td></tr>';
    }
  }

  // Crear producto
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('pname').value.trim();
    const price = Number(document.getElementById('pprice').value);
    const stock = Number(document.getElementById('pstock').value);
    const image_url = document.getElementById('pimg').value.trim() || null;
    const description = document.getElementById('pdesc').value.trim() || null;
    try {
      await apiPost(`/restaurants/${rid}/products`, { name, price, stock, image_url, description, is_available: true });
      form.reset();
      await load();
    } catch (err) {
      alert('Error creando producto: ' + err.message);
    }
  });

  // Toggle disponibilidad + editar
  document.getElementById('ownerProducts').addEventListener('change', async (e) => {
    const sw = e.target.closest('input[data-toggle]');
    if (!sw) return;
    const id = Number(sw.getAttribute('data-toggle'));
    try {
      await apiPatch(`/products/${id}/availability`, { is_available: sw.checked });
    } catch (err) {
      alert('No se pudo cambiar disponibilidad: ' + err.message);
      sw.checked = !sw.checked; // revertir UI
    }
  });

  document.getElementById('ownerProducts').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-edit]');
    if (!btn) return;
    const p = JSON.parse(btn.getAttribute('data-edit').replace(/&quot;/g,'"'));
    const newPriceStr = prompt('Nuevo precio para ' + p.name, p.price);
    if (newPriceStr === null) return;
    const newPrice = Number(newPriceStr);
    if (!Number.isFinite(newPrice) || newPrice < 0) return alert('Precio inválido');

    const newStockStr = prompt('Nuevo stock para ' + p.name, p.stock);
    if (newStockStr === null) return;
    const newStock = Number(newStockStr);
    if (!Number.isInteger(newStock) || newStock < 0) return alert('Stock inválido');

    try {
      await apiPut(`/products/${p.id}`, { price: newPrice, stock: newStock });
      await load();
    } catch (err) {
      alert('Error actualizando: ' + err.message);
    }
  });

  load();
});