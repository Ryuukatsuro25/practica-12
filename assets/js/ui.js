// RappiWAO — UI helpers (sin dependencias)
import { escapeHTML, clamp } from './util.js';

export function toast(title, msg, tone = 'info'){
  const area = document.getElementById('toast-area');
  if(!area) return;

  const emoji = tone === 'ok' ? '✅' : tone === 'danger' ? '⛔' : tone === 'warn' ? '⚠️' : 'ℹ️';
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `
    <div>${emoji}</div>
    <div>
      <div class="toast__title">${escapeHTML(title)}</div>
      <div class="toast__msg">${escapeHTML(msg)}</div>
    </div>
    <button class="toast__close" aria-label="Cerrar" title="Cerrar">✕</button>
  `;
  area.appendChild(el);

  const close = () => { el.remove(); };
  el.querySelector('.toast__close')?.addEventListener('click', close);
  setTimeout(close, 5200);
}

export function confirmDialog({ title='Confirmar', msg='¿Estás seguro?', okText='Sí', cancelText='Cancelar' } = {}){
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,.55)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.zIndex = '250';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    overlay.style.padding = '18px';

    const card = document.createElement('div');
    card.className = 'card';
    card.style.width = 'min(560px, 100%)';
    card.innerHTML = `
      <div class="card__inner">
        <h3 class="card__title">${escapeHTML(title)}</h3>
        <p class="card__subtitle">${escapeHTML(msg)}</p>
        <div class="row" style="justify-content:flex-end; gap:10px;">
          <button class="btn btn--ghost" data-x="cancel">${escapeHTML(cancelText)}</button>
          <button class="btn btn--primary" data-x="ok">${escapeHTML(okText)}</button>
        </div>
      </div>
    `;
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const cleanup = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay){ cleanup(); resolve(false); }
    });
    card.querySelector('[data-x="cancel"]')?.addEventListener('click', () => { cleanup(); resolve(false); });
    card.querySelector('[data-x="ok"]')?.addEventListener('click', () => { cleanup(); resolve(true); });
  });
}

export function starIcon(on){
  return `
  <span class="star ${on ? 'star--on' : 'star--off'}" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false" role="img">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
    </svg>
  </span>`;
}

export function renderStars(rating, { outOf=5 } = {}){
  const r = clamp(Number(rating || 0), 0, outOf);
  let html = `<span class="stars" title="${r}/${outOf}">`;
  for(let i=1;i<=outOf;i++){
    html += starIcon(i <= r);
  }
  html += `</span>`;
  return html;
}

export function renderStarPicker({ name='rating', value=5 } = {}){
  const v = clamp(Number(value || 5), 1, 5);
  const radios = [1,2,3,4,5].map(n => `
    <label class="pill" style="display:inline-flex; align-items:center; gap:8px;">
      <input type="radio" name="${escapeHTML(name)}" value="${n}" ${n===v?'checked':''} />
      <span>${renderStars(n)}</span>
    </label>
  `).join('');
  return `<div class="pills" role="radiogroup" aria-label="Calificación">${radios}</div>`;
}

export function scrollToTop(){
  document.getElementById('main')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
