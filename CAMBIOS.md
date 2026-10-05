# VEXBIZ APP · Cambios por entrega

Cada entrega se escribe en esta carpeta. Para ver un cambio: doble clic en `index.html` y la ruta indicada (se escribe después de `index.html` en la barra de direcciones, por ejemplo `index.html#/login`).












## 1.9.10 · 05/10/2026

- Ficha de producto: más aire entre el precio y la nota "Precio en dólares (USD), con IVA…" (8 px) y la nota con interlineado más cómodo. Prueba: pruebas/v1.9.10-precio-ficha.png (arriba antes, abajo después).
## 1.9.9 · 05/10/2026

- Inicio: nuevo orden después del carril de nichos: Ofertas relámpago primero, luego Proveedores certificados y luego Explora por interés. Desde ahí sigue igual (recorrido por los 11 nichos, marcas y confianza). Prueba: pruebas/v1.9.9-orden.png.
## 1.9.8 · 05/10/2026

- Cuenta, tema oscuro: los círculos de Pedidos, Favoritos, Direcciones y Soporte pasan a #FFE396 y el ícono toma el color del fondo (contraste 13,3:1). El tema claro sigue en navy. Prueba: pruebas/v1.9.8-cuenta.png.
## 1.9.7 · 30/09/2026

- Entrega y pago: se quitó "Efectivo al retirar"; "Transferencia en divisas" pasa a "Criptomonedas · USDT" (envías USDT a la billetera de la tienda y subes el comprobante); se retiró el aviso de las 8 horas de reserva, también en la pantalla de Pedido recibido. Prueba: pruebas/v1.9.7-pago.png.
- Incluye todos los cambios gráficos hasta la 1.9.6 (precio sin píldora, accesos de Cuenta en navy, recorrido por nichos, ofertas relámpago, cupón).
## 1.9.6 · 30/09/2026

- Cuenta: los círculos de Pedidos, Favoritos, Direcciones y Soporte pasan a azul navy y el ícono toma el color del fondo de la pantalla (contraste 15,5:1). En tema oscuro el ícono va claro para que se siga leyendo. Prueba: pruebas/v1.9.6-cuenta.png.
## 1.9.5 · 30/09/2026

- Precio de la tarjeta de producto otro 10 % más pequeño (de 20 px en teléfono a 31 px en pantalla ancha).
## 1.9.4 · 30/09/2026

- Precio de la tarjeta de producto un 10 % más pequeño que en la 1.9.3 (de 22 px en teléfono a 34 px en pantalla ancha).
## 1.9.3 · 30/09/2026

- Precio de la tarjeta de producto un 5 % más pequeño.
## 1.9.2 · 30/09/2026

- Tarjeta de producto: el precio ya no va dentro de la píldora oscura. Queda como texto grande (del alto que tenía la píldora) y sigue abriendo la vista rápida al tocarlo. "Precio a consultar" queda en tamaño pequeño. Prueba: pruebas/v1.9.2-precio.png (antes y después, oscuro y claro).
## 1.9.1 · 30/09/2026

- Corregido: una foto de producto muy alta estiraba todas las tarjetas del carril (quedaba un hueco grande entre la marca y el precio, se vio en Ofertas relámpago). Ahora la foto se ajusta dentro de su cuadro 1:1 y la tarjeta mide lo mismo con cualquier foto. Mismo arreglo en la ficha de producto y en la vista rápida.
## 1.9.0 · 30/09/2026

- Tarjeta de proveedor: el nicho ("Refrigeración", etc.) ya no va en burbuja, queda como texto.
- Inicio con recorrido por los 11 nichos: al bajar se carga un bloque por nicho (ícono, "Nicho N de 11", productos y tiendas, categorías principales y el botón "Explorar <nicho>"). Los nichos sin catálogo muestran sus tiendas y "Avísame cuando haya". Termina con "Recorriste los 11 nichos" y enlaces a Categorías y a Vender.
- Cada 2 nichos se intercala un bloque del sitio en vivo: Técnicos certificados, Auxilio vial 24/7, Academia, Comunidad técnica y Seguros y pólizas (abren ve.vexbiz.com).
- Ofertas relámpago reales de ve.vexbiz.com (6 productos, -10%, precio anterior tachado y cuenta regresiva hasta el 06/10).
- Carrito: campo "¿Tienes un código de cupón?" como en el sitio. Los cupones los crea cada tienda y se validan al crear la compra; la app guarda el código y lo muestra en Entrega y pago.
- Catálogo actualizado al 30/09 (373 productos, 23 tiendas, Farmacias con productos). Ícono nuevo "tag" en el sprite.

## 1.8.0 · 29/09 · Dos ideas del tablero de Pinterest «UI DESIGN WZ68»

Revisé 50 de los 197 pines; los demás piden iniciar sesión en Pinterest. Se programaron 4 propuestas con pruebas de antes y después, y se aplicaron las 2 elegidas.

- **Tarjeta de proveedor** (pines 17, 45, 49 y 50):
  - Más alta, con la imagen o el logo arriba, un marco interior fino y el nombre sobre la imagen.
  - Debajo, el nicho y los productos, más un botón blanco «Ver tienda» a todo el ancho. Toda la tarjeta sigue abriendo la tienda.
- **Cuenta** (pin 25): Pedidos, Favoritos, Direcciones y Soporte pasan a ser 4 accesos rápidos circulares debajo del perfil, en lugar de la lista «Mis compras».
  - Pedidos y Favoritos muestran su número cuando hay algo.
  - Direcciones abre la hoja de ciudad y Soporte da el mismo aviso de antes.
- **No aplicadas** (quedan en la rama `propuestas-pinterest`):
  - P1: botón redondo «Añadir» en cada tarjeta de producto.
  - P2: usar los íconos de nicho como filtro en lugar de las pestañas de texto.

## 1.7.0 · 29/09 · Banners del hero en el azul del Figma

- Los tres banners del carrusel del Inicio pasan al degradado índigo de la maqueta de Figma (nodo 321:962). El azul se midió de los banners exportados del Figma, de #121B3C a #221A8F.
- Cada banner lleva su propio tono del mismo azul, para distinguirlos al deslizar:
  - Marketplace: el tono base del Figma.
  - Técnicos: más oscuro.
  - Vende en VEXBIZ: más claro.
- El título va en dos partes, como en el Figma: la primera en blanco y la segunda en ámbar («en un solo lugar», «listos para ayudarte», «y expande tu negocio»). El ámbar se usa como color de marca, no de estado.
- La foto del producto va en un recuadro blanco con sombra, y un brillo índigo suave queda detrás, arriba a la derecha.
- Contraste medido en el tono más claro: blanco 9,8:1, texto secundario 7,0:1 y ámbar 7,1:1, todos AA. Los banners son iguales en tema claro y oscuro.
- Tokens nuevos en `tokens.css`: `--vx-indigo-950` a `--vx-indigo-600`, solo para piezas promocionales.

## 1.6.1 · 28/09 · Tab bar: nombre solo en la pestaña activa (B2 reabierta)

- Las pestañas inactivas muestran solo el ícono, centrado. La activa muestra el ícono y su nombre debajo, dentro de la píldora ámbar.
- Las 4 pestañas miden lo mismo.
- Al cambiar de pestaña, el ícono de la nueva sube y su nombre aparece; en la anterior el nombre se desvanece y el ícono baja al centro (300 ms, curva estándar). El número del carrito acompaña al ícono.
- Los nombres siguen en la página con opacidad 0, así un lector de pantalla sigue diciendo «Inicio», «Categorías», «Carrito, 1 producto» y «Cuenta».
- Reemplaza la decisión B2 «etiquetas siempre visibles», que el usuario reabrió el 28/09.

## 1.6.0 · 28/09 · Todas las tiendas en vivo en el Inicio + nombres de nicho sin cortes

**Carrusel de nichos**
- Cada nicho mide lo que ocupa su nombre, en una sola línea (antes «Telecomunicaciones» y «GPS Trackers» se partían o se montaban sobre el vecino).
- Entre un nicho y el siguiente hay siempre 12 px. El primero se alinea con el margen de la pantalla.

**Proveedores**
- El carril «Proveedores certificados» del Inicio muestra ahora las **21 tiendas** que publica ve.vexbiz.com (antes 3).
  - Orden: primero las que tienen productos (Repuestos Refrihogar, 2.025; Multiservicios Jimenez, 169), luego el resto de la A a la Z.
  - Las que aún no cargan productos dicen «Catálogo en camino» en lugar de «0 productos».
- «Ver todas» abre la lista completa, con las 21 en el mismo orden. Cada tienda abre su página; si no tiene catálogo, ofrece «Avísame cuando haya».
- El filtro de nicho de arriba también filtra las tiendas. Auxilio Vial Guayana Express y Seguros Orinoco Protege aparecen tanto en Automotriz como en Farmacias, como en el sitio.

**Datos**
- `data/catalog.json` se actualizó con la lista completa de tiendas (copia en `tools/stores-live-2026-09-28.json`).
  - La captura anterior tenía solo 8 porque la API devuelve 8 si no se le pide más; `tools/snapshot.js` ahora pide `limit=100`.
  - Las tiendas repetidas por nicho se unen en una sola, también cuando la app lee la API en vivo.
- Se quitó «Empresa Dora» y su único producto: ya no aparece en el sitio. El catálogo queda en 317 productos.

## 1.5.1 · 28/09 · Carrusel de nichos sin tarjeta

- Se retiró la tarjeta blanca que contenía el carrusel: los íconos van directo sobre el fondo del Inicio. El primer círculo queda alineado con el margen de la pantalla.
- Los círculos pasan a blanco con borde fino y sombra suave, para que se despeguen del fondo gris (en tema oscuro, sobre la superficie oscura).
- Todo lo demás sigue igual: se desliza de lado, cada nicho abre su página, y conserva el hover, el toque y la entrada escalonada.

## 1.5.0 · 28/09 · Carrusel de nichos con íconos

- Nuevo carrusel en Inicio, debajo de la píldora de Academia.
  - Es una tarjeta blanca con los 11 nichos en orden alfabético.
  - Cada nicho lleva su ícono en un círculo claro y el nombre debajo.
  - Se desliza de lado y cada nicho abre su página.
- Los íconos salen de `ICONOS NICHOS` (se usó la versión más reciente de cada uno, en `nuevos`). Quedaron como `assets/img/nichos/<nicho>.webp`, recortados, cuadrados, de 192 px y entre 8 y 17 KB cada uno. También se guardan para abrir sin conexión.
- No se usaron Licorerías, Equipos de salud ni Repuestos de salud porque no están entre los 11 nichos del catálogo.
- Movimiento: al pasar el mouse el círculo toma sombra y el ícono sube un poco con rebote; al tocar, el círculo se hunde. Los íconos entran escalonados como las tarjetas.

## 1.4.0 · 28/09 · Animaciones premium (tutoriales A1 a A8 de la guía del Home)

Los ocho tutoriales de «Animaciones en el prototipo de Figma» de `GUIA HOME/guia-home-vexbiz.html`, llevados al código de la app con los tokens de movimiento (150 / 300 / 500 ms y las curvas estándar, entrada, salida y rebote). Con «reducir movimiento» activado en el sistema, todo queda quieto: sin autoplay, sin pausa, sin rebotes ni entradas escalonadas.

- **A1 · Estados interactivos.**
  - La línea de la tab de nicho crece de 20 % a 100 % y aparece (300 ms); al pasar el mouse asoma.
  - Botones, tabs y el precio de la tarjeta se hunden al presionar (150 ms).
- **A2 · Píldora de la tab bar.** Ya viajaba entre pestañas en 300 ms. Ahora el ícono también se hunde al tocarlo.
- **A3 · Carrusel automático.**
  - Cambia cada 4 s con un deslizamiento de 500 ms ease-in-out.
  - Los puntos cambian de ancho al mismo tiempo.
  - El bucle no rebobina: del tercer banner pasa al primero siguiendo hacia la derecha.
  - Flechas del teclado para moverlo; botón de pausa.
- **A4 · Carriles horizontales.** Sin cambios: ya tenían scroll-snap y asoma la tercera tarjeta.
- **A5 · Buscador fijo arriba.** En Inicio, la barra con el buscador queda arriba al bajar y toma fondo translúcido, desenfoque y sombra al despegarse.
- **A6 · Vista rápida.** Tocar el **precio** de cualquier tarjeta abre una hoja inferior con:
  - foto, stock, marca, precio y tienda;
  - cantidad limitada al stock;
  - favorito;
  - «Añadir al carrito», que pasa a «Añadido al carrito» 1,2 s y cierra la hoja;
  - «Ver ficha completa».

  La hoja sube en 500 ms, con fondo al 56 %, y su contenido entra un instante después. Tocar el resto de la tarjeta sigue abriendo la ficha.
- **A7 · Contador del carrito.** Ya existía: el número de la tab bar rebota al añadir.
- **A8 · Microinteracciones.**
  - El corazón rebota al guardar un favorito, con el mismo keyframe del contador.
  - El punto de stock bajo respira solo en la ficha y en la vista rápida (en las tarjetas sigue quieto, como pidió la auditoría).
- **Extra.** Las tarjetas que aparecen juntas al hacer scroll entran escalonadas, con 50 ms entre una y otra.

## 1.3.1 · 28/09 · Barra de «Añadir al carrito» fija al pie

- En la ficha de producto y en Entrega y pago, la barra con la cantidad y «Añadir al carrito» (o el total y «Confirmar pedido») queda siempre pegada al pie de la pantalla. Antes subía con el contenido al hacer scroll y tapaba la ficha.
- Cuando el contenido es corto, la barra igual se ubica al pie. Al final del scroll queda aire entre el último bloque y la barra.

## 1.3.0 · 28/09 · Cambios de la auditoría (pautas web + aspecto premium)

Aplicado sobre el CSS y las pantallas ya hechas. No cambia la decisión B1: el precio sigue en botón oscuro.

**Cómo se ve**
- **Inicio:** los banners ahora son editoriales, con texto real (antes eran imágenes con el texto incrustado) y una foto del catálogo. Hay un botón de pausa junto a los puntos que detiene el carrusel y la banda de Academia. En tema oscuro la cabecera es neutra (antes se veía marrón).
- **«Ver todo»:** pasa a ser un enlace de texto con flecha en lugar de una píldora oscura.
- **Secciones:** títulos más grandes (22 px) y más aire entre secciones.
- **Tarjetas:** foto 1:1 con margen interno. El stock aparece como una línea de texto solo con 2 unidades o menos o agotado, sin el punto que latía. La ficha conserva la etiqueta de 3 niveles.
- **Menos ámbar:** los íconos de filas y nichos, el avatar, las iniciales de tiendas y proveedores y el corazón de favoritos pasan a tonos neutros. El aviso del carrito es informativo (azul). En Categorías se quitó «Explorar» de cada fila; queda la flecha.
- **Marcas:** fichas claras con el nombre en mayúsculas, en lugar de círculos con iniciales.
- **Ficha:** la foto es cuadrada con margen, y el nombre del producto es el título principal de la pantalla.
- **Iniciar sesión y Crear cuenta:** la barra lleva el logo de VEXBIZ y el título va solo en la tarjeta (antes se repetía). Los errores aparecen debajo del campo que hay que corregir y dicen cómo arreglarlo.
- **Carrito:** al quitar un producto, el aviso trae «Deshacer» durante 5 segundos.
- **Hover:** filas, nichos, tiendas, proveedores, marcas, banners y enlaces responden al pasar el mouse.

**Técnico**
- `theme-color` para claro y oscuro; precarga de fuentes cuando se sirve por http.
- «Saltar al contenido» con la tecla Tab.
- `touch-action: manipulation` y `text-wrap: balance` en títulos.
- `translate="no"` en marcas y tiendas.
- Imágenes con `width` y `height`; `fetchpriority` en el primer banner; `content-visibility` en la grilla.
- Precios con `Intl.NumberFormat` (se lee $8,80).
- Buscadores con `name` y textos de ejemplo terminados en «…»; «VEXBIZ» bien escrito.
- Soporte dice «24/7», igual que el Inicio.
- `acceso-demo.html` actualizado con el mismo logo y los mismos errores por campo.

## 1.2.0 · 28/09 · Iniciar sesión y Crear cuenta integrados en la app

- Abierta desde la carpeta (doble clic en `index.html`), la app entra en **modo demostración**: Iniciar sesión funciona con respuestas simuladas y nada sale del teléfono. Antes mostraba un aviso de que no podía abrir sesión. Cada formulario lo avisa con un recuadro azul.
- Nueva pantalla **Crear cuenta** dentro de la app (`index.html#/registro`), la misma de `acceso-demo.html`. Se llega desde Cuenta → «Crear cuenta gratis» y desde Iniciar sesión.
- Al entrar o registrarte, la sesión de demostración recorre toda la app:
  - Inicio y Cuenta dicen «Hola, <nombre>».
  - Mis pedidos muestra tres **pedidos de ejemplo** (pendiente de pago, en camino, entregado).
  - Salir cierra la sesión.
  - La sesión se mantiene al recargar y se borra al cerrar la pestaña.
- Cómo probar los estados escribiendo:
  - Iniciar sesión: cualquier correo entra; un correo con «2fa» pide código (123456), uno con «bloqueada» muestra el bloqueo y la contraseña «error» falla.
  - Crear cuenta: un correo con «existe» muestra el aviso de correo ya registrado.
- «Cuenta creada» cambia según «Quiero»: Comprar lleva a «Empezar a comprar»; Vender y Técnico llevan a «Ir a mi cuenta».
- En Cuenta (solo en modo demostración) hay una fila **Estados de acceso** que abre `acceso-demo.html`. Esa página tiene un botón «Ir a la app» para volver.
- Con la app publicada en vexbiz.com todo esto se apaga solo: se usa la cuenta real y Crear cuenta lleva a ve.vexbiz.com/register.

## 1.1.2 · 28/09 · Copia de Iniciar sesión y Crear cuenta para visualizar

- Nuevo **`acceso-demo.html`** (doble clic): copia solo para visualización del acceso. No se conecta a ninguna API; todas las respuestas son simuladas.
- Arriba, una barra oscura «Demo · solo visualización» con un selector para saltar a cada estado y un botón de tema Claro/Oscuro.
- Estados de **Iniciar sesión**: normal, correo o contraseña incorrectos, cuenta bloqueada, sin conexión, verificación en dos pasos y código no válido.
- **Crear cuenta** copia los campos de ve.vexbiz.com/register: Nombre, Apellido, Correo, Contraseña de acceso con los tres requisitos que se marcan mientras escribes (mínimo 10 caracteres, una letra, un número), Código de invitación opcional, «Registrar mi cuenta» → «Creando cuenta…», aviso de Términos y Política de Privacidad y «¿Ya tienes una cuenta registrada? Iniciar sesión».
- Agregado el selector «Quiero: Comprar · Vender · Técnico», que cambia el texto de bienvenida por los tres textos que usa el sitio.
- Después de registrarte ves **Cuenta creada** y luego **Cuenta** con «Hola, <nombre>». La pantalla «Cuenta creada» es una propuesta: no verifiqué qué muestra el sitio después de registrarse.
- Se puede recorrer escribiendo: cualquier correo y contraseña entran, un correo con «2fa» pide código (123456) y uno con «bloqueada» muestra el aviso de bloqueo.
- Para ir directo a un estado, agrega la ruta después del archivo, por ejemplo `acceso-demo.html#register-filled`.

## 1.1.1 · 28/09 · Abrir con doble clic

- `index.html` ahora abre directo desde la carpeta, sin servidor. Antes, abierta con doble clic, quedaba en blanco porque el navegador bloquea los módulos JS en archivos locales.
- Nuevos archivos generados: `assets/js/app.local.js`, `data/catalog.js`, `assets/css/fonts.local.css`, y la herramienta `tools/build_local.py` que los regenera.
- Probado abriendo el archivo local: Inicio, Categorías, Refrigeración, Buscar «compresor» (29 resultados), ficha, Carrito, Cuenta, Iniciar sesión y Mis pedidos, con las fuentes Host Grotesk e Inter cargadas y sin errores.

## 1.1.0 · 28/09 · Login real con la cuenta de ve.vexbiz.com

- **Iniciar sesión** (`#/login`, también desde Cuenta → Entrar y desde el avatar de Inicio): correo, contraseña con Ver/Ocultar, «¿Olvidaste tu contraseña?», «Entrar a mi cuenta», verificación en dos pasos con código, «Crear cuenta gratis». Errores con los mismos textos del sitio.
- **Cuenta** (`#/cuenta`): con sesión, «Hola, <nombre>», nombre completo, iniciales o foto y botón Salir.
- **Inicio** (`#/inicio`): saludo «Hola, <nombre>» y avatar con iniciales.
- **Mis pedidos** (`#/pedidos`): compras reales de la cuenta con estado, «Falta pagar» y enlace al detalle en ve.vexbiz.com; debajo, los pedidos hechos en la app.
- El login real solo funciona con la app alojada en un dominio de vexbiz.com. Abierta desde la carpeta, `#/login` explica esto y ofrece «Entrar en ve.vexbiz.com».

## 1.0.0 · 28/09 · App móvil con el catálogo real

- PWA vanilla con tarjeta de producto clara (B1), tab bar de 4 ítems con etiqueta (B2) y catálogo real de ve.vexbiz.com (snapshot del 28/09).
- Pantallas: Inicio, Categorías, Nicho, Ficha, Tienda, Tiendas, Buscar, Carrito por tienda, Entrega y pago, Pedido recibido, Mis pedidos, Favoritos, Cuenta.
