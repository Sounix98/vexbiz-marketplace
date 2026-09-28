# VEXBIZ · App móvil (PWA)

App móvil del marketplace VEXBIZ en HTML, CSS y JavaScript vanilla, sin frameworks ni paso de build. Se instala en el teléfono desde el navegador, abre sin conexión y usa el catálogo real de `ve.vexbiz.com`.

## Bases de diseño

- **Figma MARKETPLACE** · página PROTOTIPO (frame Home 292:800) y página COMPONENTES (botones, tab bar, tarjetas, tabs de nicho, banda Academia, carrusel, badges de stock).
- **Guía «Home VEXBIZ pieza por pieza»** (26/09): ajustes de sistema aplicados a los ocho componentes del Home.
- **Guía de diseño de portada y categoría** (19/09) y decisiones cerradas del proyecto: tarjeta de producto clara (B1), tab bar de 4 ítems con etiquetas siempre visibles (B2), carrito agrupado por tienda, stock de 3 niveles, ámbar solo para acción y marca.
- **Tokens** `--vx-*` de `assets/css/tokens.css` (copia del design system). Ningún color fuera de esa capa.

## Pantallas

Inicio · Categorías (11 nichos) · Nicho (portada, categorías, orden, paginación) · Ficha (fotos, precio, stock, tiendas que lo venden, características, descripción, más de la tienda, relacionados) · Tienda · Tiendas · Buscar (en vivo, recientes) · Carrito por tienda · Entrega y pago por tienda · Pedido recibido · Mis pedidos (compras reales de la cuenta + pedidos hechos en la app) · Favoritos · Cuenta (sesión, tema oscuro, ciudad, instalar, datos del catálogo) · Iniciar sesión (correo y contraseña, verificación en dos pasos).

## Datos

`assets/js/api.js` expone una sola interfaz (`niches`, `niche`, `search`, `product`, `stores`, `store`, `home`) con dos fuentes:

| Modo | Cuándo | Qué usa |
|---|---|---|
| snapshot | por defecto | `data/catalog.json`, capturado de `ve.vexbiz.com/marketplace-api/v1` (tenant `vepr`). Funciona offline. |
| live | la app se sirve desde `*.vexbiz.com`, o se abre con `?api=<url>` | la API en vivo. Si falla, vuelve sola al snapshot. |

La API no envía cabeceras CORS: desde otro dominio (GitHub Pages, localhost) el navegador bloquea las llamadas. Para usar datos en vivo fuera de vexbiz.com hay dos caminos: publicar la app en un subdominio de vexbiz.com, o desplegar `tools/cors-proxy.worker.js` (Cloudflare Worker de solo lectura) y abrir la app con `?api=https://<worker>/marketplace-api/v1`.

### Actualizar el snapshot

1. Abre `https://ve.vexbiz.com`, abre la consola del navegador y pega `tools/snapshot.js`. Descarga `catalog-raw.json`.
2. `python3 tools/build_catalog.py catalog-raw.json` genera `data/catalog.json` (nombres en tipo oración, marcas y tiendas con mayúsculas correctas, índice de búsqueda sin acentos).
3. Sube `VERSION` en `sw.js` para que los teléfonos instalados descarguen el catálogo nuevo.

## Abrir en la computadora

**Doble clic en `index.html`.** Abierta así (`file://`) la app carga la versión empaquetada: `assets/js/app.local.js` (todos los módulos en un script), `data/catalog.js` (el catálogo) y `assets/css/fonts.local.css` (fuentes incrustadas), porque Chrome y Edge bloquean módulos, `fetch` y fuentes en archivos locales. Carrito, favoritos y tema se guardan en el navegador. Sin conexión a internet no cargan las fotos de productos. Para verla como teléfono: F12 → ícono de dispositivo (Ctrl+Shift+M) → iPhone 12 Pro o 390 × 844.

Después de cambiar cualquier `.js` o el catálogo, regenerar la versión empaquetada:

```
python3 tools/build_local.py
```

Servida por http (`python3 -m http.server 8000` → `http://localhost:8000`) usa los módulos ES directamente y además se instala y funciona sin conexión (service worker).

Los cambios de cada entrega están en `CAMBIOS.md`. `acceso-demo.html` es una copia solo para visualización de Iniciar sesión y Crear cuenta, con todos sus estados y respuestas simuladas (se genera desde `tools/acceso-demo.template.html`).

## Cuenta real (iniciar sesión)

`assets/js/auth.js` usa el mismo contrato que ve.vexbiz.com (leído de sus bundles el 28/09): `POST /auth/login` → si la cuenta tiene verificación en dos pasos, `POST /auth/2fa/verify` con el ticket y el código; después `GET /auth/me` (nombre, correo, foto). La sesión se renueva sola con `POST /auth/refresh` 60 s antes de que venza el token, y al abrir la app se recupera si el sitio dejó la cookie `vexbiz_user_activa=1`. «Salir» llama a `POST /auth/logout`. Mis pedidos lee `GET /account-api/v1/orders` (paginado por cursor) y cada pedido abre su detalle y pago en ve.vexbiz.com. Todas las llamadas llevan `X-Tenant-Code: vepr`.

- El token de acceso vive solo en memoria; la app nunca guarda la contraseña ni el token en el teléfono. El service worker no cachea nada de `/auth`, `/account-api` ni pedidos con `Authorization`.
- **Modo demostración:** fuera de vexbiz.com (doble clic, GitHub Pages, local) `auth.js` responde con datos simulados (`demoCall`): Iniciar sesión, verificación en dos pasos, Crear cuenta (`#/registro`), saludo, pedidos de ejemplo y Salir funcionan igual, sin salir del teléfono. La sesión de demostración vive en `sessionStorage` (solo nombre y correo, nunca la contraseña).
- **La cuenta real solo funciona servida desde un dominio de vexbiz.com** (por ejemplo `app.vexbiz.com` o `ve.vexbiz.com/app/`): la renovación depende de la cookie httpOnly del dominio y la API no acepta llamadas de otros orígenes. Allí Crear cuenta lleva a ve.vexbiz.com/register (el endpoint de alta no está confirmado).
- Para probar detrás de un proxy del mismo sitio: abrir con `?auth=<origen>` (vacío = mismo origen). Los textos de error son los del sitio (correo o contraseña incorrectos, cuenta bloqueada, contraseña sin crear, cuenta sin acceso a Venezuela, sin conexión).

## Publicar

Es un sitio estático: GitHub Pages (rama `main`, carpeta raíz, con `.nojekyll`), Cloudflare Pages o cualquier hosting. Las rutas usan hash (`#/p/<id>`), así que no hace falta reescribir URLs en el servidor.

## Estructura

```
index.html              casco: sprite de íconos, tab bar, hoja inferior, aviso
manifest.webmanifest    instalación (nombre, íconos, accesos directos)
sw.js                   offline: casco, catálogo, fotos, API
assets/css/             tokens.css · fonts.css · app.css
assets/js/              config · api · auth · store · router · ui · format · pwa · nav · main
assets/js/views/        home · catalog · product · checkout · account · login
data/catalog.json       snapshot normalizado
tools/                  build_local.py · snapshot.js · build_catalog.py · cors-proxy.worker.js
```

## Fuera de alcance en esta versión

Registro y recuperación de contraseña (abren ve.vexbiz.com), pago dentro de la app (los pedidos hechos aquí quedan en el teléfono; los de la cuenta se pagan en el sitio), seguimiento del envío, mensajería con la tienda y servicios especializados (Academia, Técnicos, Auxilio vial, Seguros), que abren un aviso.
