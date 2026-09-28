/* VEXBIZ · Captura del catálogo real para la app (modo snapshot).
   Uso: abrir https://ve.vexbiz.com en el navegador, pegar este script en la consola
   de desarrollador y esperar. Descarga "catalog-raw.json"; luego ejecutar
   `python3 tools/build_catalog.py catalog-raw.json` para generar data/catalog.json.
   Solo lee endpoints públicos de marketplace-api/v1 (sin sesión). */
(async () => {
  const TENANT = 'vepr';            // código de país que el sitio resuelve desde el anfitrión
  const PAGES = { ref: 5, aut: 4, fer: 5, ind: 1 }; // páginas de 24 por nicho con catálogo
  const H = { headers: { 'X-Tenant-Code': TENANT, Accept: 'application/json' } };
  const J = async (p) => {
    for (let a = 0; a < 3; a++) {
      try { const r = await fetch('/marketplace-api/v1/' + p, H); if (r.ok) return r.json(); if (r.status === 404) return null; } catch (e) {}
      await new Promise((z) => setTimeout(z, 800));
    }
    return null;
  };
  const snap = { fetched_at: new Date().toISOString(), tenant: TENANT, source: location.origin + '/marketplace-api/v1' };
  snap.storefront = await J('storefront');
  snap.niches = (await J('niches')).data;
  snap.nicheDetail = {};
  for (const n of snap.niches.filter((n) => n.products > 0)) snap.nicheDetail[n.code] = await J('niches/' + n.code);
  snap.stores = (await J('stores?limit=100')).data;   // sin limit la API devuelve solo 8
  snap.listings = {};
  for (const [code, max] of Object.entries(PAGES)) {
    let cursor = null, all = [];
    for (let i = 0; i < max; i++) {
      const d = await J('search?niche=' + code + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
      if (!d) break; all = all.concat(d.results); cursor = d.cursor; if (!cursor || !d.results.length) break;
    }
    snap.listings[code] = all;
  }
  const slugs = [...new Set(Object.values(snap.listings).flat().map((p) => p.slug))];
  snap.details = {}; snap.offers = {};
  let i = 0;
  const worker = async () => { while (i < slugs.length) { const s = slugs[i++]; const [d, o] = await Promise.all([J('products/' + s), J('products/' + s + '/offers')]); if (d) snap.details[s] = d; if (o) snap.offers[s] = o.data; } };
  await Promise.all(Array.from({ length: 6 }, worker));
  const blob = new Blob([JSON.stringify(snap)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'catalog-raw.json'; a.click();
  console.log('[vexbiz] listo:', slugs.length, 'productos');
})();
