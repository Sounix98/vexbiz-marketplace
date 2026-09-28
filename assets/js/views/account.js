/* Cuenta · perfil, mis compras, preferencias (tema oscuro, ciudad), instalar la app,
   datos del catálogo. Favoritos. Vista de error. */
import { api } from '../api.js';
import { esc, plural, shortDate, initials } from '../format.js';
import { ico, pcard, empty, topbar, rootHead, link, btn, toast } from '../ui.js';
import { favs, orders, prefs } from '../store.js';
import { CONFIG } from '../config.js';
import { install } from '../pwa.js';
import { auth } from '../auth.js';

const row = (href, icon, title, sub, end = '', attrs = '') =>
  `<${href ? `a href="${href}"` : 'button type="button"'} class="row"${attrs}><span class="row__thumb row__thumb--ico">${ico(icon)}</span>
   <span class="row__body"><span class="row__title">${title}</span>${sub ? `<span class="row__sub">${sub}</span>` : ''}</span>${end || ico('chev-r')}</${href ? 'a' : 'button'}>`;

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark' ||
  (!document.documentElement.getAttribute('data-theme') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);

function profile() {
  const u = auth.user();
  if (auth.signedIn() && u) {
    const name = u.full_name || u.name || '';
    return `<div class="profile"><span class="profile__ava profile__ava--in" data-initials="${esc(initials(name || u.email))}">${u.avatar_url ? `<img src="${esc(u.avatar_url)}" alt="" referrerpolicy="no-referrer" data-fallback>` : esc(initials(name || u.email))}</span>
      <span class="profile__body"><b>Hola, ${esc(auth.firstName())}</b><span>${esc(name || 'Tu cuenta VEXBIZ')}</span></span>
      <button class="vx-btn" type="button" data-logout><span class="vx-btn__label">Salir</span></button></div>`;
  }
  return `<div class="profile"><span class="profile__ava">${ico('user')}</span><span class="profile__body"><b>Hola</b><span>${auth.available() ? 'Entra para ver tus compras de VEXBIZ.' : 'Tus pedidos y favoritos se guardan en este teléfono.'}</span></span>
    <a class="vx-btn" href="#/login"><span class="vx-btn__label">Entrar</span></a></div>`;
}

export const cuenta = {
  title: () => 'Cuenta',
  async render() {
    const m = await api.meta();
    const canInstall = install.available();
    return rootHead('Cuenta') +
      profile() +
      `      ${canInstall ? `<div class="install" style="margin-top:16px" data-install-card><img class="install__ico" src="assets/icons/icon-192.png" alt="" width="44" height="44"><span class="install__body"><b>Instala VEXBIZ</b><span>Ábrela desde tu pantalla de inicio, también sin conexión.</span></span>${btn('Instalar', 'vx-btn--primary', 'data-install')}</div>` : ''}
      <p class="label" style="padding:20px var(--app-gutter) 8px">Mis compras</p><div class="list">
        ${row('#/pedidos', 'box', 'Mis pedidos', auth.signedIn() ? 'Tus compras en VEXBIZ' : 'Estado y comprobante de pago', auth.signedIn() ? '' : `<span class="count">${orders.list().length}</span>`)}
        ${row('#/favoritos', 'heart', 'Favoritos', 'Productos guardados', `<span class="count">${favs.list().length}</span>`)}
        ${row('', 'pin', 'Mis direcciones', `<span data-city>${esc(prefs.city())}</span>`, '', ' data-open="loc"')}
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Preferencias</p><div class="list">
        <button class="row" type="button" role="switch" aria-checked="${isDark()}" data-theme-toggle><span class="row__thumb row__thumb--ico">${ico('moon')}</span><span class="row__body"><span class="row__title">Tema oscuro</span><span class="row__sub">Se guarda en este dispositivo</span></span><span class="switch" aria-hidden="true"></span></button>
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">VEXBIZ</p><div class="list">
        ${row('', 'book', 'Academia VEXBIZ', 'Cursos y certificaciones', '', ' data-toast="Academia VEXBIZ: cursos para técnicos y comercios"')}
        ${row('', 'store', 'Vender en VEXBIZ', 'Publica tu catálogo', '', ' data-toast="Vender en VEXBIZ: registro de proveedor en ve.vexbiz.com"')}
        ${row('', 'help', 'Soporte', 'Ayuda y reclamos', '', ' data-toast="Soporte: respondemos en menos de 2 horas hábiles"')}
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Catálogo</p><div class="list">
        ${row('', 'globe', m.mode === 'live' ? 'En vivo desde ve.vexbiz.com' : 'Copia guardada de ve.vexbiz.com', `${plural(m.products, 'producto', 'productos')} · sincronizado el ${shortDate(m.fetchedAt)}`, '<span></span>')}
        ${row('', 'trash', 'Borrar datos de este teléfono', 'Carrito, favoritos, pedidos y búsquedas', '<span></span>', ' data-reset')}
      </div>
      <p class="foot-note">VEXBIZ · app móvil · versión ${esc(CONFIG.version || '1.0')}</p>`;
  },
  mount(el, _p, _q, ctx) {
    const lo = el.querySelector('[data-logout]');
    if (lo) lo.addEventListener('click', async () => { lo.dataset.state = 'sending'; await auth.logout(); toast('Cerraste sesión en este teléfono'); });
    const t = el.querySelector('[data-theme-toggle]');
    t.addEventListener('click', () => {
      const next = t.getAttribute('aria-checked') === 'true' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(CONFIG.themeKey, next); } catch (e) {}
      t.setAttribute('aria-checked', String(next === 'dark'));
      document.querySelector('meta[name="theme-color"]').content = next === 'dark' ? '#1E262A' : '#FFD85E';
    });
    const ib = el.querySelector('[data-install]');
    if (ib) ib.addEventListener('click', async () => { const ok = await install.prompt(); if (ok) el.querySelector('[data-install-card]').remove(); });
    const reset = el.querySelector('[data-reset]'); let armed = false;
    reset.addEventListener('click', () => {
      if (!armed) { armed = true; reset.querySelector('.row__sub').textContent = 'Toca otra vez para confirmar'; setTimeout(() => { armed = false; }, 4000); return; }
      prefs.reset(); toast('Datos borrados de este teléfono'); ctx.rerender();
    });
  },
};

export const favoritos = {
  title: () => 'Favoritos',
  render() {
    const list = favs.list();
    if (!list.length) return topbar('Favoritos') + empty('heart', 'Todavía no guardas favoritos', 'Toca el corazón de un producto para guardarlo aquí.', link('Explorar productos', '#/inicio'));
    const asProduct = (f) => ({ id: f.id, name: f.name, images: [f.img].filter(Boolean), price: f.price, currency: f.currency, stock: f.stock, availability: f.availability, store: f.store });
    return topbar('Favoritos') + `<p class="sec__meta" style="padding-bottom:12px">${plural(list.length, 'producto guardado', 'productos guardados')}</p><div class="grid">${list.map((f) => pcard(asProduct(f))).join('')}</div>`;
  },
};

export const error = {
  title: () => 'Error',
  render(e) {
    return topbar('Algo salió mal') + empty('alert', 'No pudimos cargar esta pantalla', 'Revisa tu conexión y vuelve a intentarlo. Si sigue pasando, avísanos desde Soporte.',
      `<a class="vx-btn vx-btn--secondary" href="#/inicio"><span class="vx-btn__label">Ir a Inicio</span></a>`);
  },
};
