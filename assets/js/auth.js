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
   un dominio de vexbiz.com (mismo origen que /auth). Fuera de ahí, auth.available() es false y
   la app lo explica en vez de mostrar un formulario que no puede funcionar. */
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

async function call(path, { method = 'GET', body, params } = {}) {
  if (CONFIG.authBase === null) throw new AuthError(0, 'auth.unavailable');
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

const hasHint = () => /(?:^|;\s*)vexbiz_user_activa=1/.test(document.cookie);

let booting = null;
export const auth = {
  available: () => CONFIG.authBase !== null,
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
    booting = (!auth.available() || !hasHint()) ? Promise.resolve(null)
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
