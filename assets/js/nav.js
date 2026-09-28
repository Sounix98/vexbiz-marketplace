/* VEXBIZ · Acceso a la navegación desde las vistas (lo conecta main.js al arrancar). */
export const nav = { go: (h) => { location.hash = h; }, back: () => history.back(), rerender: () => {} };
