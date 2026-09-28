# VEXBIZ · App móvil (PWA)

App móvil del marketplace VEXBIZ en HTML, CSS y JavaScript vanilla, sin frameworks ni paso de build. Se instala en el teléfono desde el navegador, abre sin conexión y usa el catálogo real de `ve.vexbiz.com`.

## Bases de diseño

- **Figma MARKETPLACE** · página PROTOTIPO (frame Home 292:800) y página COMPONENTES (botones, tab bar, tarjetas, tabs de nicho, banda Academia, carrusel, badges de stock).
- **Guía «Home VEXBIZ pieza por pieza»** (26/09): ajustes de sistema aplicados a los ocho componentes del Home.
- **Guía de diseño de portada y categoría** (19/09) y decisiones cerradas del proyecto: tarjeta de producto clara (B1), tab bar de 4 ítems con etiquetas siempre visibles (B2), carrito agrupado por tienda, stock de 3 niveles, ámbar solo para acción y marca.
- **Tokens** `--vx-*` de `assets/css/tokens.css` (copia del design system). Ningún color fuera de esa capa.

## Pantallas

Inicio · Categorías (11 nichos) · Nicho (portada, categorías, orden, paginación) · Ficha (fotos, precio, stock, tiendas que lo venden, características, descripción, más de la tienda, relacionados) · Tienda · Tiendas · Buscar (en vivo, recientes) · Carrito por tienda · Entrega y pago por tienda · Pedido recibido · Mis pedidos · Favoritos · Cuenta (tema oscuro, ciudad, instalar, datos del catálogo).

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

## Correr en local

Los módulos ES y el service worker necesitan http, no `file://`:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000`.

## Publicar

Es un sitio estático: GitHub Pages (rama `main`, carpeta raíz, con `.nojekyll`), Cloudflare Pages o cualquier hosting. Las rutas usan hash (`#/p/<id>`), así que no hace falta reescribir URLs en el servidor.

## Estructura

```
index.html              casco: sprite de íconos, tab bar, hoja inferior, aviso
manifest.webmanifest    instalación (nombre, íconos, accesos directos)
sw.js                   offline: casco, catálogo, fotos, API
assets/css/             tokens.css · fonts.css · app.css
assets/js/              config · api · store · router · ui · format · pwa · nav · main
assets/js/views/        home · catalog · product · checkout · account
data/catalog.json       snapshot normalizado
tools/                  snapshot.js · build_catalog.py · cors-proxy.worker.js
```

## Fuera de alcance en esta versión

Inicio de sesión con la cuenta de ve.vexbiz.com, pago real (el pedido queda guardado en el teléfono), seguimiento del envío, mensajería con la tienda y servicios especializados (Academia, Técnicos, Auxilio vial, Seguros), que abren un aviso.
