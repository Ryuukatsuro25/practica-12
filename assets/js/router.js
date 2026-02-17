// RappiWAO — Router sencillo con hash (#/ruta)
import { scrollToTop } from './ui.js';

export function getPath(){
  const raw = location.hash || '#/';
  const p = raw.startsWith('#') ? raw.slice(1) : raw;
  if(!p.startsWith('/')) return '/' + p;
  return p;
}

export function matchRoute(path){
  const clean = path.replace(/\/+$/, '') || '/';

  const routes = [
    { name: 'home', re: /^\/$/ },
    { name: 'stores', re: /^\/stores$/ },
    { name: 'store', re: /^\/store\/([^/]+)$/ },
    { name: 'products', re: /^\/products$/ },
    { name: 'product', re: /^\/product\/([^/]+)$/ },
    { name: 'cart', re: /^\/cart$/ },
    { name: 'login', re: /^\/login$/ },
    { name: 'registerCustomer', re: /^\/register-customer$/ },
    { name: 'registerStore', re: /^\/register-store$/ },
    { name: 'profile', re: /^\/profile$/ },
    { name: 'orders', re: /^\/orders$/ },
    { name: 'admin', re: /^\/admin$/ },
    { name: 'storeDashboard', re: /^\/store-dashboard$/ },
    { name: 'storeApplication', re: /^\/store-application$/ },
  ];

  for(const r of routes){
    const m = clean.match(r.re);
    if(m){
      return { name: r.name, params: m.slice(1) };
    }
  }
  return { name: 'notFound', params: [] };
}

export function navigate(hash){
  location.hash = hash;
  scrollToTop();
}
