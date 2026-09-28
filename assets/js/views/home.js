/* Inicio · Figma MARKETPLACE / PROTOTIPO / Home (292:800) + guía del Home 26/09.
   Orden: cabecera y ubicación → tabs de nicho → banners → banda Academia/Técnicos →
   proveedores certificados → explora por interés → marcas → confianza. */
import { api } from '../api.js';
import { CONFIG } from '../config.js';
import { esc, plural } from '../format.js';
import { ico, pcard, provCard, empty, btn, reveal, reduce, storeOf } from '../ui.js';
import { prefs } from '../store.js';

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
    return `<div class="home">
      <header class="hero">
        <div class="hero__bar">
          <a class="avatar" href="#/cuenta" aria-label="Mi cuenta">${ico('user')}</a>
          <a class="searchfield" href="#/buscar">${ico('search')}<span>Buscar en Vexbiz</span></a>
          <a class="iconbtn" href="#/pedidos" aria-label="Mis pedidos">${ico('bell')}</a>
        </div>
        <h1 class="sr" tabindex="-1" data-focus>Inicio</h1>
        <button class="loc" type="button" data-open="loc" aria-haspopup="dialog">${ico('pin', 'ico--sm')}<span>Enviar a <b data-city>${esc(prefs.city())}</b></span>${ico('chev-d', 'ico--xs')}</button>
        <div class="niches" role="tablist" aria-label="Nichos" data-niches>
          ${tabs.map((id) => `<button class="niche" role="tab" type="button" data-niche="${id}" aria-selected="${selected === id}" tabindex="${selected === id ? 0 : -1}">${id === 'todo' ? 'Todo' : esc(map.get(id).name)}</button>`).join('')}
        </div>
        <section class="banners" aria-roledescription="carrusel" aria-label="Promociones">
          <div class="banners__track" data-banners tabindex="0">
            <a class="banner" href="#/categorias"><img src="assets/img/banner-1.webp" width="404" height="132" alt="Encuentra todo en un solo lugar. Miles de productos, repuestos y suministros al mejor precio con garantía oficial."></a>
            <button class="banner" type="button" data-toast="Técnicos certificados: instalación, mantenimiento y reparación"><img src="assets/img/banner-2.webp" width="404" height="132" alt="Técnicos certificados listos para ayudarte." loading="lazy"></button>
            <button class="banner" type="button" data-toast="Vender en VEXBIZ: registro de proveedor"><img src="assets/img/banner-3.webp" width="404" height="132" alt="Vende tus suministros y expande tu negocio. Cobros protegidos con Escrow." loading="lazy"></button>
          </div>
          <div class="dots" data-dots>${[1, 2, 3].map((n) => `<button class="dot" type="button" aria-label="Promoción ${n} de 3"${n === 1 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
        </section>
      </header>
      <div class="band-ticker" data-ticker>
        <button class="band" type="button" data-toast="${esc((home.academy && home.academy.title) || 'Academia VEXBIZ')}"><span class="band__title">Academia</span><img class="band__logo" src="assets/img/logo-oscuro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Aprende con nosotros y descubre más</span>${ico('chev-r')}</button>
        <button class="band band--alt" type="button" aria-hidden="true" tabindex="-1" data-toast="Técnicos certificados con homologación verificada"><span class="band__title">Técnicos certificados</span><img class="band__logo" src="assets/img/logo-claro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Homologación verificada</span>${ico('chev-r')}</button>
      </div>
      <section class="sec" aria-labelledby="t-prov"><div class="sec__head"><h2 class="sec__title" id="t-prov">Proveedores certificados</h2><a class="seeall" href="#/tiendas">Ver todo</a></div><div class="rail" data-providers></div></section>
      <section class="sec" aria-labelledby="t-exp"><div class="sec__head"><h2 class="sec__title" id="t-exp">Explora por interés</h2><a class="seeall" href="#/n/todo" data-seeall>Ver todo</a></div><div class="rail" data-products></div></section>
      ${home.brands && home.brands.length ? `<section class="sec" aria-labelledby="t-brands"><div class="sec__head"><h2 class="sec__title" id="t-brands">Marcas en VEXBIZ</h2></div>
        <div class="rail">${home.brands.slice(0, 10).map((b) => `<a class="brand-chip reveal" href="#/buscar?q=${encodeURIComponent(b.name)}"><span class="brand-chip__mark" aria-hidden="true">${esc(b.name.slice(0, 2).toUpperCase())}</span><span class="brand-chip__name">${esc(b.name)}</span><span class="brand-chip__count">${plural(b.products, 'producto', 'productos')}</span></a>`).join('')}</div></section>` : ''}
      ${trust.length ? `<section class="sec" aria-label="Por qué comprar en VEXBIZ"><div class="trust-strip">${trust.map((t) => `<div class="trust-item">${ico(TRUST_ICON[t.icon] || 'check-circle')}<span><b>${esc(t.title)}</b><span>${esc(t.detail)}</span></span></div>`).join('')}</div></section>` : ''}
    </div>`;
  },

  async mount(el, _p, _q, ctx) {
    const [niches, home, stores] = await Promise.all([api.niches(), api.home(), api.stores()]);
    const map = new Map(niches.map((n) => [n.id, n]));
    const certified = stores.filter((s) => s.verified && s.count > 0).sort((a, b) => b.count - a.count);
    const cover = (s) => (/refrihogar/i.test(s.name) ? 'assets/img/prov-refrihogar.webp' : '');   // portada del Figma (248:322)

    async function rails() {
      const n = map.get(selected);
      const provs = certified.filter((s) => selected === 'todo' || !n || s.niche === n.name);
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

    // Carrusel: scroll-snap, puntos y autoplay que se pausa al tocar (y no corre con reduced-motion)
    const track = el.querySelector('[data-banners]'), dots = [...el.querySelectorAll('[data-dots] .dot')];
    let cur = 0, auto;
    const goB = (i) => { cur = (i + dots.length) % dots.length; track.scrollTo({ left: track.children[cur].offsetLeft - track.children[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); };
    track.addEventListener('scroll', () => {
      const w = track.children[0].getBoundingClientRect().width + 12, i = Math.round(track.scrollLeft / w);
      if (dots[i] && (i !== cur || !dots[i].hasAttribute('aria-current'))) { cur = i; dots.forEach((d, k) => (k === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'))); }
    }, { passive: true });
    dots.forEach((d, k) => d.addEventListener('click', () => { goB(k); restart(); }));
    const restart = () => { clearInterval(auto); if (!reduce) auto = setInterval(() => { if (!track.contains(document.activeElement) && document.visibilityState === 'visible') goB(cur + 1); }, 4500); };
    ['pointerdown', 'focusin', 'wheel'].forEach((ev) => track.addEventListener(ev, restart, { passive: true }));
    restart();
    // Banda Academia / Técnicos
    const bands = el.querySelectorAll('[data-ticker] .band'); let bi = 0;
    const tick = reduce ? null : setInterval(() => {
      bi = (bi + 1) % bands.length;
      bands.forEach((b, k) => { const on = k === bi; b.setAttribute('aria-hidden', on ? 'false' : 'true'); b.tabIndex = on ? 0 : -1; });
    }, 4000);
    ctx.onCleanup(() => { clearInterval(auto); clearInterval(tick); });
  },
};
