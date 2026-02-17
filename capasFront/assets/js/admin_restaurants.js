document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  requireRole('super_admin');

  async function load() {
    const data = await apiGet('/restaurants');
    const rows = data.map(r => `<tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.is_active ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-edit='${JSON.stringify(r).replace(/"/g,"&quot;")}'>Editar</button>
        <button class="btn btn-sm ${r.is_active ? 'btn-outline-danger' : 'btn-outline-success'}" data-toggle="${r.id}" data-active="${r.is_active?0:1}">
          ${r.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    </tr>`).join('');
    document.getElementById('restRows').innerHTML = rows;
  }

  document.getElementById('formNewR').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('rname').value.trim(),
      description: document.getElementById('rdesc').value.trim(),
      logo_url: document.getElementById('rlogo').value.trim(),
      is_active: true
    };
    await apiPost('/restaurants', payload);
    e.target.reset();
    await load();
  });

  document.getElementById('adminRest').addEventListener('click', async (e) => {
    const toggleId = e.target.getAttribute('data-toggle');
    if (toggleId) {
      const active = Number(e.target.getAttribute('data-active')) === 1;
      await apiPatch(`/restaurants/${toggleId}/availability`, { is_active: active });
      return location.reload();
    }
    const btn = e.target.closest('button[data-edit]');
    if (btn) {
      const r = JSON.parse(btn.getAttribute('data-edit').replace(/&quot;/g,'"'));
      const newName = prompt('Nuevo nombre', r.name);
      if (newName && newName.trim()) {
        await apiPut(`/restaurants/${r.id}`, { name: newName.trim() });
        return location.reload();
      }
    }
  });

  load();
});