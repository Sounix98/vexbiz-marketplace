/* VEXBIZ · Sesión con la cuenta real de ve.vexbiz.com.
   Mismo contrato que usa el sitio (main + chunk de login, leídos el 28/09):
   - POST /auth/login {email, password} → {two_factor_required, ticket} o {access_token, expires_in, identity}
   - POST /auth/2fa/verify {ticket, code} → igual que login sin segundo factor
   - POST /auth/refresh {} → renueva con la cookie httpOnly; el sitio deja la pista vexbiz_user_activa=1
   - GET  /auth/me → identidad (full_name, email, avatar_url, areas)
   - POST /auth/logout {}
   - GET  /account-api/v1/orders?cursor&limit → {data:[{order_number, store_name, created_at, currency, total, reported, item_count, status, image}], next_cursor}
   Todas llevan X-Tenant-Code y, si hay sesión, Authorization: Bearer.

   El token de acceso vive solo en memoria (nunca en localStorage). La renovación depende de la
   cookie httpOnly del dominio, así que el login funciona únicamente cuando la app se sirve desde
   un dominio de vexbiz.com (mismo origen que /auth). Fuera de ahí (doble clic, GitHub Pages, local)
   la app entra en MODO DEMOSTRACIÓN: mismas pantallas y mismos estados, respuestas simuladas en
   este archivo (demoCall), nada sale del teléfono. auth.demo() lo indica para avisarlo en pantalla. */
import { CONFIG } from './config.js';

const RENEW_MARGIN = 60;               // segundos antes de que venza el token
let token = '', identity = null, timer = null, renewing = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => { try { fn(identity); } catch (e) {} });

export const STATUS = {
  created: 'Pendiente de pago', pending_payment: 'Pendiente de pago', payment_failed: 'Pago rechazado',
  paid: 'Pagado', in_transit: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado',
};
export const STATUS_TONE = { created: 'warning', pending_payment: 'warning', payment_failed: 'danger', paid: 'success', in_transit: 'info', delivered: 'success', cancelled: 'neutral' };

class AuthError extends Error {
  constructor(status, code, detail) { super(detail || code || 'Error ' + status); this.status = status; this.code = code || ''; this.detail = detail || ''; }
}

/* ---------- Modo demostración: respuestas simuladas con la misma forma que la API ---------- */
const DEMO = CONFIG.authBase === null;
const DEMO_KEY = 'vx-demo-session';
const demoSave = (id) => { try { if (id) sessionStorage.setItem(DEMO_KEY, JSON.stringify(id)); else sessionStorage.removeItem(DEMO_KEY); } catch (e) {} };
const demoLoad = () => { try { return JSON.parse(sessionStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { return null; } };
const cap = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : '');
const nameFromEmail = (email) => { const p = String(email).split('@')[0].replace(/[^a-záéíóúñ]/gi, ' ').trim().split(/\s+/); return [cap(p[0]) || 'Carlos', cap(p[1] || '')].join(' ').trim(); };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let demoPending = null;                                    // identidad esperando el código 2FA
function demoOrders() {
  // <!-- mock --> pedidos de ejemplo, solo en modo demostración
  const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
  return [
    { order_number: 'VE-DEMO-3', store_name: 'Refrihogar', created_at: d(2), currency: 'USD', total: 184.5, reported: 0, item_count: 3, status: 'pending_payment', image: '' },
    { order_number: 'VE-DEMO-2', store_name: 'Total Herramientas', created_at: d(16), currency: 'USD', total: 42, reported: 42, item_count: 1, status: 'in_transit', image: '' },
    { order_number: 'VE-DEMO-1', store_name: 'MAXIFARMA', created_at: d(40), currency: 'USD', total: 19.9, reported: 19.9, item_count: 2, status: 'delivered', image: '' },
  ];
}
async function demoCall(path, { body = {} } = {}) {
  await pause(path === '/auth/me' || path === '/auth/refresh' ? 120 : 850);
  const ok = (identity) => ({ access_token: 'demo', expires_in: 0, identity });
  switch (path) {
    case '/auth/login': {
      const e = String(body.email || '').toLowerCase();
      if (e.includes('bloquead')) throw new AuthError(423, 'auth.account_locked');
      if (e.includes('sinclave')) throw new AuthError(409, 'auth.password_not_set');
      if (e.includes('error') || body.password === 'error') throw new AuthError(401, 'auth.invalid_credentials');
      const id = { full_name: nameFromEmail(e), email: e, areas: ['account', 'purchases'] };
      if (e.includes('2fa')) { demoPending = id; return { two_factor_required: true, ticket: 'demo' }; }
      return ok(id);
    }
    case '/auth/2fa/verify':
      if (String(body.code).trim() !== '123456' || !demoPending) throw new AuthError(422, 'auth.invalid_code', 'Ese código no es válido.');
      return ok(demoPending);
    case '/auth/register': {
      const e = String(body.email || '').toLowerCase();
      if (e.includes('existe')) throw new AuthError(409, 'auth.email_taken', 'Ya hay una cuenta con ese correo. Inicia sesión o recupera tu contraseña.');
      return ok({ full_name: `${body.first_name} ${body.last_name}`.trim(), email: e, areas: ['account', 'purchases'] });
    }
    case '/auth/refresh': { const id = demoLoad(); if (!id) throw new AuthError(401, 'auth.no_session'); return ok(id); }
    case '/auth/me': return identity;
    case '/auth/logout': demoSave(null); return {};
    case '/account-api/v1/orders': return { data: demoOrders(), next_cursor: '' };
    default: throw new AuthError(404, 'demo.not_found');
  }
}

async function call(path, opts = {}) {
  if (DEMO) return demoCall(path, opts);
  const { method = 'GET', body, params } = opts;
  let url = CONFIG.authBase + path;
  if (params) { const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)); if ([...q].length) url += '?' + q; }
  const headers = { Accept: 'application/json', 'X-Tenant-Code': CONFIG.tenant };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = 'Bearer ' + token;
  let r;
  try { r = await fetch(url, { method, headers, credentials: 'include', body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch (e) { throw new AuthError(0, 'network'); }
  let j = null;
  try { j = await r.json(); } catch (e) {}
  if (!r.ok) {
    const err = (j && j.error) || j || {};
    throw new AuthError(r.status, err.code, typeof err.detail === 'string' ? err.detail : (err.message || ''));
  }
  return j;
}

function adopt(res) {
  token = res.access_token || '';
  clearTimeout(timer);
  if (token && res.expires_in) timer = setTimeout(() => { timer = null; if (token) renew().catch(() => {}); }, Math.max(res.expires_in - RENEW_MARGIN, 30) * 1000);
}
function forget() { token = ''; clearTimeout(timer); timer = null; }

async function loadMe(fallback) {
  if (DEMO) { identity = fallback || demoLoad(); demoSave(identity); emit(); return identity; }
  try { const me = await call('/auth/me'); identity = (me && me.data) || me || fallback || null; }
  catch (e) { identity = fallback || null; }
  emit();
  return identity;
}

function renew() {
  if (renewing) return renewing;
  renewing = call('/auth/refresh', { method: 'POST', body: {} })
    .then((res) => { adopt(res); if (res.identity && !identity) { identity = res.identity; emit(); } return token; })
    .catch((e) => { forget(); if (identity) { identity = null; emit(); } throw e; })
    .finally(() => { renewing = null; });
  return renewing;
}

const hasHint = () => (DEMO ? !!demoLoad() : /(?:^|;\s*)vexbiz_user_activa=1/.test(document.cookie));

let booting = null;
export const auth = {
  available: () => true,
  demo: () => DEMO,
  user: () => identity,
  signedIn: () => !!identity && !!token,
  firstName() {
    const n = (identity && (identity.full_name || identity.name)) || '';
    return n.trim().split(/\s+/)[0] || ((identity && identity.email) || '').split('@')[0] || '';
  },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  /* Al abrir la app: si el sitio dejó la pista de sesión, renueva y trae la identidad. */
  boot() {
    if (booting) return booting;
    booting = !hasHint() ? Promise.resolve(null)
      : call('/auth/refresh', { method: 'POST', body: {} }).then((res) => { adopt(res); return loadMe(res.identity); }).catch(() => { forget(); return null; });
    return booting;
  },

  /* Devuelve {twoFactor:true, ticket} o {ok:true}. Lanza AuthError. */
  async login(email, password) {
    const res = await call('/auth/login', { method: 'POST', body: { email, password } });
    if (res.two_factor_required) return { twoFactor: true, ticket: res.ticket || '' };
    adopt(res); await loadMe(res.identity);
    return { ok: true };
  },
  async verify(ticket, code) {
    const res = await call('/auth/2fa/verify', { method: 'POST', body: { ticket, code } });
    adopt(res); await loadMe(res.identity);
    return { ok: true };
  },
  /* Alta de cuenta. En la app real el alta se hace en ve.vexbiz.com/register (endpoint no confirmado),
     así que solo el modo demostración la resuelve aquí. */
  async register(data) {
    if (!DEMO) throw new AuthError(0, 'auth.register_on_site');
    const res = await call('/auth/register', { method: 'POST', body: data });
    adopt(res); await loadMe(res.identity);
    return { ok: true };
  },
  async logout() {
    try { await call('/auth/logout', { method: 'POST', body: {} }); } catch (e) {}
    forget(); identity = null; emit();
  },

  /* Compras reales de la cuenta (paginadas por cursor). */
  async orders(cursor = '', limit = 10) {
    const run = () => call('/account-api/v1/orders', { params: { cursor, limit } });
    let r;
    try { r = await run(); }
    catch (e) { if (e.status !== 401) throw e; await renew(); r = await run(); }
    return { items: (r && r.data) || [], next: (r && r.next_cursor) || '' };
  },
  leftToPay(o) {
    if (!['created', 'pending_payment', 'payment_failed'].includes(o.status)) return 0;
    return Math.max(0, Math.round(((o.total || 0) - (o.reported || 0)) * 100) / 100);
  },

  /* Mismo texto que el formulario del sitio para cada código de error. */
  message(e) {
    switch (e && e.code) {
      case 'auth.invalid_credentials': return { error: 'Correo o contraseña incorrectos.' };
      case 'auth.account_locked': return { notice: 'Bloqueamos la cuenta un rato por demasiados intentos. Prueba de nuevo en unos minutos.' };
      case 'auth.password_not_set': return { notice: 'Todavía no has creado tu contraseña. Pídenos el enlace desde «¿Olvidaste tu contraseña?».' };
      case 'auth.no_tenant_access': return { notice: 'Tu cuenta no participa en Venezuela todavía.' };
      default: return { error: e && e.status === 0 ? 'No hay conexión. Comprueba tu red e inténtalo otra vez.' : (e && e.detail) || 'No pudimos entrar. Inténtalo otra vez.' };
    }
  },
};
