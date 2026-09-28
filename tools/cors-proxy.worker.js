/* VEXBIZ · Proxy de solo lectura para usar la API en vivo desde la app publicada
   fuera de vexbiz.com (por ejemplo en GitHub Pages).
   La API marketplace-api/v1 no envía cabeceras CORS: el navegador bloquea las
   llamadas desde otro dominio. Este Worker de Cloudflare reenvía GET a
   ve.vexbiz.com, agrega X-Tenant-Code y responde con CORS solo para ALLOWED.
   Despliegue: wrangler deploy (o pegar en el editor de Workers). Luego abrir la app con
   ?api=https://<tu-worker>.workers.dev/marketplace-api/v1  */
const UPSTREAM = 'https://ve.vexbiz.com';
const TENANT = 'vepr';
const ALLOWED = ['https://sounixromero-source.github.io', 'http://localhost:8000'];

export default {
  async fetch(req) {
    const origin = req.headers.get('Origin') || '';
    const cors = ALLOWED.includes(origin) ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' } : {};
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'X-Tenant-Code, Accept', 'Access-Control-Max-Age': '86400' } });
    const url = new URL(req.url);
    if (req.method !== 'GET' || !url.pathname.startsWith('/marketplace-api/v1/')) return new Response('No permitido', { status: 405, headers: cors });
    const res = await fetch(UPSTREAM + url.pathname + url.search, { headers: { 'X-Tenant-Code': TENANT, Accept: 'application/json' }, cf: { cacheTtl: 300 } });
    const headers = new Headers(res.headers);
    Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
    return new Response(res.body, { status: res.status, headers });
  },
};
