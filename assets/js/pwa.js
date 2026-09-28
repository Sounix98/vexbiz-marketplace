/* VEXBIZ · PWA: service worker, instalación, actualizaciones y estado de red. */
import { toast } from './ui.js';

let deferred = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
window.addEventListener('appinstalled', () => { deferred = null; toast('VEXBIZ quedó instalada en tu teléfono'); });

export const install = {
  available: () => !!deferred && !matchMedia('(display-mode: standalone)').matches,
  async prompt() {
    if (!deferred) return false;
    deferred.prompt();
    const { outcome } = await deferred.userChoice.catch(() => ({ outcome: 'dismissed' }));
    deferred = null;
    return outcome === 'accepted';
  },
};

export function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          const el = document.querySelector('[data-toast-out]');
          toast('Hay una versión nueva de VEXBIZ. Toca aquí para actualizar.');
          el.style.pointerEvents = 'auto';
          el.onclick = () => { w.postMessage('skip-waiting'); };
        }
      });
    });
  }).catch((e) => console.warn('[vexbiz] SW no registrado:', e.message));
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}

export function watchNetwork() {
  window.addEventListener('offline', () => toast('Sin conexión: ves el catálogo guardado en el teléfono'));
  window.addEventListener('online', () => toast('Conexión recuperada'));
}
