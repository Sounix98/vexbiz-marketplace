/* VEXBIZ · Formato de textos, precios y fechas. */
import { CONFIG } from './config.js';

const ACRONYMS = new Set(['LG', 'RGC', 'BTU', 'HP', 'LBP', 'HBP', 'MBP', 'A/A', 'AC', 'A/C', 'PVC', 'LED', 'USB', 'GPS', 'TV', 'ABS',
  'DC', 'PTC', 'NTC', 'CPU', 'PH', 'ISYN', 'CVS', 'C.A.', 'CA', 'GE', 'NSK']);
const SMALL = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'o', 'para', 'con', 'en', 'a', 'al', 'por', 'sin']);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const plural = (n, one, many) => `${n.toLocaleString(CONFIG.locale)} ${n === 1 ? one : many}`;

export function money(n, currency = CONFIG.currency) {
  const v = Number(n || 0).toLocaleString(CONFIG.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'USD' ? `$ ${v}` : `${currency === 'VES' ? 'Bs.' : currency} ${v}`;
}

export function shortDate(iso) {
  try { return new Date(iso).toLocaleDateString(CONFIG.locale, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; }
}

const mostlyUpper = (s) => { const l = [...String(s)].filter((c) => c.toLowerCase() !== c.toUpperCase()); return l.length > 0 && l.filter((c) => c === c.toUpperCase()).length / l.length > 0.6; };
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const isAcr = (core) => ACRONYMS.has(core.toUpperCase()) || core.length <= 2 || (core.length <= 4 && !/[aeiou]/i.test(core));

export function brandCase(b) {
  b = String(b || '').trim();
  if (!b || !(mostlyUpper(b) || b === b.toLowerCase())) return b;
  return b.split(' ').map((w) => { const core = w.replace(/[,./]/g, ''); return core && isAcr(core) ? w.toUpperCase() : cap(w); }).join(' ');
}

/* Los nombres del catálogo en mayúsculas pasan a tipo oración (guía del Home, §7):
   se conservan modelos, voltajes y siglas. */
export function sentenceCase(name, brand = '') {
  name = String(name || '').replace(/\s+/g, ' ').trim();
  if (!mostlyUpper(name)) return name;
  const brands = new Set(String(brand).toUpperCase().split(/\s+/).filter(Boolean));
  const s = name.split(' ').map((tok) => {
    const core = tok.replace(/^[,.;:()]+|[,.;:()]+$/g, '');
    if (/\d/.test(core) || ACRONYMS.has(core.toUpperCase())) return tok;
    if (core && brands.has(core.toUpperCase())) return tok.replace(core, brandCase(core));
    return tok.toLowerCase();
  }).join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function storeCase(n) {
  n = String(n || '').replace(/_/g, ' ').trim();
  if (!(mostlyUpper(n) || n === n.toLowerCase())) return n;
  return n.split(' ').map((w, i) => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : i && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : cap(w))).join(' ');
}

export const initials = (name) => String(name || '?').replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
