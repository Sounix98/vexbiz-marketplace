/* Catálogo · Categorías (§6 .niche-row) · Nicho (§7 portada + filtros) · Tiendas (§8.1)
   · Tienda · Buscar. Todo con datos reales de marketplace-api/v1. */
import { api } from '../api.js';
import { esc, plural, shortDate, fold } from '../format.js';
import { ico, img, pcard, storeCard, storeLogo, empty, topbar, rootHead, btn, link, reveal, skeletonGrid, priceLabel, storeName, storeNiches, storeCount, storeOrder } from '../ui.js';
import { prefs } from '../store.js';
import { nav } from '../nav.js';
import { nicheEmpty } from './home.js';

const SORTS = [['rel', 'Relevancia'], ['price_asc', 'Menor precio'], ['price_desc', 'Mayor precio'], ['stock', 'Disponibles']];

async function syncNote(shown, total) {
  const m = await api.meta();
  if (api.mode === 'live' || !total || shown >= total) return '';
  return `<p class="sync-note">${ico('clock')}Selección de ${plural(shown, 'producto', 'productos')} de ${total.toLocaleString('es-VE')} · catálogo sincronizado el ${shortDate(m.fetchedAt)}</p>`;
}

/* Lista paginada reutilizable: grilla + "Cargar más" */
function pager(el, fetchPage) {
  const grid = el.querySelector('[data-grid]'), more = el.querySelector('[data-more]');
  let cursor = null, loading = false;
  async function load(reset) {
    if (loading) return; loading = true;
    if (reset) { cursor = null; grid.innerHTML = skeletonGrid(4).replace(/^<div class="grid">|<\/div>$/g, ''); }
    more.innerHTML = '';
    const res = await fetchPage(cursor);
    if (reset) grid.innerHTML = '';
    grid.insertAdjacentHTML('beforeend', res.items.map(pcard).join(''));
    cursor = res.cursor;
    const count = el.querySelector('[data-count]');
    if (count) count.textContent = plural(res.total, 'producto', 'productos');
    more.innerHTML = cursor ? btn('Cargar más', 'vx-btn--ghost', 'data-loadmore') : '';
    if (!res.total && reset) grid.innerHTML = `<div style="grid-column:1/-1;margin-inline:calc(var(--app-gutter) * -1)">${empty('search', 'Sin productos con este filtro', 'Prueba con otra categoría o quita el filtro.')}</div>`;
    reveal(el); loading = false;
    return res;
  }
  more.addEventListener('click', (e) => { if (e.target.closest('[data-loadmore]')) load(false); });
  return load;
}

/* ---------------- Categorías ---------------- */
export const categorias = {
  title: () => 'Categorías',
  async render() {
    const niches = (await api.niches()).slice().sort((a, b) => (b.count > 0) - (a.count > 0) || a.name.localeCompare(b.name, 'es'));
    return rootHead('Explora por nichos', `${niches.length} nichos · proveedores homologados por VEXBIZ`, 'Inicio / Categorías') +
      `<div style="padding:0 var(--app-gutter) var(--vx-sp-4)"><label class="searchfield">${ico('search')}<span class="sr">Filtrar nichos</span><input id="niche-filter" name="nicho" type="search" placeholder="Filtrar nichos…" data-filter autocomplete="off"></label></div>
      <div class="list" data-niche-list>${niches.map((n) => `<a class="niche-row" href="#/n/${esc(n.id)}" data-name="${esc(fold(n.name))}">
        <span class="niche-row__ico niche-row__ico--img">${n.image ? img(n.image, '') : ico('grid')}</span>
        <span class="niche-row__body"><span class="niche-row__name">${esc(n.name)}</span><span class="niche-row__meta">${n.count > 0 ? plural(n.count, 'producto', 'productos') : 'Todavía sin catálogo'}</span></span>
        <span class="niche-row__go" aria-hidden="true">${ico('chev-r')}</span></a>`).join('')}</div>
      <p class="sec__meta" data-none hidden style="padding-top:12px">Ningún nicho coincide con ese nombre.</p>`;
  },
  mount(el) {
    const input = el.querySelector('[data-filter]');
    input.addEventListener('input', () => {
      const q = fold(input.value.trim()); let shown = 0;
      el.querySelectorAll('.niche-row').forEach((r) => { const ok = !q || r.dataset.name.includes(q); r.hidden = !ok; if (ok) shown++; });
      el.querySelector('[data-none]').hidden = shown > 0;
    });
  },
};

/* ---------------- Nicho ---------------- */
export const nicho = {
  title: (_id, el) => (el.querySelector('.topbar__title') || {}).textContent || 'Catálogo',
  async render(id, q) {
    const isAll = id === 'todo';
    const { niche, categories } = isAll ? { niche: { id: 'todo', name: 'Todo el catálogo', count: 0 }, categories: [] } : await api.niche(id);
    if (!niche) return topbar('Nicho') + empty('alert', 'Este nicho no existe', 'Vuelve a Categorías para ver los nichos disponibles.', link('Ver categorías', '#/categorias'));
    const first = await api.search({ niche: id, category: q.cat, sort: q.sort, cursor: 0 });
    const stores = (await api.stores()).filter((s) => s.count > 0 && (isAll || s.niche === niche.name));
    const head = topbar(esc(niche.name), `<a class="iconbtn" href="#/buscar" aria-label="Buscar">${ico('search')}</a>`);
    const hero = isAll ? '' : `<div class="niche-hero">${niche.image ? img(niche.image, '') : ''}<div class="niche-hero__body"><h2 class="niche-hero__name">${esc(niche.name)}</h2><span class="niche-hero__meta">${niche.count > 0 ? plural(niche.count, 'producto', 'productos') : 'Todavía sin catálogo'}</span></div></div>`;
    if (!first.total && !q.cat) return head + hero + nicheEmpty(niche);
    const cats = categories.length ? `<div class="chips" role="group" aria-label="Categorías" style="margin-bottom:10px">
      <button class="chip" type="button" data-cat="" aria-pressed="${!q.cat}">Todas</button>
      ${categories.map((c) => `<button class="chip" type="button" data-cat="${esc(c.slug)}" aria-pressed="${q.cat === c.slug}">${esc(c.name)} <span class="chip__count">${c.products}</span></button>`).join('')}</div>` : '';
    const sorts = `<div class="chips" role="group" aria-label="Ordenar" style="margin-bottom:12px">${SORTS.map(([k, l]) => `<button class="chip" type="button" data-sort="${k}" aria-pressed="${(q.sort || 'rel') === k}">${l}</button>`).join('')}</div>`;
    const provs = stores.length ? `<section class="sec" style="margin-bottom:var(--vx-sp-4)" aria-labelledby="t-np"><div class="sec__head"><h2 class="sec__title" id="t-np">Proveedores${isAll ? '' : ' de ' + esc(niche.name)}</h2></div><div class="stack">${stores.slice(0, 3).map((s) => storeCard(s)).join('')}</div></section>` : '';
    return head + hero + provs + cats + sorts + (await syncNote(first.total, niche.count)) +
      `<p class="sec__meta" style="padding-bottom:12px" data-count>${plural(first.total, 'producto', 'productos')}</p><div class="grid" data-grid></div><div class="more" data-more></div>`;
  },
  async mount(el, id, q) {
    if (!el.querySelector('[data-grid]')) return;
    const state = { cat: q.cat || '', sort: q.sort || 'rel' };
    const load = pager(el, (cursor) => api.search({ niche: id, category: state.cat, sort: state.sort, cursor }));
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-cat]'), s = e.target.closest('[data-sort]');
      if (!c && !s) return;
      if (c) { state.cat = c.dataset.cat; el.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', x === c)); }
      if (s) { state.sort = s.dataset.sort; el.querySelectorAll('[data-sort]').forEach((x) => x.setAttribute('aria-pressed', x === s)); }
      history.replaceState(null, '', `#/n/${id}?${new URLSearchParams(Object.entries(state).filter(([, v]) => v && v !== 'rel'))}`);
      load(true);
    });
    await load(true);
  },
};

/* ---------------- Tiendas ---------------- */
export const tiendas = {
  title: () => 'Tiendas',
  async render() {
    const all = (await api.stores()).slice().sort(storeOrder);
    return topbar('Proveedores y tiendas') + `<p class="sec__meta" style="padding-bottom:12px">${plural(all.length, 'tienda verificada', 'tiendas verificadas')} por VEXBIZ</p><div class="stack">${all.map((s) => storeCard(s)).join('')}</div>`;
  },
};

/* ---------------- Tienda ---------------- */
export const tienda = {
  title: (_id, el) => (el.querySelector('.topbar__title') || {}).textContent || 'Catálogo',
  async render(id) {
    const s = await api.store(id);
    if (!s) return topbar('Tienda') + empty('store', 'No encontramos esta tienda', 'Puede que haya cambiado de nombre o ya no venda en VEXBIZ.', link('Ver tiendas', '#/tiendas'));
    const first = await api.search({ store: id, cursor: 0 });
    const hero = `<div class="store-hero"><div class="store-hero__cover store-hero__cover--mono" aria-hidden="true">${storeLogo(s, 'store-card__logo store-card__logo--lg')}</div>
      <div class="store-hero__body"><h2 class="store-hero__name" translate="no">${esc(s.name)}</h2>
      <span class="store-hero__meta">${[storeNiches(s).join(' y '), [s.city, s.state].filter(Boolean).join(', '), storeCount(s)].filter(Boolean).map(esc).join(' · ')}</span>
      ${s.verified ? `<span class="vx-status">${ico('shield')}Tienda verificada</span>` : ''}</div></div>`;
    if (!first.total) return topbar(esc(s.name)) + hero + empty('box', 'Su catálogo se está sumando a la app', `${esc(s.name)} está cargando sus productos.`, btn('Avísame cuando haya', 'vx-btn--secondary', 'data-notify'));
    return topbar(esc(s.name)) + hero + (await syncNote(first.total, s.count)) +
      `<div class="chips" role="group" aria-label="Ordenar" style="margin-bottom:12px">${SORTS.map(([k, l]) => `<button class="chip" type="button" data-sort="${k}" aria-pressed="${k === 'rel'}">${l}</button>`).join('')}</div>
      <p class="sec__meta" style="padding-bottom:12px" data-count></p><div class="grid" data-grid></div><div class="more" data-more></div>`;
  },
  async mount(el, id) {
    if (!el.querySelector('[data-grid]')) return;
    let sort = 'rel';
    const load = pager(el, (cursor) => api.search({ store: id, sort, cursor }));
    el.addEventListener('click', (e) => { const s = e.target.closest('[data-sort]'); if (!s) return; sort = s.dataset.sort; el.querySelectorAll('[data-sort]').forEach((x) => x.setAttribute('aria-pressed', x === s)); load(true); });
    await load(true);
  },
};

/* ---------------- Buscar ---------------- */
export const buscar = {
  title: () => 'Buscar',
  noBar: true,
  render(_p, q) {
    return `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico('chev-l')}</button>
      <form class="searchfield" role="search" data-search style="margin-right:8px">${ico('search')}<label class="sr" for="q">Buscar en VEXBIZ</label>
      <input id="q" name="q" type="search" placeholder="Producto, marca, código o tienda…" autocomplete="off" enterkeyhint="search" value="${esc(q.q || '')}" data-focus>
      <button class="iconbtn" type="button" data-clear ${q.q ? '' : 'hidden'} aria-label="Borrar búsqueda">${ico('x', 'ico--xs')}</button></form></header>
      <div data-results></div>`;
  },
  async mount(el, _p, q) {
    const input = el.querySelector('#q'), out = el.querySelector('[data-results]'), clear = el.querySelector('[data-clear]');
    const niches = await api.niches();
    let timer, cursor = null, lastQ = '';
    const row = (p) => `<a class="row" href="#/p/${esc(p.id)}"><span class="row__thumb">${p.images && p.images[0] ? img(p.images[0], '') : ico('image')}</span>
      <span class="row__body"><span class="row__title">${esc(p.name)}</span><span class="row__sub">${esc([p.brand, storeName(p)].filter(Boolean).join(' · '))}</span></span><span class="row__end">${priceLabel(p)}</span></a>`;
    function idle() {
      const recent = prefs.recent();
      out.innerHTML = (recent.length ? `<div class="sec__head" style="padding-top:8px"><p class="label" style="padding:0">Búsquedas recientes</p><button class="seeall" type="button" data-clear-recent>Borrar</button></div>
        <div class="chips" style="padding-block:12px 16px">${recent.map((r) => `<button class="chip" type="button" data-q="${esc(r)}">${ico('clock', 'ico--xs')}${esc(r)}</button>`).join('')}</div>` : '') +
        `<p class="label">Nichos</p><div class="chips" style="padding-block:12px 16px">${niches.filter((n) => n.count > 0).map((n) => `<a class="chip" href="#/n/${esc(n.id)}">${esc(n.name)} <span class="chip__count">${n.count.toLocaleString('es-VE')}</span></a>`).join('')}</div>
        <p class="label">Prueba con</p><div class="chips" style="padding-block:12px">${['compresor', 'termostato', 'rodamiento', 'Whirlpool', 'R134A'].map((t) => `<button class="chip" type="button" data-q="${t}">${t}</button>`).join('')}</div>`;
    }
    async function run(reset) {
      const term = input.value.trim(); clear.hidden = !term;
      history.replaceState(null, '', term ? '#/buscar?q=' + encodeURIComponent(term) : '#/buscar');
      if (!term) { idle(); return; }
      if (reset) { cursor = null; out.innerHTML = '<div style="padding:0 var(--app-gutter)"><div class="skel skel-row"></div></div>'; }
      lastQ = term;
      const res = await api.search({ q: term, cursor });
      if (term !== input.value.trim()) return;           // llegó tarde
      if (!res.total) { out.innerHTML = '<div style="padding-top:8px">' + empty('search', `No encontramos “${esc(term)}”`, 'Prueba con el código de referencia, la marca o una palabra más corta.') + '</div>'; return; }
      const html = res.items.map(row).join('');
      if (reset) out.innerHTML = `<p class="sec__meta" style="padding-bottom:8px">${plural(res.total, 'resultado', 'resultados')}</p><div class="list" data-list>${html}</div><div class="more" data-more></div>`;
      else out.querySelector('[data-list]').insertAdjacentHTML('beforeend', html);
      cursor = res.cursor;
      out.querySelector('[data-more]').innerHTML = cursor ? btn('Cargar más', 'vx-btn--ghost', 'data-loadmore') : '';
    }
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => run(true), 180); });
    el.querySelector('[data-search]').addEventListener('submit', (e) => { e.preventDefault(); prefs.pushRecent(input.value); input.blur(); run(true); });
    clear.addEventListener('click', () => { input.value = ''; run(true); input.focus(); });
    out.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-q]'); if (chip) { input.value = chip.dataset.q; prefs.pushRecent(chip.dataset.q); run(true); return; }
      if (e.target.closest('[data-clear-recent]')) { prefs.clearRecent(); idle(); return; }
      if (e.target.closest('[data-loadmore]')) run(false);
      if (e.target.closest('a.row') && lastQ) prefs.pushRecent(lastQ);
    });
    input.value ? run(true) : idle();
  },
};
