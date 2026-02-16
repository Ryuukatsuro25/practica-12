const STORAGE_KEY = "cuentica_marketplace_presentation_v1";

async function loadData(){
  // Prefer localStorage (cache del navegador). If empty, load from data.json
  const existing = localStorage.getItem(STORAGE_KEY);
  if(existing){
    try { return JSON.parse(existing); } catch(e){ /* fallthrough */ }
  }
  const res = await fetch("./data.json");
  const data = await res.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function fmtMoney(v){
  return new Intl.NumberFormat("es-CO", { style:"currency", currency:"USD" }).format(v);
}

function renderSwatches(pal){
  const items = [
    ["Primario", pal.primario],
    ["Secundario", pal.secundario],
    ["Acento", pal.acento],
    ["Fondo", pal.fondo],
  ];
  const wrap = document.querySelector("#palette");
  wrap.innerHTML = items.map(([name, hex]) => `
    <div class="swatch">
      <div class="color" style="background:${hex}"></div>
      <div class="meta">
        <div class="name">${name}</div>
        <div class="hex">${hex}</div>
      </div>
    </div>
  `).join("");
}

function renderIcons(){
  const icons = [
    {file:"admin.svg", title:"Administrador", desc:"Control total, moderación y configuración global."},
    {file:"store.svg", title:"Tienda", desc:"Autonomía para catálogo, precios y respuestas a reseñas."},
    {file:"customer.svg", title:"Cliente", desc:"Carrito multi-tienda, compras, reseñas e historial."},
    {file:"visitor.svg", title:"Visitante", desc:"Explora el marketplace; acciones clave requieren registro."},
  ];
  const wrap = document.querySelector("#icons");
  wrap.innerHTML = icons.map(i => `
    <div class="icon-card">
      <img src="./assets/${i.file}" alt="${i.title}"/>
      <div>
        <div class="t">${i.title}</div>
        <div class="d">${i.desc}</div>
      </div>
    </div>
  `).join("");
}

function renderProducts(products){
  const wrap = document.querySelector("#products");
  wrap.innerHTML = products.map(p => `
    <div class="product">
      <p class="name">${p.nombre}</p>
      <div class="meta">
        <span class="price">${fmtMoney(p.precio)}</span>
        <span>·</span>
        <span>${p.tienda}</span>
      </div>
      <p class="small" style="margin:10px 0 0 0">${p.descripcion}</p>
      <div class="tags">
        ${p.tags.map((t, idx)=>`<span class="pill ${idx===0 ? "green":""}">${t}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

function renderRoles(perfiles){
  const tbody = document.querySelector("#rolesBody");
  tbody.innerHTML = perfiles.map(p => `
    <tr>
      <td style="width:22%"><strong>${p.perfil}</strong><div class="small">${p.descripcion}</div></td>
      <td>
        <ul style="margin:0; padding-left:18px">
          ${p.capacidades.map(c=>`<li class="small">${c}</li>`).join("")}
        </ul>
      </td>
    </tr>
  `).join("");
}

function renderReferences(refs){
  const wrap = document.querySelector("#refs");
  wrap.innerHTML = refs.map(r => `
    <div class="icon-card" style="justify-content:space-between">
      <div>
        <div class="t">${r.nombre}</div>
        <div class="d">${r.url}</div>
      </div>
      <a class="button" href="${r.url}" target="_blank" rel="noreferrer">Abrir</a>
    </div>
  `).join("");
}

function downloadJSON(obj, filename="data-localstorage.json"){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toast(msg){
  const el = document.querySelector("#toast");
  el.textContent = msg;
  el.style.opacity = "1";
  setTimeout(()=> el.style.opacity = "0", 2000);
}

async function init(){
  const data = await loadData();

  document.querySelector("#title").textContent = data.descripcion_plataforma.titulo;
  document.querySelector("#summary").textContent = data.descripcion_plataforma.resumen;

  // Requirements
  document.querySelector("#reqs").innerHTML = data.presentacion_debe_contener
    .map(x => `<li class="small">${x}</li>`).join("");

  // Typography
  document.querySelector("#fonts").innerHTML = data.tipografias
    .map(f => `<div class="icon-card"><div><div class="t">${f.nombre}</div><div class="d">${f.uso}</div></div></div>`)
    .join("");

  renderSwatches(data.paleta_colores);
  renderIcons();
  renderProducts(data.productos_demo);
  renderRoles(data.descripcion_plataforma.perfiles);
  renderReferences(data.referencias_web);

  // Store steps
  document.querySelector("#storeSteps").innerHTML =
    data.descripcion_plataforma.registro_tiendas.pasos_sugeridos.map(s=>`<li class="small">${s}</li>`).join("");

  // Buttons
  document.querySelector("#btnExport").addEventListener("click", ()=>{
    const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || data;
    downloadJSON(latest);
    toast("JSON exportado.");
  });

  document.querySelector("#btnReset").addEventListener("click", ()=>{
    localStorage.removeItem(STORAGE_KEY);
    toast("Cache limpiado. Recarga la página.");
  });

  document.querySelector("#btnView").addEventListener("click", ()=>{
    const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || data;
    downloadJSON(latest, "preview.json");
    toast("Vista previa del JSON.");
  });

  document.querySelector("#storageKey").textContent = STORAGE_KEY;
}

init();
