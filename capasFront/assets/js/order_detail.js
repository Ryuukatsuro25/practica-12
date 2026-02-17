document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) return;
  try {
    const data = await apiGet(`/orders/${id}`);
    const o = data.order;
    document.getElementById('title').textContent = 'Orden #' + o.id;
    document.getElementById('meta').textContent = `Estado: ${o.status} | Total: $${Number(o.total_amount).toFixed(2)} | ${new Date(o.created_at).toLocaleString()}`;
    const rows = data.items.map(i => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>$${Number(i.unit_price).toFixed(2)}</td></tr>`).join('');
    document.getElementById('items').innerHTML = rows;
  } catch (e) {
    document.getElementById('detailContainer').innerHTML = '<div class="alert alert-danger">No puedes ver esta orden o no existe</div>';
  }
});