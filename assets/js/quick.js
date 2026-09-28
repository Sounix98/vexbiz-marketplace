/* VEXBIZ · Vista rápida como hoja inferior (guía del Home, tutorial A6).
   Se abre desde el botón de precio de cada tarjeta: sube desde abajo en 500 ms con la curva de
   entrada y fondo al 56 %, y se cierra con la misma animación al revés (openSheet/closeSheet).
   «Añadir al carrito» pasa al estado de éxito 1200 ms y luego cierra la hoja. */
import { api } from './api.js';
import { esc } from './format.js';
import { ico, img, stock, canBuy, priceLabel, storeName, favBtn, btn, success, toast, openSheet, closeSheet } from './ui.js';
import { cart } from './store.js';
import { nav } from './nav.js';

export async function quickView(id, from) {
  const p = await api.product(id);
  if (!p) { nav.go('#/p/' + encodeURIComponent(id)); return; }
  const buy = canBuy(p), max = Math.max(1, Math.min(Number(p.stock) || 1, 99));
  const sheet = openSheet(`
    <div class="sheet__top"><h2 class="sheet__title" id="sheet-t">Vista rápida</h2>
      <span class="quick__acts">${favBtn(p, 'iconbtn')}<button class="iconbtn" type="button" data-close aria-label="Cerrar">${ico('x')}</button></span></div>
    <div class="quick">
      <span class="quick__media">${p.images && p.images[0] ? img(p.images[0], p.name, '', 320) : ico('image')}</span>
      <div class="quick__body">
        <div class="pd__badges">${stock(p, true)}</div>
        ${p.brand ? `<span class="pd__brand" translate="no">${esc(p.brand)}</span>` : ''}
        <p class="quick__name">${esc(p.name)}</p>
        <p class="quick__price">${priceLabel(p)}</p>
        <p class="quick__store">${ico('shield', 'ico--xs')}Vende <b translate="no">${esc(storeName(p))}</b></p>
      </div>
    </div>
    <div class="quick__buy">
      ${buy ? `<div class="step" data-qstep data-max="${max}"><button type="button" data-dec aria-label="Quitar uno" disabled>${ico('minus', 'ico--sm')}</button><output aria-label="Cantidad">1</output><button type="button" data-inc aria-label="Agregar uno"${max <= 1 ? ' disabled' : ''}>${ico('plus', 'ico--sm')}</button></div>
        ${btn(ico('cart', 'ico--sm') + 'Añadir al carrito', 'vx-btn--primary', 'data-qadd data-autofocus')}`
      : btn(p.price > 0 ? 'Agotado' : 'Consultar precio a la tienda', 'vx-btn--secondary', p.price > 0 ? 'disabled' : `data-toast="Escríbele a ${esc(storeName(p))} desde su tienda en ve.vexbiz.com para pedir el precio"`)}
    </div>
    <a class="vx-btn vx-btn--ghost vx-btn--block" href="#/p/${esc(p.id)}" data-qfull><span class="vx-btn__label">Ver ficha completa${ico('chev-r', 'ico--sm')}</span></a>`, from);
  sheet.setAttribute('aria-labelledby', 'sheet-t');
  sheet.onclick = (e) => {
    const st = e.target.closest('[data-qstep]'), b = e.target.closest('[data-inc],[data-dec]');
    if (st && b) {
      const out = st.querySelector('output'), m = +st.dataset.max, v = Math.max(1, Math.min(m, +out.textContent + (b.hasAttribute('data-inc') ? 1 : -1)));
      out.textContent = v; st.querySelector('[data-dec]').disabled = v <= 1; st.querySelector('[data-inc]').disabled = v >= m;
      return;
    }
    const add = e.target.closest('[data-qadd]');
    if (add && !add.dataset.state) {
      const q = +sheet.querySelector('[data-qstep] output').textContent;
      const added = cart.add(p, q);
      if (!added) { toast('Ya tienes en el carrito todas las unidades disponibles'); return; }
      success(add, 'Añadido al carrito', () => closeSheet());
      return;
    }
    if (e.target.closest('[data-qfull]')) closeSheet();
  };
}
