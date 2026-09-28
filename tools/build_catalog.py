#!/usr/bin/env python3
"""VEXBIZ · Normaliza la captura del catálogo real a data/catalog.json.

Acepta dos formas de entrada:
  - la captura "cruda" de tools/snapshot.js (niches, stores, listings, details, offers), o
  - la forma compacta intermedia (products con claves cortas) usada en la primera captura.
Uso: python3 tools/build_catalog.py <entrada.json> [salida=data/catalog.json]
"""
import json, re, sys, unicodedata
from pathlib import Path

ACRONYMS = {'LG', 'RGC', 'BTU', 'HP', 'LBP', 'HBP', 'MBP', 'A/A', 'AC', 'A/C', 'PVC', 'LED', 'USB', 'GPS', 'TV', 'ABS',
            'DC', 'PTC', 'NTC', 'CPU', 'PH', 'FS10', 'FX15', 'ISYN', 'CVS', 'C.A.', 'CA', 'TEK', 'GE'}
SMALL = {'de', 'del', 'la', 'las', 'el', 'los', 'y', 'o', 'para', 'con', 'en', 'a', 'al', 'por', 'sin'}


def mostly_upper(s):
    letters = [c for c in s if c.isalpha()]
    return bool(letters) and sum(c.isupper() for c in letters) / len(letters) > 0.6


def brand_case(b):
    b = (b or '').strip()
    if not b:
        return ''
    if not (mostly_upper(b) or b.islower()):
        return b
    words = []
    for w in b.split(' '):
        core = w.strip(',./')
        words.append(w.upper() if (core.upper() in ACRONYMS or len(core) <= 2 or (len(core) <= 4 and not re.search('[AEIOUaeiou]', core))) else w[:1].upper() + w[1:].lower())
    return ' '.join(words)


def sentence_case(name, brand=''):
    """Nombres del catálogo en mayúsculas pasan a tipo oración (guía del Home, §7)."""
    name = re.sub(r'\s+', ' ', (name or '').strip())
    if not mostly_upper(name):
        return name
    brands = {w.upper() for w in re.split(r'\s+', brand or '') if w}
    out = []
    for i, tok in enumerate(name.split(' ')):
        core = tok.strip(',.;:()')
        up = core.upper()
        if any(ch.isdigit() for ch in core) or up in ACRONYMS:
            out.append(tok)                       # modelos, voltajes, siglas: tal cual
        elif up in brands and core:
            out.append(tok.replace(core, brand_case(core)))
        else:
            low = tok.lower()
            out.append(low if (i and core.lower() in SMALL) else low)
    s = ' '.join(out)
    return s[:1].upper() + s[1:]


def store_case(n):
    n = (n or '').replace('_', ' ').strip()
    if not mostly_upper(n) and not n.islower():
        return n
    words = []
    for i, w in enumerate(n.split(' ')):
        if w.upper() in ACRONYMS:
            words.append(w.upper())
        elif i and w.lower() in SMALL:
            words.append(w.lower())
        else:
            words.append(w[:1].upper() + w[1:].lower())
    return ' '.join(words)


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


def compact_from_raw(s):
    prods, seen = [], set()
    for code, lst in s['listings'].items():
        for p in lst:
            if p['slug'] in seen:
                continue
            seen.add(p['slug'])
            d = s['details'].get(p['slug'], {}) or {}
            off = s['offers'].get(p['slug'], []) or []
            o0 = next((o for o in off if o.get('store_slug') == p.get('store_slug')), off[0] if off else {})
            prods.append({'id': p['slug'], 'n': p['name'], 'b': p.get('brand') or d.get('brand') or '', 'm': p.get('model') or d.get('model') or '',
                          'c': d.get('category') or p.get('category'), 'cp': p.get('category'), 'nc': d.get('niche_code') or code,
                          'img': [i for i in (d.get('images') or [p.get('image')]) if i], 'ds': d.get('description') or '',
                          'at': [[a['name'], a['value']] for a in d.get('attributes', []) if a.get('code') not in ('brand', 'niche', 'category')],
                          'cm': d.get('compatibility') or [], 'pr': p.get('price'), 'cur': p.get('currency'), 'av': p.get('availability'),
                          'st': p.get('stock'), 'ss': p.get('store_slug'), 'sku': o0.get('sku', ''), 'city': o0.get('city', ''), 'cond': p.get('condition'),
                          'of': [{'ss': o['store_slug'], 'pr': o['price'], 'st': o.get('stock'), 'av': o.get('availability'), 'sku': o.get('sku'), 'city': o.get('city')} for o in off]})
    sf = {}
    for sec in (s.get('storefront') or {}).get('sections', []):
        if sec['key'] != 'global_nav':
            sf[sec['key']] = sec.get('content') or sec.get('best_sellers') or sec.get('brands') or sec.get('stores') or sec.get('metrics')
    return {'fetched_at': s['fetched_at'], 'source': s.get('source'), 'tenant': s.get('tenant'), 'niches': s['niches'],
            'nicheCategories': {k: [c for c in (v or {}).get('categories', []) if c.get('products')] for k, v in s['nicheDetail'].items()},
            'stores': s['stores'], 'products': prods, 'storefront': sf}


def build(c):
    stores = {}
    for st in c['stores']:
        stores[st['slug']] = {'id': st['slug'], 'name': store_case(st['name']), 'legal': st.get('legal_name', ''), 'niche': st.get('niche', ''),
                              'city': st.get('city', ''), 'state': st.get('state', ''), 'verified': bool(st.get('verified')),
                              'logo': st.get('logo') or '', 'count': st.get('catalog_size') or 0}
    products = []
    for p in c['products']:
        ss = p['ss'] or next((o['ss'] for o in p['of'] if o.get('ss')), '')
        if not ss or ss not in stores:
            continue                                 # sin tienda identificable: no se puede comprar
        offers = sorted([{'store': o['ss'], 'price': o['pr'], 'stock': o.get('st') or 0, 'av': o.get('av'), 'sku': o.get('sku') or '', 'city': o.get('city') or ''}
                         for o in p['of'] if o.get('ss') in stores], key=lambda o: (o['price'] or 1e9))
        products.append({'id': p['id'], 'name': sentence_case(p['n'], p['b']), 'raw': p['n'], 'brand': brand_case(p['b']), 'model': p['m'],
                         'category': (p['c'] or '').split(' > ')[-1], 'niche': p['nc'], 'images': p['img'], 'desc': p['ds'].strip(),
                         'attrs': p['at'], 'compat': p['cm'], 'price': p['pr'] or 0, 'currency': p['cur'] or 'USD', 'availability': p['av'],
                         'stock': p['st'] or 0, 'store': ss, 'sku': p['sku'], 'city': p['city'] or stores[ss]['city'], 'condition': p['cond'],
                         'offers': offers,
                         'q': fold(' '.join([p['n'], p['b'] or '', p['m'] or '', p['c'] or '', p['sku'] or '', stores[ss]['name']]))})
    ids = {p['id'] for p in products}
    sf = c.get('storefront') or {}
    best = {b['niche_code']: [x['slug'] for x in b['products'] if x['slug'] in ids] for b in (sf.get('best_sellers') or [])}
    return {
        'version': 1,
        'fetched_at': c['fetched_at'], 'source': c.get('source') or 'https://ve.vexbiz.com/marketplace-api/v1', 'tenant': c.get('tenant', 'vepr'),
        'niches': [{'id': n['code'], 'name': n['name'], 'image': n.get('image', ''), 'count': n.get('products', 0), 'technician': bool(n.get('requires_technician'))} for n in c['niches']],
        'categories': c.get('nicheCategories', {}),
        'stores': list(stores.values()),
        'products': products,
        'home': {'bestSellers': best, 'brands': (sf.get('brands') or [])[:12], 'metrics': {m['key']: m['value'] for m in (sf.get('trust_metrics') or [])},
                 'trust': (sf.get('trust_bar') or {}).get('benefits', []), 'academy': sf.get('academy_banner') or {}},
    }


if __name__ == '__main__':
    src = Path(sys.argv[1]); dst = Path(sys.argv[2] if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / 'data' / 'catalog.json')
    raw = json.loads(src.read_text(encoding='utf-8'))
    compact = compact_from_raw(raw) if 'listings' in raw else raw
    out = build(compact)
    dst.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f"{dst}: {len(out['products'])} productos, {len(out['stores'])} tiendas, {len(out['niches'])} nichos, {dst.stat().st_size // 1024} KB")
