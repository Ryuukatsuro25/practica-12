// RappiWAO — Almacenamiento local (JSON en localStorage)
// Nota: Esto es una DEMO sin backend. No es seguro para producción.

import { createSeedDB } from './seed.js';
import { toast } from './ui.js';
import { nowISO, safeParse } from './util.js';

export const DB_KEY = 'RappiWAO_DB_V1';
export const SESSION_KEY = 'RappiWAO_SESSION_V1';

export function loadDB(){
  const raw = localStorage.getItem(DB_KEY);
  if(!raw){
    const seed = createSeedDB();
    saveDB(seed);
    return seed;
  }
  const db = safeParse(raw, null);
  if(!db || !db.meta || !db.meta.version){
    const seed = createSeedDB();
    saveDB(seed);
    return seed;
  }
  return db;
}

export function saveDB(db){
  db.meta = db.meta || {};
  db.meta.updatedAt = nowISO();
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDB(){
  const seed = createSeedDB();
  saveDB(seed);
  clearSession();
  toast('Base de datos reiniciada', 'Se cargaron los datos de ejemplo.', 'ok');
  return seed;
}

export function getSession(){
  return safeParse(localStorage.getItem(SESSION_KEY), null);
}

export function setSession(session){
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(){
  localStorage.removeItem(SESSION_KEY);
}

export function exportDB(){
  const db = loadDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rappiwao-db-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('DB exportada', 'Se descargó un archivo JSON con tus datos.', 'ok');
}

export async function importDBFromFile(file){
  const text = await file.text();
  const parsed = safeParse(text, null);
  if(!parsed || !parsed.meta || !parsed.users || !parsed.products){
    toast('Importación fallida', 'El archivo no parece ser una DB válida de RappiWAO.', 'danger');
    return null;
  }
  saveDB(parsed);
  toast('DB importada', 'Tus datos fueron cargados desde el JSON.', 'ok');
  return parsed;
}
