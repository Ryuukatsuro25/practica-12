// RappiWAO — Utilidades pequeñas (sin dependencias)

export function nowISO(){
  return new Date().toISOString();
}

export function id(prefix = 'id'){
  // Generador simple y legible para IDs (no criptográfico)
  // Si existe crypto.randomUUID(), lo usamos para mejorar unicidad.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(16).slice(2);
  const ts = Date.now().toString(16);
  return `${prefix}_${ts}_${rand}`;
}

export function safeParse(json, fallback){
  try { return JSON.parse(json); } catch { return fallback; }
}

export function deepClone(obj){
  // structuredClone está disponible en navegadores modernos
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

export function escapeHTML(str){
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatMoneyCOP(value){
  const num = Number(value || 0);
  return num.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export function clamp(n, min, max){
  return Math.min(max, Math.max(min, n));
}
