document.addEventListener('DOMContentLoaded', async () => {
  guardAuth(true);
  requireRole('super_admin');

  async function load() {
    const data = await apiGet('/users');
    const rows = data.map(u => `<tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>${u.restaurant_id || ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" data-edit='${JSON.stringify(u).replace(/"/g,"&quot;")}'>Editar</button>
      </td>
    </tr>`).join('');
    document.getElementById('userRows').innerHTML = rows;
  }

  document.getElementById('formNewU').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('uname').value.trim(),
      username: document.getElementById('uuser').value.trim(),
      email: document.getElementById('uemail').value.trim(),
      password: document.getElementById('upass').value.trim(),
      role: document.getElementById('urole').value,
      restaurant_id: document.getElementById('urest').value ? Number(document.getElementById('urest').value) : null
    };
    await apiPost('/users', payload);
    e.target.reset();
    await load();
  });

  document.getElementById('adminUsers').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-edit]');
    if (!btn) return;
    const u = JSON.parse(btn.getAttribute('data-edit').replace(/&quot;/g,'"'));
    const role = prompt('Nuevo rol (client, restaurant_owner, super_admin)', u.role) || u.role;
    const rid = prompt('Restaurant ID (para owners; deje vacío si no aplica)', u.restaurant_id || '');
    await apiPut(`/users/${u.id}`, { role, restaurant_id: rid? Number(rid) : null });
    await load();
  });

  load();
});