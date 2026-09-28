/* Iniciar sesión · réplica móvil del formulario de ve.vexbiz.com/login (grabación del 28/09):
   correo, contraseña con Ver/Ocultar, «¿Olvidaste tu contraseña?», «Entrar a mi cuenta»,
   segundo paso con código si la cuenta tiene verificación en dos pasos, y «Crear cuenta gratis».
   Textos de error = los mismos del sitio (auth.message). */
import { esc } from '../format.js';
import { ico, topbar, success } from '../ui.js';
import { CONFIG } from '../config.js';
import { auth } from '../auth.js';
import { nav } from '../nav.js';

const site = (path) => CONFIG.siteUrl + path;
const ext = (label, path, cls = 'textlink') => `<a class="${cls}" href="${site(path)}" target="_blank" rel="noopener">${label}</a>`;
const safeNext = (n) => (n && /^#\/[a-z]/.test(n) && !n.startsWith('#/login') ? n : '#/cuenta');

function unavailable() {
  return topbar('Iniciar sesión') + `<div class="auth"><div class="auth__card">
      <div class="auth__head"><span class="auth__badge">${ico('lock')}</span><div><h1>Tu cuenta VEXBIZ</h1><p>Compras, pedidos y servicios.</p></div></div>
      <div class="msg msg--info">${ico('globe')}<span>Esta copia de la app no está alojada en vexbiz.com, así que no puede abrir tu sesión. Cuando la app se publique en el dominio de VEXBIZ, entras aquí con tu mismo correo y contraseña.</span></div>
      <p class="auth__alt" style="text-align:left">Mientras tanto, tus pedidos y favoritos se guardan en este teléfono.</p>
      ${ext('<span class="vx-btn__label">Entrar en ve.vexbiz.com</span>', '/login', 'vx-btn vx-btn--primary vx-btn--block')}
    </div>
    <p class="auth__alt">¿Todavía no tienes cuenta en Venezuela? ${ext('Crear cuenta gratis', '/register')}</p></div>`;
}

const stepPassword = () => `
  <form novalidate data-form="password">
    <div class="msg msg--danger" role="alert" data-error hidden></div>
    <div class="msg msg--info" role="status" data-notice hidden></div>
    <div class="fld" data-fld="email"><label for="lg-email">Correo electrónico</label>
      <div class="fld__box">${ico('mail')}<input id="lg-email" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nombre@ejemplo.com" required></div></div>
    <div class="fld" data-fld="password"><div class="fld__top"><label for="lg-pass">Contraseña</label>${ext('¿Olvidaste tu contraseña?', '/recover')}</div>
      <div class="fld__box">${ico('lock')}<input id="lg-pass" name="password" type="password" autocomplete="current-password" required>
        <button class="iconbtn" type="button" data-peek aria-pressed="false" aria-label="Ver contraseña" aria-controls="lg-pass">${ico('eye')}</button></div></div>
    <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Entrar a mi cuenta</span></button>
  </form>`;

const stepCode = () => `
  <form novalidate data-form="code">
    <div class="msg msg--danger" role="alert" data-error hidden></div>
    <div class="fld fld__code" data-fld="code"><label for="lg-code">Código de verificación</label>
      <div class="fld__box">${ico('shield')}<input id="lg-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" autocapitalize="none" spellcheck="false" required></div></div>
    <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Validar y entrar</span></button>
    <button class="vx-btn vx-btn--ghost vx-btn--block" type="button" data-restart><span class="vx-btn__label">Usar otra cuenta</span></button>
  </form>`;

export const login = {
  title: () => 'Iniciar sesión',
  noBar: true,
  render(_p, q) {
    if (!auth.available()) return unavailable();
    if (auth.signedIn()) return topbar('Iniciar sesión') + `<div class="auth"><div class="msg msg--info">${ico('check-circle')}<span>Ya entraste como ${esc(auth.firstName())}.</span></div></div>`;
    return topbar('Iniciar sesión') + `<div class="auth"><div class="auth__card">
        <div class="auth__head"><span class="auth__badge">${ico('shield')}</span><div><h1 data-step-title>Iniciar sesión</h1><p data-step-sub>Ingresa con tu email y contraseña registrados en Venezuela.</p></div></div>
        <div data-step>${stepPassword()}</div>
        <p class="auth__safe">${ico('lock')}<span>La conexión va directo a VEXBIZ. La app no guarda tu contraseña.</span></p>
      </div>
      <p class="auth__alt">¿Todavía no tienes cuenta en Venezuela? ${ext('Crear cuenta gratis', '/register')}</p></div>`;
  },
  mount(el, _p, q) {
    const next = safeNext(q && q.next);
    if (!auth.available()) return;
    if (auth.signedIn()) { nav.go(next, true); return; }
    const host = el.querySelector('[data-step]');
    let ticket = '';

    const show = (form, { error = '', notice = '' }) => {
      const e = form.querySelector('[data-error]'), n = form.querySelector('[data-notice]');
      e.hidden = !error; e.innerHTML = error ? ico('alert') + `<span>${esc(error)}</span>` : '';
      if (n) { n.hidden = !notice; n.innerHTML = notice ? ico('help') + `<span>${esc(notice)}</span>` : ''; }
    };
    const busy = (btn, on, text) => {
      const label = btn.querySelector('.vx-btn__label');
      if (on) { btn.dataset.idle = label.textContent; btn.dataset.state = 'sending'; btn.setAttribute('aria-busy', 'true'); label.textContent = text; }
      else { btn.removeAttribute('data-state'); btn.removeAttribute('aria-busy'); label.textContent = btn.dataset.idle || label.textContent; }
    };
    const finish = (btn) => { busy(btn, false); success(btn, 'Listo', () => nav.go(next, true)); };

    function bindPassword() {
      const form = host.querySelector('form'), email = form.elements.email, pass = form.elements.password, btn = form.querySelector('[data-submit]');
      const peek = form.querySelector('[data-peek]');
      peek.addEventListener('click', () => {
        const on = pass.type === 'password';
        pass.type = on ? 'text' : 'password';
        peek.setAttribute('aria-pressed', String(on));
        peek.setAttribute('aria-label', on ? 'Ocultar contraseña' : 'Ver contraseña');
        peek.querySelector('use').setAttribute('href', '#i-' + (on ? 'eye-off' : 'eye'));
      });
      [email, pass].forEach((i) => i.addEventListener('input', () => { i.closest('.fld').classList.remove('fld--bad'); show(form, {}); }));
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (btn.dataset.state) return;
        const e = email.value.trim(), p = pass.value;
        const bad = !/^\S+@\S+\.\S+$/.test(e) ? email : !p ? pass : null;
        if (bad) {
          bad.closest('.fld').classList.add('fld--bad');
          show(form, { error: bad === email ? 'Escribe el correo con el que te registraste.' : 'Escribe tu contraseña.' });
          bad.focus(); return;
        }
        busy(btn, true, 'Entrando…'); show(form, {});
        try {
          const r = await auth.login(e, p);
          if (r.twoFactor) { ticket = r.ticket; toCode(); return; }
          finish(btn);
        } catch (err) {
          busy(btn, false);
          const m = auth.message(err); show(form, m);
          if (m.error && err.code === 'auth.invalid_credentials') { pass.value = ''; pass.focus(); }
        }
      });
      setTimeout(() => email.focus({ preventScroll: true }), 60);
    }

    function toCode() {
      el.querySelector('[data-step-title]').textContent = 'Verificación en dos pasos';
      el.querySelector('[data-step-sub]').textContent = 'Escribe el código de tu app de autenticación para terminar de entrar.';
      host.innerHTML = stepCode();
      const form = host.querySelector('form'), code = form.elements.code, btn = form.querySelector('[data-submit]');
      code.addEventListener('input', () => { code.closest('.fld').classList.remove('fld--bad'); show(form, {}); });
      form.querySelector('[data-restart]').addEventListener('click', toPassword);
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        if (btn.dataset.state) return;
        const c = code.value.trim();
        if (!c) { code.closest('.fld').classList.add('fld--bad'); show(form, { error: 'Escribe el código.' }); code.focus(); return; }
        busy(btn, true, 'Comprobando código…'); show(form, {});
        try { await auth.verify(ticket, c); finish(btn); }
        catch (err) { busy(btn, false); code.value = ''; code.focus(); show(form, { error: err.status === 0 ? 'No hay conexión. Comprueba tu red e inténtalo otra vez.' : err.detail || 'Ese código no es válido.' }); }
      });
      setTimeout(() => code.focus({ preventScroll: true }), 60);
    }

    function toPassword() {
      ticket = '';
      el.querySelector('[data-step-title]').textContent = 'Iniciar sesión';
      el.querySelector('[data-step-sub]').textContent = 'Ingresa con tu email y contraseña registrados en Venezuela.';
      host.innerHTML = stepPassword(); bindPassword();
    }

    bindPassword();
  },
};
