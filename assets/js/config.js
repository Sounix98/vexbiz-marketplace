/* VEXBIZ · Configuración de la app.
   Dos fuentes de datos con la misma forma:
   - snapshot: data/catalog.json, capturado de ve.vexbiz.com con tools/snapshot.js (funciona offline).
   - live: marketplace-api/v1 en vivo. La API no envía cabeceras CORS, así que solo responde
     cuando la app se sirve desde un dominio de vexbiz.com o detrás de un proxy propio
     (ver tools/cors-proxy.worker.js). Si falla, la app vuelve sola al snapshot. */

const onVexbiz = /(^|\.)vexbiz\.com$/i.test(location.hostname);
const params = new URLSearchParams(location.search);

export const CONFIG = {
  tenant: 'vepr',                                   // código de país que resuelve ve.vexbiz.com
  apiBase: params.get('api') || (onVexbiz ? '/marketplace-api/v1' : ''),
  snapshotUrl: 'data/catalog.json',
  pageSize: 24,
  currency: 'USD',
  locale: 'es-VE',
  storageKey: 'vx-app-v1',
  themeKey: 'vx-theme',
  cities: ['Ciudad Guayana', 'Puerto Ordaz', 'San Félix', 'Ciudad Bolívar', 'Upata', 'Caracas'],
  // Orden de las pestañas de nicho en Inicio: primero los que tienen catálogo (Figma 395:1984)
  homeNiches: ['ref', 'aut', 'fer', 'ind', 'mot', 'res', 'gps', 'far', 'sol', 'sup', 'tlc'],
};
