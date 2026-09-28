/* Compra · Carrito agrupado por tienda desde el inicio (decisión cerrada #8) → Entrega
   y pago por tienda (copy de S08) → Pedido recibido → Mis pedidos. El seguimiento del
   envío queda fuera de alcance (decisión #6): el pedido muestra su estado, no un mapa. */
import { esc, money, plural, shortDate } from '../format.js';
import { ico, img, empty, topbar, rootHead, link, btn, success, storeOf, toast, reduce } from '../ui.js';
import { cart, orders, prefs } from '../store.js';
import { nav } from '../nav.js';
import { CONFIG } from '../config.js';
import { auth, STATUS, STATUS_TONE } from '../auth.js';

const sname = (id) => (storeOf(id) || {}).name || 'Tienda';
const thumb = (l) => `<a class="row__thumb" href="#/p/${esc(l.id)}" aria-label="${esc(l.name)}">${l.img ? img(l.img, '') : ico('image')}</a>`;

export const carrito = {
  title: () => 'Carrito',
  render() {
    const g = cart.byStore(), keys = Object.keys(g), n = cart.count();
    if (!n) return rootHead('Carrito') + empty('cart', 'Tu carrito está vacío', 'Toca un producto y usa “Añadir al carrito”.', link('Explorar productos', '#/inicio'));
    return rootHead('Carrito', `${plural(n, 'producto', 'productos')} de ${plural(keys.length, 'tienda', 'tiendas')}`) +
      `<div style="display:flex;flex-direction:column;gap:12px">${keys.map((k) => {
        const sub = g[k].reduce((s, l) => s + l.qty * l.price, 0);
        return `<section class="group" aria-label="${esc(sname(k))}"><div class="group__head">${ico('shield')}${esc(sname(k))}</div>
          ${g[k].map((l) => `<div class="cartline">${thumb(l)}
            <div class="row__body"><span class="row__title">${esc(l.name)}</span><span class="row__sub">${money(l.price)} c/u · ${l.stock <= 5 ? (l.stock === 1 ? 'Última unidad' : `Últimas ${l.stock}`) : 'Disponible'}</span></div>
            <div class="cartline__ctrl"><div class="step" data-line="${esc(l.id)}"><button type="button" data-dec aria-label="Quitar uno"${l.qty <= 1 ? ' disabled' : ''}>${ico('minus', 'ico--xs')}</button><output aria-label="Cantidad">${l.qty}</output><button type="button" data-inc aria-label="Agregar uno"${l.qty >= l.stock ? ' disabled' : ''}>${ico('plus', 'ico--xs')}</button></div>
            <b class="row__end">${money(l.qty * l.price)}</b><button class="iconbtn" type="button" data-remove="${esc(l.id)}" aria-label="Quitar ${esc(l.name)} del carrito">${ico('trash', 'ico--sm')}</button></div></div>`).join('')}
          <div class="group__foot"><span>Subtotal de la tienda</span><b>${money(sub)}</b></div></section>`;
      }).join('')}
      <p class="note">${ico('info')}<span>El envío o retiro se elige por tienda en el siguiente paso. Cada tienda despacha por separado.</span></p>
      <div class="total"><div class="total__line total__line--big"><span>Total productos</span><b>${money(cart.total())}</b></div></div>
      <div style="padding:0 var(--app-gutter)"><a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/pago"><span class="vx-btn__label">Continuar a entrega y pago</span></a></div></div>`;
  },
  mount(el, _p, _q, ctx) {
    el.addEventListener('click', (e) => {
      const line = e.target.closest('[data-line]'), b = e.target.closest('[data-inc],[data-dec]'), rm = e.target.closest('[data-remove]');
      if (line && b) cart.set(line.dataset.line, cart.qty(line.dataset.line) + (b.hasAttribute('data-inc') ? 1 : -1));
      else if (rm) { cart.remove(rm.dataset.remove); toast('Quitado del carrito'); }
      else return;
      ctx.rerender();
    });
  },
};

export const pago = {
  title: () => 'Entrega y pago',
  cls: 'screen--action',
  noBar: true,
  render() {
    const g = cart.byStore(), keys = Object.keys(g);
    if (!keys.length) return topbar('Entrega y pago') + empty('cart', 'No hay nada que pagar', 'Tu carrito está vacío.', link('Explorar productos', '#/inicio'));
    const city = prefs.city();
    return topbar('Entrega y pago') +
      `<p class="label" style="padding-bottom:8px">Entrega por tienda</p><div style="display:flex;flex-direction:column;gap:12px">${keys.map((k) => {
        const items = g[k].reduce((a, l) => a + l.qty, 0), from = g[k][0].city || (storeOf(k) || {}).city || '';
        return `<fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin-inline:var(--app-gutter)"><legend class="sr">Entrega de ${esc(sname(k))}</legend>
          <div class="group__head">${ico('shield')}${esc(sname(k))} · ${plural(items, 'artículo', 'artículos')}</div>
          <label class="opt"><input type="radio" name="del-${esc(k)}" value="retiro" checked><span class="opt__body"><span class="opt__title">Retiro en la tienda</span><span class="opt__sub">${esc(from || 'En la tienda')} · coordinas el horario con la tienda</span></span><span class="opt__end">Gratis</span></label>
          <label class="opt"><input type="radio" name="del-${esc(k)}" value="envio"><span class="opt__body"><span class="opt__title">Envío a domicilio</span><span class="opt__sub">A ${esc(city)} · la tienda confirma el costo</span></span><span class="opt__end">Por confirmar</span></label></fieldset>`;
      }).join('')}</div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Cómo pagas</p>
      <fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin-inline:var(--app-gutter)"><legend class="sr">Método de pago</legend>
        <label class="opt"><input type="radio" name="pay" value="pagomovil" checked><span class="opt__body"><span class="opt__title">Pago móvil</span><span class="opt__sub">En bolívares a la tasa BCV del día. Subes el comprobante y la tienda lo verifica.</span></span></label>
        <label class="opt"><input type="radio" name="pay" value="divisas"><span class="opt__body"><span class="opt__title">Transferencia en divisas</span><span class="opt__sub">Cuenta en dólares de la tienda. Se verifica en 24 h hábiles.</span></span></label>
        <label class="opt" data-cash><input type="radio" name="pay" value="efectivo"><span class="opt__body"><span class="opt__title">Efectivo al retirar</span><span class="opt__sub">Solo si retiras todo en la tienda.</span></span></label>
      </fieldset>
      <p class="note" style="margin-top:16px">${ico('clock')}<span>Tu pedido queda reservado 8 horas mientras la tienda verifica el pago. Si no lo verifica en ese plazo, se libera la existencia y te avisamos.</span></p>
      <div class="total" style="margin-top:12px"><div class="total__line"><span>Productos</span><b>${money(cart.total())}</b></div><div class="total__line" data-ship><span>Envío</span><b>Gratis</b></div>
        <div class="total__line total__line--big"><span>Total</span><b>${money(cart.total())}</b></div></div>
      <p class="foot-note">Al confirmar aceptas los términos y la política de devoluciones de cada tienda.</p>
      <div class="actionbar"><div class="actionbar__sum"><span>Total</span><b>${money(cart.total())}</b></div>${btn('Confirmar pedido', 'vx-btn--primary', 'data-confirm')}</div>`;
  },
  mount(el) {
    const cash = el.querySelector('[data-cash]');
    if (!cash) return;
    const sync = () => {
      const anyShip = !!el.querySelector('input[value="envio"]:checked'), ci = cash.querySelector('input');
      ci.disabled = anyShip; cash.classList.toggle('opt--off', anyShip);
      if (anyShip && ci.checked) el.querySelector('input[value="pagomovil"]').checked = true;
      el.querySelector('[data-ship] b').textContent = anyShip ? 'Por confirmar' : 'Gratis';
    };
    el.addEventListener('change', sync); sync();
    el.querySelector('[data-confirm]').addEventListener('click', function () {
      if (this.dataset.state) return;
      this.dataset.state = 'sending';
      const delivery = Object.fromEntries([...el.querySelectorAll('input[name^="del-"]:checked')].map((i) => [i.name.slice(4), i.value]));
      const pay = (el.querySelector('input[name="pay"]:checked') || {}).value;
      setTimeout(() => success(this, 'Listo', () => { const code = orders.place({ pay, delivery, city: prefs.city() }); nav.go('#/pedido/' + code, true); }), reduce ? 300 : 1400);
    });
  },
};

export const pedido = {
  title: () => 'Pedido recibido',
  noBar: true,
  render(code) {
    return `<div class="done"><span class="done__ico">${ico('check-circle')}</span><h1 tabindex="-1" data-focus>Pedido recibido</h1><span class="done__code">#${esc(code)}</span>
      <p>Queda reservado 8 horas mientras cada tienda verifica tu pago. Te avisamos cuando lo confirmen.</p></div>
      <div class="stack">${link('Ver mis pedidos', '#/pedidos', 'vx-btn--primary vx-btn--block')}${link('Seguir comprando', '#/inicio', 'vx-btn--ghost vx-btn--block')}</div>`;
  },
};

const PAY = { pagomovil: 'Pago móvil', divisas: 'Transferencia en divisas', efectivo: 'Efectivo al retirar' };
const localRows = (list) => `<div class="list">${list.map((o) => `<div class="row" style="align-items:flex-start"><span class="row__thumb row__thumb--ico">${ico('box')}</span>
      <span class="row__body"><span class="row__title">Pedido #${esc(o.code)}</span>
      <span class="row__sub">${plural(o.items, 'artículo', 'artículos')} · ${plural(o.stores, 'tienda', 'tiendas')} · ${shortDate(o.date)}${o.pay ? ' · ' + PAY[o.pay] : ''}</span>
      <span class="vx-status vx-status--info" style="margin-top:6px">${ico('clock')}Esperando verificación del pago</span></span><span class="row__end">${money(o.total)}</span></div>`).join('')}</div>`;

/* Compra real de la cuenta (GET /account-api/v1/orders). El detalle y el pago siguen en el sitio. */
const realRow = (o) => {
  const left = auth.leftToPay(o), tone = STATUS_TONE[o.status] || 'neutral';
  return `<a class="row" style="align-items:flex-start" href="${CONFIG.siteUrl}/order/${encodeURIComponent(o.order_number)}" target="_blank" rel="noopener">
    <span class="row__thumb order-thumb${o.image ? '' : ' row__thumb--ico'}">${o.image ? img(o.image, '') : ico('box')}</span>
    <span class="row__body"><span class="row__title">Pedido #${esc(o.order_number)}</span>
      <span class="row__sub">${[o.store_name, o.item_count ? plural(o.item_count, 'artículo', 'artículos') : '', o.created_at ? shortDate(o.created_at) : ''].filter(Boolean).map(esc).join(' · ')}</span>
      <span class="vx-status vx-status--${tone}" style="margin-top:6px">${esc(STATUS[o.status] || o.status || 'En proceso')}</span>
      ${left > 0 ? `<span class="row__sub" style="margin-top:4px">Falta pagar <b>${money(left, o.currency || CONFIG.currency)}</b></span>` : ''}</span>
    <span class="row__end">${money(o.total || 0, o.currency || CONFIG.currency)}</span></a>`;
};

export const pedidos = {
  title: () => 'Mis pedidos',
  async render() {
    const list = orders.list();
    if (auth.signedIn()) {
      let block;
      try {
        const r = await auth.orders('', 10);
        block = r.items.length
          ? `<div class="list" data-real>${r.items.map(realRow).join('')}</div>${r.next ? `<div class="pager">${btn('Ver más pedidos', 'vx-btn--secondary', `data-more="${esc(r.next)}"`)}</div>` : ''}`
          : empty('box', 'Todavía no tienes compras registradas', 'Cuando compres con tu cuenta, aquí verás cada pedido con su estado.', link('Explorar productos', '#/inicio'));
      } catch (e) {
        block = `<div class="msg msg--danger" role="alert" style="margin:0 var(--app-gutter)">${ico('alert')}<span>No pudimos traer tus compras de VEXBIZ. Revisa tu conexión y vuelve a intentarlo.</span></div>`;
      }
      return topbar('Mis pedidos') + `<p class="sec__meta" style="padding-bottom:12px">Compras de ${esc(auth.firstName())} en VEXBIZ · toca un pedido para ver el detalle y pagar</p>${block}` +
        (list.length ? `<p class="label" style="padding:20px var(--app-gutter) 8px">Hechos en esta app</p>${localRows(list)}` : '');
    }
    if (!list.length) return topbar('Mis pedidos') + empty('box', 'Aún no tienes pedidos', 'Cuando compres, aquí verás cada pedido con su estado y el comprobante de pago.', link('Explorar productos', '#/inicio')) + signinHint();
    return topbar('Mis pedidos') + localRows(list) + signinHint();
  },
  mount(el) {
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-more]');
      if (!b || b.dataset.state) return;
      b.dataset.state = 'sending';
      try {
        const r = await auth.orders(b.dataset.more, 10);
        el.querySelector('[data-real]').insertAdjacentHTML('beforeend', r.items.map(realRow).join(''));
        if (r.next) { b.dataset.more = r.next; b.removeAttribute('data-state'); } else b.closest('.pager').remove();
      } catch (err) { b.removeAttribute('data-state'); toast('No pudimos traer más pedidos. Inténtalo otra vez.'); }
    });
  },
};

const signinHint = () => (auth.available() ? `<p class="auth__alt" style="padding:16px var(--app-gutter)">¿Compraste en ve.vexbiz.com? <a class="textlink" href="#/login?next=%23%2Fpedidos">Entra para ver esas compras</a></p>` : '');
