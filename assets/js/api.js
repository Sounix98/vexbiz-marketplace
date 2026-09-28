/* VEXBIZ · Capa de datos. Una sola interfaz para el catálogo, venga del snapshot
   (data/catalog.json) o de marketplace-api/v1 en vivo. Las vistas no saben cuál es. */
import { CONFIG } from './config.js';
import { fold, sentenceCase, storeCase, brandCase } from './format.js';

let snap = null, loading = null;
let mode = CONFIG.apiBase ? 'live' : 'snapshot';
const byId = new Map(), byStore = new Map(), byNiche = new Map();

function indexSnapshot(c) {
  c.products.forEach((p, i) => {
    p._i = i;
    byId.set(p.id, p);
    (byStore.get(p.store) || byStore.set(p.store, []).get(p.store)).push(p);
    (byNiche.get(p.niche) || byNiche.set(p.niche, []).get(p.niche)).push(p);
  });
  c.storeMap = new Map(c.stores.map((s) => [s.id, s]));
  c.nicheMap = new Map(c.niches.map((n) => [n.id, n]));
  return c;
}

async function snapshot() {
  if (snap) return snap;
  // Abierta con doble clic (file://): el catálogo llega ya cargado por data/catalog.js
  const src = window.VX_CATALOG ? Promise.resolve(JSON.parse(JSON.stringify(window.VX_CATALOG)))
    : fetch(CONFIG.snapshotUrl).then((r) => { if (!r.ok) throw new Error('snapshot ' + r.status); return r.json(); });
  if (!loading) loading = src.then(indexSnapshot).then((c) => (snap = c));
  return loading;
}

/* ---------------- En vivo ---------------- */
async function live(path) {
  const r = await fetch(CONFIG.apiBase.replace(/\/$/, '') + '/' + path, { headers: { 'X-Tenant-Code': CONFIG.tenant, Accept: 'application/json' } });
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return r.json();
}
/* Si la API en vivo falla (sin red, sin CORS), se sigue con el snapshot sin romper la vista. */
async function prefer(liveFn, snapFn) {
  if (mode === 'live') {
    try { return await liveFn(); } catch (e) { console.warn('[vexbiz] API en vivo no disponible, uso el snapshot:', e.message); mode = 'snapshot'; }
  }
  return snapFn(await snapshot());
}
const liveListing = (p) => ({
  id: p.slug, name: sentenceCase(p.name, p.brand), raw: p.name, brand: brandCase(p.brand), model: p.model || '', category: String(p.category || '').split(' > ').pop(),
  niche: p.niche_code || '', images: [p.image].filter(Boolean), price: p.price || 0, currency: p.currency || 'USD', availability: p.availability,
  stock: p.stock ?? (p.availability === 'in_stock' ? 99 : 1), store: p.store_slug, storeName: storeCase(p.store), city: p.city || '', condition: p.condition, offers: [],
});
const liveStore = (s) => ({ id: s.slug, name: storeCase(s.name), legal: s.legal_name || '', niche: s.niche || '', niches: s.niche ? [s.niche] : [], city: s.city || '', state: s.state || '', verified: !!s.verified, logo: s.logo || '', count: s.catalog_size || 0 });
/* La API repite la tienda una vez por cada nicho: se unen en una sola con niches[] */
function mergeStores(list) {
  const m = new Map();
  list.forEach((s) => { const x = m.get(s.id); if (!x) m.set(s.id, s); else if (s.niche && !x.niches.includes(s.niche)) x.niches.push(s.niche); });
  return [...m.values()];
}

/* ---------------- Utilidades del snapshot ---------------- */
function sortList(list, sort) {
  const l = list.slice();
  const priceKey = (p) => (p.price > 0 ? p.price : Infinity);   // sin precio va al final
  if (sort === 'price_asc') l.sort((a, b) => priceKey(a) - priceKey(b));
  else if (sort === 'price_desc') l.sort((a, b) => (b.price || -1) - (a.price || -1));
  else if (sort === 'stock') l.sort((a, b) => (b.availability === 'in_stock') - (a.availability === 'in_stock') || a._i - b._i);
  return l;
}
function page(list, cursor, size = CONFIG.pageSize) {
  const start = Number(cursor || 0);
  return { items: list.slice(start, start + size), total: list.length, cursor: start + size < list.length ? String(start + size) : null };
}

/* ---------------- Interfaz pública ---------------- */
export const api = {
  get mode() { return mode; },

  async meta() {
    const c = await snapshot();
    return { fetchedAt: c.fetched_at, source: c.source, mode, products: c.products.length, metrics: c.home.metrics };
  },

  niches: () => prefer(
    async () => (await live('niches')).data.map((n) => ({ id: n.code, name: n.name, image: n.image || '', count: n.products || 0, technician: !!n.requires_technician })),
    (c) => c.niches),

  niche: (id) => prefer(
    async () => { const d = await live('niches/' + encodeURIComponent(id)); return { niche: { id: d.niche.code, name: d.niche.name, image: d.niche.image, count: d.niche.products, technician: !!d.niche.requires_technician }, categories: (d.categories || []).filter((x) => x.products) }; },
    (c) => ({ niche: c.nicheMap.get(id) || null, categories: c.categories[id] || [] })),

  /* search({ q, niche, category, store, sort, cursor }) → { items, total, cursor } */
  search: (opt = {}) => prefer(
    async () => {
      const qs = new URLSearchParams();
      if (opt.q) qs.set('q', opt.q); if (opt.niche && opt.niche !== 'todo') qs.set('niche', opt.niche);
      if (opt.category) qs.set('category', opt.category); if (opt.store) qs.set('store', opt.store);
      if (opt.sort && opt.sort !== 'rel') qs.set('sort', opt.sort); if (opt.cursor) qs.set('cursor', opt.cursor);
      const d = await live('search?' + qs);
      return { items: d.results.map(liveListing), total: d.total || d.total_offers || d.results.length, cursor: d.cursor || null };
    },
    (c) => {
      let list = opt.store ? byStore.get(opt.store) || [] : opt.niche && opt.niche !== 'todo' ? byNiche.get(opt.niche) || [] : c.products;
      if (opt.category) { const cat = fold(opt.category).replace(/-/g, ' '); list = list.filter((p) => fold(p.category).includes(cat) || fold(p.category).replace(/\s+/g, ' ') === cat); }
      if (opt.q) { const toks = fold(opt.q).split(/\s+/).filter(Boolean); list = list.filter((p) => toks.every((t) => p.q.includes(t))); }
      return page(sortList(list, opt.sort), opt.cursor);
    }),

  product: (id) => prefer(
    async () => {
      const [d, o] = await Promise.all([live('products/' + id), live('products/' + id + '/offers')]);
      const offers = (o.data || []).map((x) => ({ store: x.store_slug, storeName: storeCase(x.store_name), price: x.price, stock: x.stock || 0, av: x.availability, sku: x.sku || '', city: x.city || '', verified: !!x.store_verified })).sort((a, b) => a.price - b.price);
      const best = offers[0] || {};
      return { id: d.slug, name: sentenceCase(d.name, d.brand), raw: d.name, brand: brandCase(d.brand), model: d.model || '', category: d.category, niche: d.niche_code, images: d.images || [],
        desc: d.description || '', attrs: (d.attributes || []).filter((a) => !['brand', 'niche', 'category'].includes(a.code)).map((a) => [a.name, a.value]), compat: d.compatibility || [],
        price: best.price || 0, currency: 'USD', availability: best.av, stock: best.stock || 0, store: best.store, sku: best.sku, city: best.city, condition: 'new', offers };
    },
    (c) => byId.get(id) || null),

  related: async (p, limit = 12) => {
    const c = await snapshot();
    const same = (byNiche.get(p.niche) || []).filter((x) => x.id !== p.id && x.category === p.category);
    return same.slice(0, limit);
  },

  stores: () => prefer(async () => mergeStores((await live('stores?limit=100')).data.map(liveStore)), (c) => c.stores),
  store: (id) => prefer(async () => liveStore(await live('stores/' + id)), (c) => c.storeMap.get(id) || null),

  async home() {
    const c = await snapshot();
    return c.home;
  },

  /* Resuelve varios productos por id desde el snapshot (carriles de Inicio, favoritos). */
  async byIds(ids) { await snapshot(); return ids.map((i) => byId.get(i)).filter(Boolean); },
  async storeName(id) { const c = await snapshot(); return (c.storeMap.get(id) || {}).name || ''; },
};
