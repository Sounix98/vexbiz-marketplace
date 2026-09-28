/* VEXBIZ · Piezas de interfaz compartidas por todas las vistas.
   Nombres de clase = inventario del skill (§4): .pcard, .prov, .store-card, .niche-row,
   .band, .vx-btn, .vx-status, .tabbar. Cero hex: todo sale de tokens.css / app.css. */
import { esc, money, initials, plural } from './format.js';
import { favs } from './store.js';

export const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ico = (id, cls) => `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const stores = new Map();
export const setStores = (list) => list.forEach((s) => stores.set(s.id, s));
export const storeOf = (id) => stores.get(id) || null;
export const storeName = (p) => p.storeName || (stores.get(p.store) || {}).name || 'Tienda';

/* Stock de 3 niveles: Disponible · Últimas N · Agotado (decisión cerrada #11) */
export function stock(p, full) {
  const n = Number(p.stock || 0);
  if (p.availability === 'out_of_stock' || n <= 0 && p.availability !== 'in_stock') return '<span class="stock stock--out">Agotado</span>';
  if (p.availability === 'low_stock' || (n > 0 && n <= 5)) return `<span class="stock stock--low">${n === 1 ? 'Última unidad' : `Últimas ${n}${full ? ' disponibles' : ''}`}</span>`;
  return '<span class="stock">Disponible</span>';
}
export const canBuy = (p) => p.price > 0 && !(p.availability === 'out_of_stock' || (Number(p.stock || 0) <= 0 && p.availability !== 'in_stock'));
export const priceLabel = (p) => (p.price > 0 ? money(p.price, p.currency) : 'Precio a consultar');

/* width/height dan el ratio antes de cargar (sin saltos de diseño); el CSS decide el tamaño final */
export function img(src, alt = '', attrs = '', size = 240) {
  const eager = /fetchpriority/.test(attrs);
  return src ? `<img src="${esc(src)}" alt="${esc(alt)}" width="${size}" height="${size}"${eager ? '' : ' loading="lazy"'} decoding="async" referrerpolicy="no-referrer" ${attrs} data-fallback>` : '';
}

/* Stock en la tarjeta: una línea de texto solo si quedan 2 o menos o está agotado (auditoría 28/09).
   La ficha conserva la etiqueta de 3 niveles con stock(). */
export function stockLine(p) {
  const n = Number(p.stock || 0);
  if (p.availability === 'out_of_stock' || (n <= 0 && p.availability !== 'in_stock')) return '<span class="pcard__stock pcard__stock--out">Agotado</span>';
  if (n > 0 && n <= 2) return `<span class="pcard__stock">${n === 1 ? 'Última unidad' : 'Últimas 2'}</span>`;
  return '';
}

export function favBtn(p, cls) {
  const on = favs.has(p.id);
  return `<button class="${cls}" type="button" data-fav="${esc(p.id)}" aria-pressed="${on}" aria-label="Guardar ${esc(p.name)} en favoritos">${ico(on ? 'heart-f' : 'heart')}</button>`;
}

export function pcard(p) {
  return `<article class="pcard reveal">${favBtn(p, 'pcard-fav')}
    <a class="pcard__link" href="#/p/${esc(p.id)}">
      <span class="pcard__media">${p.images && p.images[0] ? img(p.images[0], '') : `<span class="pcard__noimg">${ico('image')}</span>`}</span>
      <span class="pcard__body"><span class="pcard__name">${esc(p.name)}</span>
        <span class="pcard__sku"${p.brand ? ' translate="no"' : ''}>${esc(p.brand || p.category || '')}</span>${stockLine(p)}</span>
    </a>
    <div class="pcard__foot"><button class="pcard-price${p.price > 0 ? '' : ' pcard-price--ask'}" type="button" data-quick="${esc(p.id)}" aria-haspopup="dialog" aria-label="Vista rápida de ${esc(p.name)}, ${esc(priceLabel(p))}">${priceLabel(p)}</button>
      <span class="pcard__store">${ico('shield')}<span translate="no">${esc(storeName(p))}</span></span></div></article>`;
}

export function storeLogo(s, cls = 'store-card__logo') {
  return `<span class="${cls}" aria-hidden="true" data-initials="${esc(initials(s.name))}">${s.logo ? img(s.logo, '') : esc(initials(s.name))}</span>`;
}

export function provCard(s, cover) {
  const bg = cover ? ` style="background-image:url(${esc(cover)})"` : '';
  return `<a class="prov reveal" href="#/s/${esc(s.id)}"${bg}>
    ${cover ? `<span class="sr">${esc(s.name)}</span>` : (s.logo ? `<span class="prov__logo">${img(s.logo, '')}</span>` : `<span class="prov__mono" aria-hidden="true">${esc(initials(s.name))}</span>`) + ico('check-circle', 'prov__check') + `<span class="prov__name" translate="no">${esc(s.name)}</span>`}
    <span class="prov__chip">${esc(s.niche || 'Tienda verificada')}</span>
    <span class="prov__count">${plural(s.count, 'producto', 'productos')}</span></a>`;
}

export function storeCard(s, extraMeta = '') {
  return `<a class="store-card reveal" href="#/s/${esc(s.id)}">${storeLogo(s)}
    <span class="store-card__body"><span class="store-card__name" translate="no">${esc(s.name)}</span>
      <span class="store-card__meta">${[extraMeta, s.niche, s.city, plural(s.count, 'producto', 'productos')].filter(Boolean).map(esc).join(' · ')}</span>
      ${s.verified ? `<span class="vx-status vx-status--info">${ico('shield')}Tienda verificada</span>` : ''}</span>
    ${ico('chev-r')}</a>`;
}

export const empty = (art, title, text, action = '') =>
  `<div class="empty"><span class="empty__art">${ico(art)}</span><h3>${title}</h3><p>${text}</p>${action}</div>`;

/* tag 'p': la barra no lleva el h1 cuando la pantalla ya tiene su propio título principal */
export const topbar = (title, extra = '', tag = 'h1') =>
  `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico('chev-l')}</button>
   ${tag === 'h1' ? `<h1 class="topbar__title" tabindex="-1" data-focus>${title}</h1>` : `<p class="topbar__title">${title}</p>`}${extra}</header>`;
/* Barra de las pantallas de acceso: volver + marca (el título va en la tarjeta) */
export const brandbar = () =>
  `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico('chev-l')}</button>
   <span class="topbar__brand"><img class="brandmark--on-light" src="assets/img/logo-claro.webp" width="92" height="36" alt="VEXBIZ"><img class="brandmark--on-dark" src="assets/img/logo-oscuro.webp" width="92" height="36" alt="VEXBIZ"></span></header>`;

export const rootHead = (title, sub = '', crumb = '') =>
  `<header class="page-head" style="padding-top:var(--vx-sp-5)">${crumb ? `<span class="page-head__crumb">${crumb}</span>` : ''}
   <h1 class="page-head__title" tabindex="-1" data-focus>${title}</h1>${sub ? `<p class="page-head__sub">${sub}</p>` : ''}</header>`;

export const skeletonGrid = (n = 4) => `<div class="grid">${Array.from({ length: n }, () => '<div class="skel skel-card"></div>').join('')}</div>`;
export const skeletonScreen = () => `<div style="padding:var(--vx-sp-5) var(--app-gutter);display:flex;flex-direction:column;gap:12px" aria-busy="true" aria-label="Cargando">
  <div class="skel skel-line" style="width:40%;height:22px"></div><div class="skel skel-line" style="width:70%"></div>
  <div class="skel" style="height:150px;border-radius:var(--vx-r-lg)"></div></div>${skeletonGrid(4)}`;

export const btn = (label, cls = 'vx-btn--primary', attrs = '') => `<button class="vx-btn ${cls}" type="button" ${attrs}><span class="vx-btn__label">${label}</span></button>`;
export const link = (label, href, cls = 'vx-btn--secondary') => `<a class="vx-btn ${cls}" href="${href}"><span class="vx-btn__label">${label}</span></a>`;

/* Éxito momentáneo del botón (§1): check + texto por 1,2 s */
export function success(button, text, after) {
  const label = button.querySelector('.vx-btn__label'), original = label.innerHTML;
  button.dataset.state = 'done';
  label.innerHTML = ico('check', 'ico--sm') + esc(text);
  setTimeout(() => { if (after) { after(); return; } label.innerHTML = original; button.removeAttribute('data-state'); }, 1200);
}

/* Aviso */
let toastT;
/* toast(msg) o toast(msg, { action: 'Deshacer', onAction }) para acciones que se pueden revertir */
export function toast(msg, opts = {}) {
  const el = document.querySelector('[data-toast-out]');
  el.classList.toggle('has-action', !!opts.action);
  if (opts.action) {
    el.innerHTML = `<span>${esc(msg)}</span><button class="toast__act" type="button">${esc(opts.action)}</button>`;
    el.querySelector('button').addEventListener('click', () => { clearTimeout(toastT); el.classList.remove('is-on', 'has-action'); if (opts.onAction) opts.onAction(); }, { once: true });
  } else el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on', 'has-action'), opts.action ? 5000 : 2800);
}

/* Entrada de tarjetas: reposo visible, se anima al entrar (IntersectionObserver) */
let io;
export function reveal(root) {
  const items = root.querySelectorAll('.reveal:not(.is-visible)');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('is-visible')); return; }
  // Entrada escalonada: las tarjetas que aparecen juntas entran con 50 ms de diferencia (máx. 5 pasos)
  io = io || new IntersectionObserver((es) => { let k = 0; es.forEach((e) => { if (e.isIntersecting) { e.target.style.setProperty('--d', Math.min(k++, 5) * 50 + 'ms'); e.target.classList.add('is-visible'); io.unobserve(e.target); } }); }, { threshold: 0.1 });
  items.forEach((i) => io.observe(i));
}

/* Imágenes remotas que fallan: se ocultan y queda el ícono de foto */
document.addEventListener('error', (e) => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.hasAttribute('data-fallback') && !t.dataset.broken) {
    t.dataset.broken = '1';
    const box = t.closest('.pcard__media, .row__thumb, .pd-media, .store-card__logo, .prov__logo, .niche-row__ico, .profile__ava, .order-thumb');
    if (!box) return;
    if (box.dataset.initials) { box.insertAdjacentText('beforeend', box.dataset.initials); return; }   // logo de tienda: iniciales
    if (box.classList.contains('prov__logo')) { box.classList.add('prov__mono'); box.textContent = (box.closest('.prov').querySelector('.prov__name') || {}).textContent?.slice(0, 2).toUpperCase() || ''; return; }
    if (!box.querySelector('.pcard__noimg')) box.insertAdjacentHTML('beforeend', `<span class="pcard__noimg">${ico(box.classList.contains('niche-row__ico') ? 'grid' : 'image')}</span>`);
  }
}, true);

/* Hoja inferior */
let opener = null;
export function openSheet(html, from) {
  const layer = document.querySelector('[data-layer]'), sheet = document.querySelector('[data-sheet]');
  opener = from || document.activeElement;
  sheet.innerHTML = '<span class="sheet__grab" aria-hidden="true"></span>' + html;
  layer.classList.remove('is-closing'); layer.hidden = false;
  setTimeout(() => (sheet.querySelector('[data-autofocus]') || sheet).focus({ preventScroll: true }), 30);
  return sheet;
}
export function closeSheet() {
  const layer = document.querySelector('[data-layer]');
  if (layer.hidden) return;
  layer.classList.add('is-closing');
  setTimeout(() => { layer.hidden = true; layer.classList.remove('is-closing'); if (opener && opener.focus) opener.focus({ preventScroll: true }); }, reduce ? 0 : 300);
}
