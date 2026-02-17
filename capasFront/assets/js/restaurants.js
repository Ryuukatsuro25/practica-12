document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar?.();

  // decide role
  const current = JSON.parse(localStorage.getItem('user') || 'null');
  const canCreateReview = !!(current && current.role === 'client');

  // helper para estrellas visuales
  const stars = (avg) => {
    avg = Number(avg || 0);
    if (avg < 0) avg = 0;
    if (avg > 5) avg = 5;
    const filled = Math.floor(avg);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  try {
    const data = await apiGet('/restaurants?active=1');
    const grid = document.getElementById('restaurantsGrid');
    if (!data || !data.length) {
      grid.innerHTML = '<div class="alert alert-info">No hay restaurantes activos.</div>';
      return;
    }
    grid.innerHTML = data.map(r => `
      <div class="col-md-6 col-lg-4">
        <div class="card card-restaurant shadow-sm h-100">
          <img src="${r.logo_url || 'assets/img/placeholder-restaurant.png'}"
               class="card-img-top object-fit-contain p-3"
               alt="${r.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${r.name}</h5>
            <div class="small mb-2 text-warning">
              ${stars(r.avg_rating)}
              <span class="text-muted">(${(Number(r.avg_rating || 0)).toFixed(1)}/5 · ${r.reviews_count || 0})</span>
            </div>
            <p class="card-text flex-grow-1">${r.description || ''}</p>
            <a class="btn btn-outline-primary mt-auto" href="restaurant.php?id=${r.id}">Ver menú</a>
            <div class="d-grid gap-2 mt-2">
              <a class="btn btn-outline-secondary" href="reviews.php?restaurant_id=${r.id}">Ver reseñas</a>
              ${canCreateReview ? `<a class="btn btn-outline-success" href="add_review.php?restaurant_id=${r.id}">Hacer reseña</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    document.getElementById('restaurantsGrid').innerHTML = '<div class="alert alert-danger">Error cargando restaurantes</div>';
  }
});