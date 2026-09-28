/* VEXBIZ · Estado de la app: carrito, favoritos, pedidos, ciudad y búsquedas recientes.
   Se guarda en este dispositivo (localStorage). Cada línea guarda una copia mínima del
   producto para que el carrito siga legible aunque el catálogo cambie o no haya red. */
import { CONFIG } from './config.js';

const listeners = new Set();
const blank = () => ({ cart: {}, fav: {}, orders: [], city: 'Ciudad Guayana', recent: [] });

function load() {
  try { const s = JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null'); return s ? Object.assign(blank(), s) : blank(); } catch (e) { return blank(); }
}
export const state = load();

function save() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {} }
function emit(what) { save(); listeners.forEach((fn) => fn(what)); }
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const card = (p, offer) => ({ id: p.id, name: p.name, img: (p.images || [])[0] || '', price: offer ? offer.price : p.price, currency: p.currency || 'USD',
  store: offer ? offer.store : p.store, stock: offer ? offer.stock : p.stock, sku: offer ? offer.sku : p.sku, city: offer ? offer.city : p.city, availability: offer ? offer.av : p.availability });

export const cart = {
  lines: () => Object.values(state.cart),
  count: () => Object.values(state.cart).reduce((s, l) => s + l.qty, 0),
  total: () => Object.values(state.cart).reduce((s, l) => s + l.qty * l.price, 0),
  qty: (id) => (state.cart[id] ? state.cart[id].qty : 0),
  add(p, qty, offer) {
    const cur = state.cart[p.id];
    const base = cur || { ...card(p, offer), qty: 0 };
    const max = Math.max(1, base.stock || 1);
    const next = Math.min(max, base.qty + qty);
    state.cart[p.id] = { ...base, qty: next };
    emit('cart');
    return next - base.qty;                     // cuántas unidades entraron de verdad
  },
  set(id, qty) { const l = state.cart[id]; if (!l) return; l.qty = Math.max(1, Math.min(l.stock || 1, qty)); emit('cart'); },
  remove(id) { const l = state.cart[id]; delete state.cart[id]; emit('cart'); return l; },
  restore(line) { if (line && line.id) { state.cart[line.id] = line; emit('cart'); } },
  clear() { state.cart = {}; emit('cart'); },
  byStore() {
    const g = {};
    Object.values(state.cart).forEach((l) => { (g[l.store] = g[l.store] || []).push(l); });
    return g;
  },
};

export const favs = {
  has: (id) => !!state.fav[id],
  list: () => Object.values(state.fav),
  toggle(p) { if (state.fav[p.id]) delete state.fav[p.id]; else state.fav[p.id] = card(p); emit('fav'); return !!state.fav[p.id]; },
};

export const orders = {
  list: () => state.orders,
  place(meta) {
    const code = 'VX-' + String(1044 + state.orders.length);
    const groups = cart.byStore();
    state.orders.unshift({ code, date: new Date().toISOString(), items: cart.count(), total: cart.total(), stores: Object.keys(groups).length,
      lines: cart.lines().map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price, store: l.store })), ...meta });
    state.cart = {};
    emit('orders');
    return code;
  },
};

export const prefs = {
  city: () => state.city,
  setCity(c) { state.city = c; emit('city'); },
  recent: () => state.recent,
  pushRecent(q) { q = q.trim(); if (!q) return; state.recent = [q, ...state.recent.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6); emit('recent'); },
  clearRecent() { state.recent = []; emit('recent'); },
  reset() { Object.assign(state, blank()); emit('reset'); },
};
