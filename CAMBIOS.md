# VEXBIZ APP · Cambios por entrega

Cada entrega se escribe en esta carpeta. Para ver un cambio: doble clic en `index.html` y la ruta indicada (se escribe después de `index.html` en la barra de direcciones, por ejemplo `index.html#/login`).

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
