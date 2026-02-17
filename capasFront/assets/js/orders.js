document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  requireRole('client');
  try {
    const data = await apiGet('/my/orders');
    const cont = document.getElementById('ordersContainer');
    if (!data.length) { cont.innerHTML = '<div class="alert alert-info">No tienes pedidos aún.</div>'; return; }
    cont.innerHTML = data.map(o => `
      <div class="card mb-2">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div><strong>Orden #${o.id}</strong> - Estado: <span class="badge ${o.status==='listo'?'bg-success':(o.status==='en_progreso'?'bg-warning text-dark':'bg-secondary')}">${o.status}</span></div>
            <div class="text-muted">Total: $${Number(o.total_amount).toFixed(2)} | ${new Date(o.created_at).toLocaleString()}</div>
          </div>
          <a class="btn btn-sm btn-outline-primary" href="order_detail.php?id=${o.id}">Ver</a>
        </div>
      </div>`).join('');
  } catch (e) {
    document.getElementById('ordersContainer').innerHTML = '<div class="alert alert-danger">Error cargando pedidos</div>';
  }
});