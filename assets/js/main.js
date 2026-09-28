/* VEXBIZ · Arranque de la app. */
import { api } from './api.js';
import { CONFIG } from './config.js';
import { esc, plural } from './format.js';
import { ico, setStores, toast, success, openSheet, closeSheet, reduce } from './ui.js';
import { cart, favs, prefs, subscribe } from './store.js';
import { createRouter } from './router.js';
import { nav } from './nav.js';
import { registerSW, watchNetwork } from './pwa.js';
import home from './views/home.js';
import product from './views/product.js';
import { categorias, nicho, tiendas, tienda, buscar } from './views/catalog.js';
import { carrito, pago, pedido, pedidos } from './views/checkout.js';
import { cuenta, favoritos, error } from './views/account.js';
import { login, registro } from './views/login.js';
import { auth } from './auth.js';

CONFIG.version = document.documentElement.dataset.version || '1.0';

const views = { inicio: home, categorias, n: nicho, p: product, s: tienda, tiendas, buscar, carrito, pago, pedido, pedidos, cuenta, favoritos, login, registro, error };
const app = document.querySelector('[data-app]'), bar = document.querySelector('[data-tabbar]'), host = document.getElementById('screen-host');

/* Badge del carrito en la tab bar */
function badge(pop) {
  const b = bar.querySelector('[data-badge]'), n = cart.count();
  b.hidden = !n; b.textContent = n > 99 ? '99+' : n;
  bar.querySelector('[data-tab="carrito"]').setAttribute('aria-label', n ? 'Carrito, ' + plural(n, 'producto', 'productos') : 'Carrito');
  if (pop && !reduce) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
}
subscribe((what) => { if (what === 'cart' || what === 'reset' || what === 'orders') badge(what === 'cart'); });

/* Delegación global */
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-skip]')) {   // salto al contenido: título o primer control de la pantalla actual
    const scr = host.firstChild, t = scr && (scr.querySelector('[data-focus]') || scr.querySelector('main h1, h1, a, button, input'));
    if (t) { if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT)$/.test(t.tagName)) t.setAttribute('tabindex', '-1'); t.focus(); }
    return;
  }
  if (e.target.closest('[data-back]')) { nav.back(); return; }
  const tab = e.target.closest('[data-tab]');
  if (tab) { const h = '#/' + tab.dataset.tab; if (location.hash === h) host.firstChild && host.firstChild.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); else nav.go(h); return; }
  const fv = e.target.closest('[data-fav]');
  if (fv) {
    e.preventDefault();
    const id = fv.dataset.fav;
    api.product(id).then((p) => {
      p = p || { id, name: fv.getAttribute('aria-label') || '', images: [] };
      const on = favs.toggle(p);
      document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => { b.setAttribute('aria-pressed', on); b.querySelector('use').setAttribute('href', '#i-' + (on ? 'heart-f' : 'heart')); });
      toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
    });
    return;
  }
  if (e.target.closest('[data-open="loc"]')) { locSheet(e.target.closest('[data-open]')); return; }
  const nt = e.target.closest('[data-notify]');
  if (nt && !nt.dataset.state) { success(nt, 'Te avisaremos', () => { nt.disabled = true; }); return; }
  const t = e.target.closest('[data-toast]');
  if (t) { e.preventDefault(); toast(t.dataset.toast); }
});

/* Hoja: ciudad de entrega */
function locSheet(from) {
  const sheet = openSheet(`<div class="sheet__top"><h2 class="sheet__title" id="sheet-t">¿Dónde recibes tus pedidos?</h2><button class="iconbtn" type="button" data-close aria-label="Cerrar">${ico('x')}</button></div>
    <fieldset style="border:0;margin:0;padding:0"><legend class="sr">Ciudad de entrega</legend>
    ${CONFIG.cities.map((c, i) => `<label class="opt" for="city-${i}"><input type="radio" id="city-${i}" name="city" value="${esc(c)}"${c === prefs.city() ? ' checked data-autofocus' : ''}><span class="opt__body"><span class="opt__title">${esc(c)}</span></span></label>`).join('')}
    </fieldset><p class="sec__meta" style="padding:0">El costo y el plazo del envío los confirma cada tienda según la ciudad.</p>`, from);
  sheet.onchange = (e) => {
    if (e.target.name !== 'city') return;
    prefs.setCity(e.target.value);
    document.querySelectorAll('[data-city]').forEach((n) => { n.textContent = prefs.city(); });
    toast('Entregas a ' + prefs.city()); setTimeout(closeSheet, 250);
  };
}
const layer = document.querySelector('[data-layer]'), sheetEl = document.querySelector('[data-sheet]');
layer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
document.addEventListener('keydown', (e) => {
  if (layer.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSheet(); }
  if (e.key === 'Tab') {
    const f = [...sheetEl.querySelectorAll('button:not([disabled]), input:not([disabled]), [href]')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* Arranque */
(async () => {
  try { setStores(await api.stores()); } catch (e) { console.warn(e); }
  const router = createRouter({ views, host, bar, app });
  nav.go = router.go; nav.back = router.back; nav.rerender = router.rerender;
  router.start();
  badge(false);
  // Sesión real: si el sitio dejó sesión abierta, se recupera y la pantalla actual se actualiza
  auth.subscribe(() => { if (!/^#\/(login|registro)/.test(location.hash)) router.rerender(); });
  auth.boot();
  registerSW();
  watchNetwork();
})();
