document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  requireRole('restaurant_owner');
  try {
    const data = await apiGet('/restaurant/orders');
    const cont = document.getElementById('ownerOrders');
    if (!data.length) { cont.innerHTML = '<div class="alert alert-info">Aún no hay órdenes.</div>'; return; }
    cont.innerHTML = data.map(o => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div><strong>#${o.id}</strong> - <span class="text-muted">${new Date(o.created_at).toLocaleString()}</span></div>
            <div>Total: $${Number(o.total_amount).toFixed(2)} | Estado: <strong>${o.status}</strong></div>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" data-status="recibido" data-id="${o.id}">Recibido</button>
            <button class="btn btn-sm btn-outline-warning" data-status="en_progreso" data-id="${o.id}">En progreso</button>
            <button class="btn btn-sm btn-outline-success" data-status="listo" data-id="${o.id}">Listo</button>
          </div>
        </div>
      </div>`).join('');

    cont.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const status = e.target.getAttribute('data-status');
      if (id && status) {
        try {
          await apiPatch(`/orders/${id}/status`, { status });
          location.reload();
        } catch (e) {
          alert('Error actualizando estado');
        }
      }
    });
  } catch (e) {
    document.getElementById('ownerOrders').innerHTML = '<div class="alert alert-danger">Error cargando órdenes</div>';
  }
});