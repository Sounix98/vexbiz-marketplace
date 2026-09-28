/* Inicio · Figma MARKETPLACE / PROTOTIPO / Home (292:800) + guía del Home 26/09.
   Orden: cabecera y ubicación → tabs de nicho → banners → banda Academia/Técnicos →
   proveedores certificados → explora por interés → marcas → confianza. */
import { api } from '../api.js';
import { CONFIG } from '../config.js';
import { esc, plural, initials } from '../format.js';
import { ico, img, pcard, provCard, empty, btn, reveal, reduce, storeOf, storeNiches, storeOrder } from '../ui.js';
import { prefs } from '../store.js';
import { auth } from '../auth.js';

let selected = 'todo';
const TRUST_ICON = { truck: 'truck', returns: 'swap', shield: 'shield', headset: 'help' };

export function nicheEmpty(n) {
  if (!n) return '';
  if (n.count > 0) return empty('store', 'Catálogo en crecimiento', `${n.name} tiene ${plural(n.count, 'producto', 'productos')} en VEXBIZ. Nuevos proveedores cada semana.`,
    `<a class="vx-btn vx-btn--secondary" href="#/n/${esc(n.id)}"><span class="vx-btn__label">Ver ${esc(n.name)}</span></a>`);
  return empty('box', `Todavía sin catálogo en ${esc(n.name)}`, 'Los proveedores de este nicho están cargando sus productos.',
    btn('Avísame cuando haya', 'vx-btn--secondary', 'data-notify'));
}

async function railProducts(niche, home) {
  const order = niche === 'todo' ? ['ref', 'aut', 'fer', 'ind'] : [niche];
  const ids = order.flatMap((k) => home.bestSellers[k] || []);
  let items = await api.byIds(ids);
  if (items.length < 8) {
    const more = (await api.search({ niche, cursor: 0 })).items.filter((p) => !items.some((x) => x.id === p.id));
    items = items.concat(more).slice(0, 8);
  }
  return items;
}

export default {
  title: () => 'Inicio',
  async render() {
    const [niches, home, stores] = await Promise.all([api.niches(), api.home(), api.stores()]);
    const map = new Map(niches.map((n) => [n.id, n]));
    const tabs = ['todo', ...CONFIG.homeNiches.filter((id) => map.has(id))];
    const trust = (home.trust || []).slice(0, 4);
    // Fotos reales del catálogo para los banners editoriales (una por banner)
    const pickIds = ['ref', 'fer', 'aut'].map((k) => (home.bestSellers[k] || [])[0]).filter(Boolean);
    const feats = pickIds.length ? await api.byIds(pickIds) : [];
    const art = (i, icon) => {
      const p = feats[i], src = p && p.images && p.images[0];
      return `<span class="banner__art" aria-hidden="true">${src ? img(src, '', i === 0 ? 'fetchpriority="high"' : '', 200) : ico(icon)}</span>`;
    };
    const banner = (tag, attrs, cls, kicker, title, sub, cta, artHtml) =>
      `<${tag} class="banner${cls}" ${attrs}><span class="banner__copy"><span class="banner__kicker">${kicker}</span><span class="banner__title">${title}</span><span class="banner__sub">${sub}</span><span class="banner__cta">${cta}${ico('chev-r')}</span></span>${artHtml}</${tag}>`;
    return `<div class="home">
      <div class="topdock" data-dock><div class="hero__bar">
          ${auth.signedIn() ? `<a class="avatar avatar--in" href="#/cuenta" aria-label="Hola, ${esc(auth.firstName())} · Mi cuenta">${esc(initials((auth.user() || {}).full_name || auth.firstName()))}</a>` : `<a class="avatar" href="${auth.available() ? '#/login?next=%23%2Finicio' : '#/cuenta'}" aria-label="${auth.available() ? 'Iniciar sesión' : 'Mi cuenta'}">${ico('user')}</a>`}
          <a class="searchfield" href="#/buscar">${ico('search')}<span>Buscar en <span translate="no">VEXBIZ</span>…</span></a>
          <a class="iconbtn" href="#/pedidos" aria-label="Mis pedidos">${ico('bell')}</a>
        </div></div>
      <header class="hero">
        ${auth.signedIn() ? `<p class="hero__hello">Hola, <b>${esc(auth.firstName())}</b></p>` : ''}<h1 class="sr" tabindex="-1" data-focus>Inicio</h1>
        <button class="loc" type="button" data-open="loc" aria-haspopup="dialog">${ico('pin', 'ico--sm')}<span>Enviar a <b data-city>${esc(prefs.city())}</b></span>${ico('chev-d', 'ico--xs')}</button>
        <div class="niches" role="tablist" aria-label="Nichos" data-niches>
          ${tabs.map((id) => `<button class="niche" role="tab" type="button" data-niche="${id}" aria-selected="${selected === id}" tabindex="${selected === id ? 0 : -1}">${id === 'todo' ? 'Todo' : esc(map.get(id).name)}</button>`).join('')}
        </div>
        <section class="banners" aria-roledescription="carrusel" aria-label="Promociones">
          <div class="banners__track" data-banners tabindex="0" aria-label="Promociones, desliza para ver más">
            ${banner('a', 'href="#/categorias"', '', 'Marketplace', 'Todo para tu negocio en un solo lugar', 'Repuestos, equipos y suministros de tiendas verificadas.', 'Explorar categorías', art(0, 'grid'))}
            ${banner('button', 'type="button" data-toast="Técnicos certificados: instalación, mantenimiento y reparación"', '', 'Servicios', 'Técnicos certificados cerca de ti', 'Instalación, mantenimiento y reparación con homologación verificada.', 'Conocer técnicos', art(1, 'tools'))}
            ${banner('button', 'type="button" data-toast="Vender en VEXBIZ: registro de proveedor en ve.vexbiz.com"', ' banner--ink', 'Para proveedores', 'Vende en <span translate="no">VEXBIZ</span>', 'Sin cuota de entrada: pagas una comisión solo sobre lo que vendes.', 'Publicar mi catálogo', art(2, 'store'))}
          </div>
          <div class="dots" data-dots>${[1, 2, 3].map((n) => `<button class="dot" type="button" aria-label="Promoción ${n} de 3"${n === 1 ? ' aria-current="true"' : ''}></button>`).join('')}${reduce ? '' : `<button class="dots__pause" type="button" data-pause aria-pressed="false" aria-label="Pausar el movimiento de las promociones">${ico('pause')}</button>`}</div>
        </section>
      </header>
      <div class="band-ticker" data-ticker>
        <button class="band" type="button" data-toast="${esc((home.academy && home.academy.title) || 'Academia VEXBIZ')}"><span class="band__title">Academia</span><img class="band__logo" src="assets/img/logo-oscuro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Aprende con nosotros y descubre más</span>${ico('chev-r')}</button>
        <button class="band band--alt" type="button" aria-hidden="true" tabindex="-1" data-toast="Técnicos certificados con homologación verificada"><span class="band__title">Técnicos certificados</span><img class="band__logo" src="assets/img/logo-claro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Homologación verificada</span>${ico('chev-r')}</button>
      </div>
      <nav class="nicherail" aria-label="Nichos de VEXBIZ">
        <div class="nicherail__track">${niches.slice().sort((a, b) => a.name.localeCompare(b.name, 'es')).map((n) => `<a class="nicon reveal" href="#/n/${esc(n.id)}"><span class="nicon__bubble"><img src="assets/img/nichos/${esc(n.id)}.webp" width="96" height="96" alt="" loading="lazy" decoding="async"></span><span class="nicon__name">${esc(n.name)}</span></a>`).join('')}</div>
      </nav>
      <section class="sec" aria-labelledby="t-prov"><div class="sec__head"><h2 class="sec__title" id="t-prov">Proveedores certificados</h2><a class="seeall" href="#/tiendas" data-seeall-stores>Ver todas${ico('chev-r')}</a></div><div class="rail" data-providers></div></section>
      <section class="sec" aria-labelledby="t-exp"><div class="sec__head"><h2 class="sec__title" id="t-exp">Explora por interés</h2><a class="seeall" href="#/n/todo" data-seeall>Ver todo${ico('chev-r')}</a></div><div class="rail" data-products></div></section>
      ${home.brands && home.brands.length ? `<section class="sec" aria-labelledby="t-brands"><div class="sec__head"><h2 class="sec__title" id="t-brands">Marcas en VEXBIZ</h2></div>
        <div class="rail">${home.brands.slice(0, 10).map((b) => `<a class="brand-chip reveal" href="#/buscar?q=${encodeURIComponent(b.name)}"><span class="brand-chip__name" translate="no">${esc(b.name)}</span><span class="brand-chip__count">${plural(b.products, 'producto', 'productos')}</span></a>`).join('')}</div></section>` : ''}
      ${trust.length ? `<section class="sec" aria-label="Por qué comprar en VEXBIZ"><div class="trust-strip">${trust.map((t) => `<div class="trust-item">${ico(TRUST_ICON[t.icon] || 'check-circle')}<span><b>${esc(t.title)}</b><span>${esc(t.detail)}</span></span></div>`).join('')}</div></section>` : ''}
    </div>`;
  },

  async mount(el, _p, _q, ctx) {
    const [niches, home, stores] = await Promise.all([api.niches(), api.home(), api.stores()]);
    const map = new Map(niches.map((n) => [n.id, n]));
    // Todas las tiendas que publica ve.vexbiz.com: primero las que tienen catálogo, luego de la A a la Z
    const certified = stores.filter((s) => s.verified).sort(storeOrder);
    const cover = (s) => (/refrihogar/i.test(s.name) ? 'assets/img/prov-refrihogar.webp' : '');   // portada del Figma (248:322)

    async function rails() {
      const n = map.get(selected);
      const provs = certified.filter((s) => selected === 'todo' || !n || storeNiches(s).includes(n.name));
      el.querySelector('[data-providers]').innerHTML = provs.length ? provs.map((s) => provCard(s, cover(s))).join('')
        : `<div style="flex:1;margin-inline:calc(var(--app-gutter) * -1)">${empty('shield', `Sin proveedores certificados en ${esc(n ? n.name : '')}`, 'Estamos homologando tiendas de este nicho.')}</div>`;
      const items = selected === 'todo' || (n && n.count > 0) ? await railProducts(selected, home) : [];
      el.querySelector('[data-products]').innerHTML = items.length ? items.map(pcard).join('')
        : `<div style="flex:1;margin-inline:calc(var(--app-gutter) * -1)">${nicheEmpty(n)}</div>`;
      el.querySelector('[data-seeall]').setAttribute('href', '#/n/' + selected);
      reveal(el);
    }
    await rails();

    const tabs = el.querySelector('[data-niches]');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-niche]'); if (!b) return;
      selected = b.dataset.niche;
      tabs.querySelectorAll('[data-niche]').forEach((x) => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      b.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      rails();
    });
    tabs.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const all = [...tabs.querySelectorAll('[data-niche]')], i = all.indexOf(document.activeElement);
      if (i < 0) return; e.preventDefault();
      const nx = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]; nx.focus(); nx.click();
    });
    const sel = tabs.querySelector('[aria-selected="true"]'); if (sel) sel.scrollIntoView({ inline: 'nearest', block: 'nearest' });

    // Carrusel (guía del Home, tutorial A3): cambia cada 4000 ms con un deslizamiento de 500 ms
    // ease-in-out, los puntos cambian de ancho a la vez y el bucle no rebobina: al final hay una
    // copia del primer banner y desde ahí se salta sin animación al real.
    const track = el.querySelector('[data-banners]'), dots = [...el.querySelectorAll('[data-dots] .dot')], N = dots.length;
    const clone = track.children[0].cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('tabindex', '-1'); clone.inert = true;
    clone.querySelectorAll('img').forEach((i) => { i.removeAttribute('fetchpriority'); i.alt = ''; });
    track.appendChild(clone);
    let cur = 0, auto, raf = 0, gliding = false;
    const pos = (i) => track.children[i].offsetLeft - track.children[0].offsetLeft;
    const setDot = (i) => { cur = i; dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'))); };
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function glide(to, done) {
      cancelAnimationFrame(raf);
      const from = track.scrollLeft, dist = to - from;
      if (reduce || Math.abs(dist) < 1) { track.scrollLeft = to; if (done) done(); return; }
      gliding = true; track.style.scrollSnapType = 'none';
      const t0 = performance.now(), D = 500;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / D);
        track.scrollLeft = from + dist * easeInOut(t);
        if (t < 1) raf = requestAnimationFrame(step);
        else { track.style.scrollSnapType = ''; gliding = false; if (done) done(); }
      };
      raf = requestAnimationFrame(step);
    }
    const goB = (i) => {
      if (i >= N) { setDot(0); glide(pos(N), () => { track.scrollLeft = 0; }); return; }   // hacia la copia y salto invisible
      const k = (i + N) % N; setDot(k); glide(pos(k));
    };
    let settle;
    track.addEventListener('scroll', () => {
      if (gliding) return;
      const w = track.children[0].getBoundingClientRect().width + 12, i = Math.round(track.scrollLeft / w);
      if (i % N !== cur) setDot(i % N);
      clearTimeout(settle);
      settle = setTimeout(() => { if (!gliding && Math.round(track.scrollLeft / w) >= N) track.scrollLeft = 0; }, 140);   // deslizó a mano hasta la copia
    }, { passive: true });
    dots.forEach((d, k) => d.addEventListener('click', () => { goB(k); restart(); }));
    track.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault(); goB(e.key === 'ArrowRight' ? cur + 1 : cur - 1); restart();
    });
    let paused = false;
    const restart = () => { clearInterval(auto); if (!reduce && !paused) auto = setInterval(() => { if (!track.contains(document.activeElement) && document.visibilityState === 'visible') goB(cur + 1); }, 4000); };
    ['pointerdown', 'focusin', 'wheel'].forEach((ev) => track.addEventListener(ev, () => { cancelAnimationFrame(raf); if (gliding) { gliding = false; track.style.scrollSnapType = ''; } restart(); }, { passive: true }));
    restart();

    // Barra del buscador fija arriba al bajar (tutorial A5): toma fondo y sombra al despegarse
    const dock = el.querySelector('[data-dock]'), scr = el.closest('.screen') || el;
    const onScroll = () => dock.toggleAttribute('data-stuck', scr.scrollTop > 6);
    scr.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // Banda Academia / Técnicos
    const bands = el.querySelectorAll('[data-ticker] .band'); let bi = 0;
    const ticker = el.querySelector('[data-ticker]');
    let hold = false;
    ['pointerenter', 'focusin'].forEach((ev) => ticker.addEventListener(ev, () => { hold = true; }));
    ['pointerleave', 'focusout'].forEach((ev) => ticker.addEventListener(ev, () => { hold = false; }));
    const tick = reduce ? null : setInterval(() => {
      if (paused || hold) return;
      bi = (bi + 1) % bands.length;
      bands.forEach((b, k) => { const on = k === bi; b.setAttribute('aria-hidden', on ? 'false' : 'true'); b.tabIndex = on ? 0 : -1; });
    }, 4000);
    // Pausa visible para todo lo que se mueve solo (carrusel y banda): WCAG 2.2.2
    const pb = el.querySelector('[data-pause]');
    if (pb) pb.addEventListener('click', () => {
      paused = !paused;
      pb.setAttribute('aria-pressed', String(paused));
      pb.setAttribute('aria-label', paused ? 'Reanudar el movimiento de las promociones' : 'Pausar el movimiento de las promociones');
      pb.querySelector('use').setAttribute('href', '#i-' + (paused ? 'play' : 'pause'));
      restart();
    });
    ctx.onCleanup(() => { clearInterval(auto); clearInterval(tick); cancelAnimationFrame(raf); scr.removeEventListener('scroll', onScroll); });
  },
};
