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

/* Aviso del modo demostración (app abierta fuera de vexbiz.com): las respuestas son simuladas */
const demoNote = (kind) => (auth.demo() ? `<div class="msg msg--info" role="note">${ico('help')}<span><b>Modo demostración.</b> Nada sale de este teléfono. ${kind === 'register'
  ? 'Cualquier dato válido crea la cuenta; un correo con «existe» muestra el aviso de correo ya registrado.'
  : 'Cualquier correo y contraseña entran. Un correo con «2fa» pide código (123456), uno con «bloqueada» muestra el bloqueo y la contraseña «error» falla.'}</span></div>` : '');
const safeNote = () => `<p class="auth__safe">${ico('lock')}<span>${auth.demo() ? 'En la app publicada, la conexión va directo a VEXBIZ y la app no guarda tu contraseña.' : 'La conexión va directo a VEXBIZ. La app no guarda tu contraseña.'}</span></p>`;
const toRegister = (label) => (auth.demo() ? `<a class="textlink" href="#/registro">${label}</a>` : ext(label, '/register'));
const toLogin = (label) => `<a class="textlink" href="#/login">${label}</a>`;

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
    if (auth.signedIn()) return topbar('Iniciar sesión') + `<div class="auth"><div class="msg msg--info">${ico('check-circle')}<span>Ya entraste como ${esc(auth.firstName())}.</span></div></div>`;
    return topbar('Iniciar sesión') + `<div class="auth"><div class="auth__card">
        <div class="auth__head"><span class="auth__badge">${ico('shield')}</span><div><h1 data-step-title>Iniciar sesión</h1><p data-step-sub>Ingresa con tu email y contraseña registrados en Venezuela.</p></div></div>
        ${demoNote('login')}
        <div data-step>${stepPassword()}</div>
        ${safeNote()}
      </div>
      <p class="auth__alt">¿Todavía no tienes cuenta en Venezuela? ${toRegister('Crear cuenta gratis')}</p></div>`;
  },
  mount(el, _p, q) {
    const next = safeNext(q && q.next);
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

/* Crear cuenta · copia de ve.vexbiz.com/register (28/09): Nombre, Apellido, Correo, Contraseña de
   acceso con sus tres requisitos en vivo, Código de invitación opcional, «Registrar mi cuenta».
   «Quiero» cambia la bienvenida con los tres textos que usa el sitio. En la app publicada el alta
   se hace en el sitio; en modo demostración la resuelve auth.register(). */
const INTENT = {
  buy: { ico: 'cart', label: 'Comprar', sub: 'Regístrate gratis para comprar, vender o trabajar como técnico en Venezuela.' },
  sell: { ico: 'store', label: 'Vender', sub: 'Crea tu cuenta y da de alta tu empresa en Venezuela. Sin cuota de entrada: pagas una comisión solo sobre lo que vendes.' },
  tech: { ico: 'tools', label: 'Técnico', sub: 'Crea tu cuenta y en un minuto tendrás tu perfil de técnico en Venezuela. Después te pedimos tu cédula, tus oficios y tu zona; VexBiz revisa y te avisa.' },
};
const RULES = [
  ['Mínimo 10 caracteres', (p) => p.length >= 10],
  ['Al menos una letra', (p) => /\p{L}/u.test(p)],
  ['Al menos un número', (p) => /\d/.test(p)],
];
const rulesHtml = (p) => RULES.map(([t, f]) => { const ok = f(p); return `<li class="${ok ? 'is-ok' : ''}">${ico(ok ? 'check-circle' : 'dot')}<span>${t}</span><span class="sr">${ok ? ': cumple' : ': falta'}</span></li>`; }).join('');

export const registro = {
  title: () => 'Crear cuenta',
  noBar: true,
  render(_p, q) {
    if (auth.signedIn()) return topbar('Crear cuenta') + `<div class="auth"><div class="msg msg--info">${ico('check-circle')}<span>Ya entraste como ${esc(auth.firstName())}.</span></div></div>`;
    const it = INTENT[(q && q.quiero) in INTENT ? q.quiero : 'buy'];
    const key = Object.keys(INTENT).find((k) => INTENT[k] === it);
    if (!auth.demo()) {
      return topbar('Crear cuenta') + `<div class="auth"><div class="auth__card">
        <div class="auth__head"><span class="auth__badge">${ico('user')}</span><div><h1>Crear cuenta</h1><p>${esc(it.sub)}</p></div></div>
        ${ext('<span class="vx-btn__label">Crear mi cuenta en ve.vexbiz.com</span>', '/register', 'vx-btn vx-btn--primary vx-btn--block vx-btn--lg')}
        </div><p class="auth__alt">¿Ya tienes una cuenta registrada? ${toLogin('Iniciar sesión')}</p></div>`;
    }
    return topbar('Crear cuenta') + `<div class="auth" data-reg><div class="auth__card">
      <div class="auth__head"><span class="auth__badge">${ico('user')}</span><div><h1>Crear cuenta</h1><p data-intent-sub>${esc(it.sub)}</p></div></div>
      ${demoNote('register')}
      <form novalidate data-form="register">
        <div class="msg msg--danger" role="alert" data-error hidden></div>
        <fieldset class="seg"><legend>Quiero</legend>${Object.entries(INTENT).map(([k, v]) =>
          `<label>${ico(v.ico)}${v.label}<input type="radio" name="intent" value="${k}"${k === key ? ' checked' : ''}></label>`).join('')}</fieldset>
        <div class="fld-row">
          <div class="fld"><label for="rg-name">Nombre *</label><div class="fld__box"><input id="rg-name" name="name" type="text" autocomplete="given-name" placeholder="Ej. Carlos"></div></div>
          <div class="fld"><label for="rg-last">Apellido *</label><div class="fld__box"><input id="rg-last" name="last" type="text" autocomplete="family-name" placeholder="Ej. Mendoza"></div></div>
        </div>
        <div class="fld"><label for="rg-email">Correo electrónico *</label><div class="fld__box">${ico('mail')}<input id="rg-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="tunombre@empresa.com"></div></div>
        <div class="fld"><label for="rg-pass">Contraseña de acceso *</label><div class="fld__box">${ico('lock')}<input id="rg-pass" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 10 caracteres" aria-describedby="rg-rules">
          <button class="iconbtn" type="button" data-peek aria-pressed="false" aria-label="Ver contraseña" aria-controls="rg-pass">${ico('eye')}</button></div>
          <ul class="rules" id="rg-rules" data-rules>${rulesHtml('')}</ul></div>
        <div class="fld"><label for="rg-ref">Código de invitación (opcional)</label><div class="fld__box"><input id="rg-ref" name="ref" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej. VX-8942"></div></div>
        <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Registrar mi cuenta</span></button>
        <p class="auth__legal">Al registrarte, confirmas que aceptas nuestros ${ext('Términos y Condiciones', '/terms')} y la ${ext('Política de Privacidad', '/privacy')}.</p>
      </form></div>
      <p class="auth__alt">¿Ya tienes una cuenta registrada? ${toLogin('Iniciar sesión')}</p></div>`;
  },
  mount(el, _p, q) {
    if (auth.signedIn()) { nav.go('#/cuenta', true); return; }
    const form = el.querySelector('[data-form="register"]');
    if (!form) return;
    const f = form.elements, err = form.querySelector('[data-error]'), btn = form.querySelector('[data-submit]');
    const show = (t) => { err.hidden = !t; err.innerHTML = t ? ico('alert') + `<span>${esc(t)}</span>` : ''; };
    const mark = (i, bad) => { const b = i.closest('.fld'); if (b) b.classList.toggle('fld--bad', !!bad); };
    form.addEventListener('input', (e) => {
      if (e.target.name === 'password') form.querySelector('[data-rules]').innerHTML = rulesHtml(e.target.value);
      if (e.target.name !== 'intent') { mark(e.target, false); show(''); }
    });
    form.addEventListener('change', (e) => { if (e.target.name === 'intent') el.querySelector('[data-intent-sub]').textContent = INTENT[e.target.value].sub; });
    const peek = form.querySelector('[data-peek]');
    peek.addEventListener('click', () => {
      const on = f.password.type === 'password';
      f.password.type = on ? 'text' : 'password';
      peek.setAttribute('aria-pressed', String(on)); peek.setAttribute('aria-label', on ? 'Ocultar contraseña' : 'Ver contraseña');
      peek.querySelector('use').setAttribute('href', '#i-' + (on ? 'eye-off' : 'eye'));
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (btn.dataset.state) return;
      const checks = [
        [f.name, !f.name.value.trim(), 'Escribe tu nombre.'],
        [f.last, !f.last.value.trim(), 'Escribe tu apellido.'],
        [f.email, !/^\S+@\S+\.\S+$/.test(f.email.value.trim()), 'Escribe un correo válido, por ejemplo tunombre@empresa.com.'],
        [f.password, !RULES.every(([, t]) => t(f.password.value)), 'La contraseña todavía no cumple los tres requisitos.'],
      ];
      const bad = checks.find((c) => c[1]);
      if (bad) { mark(bad[0], true); show(bad[2]); bad[0].focus(); return; }
      const label = btn.querySelector('.vx-btn__label'), idle = label.textContent;
      btn.dataset.state = 'sending'; btn.setAttribute('aria-busy', 'true'); label.textContent = 'Creando cuenta…'; show('');
      try {
        await auth.register({ first_name: f.name.value.trim(), last_name: f.last.value.trim(), email: f.email.value.trim(), password: f.password.value, invitation_code: f.ref.value.trim(), intent: form.querySelector('[name="intent"]:checked').value });
        const intent = form.querySelector('[name="intent"]:checked').value;
        el.querySelector('[data-reg]').outerHTML = `<div class="done done--auth"><span class="done__ico">${ico('check-circle')}</span><h1 tabindex="-1" data-focus>Cuenta creada</h1>
          <p>Bienvenido a VEXBIZ, ${esc(auth.firstName())}. ${intent === 'sell' ? 'El siguiente paso es dar de alta tu empresa.' : intent === 'tech' ? 'El siguiente paso es completar tu perfil de técnico.' : 'Ya puedes comprar en tiendas verificadas de Venezuela.'}</p></div>
          <div class="stack">${intent === 'buy'
            ? '<a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/inicio"><span class="vx-btn__label">Empezar a comprar</span></a><a class="vx-btn vx-btn--ghost vx-btn--block" href="#/cuenta"><span class="vx-btn__label">Ir a mi cuenta</span></a>'
            : '<a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/cuenta"><span class="vx-btn__label">Ir a mi cuenta</span></a><a class="vx-btn vx-btn--ghost vx-btn--block" href="#/inicio"><span class="vx-btn__label">Ver el marketplace</span></a>'}</div>`;
        const h = el.querySelector('[data-focus]'); if (h) h.focus({ preventScroll: true });
      } catch (x) {
        btn.removeAttribute('data-state'); btn.removeAttribute('aria-busy'); label.textContent = idle;
        show(x.detail || (x.status === 0 ? 'No hay conexión. Comprueba tu red e inténtalo otra vez.' : 'No pudimos crear la cuenta. Inténtalo otra vez.'));
        if (x.code === 'auth.email_taken') { mark(f.email, true); f.email.focus(); }
      }
    });
  },
};
