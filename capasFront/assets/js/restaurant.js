document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const r = await apiGet(`/restaurants/${id}`);
    document.getElementById('restoTitle').textContent = r.name;
    document.getElementById('restoDesc').textContent = r.description || '';
    const logo = r.logo_url || 'images/logos/rapirollo.png';
    document.getElementById('restoLogo').src = logo;

    // productos (público)
    const data = await (async () => {
      try {
        // Intentar ruta pública (sin token)
        return await apiGet(`/public/restaurants/${id}/products`);
      } catch {
        // Si falla (porque apiGet siempre manda Authorization), forzar fetch sin header
        const resp = await fetch(`${API_BASE}/public/restaurants/${id}/products`);
        return await resp.json();
      }
    })();

    const grid = document.getElementById('productsGrid');
    if (!Array.isArray(data) || data.length === 0) {
      grid.innerHTML = '<div class="alert alert-info">Este restaurante no tiene productos disponibles.</div>';
      return;
    }

    grid.innerHTML = data.map(p => `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100">
          <img src="${p.image_url || 'images/products/roll_pollo.png'}" class="card-img-top p-3" alt="${p.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.description || ''}</p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="fw-bold">$${Number(p.price).toFixed(2)}</span>
              <button class="btn btn-sm btn-primary" data-add='${JSON.stringify({id:p.id, restaurant_id:p.restaurant_id, name:p.name, price:p.price}).replace(/"/g, "&quot;")}'>
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>`).join('');

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-add]');
      if (!btn) return;
      const prod = JSON.parse(btn.getAttribute('data-add').replace(/&quot;/g,'"'));
      addToCart({ id: prod.id, restaurant_id: prod.restaurant_id, name: prod.name, price: Number(prod.price) }, 1);
      alert('Añadido al carrito');
    });
  } catch (e) {
    console.error(e);
    document.getElementById('productsGrid').innerHTML = `<div class="alert alert-danger">Error cargando menú</div>`;
  }
});