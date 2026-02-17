document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar?.();
  const params = new URLSearchParams(location.search);
  const id = params.get('restaurant_id');
  if (!id) return;

  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (!u || u.role !== 'client') {
    // Redirige a lista de reseñas si no es cliente
    location.href = `reviews.php?restaurant_id=${id}`;
    return;
  }

  try {
    const r = await apiGet(`/restaurants/${id}`);
    document.getElementById('pageTitle').textContent = `Nueva reseña · ${r.name}`;
    document.getElementById('btnCancel').href = `reviews.php?restaurant_id=${id}`;
  } catch {}

  const form = document.getElementById('reviewForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const rating = Number(fd.get('rating'));
    const comment = (fd.get('comment') || '').trim();
    const is_anonymous = fd.get('is_anonymous') === 'on';

    const alertBox = document.getElementById('formAlert');
    alertBox.classList.add('d-none');

    if (!rating || rating < 1 || rating > 5) {
      alertBox.textContent = 'Debes seleccionar una calificación entre 1 y 5.';
      alertBox.classList.remove('d-none');
      return;
    }

    try {
      await apiPost(`/restaurants/${id}/reviews`, { rating, comment, is_anonymous });
      location.href = `reviews.php?restaurant_id=${id}`;
    } catch (err) {
      alertBox.textContent = 'Error guardando la reseña. Verifica los datos e inténtalo de nuevo.';
      alertBox.classList.remove('d-none');
    }
  });
});