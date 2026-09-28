/* Ficha de producto · datos reales: imágenes, marca, categoría, atributos, descripción,
   compatibilidad y ofertas por tienda (products/{slug} + products/{slug}/offers).
   Las ofertas se ordenan por precio (decisión cerrada #7: se declara que el envío
   se confirma con la tienda, porque la API no expone el costo de envío). */
import { api } from '../api.js';
import { esc, money, plural } from '../format.js';
import { ico, img, pcard, favBtn, stock, canBuy, priceLabel, storeCard, storeOf, empty, topbar, btn, link, success, toast } from '../ui.js';
import { cart } from '../store.js';

export default {
  cls: 'screen--action',
  noBar: true,
  title: (_id, el) => (el && el.querySelector('.pd__name') ? el.querySelector('.pd__name').textContent : 'Producto'),
  async render(id) {
    const p = await api.product(id);
    if (!p) return topbar('Producto') + empty('alert', 'Este producto ya no está disponible', 'Puede que la tienda lo haya retirado del catálogo.', link('Ir a Inicio', '#/inicio'));
    const s = storeOf(p.store) || (await api.store(p.store)) || { id: p.store, name: 'Tienda', count: 0 };
    const niches = await api.niches();
    const niche = niches.find((n) => n.id === p.niche);
    const offers = (p.offers && p.offers.length ? p.offers : [{ store: p.store, price: p.price, stock: p.stock, av: p.availability, sku: p.sku, city: p.city }]);
    const imgs = (p.images || []).length ? p.images : [''];
    const [moreStore, related] = await Promise.all([api.search({ store: p.store, cursor: 0 }), api.related(p, 10)]);
    const others = moreStore.items.filter((x) => x.id !== p.id).slice(0, 10);
    const attrs = [['Marca', p.brand], ['Modelo', p.model], ['Categoría', p.category], ['Referencia', p.sku], ...(p.attrs || [])].filter(([, v]) => v && String(v).trim());
    const max = Math.max(1, Math.min(p.stock || 1, 99)), buy = canBuy(p);

    return topbar(esc(niche ? niche.name : 'Producto'), favBtn(p, 'iconbtn'), 'p') +
      `<div class="gallery" aria-label="Fotos del producto">${imgs.map((u, i) => `<div class="pd-media">${u ? img(u, i ? '' : p.name) : `<span class="pcard__noimg">${ico('image')}</span>`}</div>`).join('')}</div>
      <div class="pd">
        <div class="pd__badges">${stock(p, true)}${p.condition === 'new' ? '<span class="vx-status vx-status--neutral">Nuevo</span>' : ''}</div>
        ${p.brand ? `<span class="pd__brand" translate="no">${esc(p.brand)}</span>` : ''}
        <h1 class="pd__name" tabindex="-1" data-focus>${esc(p.name)}</h1>
        <div class="pd__price${p.price > 0 ? '' : ' pd__price--ask'}">${priceLabel(p)}<small>${p.price > 0 ? 'Precio en dólares (USD), con IVA. El envío se confirma con la tienda.' : 'La tienda publicó este producto sin precio. Pregúntale antes de comprar.'}</small></div>
        ${p.stock > 0 && p.stock <= 5 ? `<p class="pd__note">${p.stock === 1 ? 'Queda 1 unidad' : `Quedan ${p.stock} unidades`} en ${esc(s.name)}.</p>` : ''}
        ${storeCard(s, p.city ? 'Despacha desde ' + p.city : '')}
        <div class="facts">
          <div class="fact">${ico('truck')}<b>Envío o retiro</b><span>Lo eliges por tienda al pagar</span></div>
          <div class="fact">${ico('clock')}<b>Reserva 8 h</b><span>Mientras verifican tu pago</span></div>
          <div class="fact">${ico('doc')}<b>Factura</b><span>Fiscal con RIF o nota de entrega</span></div>
        </div>
      </div>
      ${offers.length > 1 ? `<section class="sec sec--pd" aria-labelledby="t-off"><div class="sec__head"><h2 class="sec__title" id="t-off">${plural(offers.length, 'tienda lo vende', 'tiendas lo venden')}</h2></div>
        <p class="sec__meta">Ordenadas por precio. El costo de envío lo confirma cada tienda.</p>
        <fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin:8px var(--app-gutter) 0;min-width:0"><legend class="sr">Elige a qué tienda comprar</legend>
        ${offers.map((o, i) => `<label class="offer"><input type="radio" name="offer" value="${i}" ${i === 0 ? 'checked' : ''}><span class="row__body"><span class="row__title">${esc((storeOf(o.store) || {}).name || o.storeName || 'Tienda')}</span><span class="row__sub">${esc([o.city, o.stock ? plural(o.stock, 'unidad', 'unidades') : ''].filter(Boolean).join(' · '))}</span></span><span class="offer__price">${o.price > 0 ? money(o.price) : 'Consultar'}</span></label>`).join('')}
        </fieldset></section>` : ''}
      ${attrs.length ? `<section class="sec sec--pd" aria-labelledby="t-spec"><div class="sec__head"><h2 class="sec__title" id="t-spec">Características</h2></div>
        <dl class="specs">${attrs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>` : ''}
      ${p.desc && p.desc.toLowerCase() !== p.raw.toLowerCase() ? `<section class="sec sec--pd" aria-labelledby="t-desc"><div class="sec__head"><h2 class="sec__title" id="t-desc">Descripción</h2></div><p class="desc">${esc(p.desc)}</p></section>` : ''}
      ${(p.compat || []).length ? `<section class="sec sec--pd" aria-labelledby="t-comp"><div class="sec__head"><h2 class="sec__title" id="t-comp">Compatible con</h2></div><div class="chips">${p.compat.map((c) => `<span class="chip">${esc(typeof c === 'string' ? c : c.name || JSON.stringify(c))}</span>`).join('')}</div></section>` : ''}
      ${others.length ? `<section class="sec sec--pd" aria-labelledby="t-more"><div class="sec__head"><h2 class="sec__title" id="t-more">Más de ${esc(s.name)}</h2><a class="seeall" href="#/s/${esc(s.id)}">Ver todo${ico('chev-r')}</a></div><div class="rail">${others.map(pcard).join('')}</div></section>` : ''}
      ${related.length ? `<section class="sec sec--pd" aria-labelledby="t-rel"><div class="sec__head"><h2 class="sec__title" id="t-rel">También en ${esc(p.category)}</h2></div><div class="rail">${related.map(pcard).join('')}</div></section>` : ''}
      <div class="actionbar">
        ${buy ? `<div class="step" data-step data-max="${max}"><button type="button" data-dec aria-label="Quitar uno" disabled>${ico('minus', 'ico--sm')}</button><output aria-live="polite" aria-label="Cantidad">1</output><button type="button" data-inc aria-label="Agregar uno"${max <= 1 ? ' disabled' : ''}>${ico('plus', 'ico--sm')}</button></div>
          ${btn(ico('cart', 'ico--sm') + 'Añadir al carrito', 'vx-btn--primary', 'data-add')}`
        : btn(p.price > 0 ? 'Agotado' : 'Consultar precio a la tienda', 'vx-btn--secondary', p.price > 0 ? 'disabled' : `data-toast="Escríbele a ${esc(s.name)} desde su tienda en ve.vexbiz.com para pedir el precio"`)}
      </div>`;
  },
  async mount(el, id) {
    const p = await api.product(id);
    if (!p) return;
    const offers = p.offers && p.offers.length ? p.offers : null;
    el.addEventListener('click', (e) => {
      const st = e.target.closest('[data-step]'), b = e.target.closest('[data-inc],[data-dec]');
      if (st && b) {
        const out = st.querySelector('output'), max = +st.dataset.max, v = Math.max(1, Math.min(max, +out.textContent + (b.hasAttribute('data-inc') ? 1 : -1)));
        out.textContent = v; st.querySelector('[data-dec]').disabled = v <= 1; st.querySelector('[data-inc]').disabled = v >= max;
      }
      const add = e.target.closest('[data-add]');
      if (add && !add.dataset.state) {
        const q = +el.querySelector('[data-step] output').textContent;
        const pick = el.querySelector('input[name="offer"]:checked');
        const offer = offers && pick ? offers[+pick.value] : null;
        const added = cart.add(p, q, offer);
        success(add, added ? 'Añadido' : 'Ya tienes el máximo');
        if (!added) toast(`No hay más unidades disponibles de este producto`);
      }
    });
  },
};
