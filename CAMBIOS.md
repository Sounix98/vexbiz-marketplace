# VEXBIZ APP · Cambios por entrega

Cada entrega se escribe en esta carpeta. Para ver un cambio: doble clic en `index.html` y la ruta indicada (se escribe después de `index.html` en la barra de direcciones, por ejemplo `index.html#/login`).

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
