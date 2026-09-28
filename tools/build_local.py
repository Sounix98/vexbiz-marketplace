#!/usr/bin/env python3
"""Genera la versión que abre con doble clic (file://), sin servidor.

Chrome y Edge bloquean en file:// los módulos ES, fetch() y las fuentes, así que se crean:
  assets/js/app.local.js     todos los módulos en un solo script clásico (esbuild, formato IIFE)
  data/catalog.js            el snapshot como window.VX_CATALOG
  assets/css/fonts.local.css las fuentes incrustadas en base64
  acceso-demo.html           copia solo para visualización de Iniciar sesión y Crear cuenta
Correr después de cambiar cualquier .js o el catálogo:  python3 tools/build_local.py
esbuild es solo herramienta de compilación (npx la descarga); la app entregada sigue siendo vanilla."""
import base64, json, pathlib, re, subprocess
R = pathlib.Path(__file__).resolve().parent.parent
subprocess.run(['npx', '--yes', 'esbuild@0.28.2', str(R / 'assets/js/main.js'), '--bundle', '--format=iife',
                '--target=es2020', '--charset=utf8', '--legal-comments=none',
                '--banner:js=/* VEXBIZ · versión empaquetada para abrir con doble clic. Generada por tools/build_local.py: no editar a mano. */',
                '--outfile=' + str(R / 'assets/js/app.local.js')], check=True)
cat = json.loads((R / 'data/catalog.json').read_text(encoding='utf-8'))
(R / 'data/catalog.js').write_text('/* Generado por tools/build_local.py desde data/catalog.json */\nwindow.VX_CATALOG = ' + json.dumps(cat, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
css = (R / 'assets/css/fonts.css').read_text(encoding='utf-8')
def inline(m):
    data = base64.b64encode((R / 'assets/css' / m.group(1)).resolve().read_bytes()).decode()
    return f'url("data:font/woff2;base64,{data}")'
(R / 'assets/css/fonts.local.css').write_text('/* Generado por tools/build_local.py: fuentes incrustadas para file:// */\n' + re.sub(r'url\("([^"]+\.woff2)"\)', inline, css), encoding='utf-8')
# Copia de visualización de Iniciar sesión / Crear cuenta: mismo sprite que la app
html = (R / 'index.html').read_text(encoding='utf-8')
sprite = re.search(r'<svg xmlns="http://www.w3.org/2000/svg" width="0".*?</svg>', html, re.S).group(0)
tpl = (R / 'tools/acceso-demo.template.html').read_text(encoding='utf-8')
(R / 'acceso-demo.html').write_text(tpl.replace('<!--SPRITE-->', sprite), encoding='utf-8')
print('ok: app.local.js, catalog.js, fonts.local.css, acceso-demo.html')
