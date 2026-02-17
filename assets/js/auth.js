// RappiWAO — Autenticación (demo localStorage)
import { loadDB, saveDB, setSession, clearSession, getSession } from './storage.js';
import { id, nowISO } from './util.js';
import { toast } from './ui.js';

export function currentUser(){
  const db = loadDB();
  const session = getSession();
  if(!session?.userId) return null;
  return db.users.find(u => u.id === session.userId) || null;
}

export function requireLogin(){
  const u = currentUser();
  if(!u){
    toast('Inicia sesión', 'Necesitas iniciar sesión para continuar.', 'warn');
    location.hash = '#/login';
    return null;
  }
  return u;
}

export function login(email, password){
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase().trim());
  if(!user || user.password !== String(password)){
    toast('Login inválido', 'Email o contraseña incorrectos.', 'danger');
    return null;
  }
  if(user.status !== 'active'){
    toast('Cuenta inactiva', 'Tu cuenta está deshabilitada.', 'danger');
    return null;
  }

  setSession({ userId: user.id, token: id('sess'), loginAt: nowISO() });
  toast('Bienvenido', `Hola, ${user.name}.`, 'ok');
  return user;
}

export function logout(){
  clearSession();
  toast('Sesión cerrada', 'Has salido de tu cuenta.', 'ok');
}

export function registerCustomer({ name, email, password }){
  const db = loadDB();
  const normalized = String(email).toLowerCase().trim();

  if(db.users.some(u => u.email.toLowerCase() === normalized)){
    toast('No se pudo registrar', 'Ya existe un usuario con ese email.', 'danger');
    return null;
  }

  const user = {
    id: id('usr'),
    role: 'customer',
    status: 'active',
    name: String(name).trim(),
    email: normalized,
    password: String(password),
    createdAt: nowISO(),
  };
  db.users.push(user);
  saveDB(db);
  toast('Registro exitoso', 'Ahora puedes iniciar sesión.', 'ok');
  return user;
}

export function registerStoreApplication({ ownerName, email, password, storeName, legalName, taxId, docUrl, address, phone, termsAccepted }){
  const db = loadDB();
  const normalized = String(email).toLowerCase().trim();

  if(db.users.some(u => u.email.toLowerCase() === normalized)){
    toast('No se pudo registrar', 'Ya existe un usuario con ese email.', 'danger');
    return null;
  }

  const userId = id('usr');
  const user = {
    id: userId,
    role: 'store_pending',
    status: 'active',
    name: String(ownerName).trim(),
    email: normalized,
    password: String(password),
    createdAt: nowISO(),
  };

  const app = {
    id: id('app'),
    userId,
    storeName: String(storeName).trim(),
    legalName: String(legalName).trim(),
    taxId: String(taxId).trim(),
    docUrl: String(docUrl).trim(),
    address: String(address).trim(),
    phone: String(phone).trim(),
    termsAccepted: Boolean(termsAccepted),
    status: 'pending', // pending | approved | rejected
    submittedAt: nowISO(),
    reviewedAt: null,
    reviewerUserId: null,
    notes: ''
  };

  if(!app.termsAccepted){
    toast('Falta aceptar términos', 'Debes aceptar términos y condiciones.', 'warn');
    return null;
  }

  db.users.push(user);
  db.storeApplications.push(app);
  saveDB(db);

  toast('Solicitud enviada', 'Un administrador revisará tu registro como tienda.', 'ok');
  return { user, app };
}
