document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar?.();
  const params = new URLSearchParams(location.search);
  const id = params.get('restaurant_id');
  if (!id) return;

  const current = JSON.parse(localStorage.getItem('user') || 'null');
  const isOwnerOfThis = current && current.role === 'restaurant_owner' && Number(current.restaurant_id) === Number(id);

  const stars = (avg) => {
    avg = Number(avg || 0);
    const filled = Math.floor(avg);
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
  };

  try {
    const resto = await apiGet(`/restaurants/${id}`);
    document.getElementById('restoName').textContent = resto.name;

    const summary = await apiGet(`/restaurants/${id}/reviews/summary`);
    document.getElementById('ratingSummary').innerHTML =
      `${stars(summary.avg_rating)} <span class="text-muted">(${(Number(summary.avg_rating || 0)).toFixed(1)}/5 · ${summary.reviews_count || 0})</span>`;

    const list = await apiGet(`/restaurants/${id}/reviews`);
    const container = document.getElementById('reviewsList');
    if (!list.length) {
      container.innerHTML = '<div class="alert alert-secondary">Aún no hay reseñas.</div>';
    } else {
      container.innerHTML = list.map(r => `
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2">
              <div class="text-warning">${stars(r.rating)}</div>
              <strong>${r.reviewer_name || 'Anónimo'}</strong>
              <span class="text-muted small ms-auto">${new Date(r.created_at).toLocaleString()}</span>
            </div>
            ${r.comment ? `<p class="mb-2 mt-2">${String(r.comment).replace(/</g,'&lt;')}</p>` : ''}
            ${r.owner_reply ? `<div class="alert alert-success mb-0"><strong>Respuesta del dueño:</strong> ${String(r.owner_reply).replace(/</g,'&lt;')}</div>` : ''}
            ${isOwnerOfThis && !r.owner_reply ? `
              <div class="input-group mt-2">
                <input class="form-control" id="reply-${r.id}" placeholder="Responder...">
                <button class="btn btn-primary" data-reply="${r.id}">Responder</button>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');
    }

    // Hide Add Review if owner (dueño no crea reseñas)
    const addBtn = document.getElementById('btnAddReview');
    if (current && current.role !== 'client') {
      addBtn.classList.add('d-none');
    } else {
      addBtn.href = `add_review.php?restaurant_id=${id}`;
    }

    // Reply handlers
    document.querySelectorAll('[data-reply]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reviewId = btn.getAttribute('data-reply');
        const input = document.getElementById(`reply-${reviewId}`);
        const reply = (input?.value || '').trim();
        if (!reply) return;
        try {
          await apiPatch(`/restaurants/${id}/reviews/${reviewId}/reply`, { reply });
          location.reload();
        } catch (e) {
          alert('No se pudo enviar la respuesta.');
        }
      });
    });

  } catch (e) {
    console.error(e);
    document.getElementById('reviewsList').innerHTML = '<div class="alert alert-danger">Error cargando reseñas</div>';
  }
});