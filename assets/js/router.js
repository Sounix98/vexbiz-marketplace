/* VEXBIZ · Router por hash con pila de navegación (push/back), esqueleto mientras
   carga cada vista, y restauración de scroll al volver. Funciona en GitHub Pages
   y en cualquier hosting estático, sin reescrituras de servidor. */
import { skeletonScreen, reveal, reduce } from './ui.js';

const ROOTS = new Set(['inicio', 'categorias', 'carrito', 'cuenta']);
const TAB_OF = { inicio: 'inicio', categorias: 'categorias', n: 'categorias', carrito: 'carrito', pago: 'carrito', pedido: 'carrito', cuenta: 'cuenta', pedidos: 'cuenta', favoritos: 'cuenta', login: 'cuenta' };
const TAB_INDEX = { inicio: 0, categorias: 1, carrito: 2, cuenta: 3 };

export function parse(hash) {
  const h = (hash || '').replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const [view, ...rest] = path.split('/');
  return { view: view || 'inicio', param: decodeURIComponent(rest.join('/') || ''), query: Object.fromEntries(new URLSearchParams(qs || '')) };
}

export function createRouter({ views, host, bar, app, onRoute }) {
  let hist = [], pushes = 0, current = null, token = 0, curTab = 'inicio', booted = false;
  const scrolls = {}, cleanups = [];

  function setTab(t) {
    bar.querySelectorAll('[data-tab]').forEach((b) => {
      const on = b.dataset.tab === t;
      b.classList.toggle('tab--on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    bar.querySelector('.tabbar__pill').style.setProperty('--i', TAB_INDEX[t] || 0);
  }

  async function render(dir) {
    const r = parse(location.hash);
    const V = views[r.view] || views.inicio;
    const my = ++token;
    cleanups.splice(0).forEach((fn) => { try { fn(); } catch (e) {} });
    if (current && host.firstChild) scrolls[current] = host.firstChild.scrollTop;
    current = location.hash || '#/inicio';

    const el = document.createElement('section');
    el.className = 'screen' + (V.cls ? ' ' + V.cls : '') + (booted && !reduce && dir !== 'none' ? (dir === 'back' ? ' is-back' : ' is-enter') : '');
    el.innerHTML = skeletonScreen();
    host.replaceChildren(el);

    if (ROOTS.has(r.view)) curTab = r.view; else if (TAB_OF[r.view]) curTab = TAB_OF[r.view];
    setTab(curTab);
    const hideBar = !!V.noBar;
    bar.toggleAttribute('data-hidden', hideBar);
    app.setAttribute('data-bar', hideBar ? 'off' : 'on');

    let html;
    try { html = await V.render(r.param, r.query); }
    catch (e) { console.error(e); html = views.error.render(e); }
    if (my !== token) return;                           // el usuario ya navegó a otra parte
    el.innerHTML = html;
    const ctx = { onCleanup: (fn) => cleanups.push(fn), rerender: () => rerender() };
    if (V.mount) { try { await V.mount(el, r.param, r.query, ctx); } catch (e) { console.error(e); } }
    if (dir === 'back' && scrolls[current]) el.scrollTop = scrolls[current];
    reveal(el);
    document.title = 'VEXBIZ · ' + (V.title ? V.title(r.param, el) : 'Inicio');
    if (booted) { const f = el.querySelector('[data-focus]'); if (f) f.focus({ preventScroll: true }); }
    booted = true;
    onRoute && onRoute(r);
  }

  async function rerender() {
    const st = host.firstChild ? host.firstChild.scrollTop : 0;
    await render('none');
    if (host.firstChild) host.firstChild.scrollTop = st;
  }

  function go(hash, replace) {
    if (replace) { if (hist.length) hist.pop(); location.replace(hash); } else if (location.hash === hash) rerender(); else location.hash = hash;
  }
  function back() { if (pushes > 0) history.back(); else go(hist.length > 1 ? hist[hist.length - 2] : '#/inicio'); }

  window.addEventListener('hashchange', () => {
    const h = location.hash || '#/inicio', r = parse(h);
    let dir = 'push';
    if (hist.length > 1 && hist[hist.length - 2] === h) { hist.pop(); dir = 'back'; pushes = Math.max(0, pushes - 1); }
    else if (ROOTS.has(r.view) && !Object.keys(r.query).length) { hist = [h]; pushes++; }
    else { hist.push(h); pushes++; }
    render(dir);
  });

  function start() {
    if (!location.hash) location.replace('#/inicio');
    const r = parse(location.hash);
    hist = ROOTS.has(r.view) ? [location.hash] : ['#/inicio', location.hash];
    render('none');
  }

  return { start, go, back, rerender, get tab() { return curTab; } };
}
