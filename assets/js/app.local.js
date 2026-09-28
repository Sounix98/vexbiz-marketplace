/* VEXBIZ · versión empaquetada para abrir con doble clic. Generada por tools/build_local.py: no editar a mano. */
(() => {
  // assets/js/config.js
  var onVexbiz = /(^|\.)vexbiz\.com$/i.test(location.hostname);
  var params = new URLSearchParams(location.search);
  var CONFIG = {
    tenant: "vepr",
    // código de país que resuelve ve.vexbiz.com
    apiBase: params.get("api") || (onVexbiz ? "/marketplace-api/v1" : ""),
    // Cuenta real (/auth, /account-api): solo en el mismo origen que la cookie de sesión.
    // null = no disponible aquí. ?auth=<origen> permite probar detrás de un proxy del mismo sitio.
    authBase: onVexbiz ? "" : params.has("auth") ? params.get("auth") : null,
    siteUrl: "https://ve.vexbiz.com",
    snapshotUrl: "data/catalog.json",
    pageSize: 24,
    currency: "USD",
    locale: "es-VE",
    storageKey: "vx-app-v1",
    themeKey: "vx-theme",
    cities: ["Ciudad Guayana", "Puerto Ordaz", "San Félix", "Ciudad Bolívar", "Upata", "Caracas"],
    // Orden de las pestañas de nicho en Inicio: primero los que tienen catálogo (Figma 395:1984)
    homeNiches: ["ref", "aut", "fer", "ind", "mot", "res", "gps", "far", "sol", "sup", "tlc"]
  };

  // assets/js/format.js
  var ACRONYMS = /* @__PURE__ */ new Set([
    "LG",
    "RGC",
    "BTU",
    "HP",
    "LBP",
    "HBP",
    "MBP",
    "A/A",
    "AC",
    "A/C",
    "PVC",
    "LED",
    "USB",
    "GPS",
    "TV",
    "ABS",
    "DC",
    "PTC",
    "NTC",
    "CPU",
    "PH",
    "ISYN",
    "CVS",
    "C.A.",
    "CA",
    "GE",
    "NSK"
  ]);
  var SMALL = /* @__PURE__ */ new Set(["de", "del", "la", "las", "el", "los", "y", "o", "para", "con", "en", "a", "al", "por", "sin"]);
  var esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var fold = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  var plural = (n, one, many) => `${n.toLocaleString(CONFIG.locale)} ${n === 1 ? one : many}`;
  var moneyFmt = {};
  function money(n, currency = CONFIG.currency) {
    const c = String(currency || "USD").toUpperCase();
    let f = moneyFmt[c];
    if (!f) {
      try {
        f = moneyFmt[c] = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: c, currencyDisplay: "narrowSymbol" });
      } catch (e) {
        f = moneyFmt[c] = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" });
      }
    }
    return f.formatToParts(Number(n || 0)).map((p) => p.type === "currency" && c === "VES" ? "Bs. " : p.value).join("");
  }
  function shortDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(CONFIG.locale, { day: "numeric", month: "short", year: "numeric" });
    } catch (e) {
      return "";
    }
  }
  var mostlyUpper = (s) => {
    const l = [...String(s)].filter((c) => c.toLowerCase() !== c.toUpperCase());
    return l.length > 0 && l.filter((c) => c === c.toUpperCase()).length / l.length > 0.6;
  };
  var cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  var isAcr = (core) => ACRONYMS.has(core.toUpperCase()) || core.length <= 2 || core.length <= 4 && !/[aeiou]/i.test(core);
  function brandCase(b) {
    b = String(b || "").trim();
    if (!b || !(mostlyUpper(b) || b === b.toLowerCase())) return b;
    return b.split(" ").map((w) => {
      const core = w.replace(/[,./]/g, "");
      return core && isAcr(core) ? w.toUpperCase() : cap(w);
    }).join(" ");
  }
  function sentenceCase(name, brand = "") {
    name = String(name || "").replace(/\s+/g, " ").trim();
    if (!mostlyUpper(name)) return name;
    const brands = new Set(String(brand).toUpperCase().split(/\s+/).filter(Boolean));
    const s = name.split(" ").map((tok) => {
      const core = tok.replace(/^[,.;:()]+|[,.;:()]+$/g, "");
      if (/\d/.test(core) || ACRONYMS.has(core.toUpperCase())) return tok;
      if (core && brands.has(core.toUpperCase())) return tok.replace(core, brandCase(core));
      return tok.toLowerCase();
    }).join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function storeCase(n) {
    n = String(n || "").replace(/_/g, " ").trim();
    if (!(mostlyUpper(n) || n === n.toLowerCase())) return n;
    return n.split(" ").map((w, i) => ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : i && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : cap(w)).join(" ");
  }
  var initials = (name) => String(name || "?").replace(/[^\p{L}\p{N} ]/gu, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

  // assets/js/api.js
  var snap = null;
  var loading = null;
  var mode = CONFIG.apiBase ? "live" : "snapshot";
  var byId = /* @__PURE__ */ new Map();
  var byStore = /* @__PURE__ */ new Map();
  var byNiche = /* @__PURE__ */ new Map();
  function indexSnapshot(c) {
    c.products.forEach((p, i) => {
      p._i = i;
      byId.set(p.id, p);
      (byStore.get(p.store) || byStore.set(p.store, []).get(p.store)).push(p);
      (byNiche.get(p.niche) || byNiche.set(p.niche, []).get(p.niche)).push(p);
    });
    c.storeMap = new Map(c.stores.map((s) => [s.id, s]));
    c.nicheMap = new Map(c.niches.map((n) => [n.id, n]));
    return c;
  }
  async function snapshot() {
    if (snap) return snap;
    const src = window.VX_CATALOG ? Promise.resolve(JSON.parse(JSON.stringify(window.VX_CATALOG))) : fetch(CONFIG.snapshotUrl).then((r) => {
      if (!r.ok) throw new Error("snapshot " + r.status);
      return r.json();
    });
    if (!loading) loading = src.then(indexSnapshot).then((c) => snap = c);
    return loading;
  }
  async function live(path) {
    const r = await fetch(CONFIG.apiBase.replace(/\/$/, "") + "/" + path, { headers: { "X-Tenant-Code": CONFIG.tenant, Accept: "application/json" } });
    if (!r.ok) throw new Error(path + " " + r.status);
    return r.json();
  }
  async function prefer(liveFn, snapFn) {
    if (mode === "live") {
      try {
        return await liveFn();
      } catch (e) {
        console.warn("[vexbiz] API en vivo no disponible, uso el snapshot:", e.message);
        mode = "snapshot";
      }
    }
    return snapFn(await snapshot());
  }
  var liveListing = (p) => ({
    id: p.slug,
    name: sentenceCase(p.name, p.brand),
    raw: p.name,
    brand: brandCase(p.brand),
    model: p.model || "",
    category: String(p.category || "").split(" > ").pop(),
    niche: p.niche_code || "",
    images: [p.image].filter(Boolean),
    price: p.price || 0,
    currency: p.currency || "USD",
    availability: p.availability,
    stock: p.stock ?? (p.availability === "in_stock" ? 99 : 1),
    store: p.store_slug,
    storeName: storeCase(p.store),
    city: p.city || "",
    condition: p.condition,
    offers: []
  });
  var liveStore = (s) => ({ id: s.slug, name: storeCase(s.name), legal: s.legal_name || "", niche: s.niche || "", city: s.city || "", state: s.state || "", verified: !!s.verified, logo: s.logo || "", count: s.catalog_size || 0 });
  function sortList(list, sort) {
    const l = list.slice();
    const priceKey = (p) => p.price > 0 ? p.price : Infinity;
    if (sort === "price_asc") l.sort((a, b) => priceKey(a) - priceKey(b));
    else if (sort === "price_desc") l.sort((a, b) => (b.price || -1) - (a.price || -1));
    else if (sort === "stock") l.sort((a, b) => (b.availability === "in_stock") - (a.availability === "in_stock") || a._i - b._i);
    return l;
  }
  function page(list, cursor, size = CONFIG.pageSize) {
    const start = Number(cursor || 0);
    return { items: list.slice(start, start + size), total: list.length, cursor: start + size < list.length ? String(start + size) : null };
  }
  var api = {
    get mode() {
      return mode;
    },
    async meta() {
      const c = await snapshot();
      return { fetchedAt: c.fetched_at, source: c.source, mode, products: c.products.length, metrics: c.home.metrics };
    },
    niches: () => prefer(
      async () => (await live("niches")).data.map((n) => ({ id: n.code, name: n.name, image: n.image || "", count: n.products || 0, technician: !!n.requires_technician })),
      (c) => c.niches
    ),
    niche: (id) => prefer(
      async () => {
        const d = await live("niches/" + encodeURIComponent(id));
        return { niche: { id: d.niche.code, name: d.niche.name, image: d.niche.image, count: d.niche.products, technician: !!d.niche.requires_technician }, categories: (d.categories || []).filter((x) => x.products) };
      },
      (c) => ({ niche: c.nicheMap.get(id) || null, categories: c.categories[id] || [] })
    ),
    /* search({ q, niche, category, store, sort, cursor }) → { items, total, cursor } */
    search: (opt = {}) => prefer(
      async () => {
        const qs = new URLSearchParams();
        if (opt.q) qs.set("q", opt.q);
        if (opt.niche && opt.niche !== "todo") qs.set("niche", opt.niche);
        if (opt.category) qs.set("category", opt.category);
        if (opt.store) qs.set("store", opt.store);
        if (opt.sort && opt.sort !== "rel") qs.set("sort", opt.sort);
        if (opt.cursor) qs.set("cursor", opt.cursor);
        const d = await live("search?" + qs);
        return { items: d.results.map(liveListing), total: d.total || d.total_offers || d.results.length, cursor: d.cursor || null };
      },
      (c) => {
        let list = opt.store ? byStore.get(opt.store) || [] : opt.niche && opt.niche !== "todo" ? byNiche.get(opt.niche) || [] : c.products;
        if (opt.category) {
          const cat = fold(opt.category).replace(/-/g, " ");
          list = list.filter((p) => fold(p.category).includes(cat) || fold(p.category).replace(/\s+/g, " ") === cat);
        }
        if (opt.q) {
          const toks = fold(opt.q).split(/\s+/).filter(Boolean);
          list = list.filter((p) => toks.every((t) => p.q.includes(t)));
        }
        return page(sortList(list, opt.sort), opt.cursor);
      }
    ),
    product: (id) => prefer(
      async () => {
        const [d, o] = await Promise.all([live("products/" + id), live("products/" + id + "/offers")]);
        const offers = (o.data || []).map((x) => ({ store: x.store_slug, storeName: storeCase(x.store_name), price: x.price, stock: x.stock || 0, av: x.availability, sku: x.sku || "", city: x.city || "", verified: !!x.store_verified })).sort((a, b) => a.price - b.price);
        const best = offers[0] || {};
        return {
          id: d.slug,
          name: sentenceCase(d.name, d.brand),
          raw: d.name,
          brand: brandCase(d.brand),
          model: d.model || "",
          category: d.category,
          niche: d.niche_code,
          images: d.images || [],
          desc: d.description || "",
          attrs: (d.attributes || []).filter((a) => !["brand", "niche", "category"].includes(a.code)).map((a) => [a.name, a.value]),
          compat: d.compatibility || [],
          price: best.price || 0,
          currency: "USD",
          availability: best.av,
          stock: best.stock || 0,
          store: best.store,
          sku: best.sku,
          city: best.city,
          condition: "new",
          offers
        };
      },
      (c) => byId.get(id) || null
    ),
    related: async (p, limit = 12) => {
      const c = await snapshot();
      const same = (byNiche.get(p.niche) || []).filter((x) => x.id !== p.id && x.category === p.category);
      return same.slice(0, limit);
    },
    stores: () => prefer(async () => (await live("stores")).data.map(liveStore), (c) => c.stores),
    store: (id) => prefer(async () => liveStore(await live("stores/" + id)), (c) => c.storeMap.get(id) || null),
    async home() {
      const c = await snapshot();
      return c.home;
    },
    /* Resuelve varios productos por id desde el snapshot (carriles de Inicio, favoritos). */
    async byIds(ids) {
      await snapshot();
      return ids.map((i) => byId.get(i)).filter(Boolean);
    },
    async storeName(id) {
      const c = await snapshot();
      return (c.storeMap.get(id) || {}).name || "";
    }
  };

  // assets/js/store.js
  var listeners = /* @__PURE__ */ new Set();
  var blank = () => ({ cart: {}, fav: {}, orders: [], city: "Ciudad Guayana", recent: [] });
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "null");
      return s ? Object.assign(blank(), s) : blank();
    } catch (e) {
      return blank();
    }
  }
  var state = load();
  function save() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch (e) {
    }
  }
  function emit(what) {
    save();
    listeners.forEach((fn) => fn(what));
  }
  var subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  var card = (p, offer) => ({
    id: p.id,
    name: p.name,
    img: (p.images || [])[0] || "",
    price: offer ? offer.price : p.price,
    currency: p.currency || "USD",
    store: offer ? offer.store : p.store,
    stock: offer ? offer.stock : p.stock,
    sku: offer ? offer.sku : p.sku,
    city: offer ? offer.city : p.city,
    availability: offer ? offer.av : p.availability
  });
  var cart = {
    lines: () => Object.values(state.cart),
    count: () => Object.values(state.cart).reduce((s, l) => s + l.qty, 0),
    total: () => Object.values(state.cart).reduce((s, l) => s + l.qty * l.price, 0),
    qty: (id) => state.cart[id] ? state.cart[id].qty : 0,
    add(p, qty, offer) {
      const cur = state.cart[p.id];
      const base = cur || { ...card(p, offer), qty: 0 };
      const max = Math.max(1, base.stock || 1);
      const next = Math.min(max, base.qty + qty);
      state.cart[p.id] = { ...base, qty: next };
      emit("cart");
      return next - base.qty;
    },
    set(id, qty) {
      const l = state.cart[id];
      if (!l) return;
      l.qty = Math.max(1, Math.min(l.stock || 1, qty));
      emit("cart");
    },
    remove(id) {
      const l = state.cart[id];
      delete state.cart[id];
      emit("cart");
      return l;
    },
    restore(line) {
      if (line && line.id) {
        state.cart[line.id] = line;
        emit("cart");
      }
    },
    clear() {
      state.cart = {};
      emit("cart");
    },
    byStore() {
      const g = {};
      Object.values(state.cart).forEach((l) => {
        (g[l.store] = g[l.store] || []).push(l);
      });
      return g;
    }
  };
  var favs = {
    has: (id) => !!state.fav[id],
    list: () => Object.values(state.fav),
    toggle(p) {
      if (state.fav[p.id]) delete state.fav[p.id];
      else state.fav[p.id] = card(p);
      emit("fav");
      return !!state.fav[p.id];
    }
  };
  var orders = {
    list: () => state.orders,
    place(meta) {
      const code = "VX-" + String(1044 + state.orders.length);
      const groups = cart.byStore();
      state.orders.unshift({
        code,
        date: (/* @__PURE__ */ new Date()).toISOString(),
        items: cart.count(),
        total: cart.total(),
        stores: Object.keys(groups).length,
        lines: cart.lines().map((l) => ({ id: l.id, name: l.name, qty: l.qty, price: l.price, store: l.store })),
        ...meta
      });
      state.cart = {};
      emit("orders");
      return code;
    }
  };
  var prefs = {
    city: () => state.city,
    setCity(c) {
      state.city = c;
      emit("city");
    },
    recent: () => state.recent,
    pushRecent(q) {
      q = q.trim();
      if (!q) return;
      state.recent = [q, ...state.recent.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
      emit("recent");
    },
    clearRecent() {
      state.recent = [];
      emit("recent");
    },
    reset() {
      Object.assign(state, blank());
      emit("reset");
    }
  };

  // assets/js/ui.js
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ico = (id, cls) => `<svg class="ico${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  var stores = /* @__PURE__ */ new Map();
  var setStores = (list) => list.forEach((s) => stores.set(s.id, s));
  var storeOf = (id) => stores.get(id) || null;
  var storeName = (p) => p.storeName || (stores.get(p.store) || {}).name || "Tienda";
  function stock(p, full) {
    const n = Number(p.stock || 0);
    if (p.availability === "out_of_stock" || n <= 0 && p.availability !== "in_stock") return '<span class="stock stock--out">Agotado</span>';
    if (p.availability === "low_stock" || n > 0 && n <= 5) return `<span class="stock stock--low">${n === 1 ? "Última unidad" : `Últimas ${n}${full ? " disponibles" : ""}`}</span>`;
    return '<span class="stock">Disponible</span>';
  }
  var canBuy = (p) => p.price > 0 && !(p.availability === "out_of_stock" || Number(p.stock || 0) <= 0 && p.availability !== "in_stock");
  var priceLabel = (p) => p.price > 0 ? money(p.price, p.currency) : "Precio a consultar";
  function img(src, alt = "", attrs = "", size = 240) {
    const eager = /fetchpriority/.test(attrs);
    return src ? `<img src="${esc(src)}" alt="${esc(alt)}" width="${size}" height="${size}"${eager ? "" : ' loading="lazy"'} decoding="async" referrerpolicy="no-referrer" ${attrs} data-fallback>` : "";
  }
  function stockLine(p) {
    const n = Number(p.stock || 0);
    if (p.availability === "out_of_stock" || n <= 0 && p.availability !== "in_stock") return '<span class="pcard__stock pcard__stock--out">Agotado</span>';
    if (n > 0 && n <= 2) return `<span class="pcard__stock">${n === 1 ? "Última unidad" : "Últimas 2"}</span>`;
    return "";
  }
  function favBtn(p, cls) {
    const on = favs.has(p.id);
    return `<button class="${cls}" type="button" data-fav="${esc(p.id)}" aria-pressed="${on}" aria-label="Guardar ${esc(p.name)} en favoritos">${ico(on ? "heart-f" : "heart")}</button>`;
  }
  function pcard(p) {
    return `<article class="pcard reveal">${favBtn(p, "pcard-fav")}
    <a class="pcard__link" href="#/p/${esc(p.id)}">
      <span class="pcard__media">${p.images && p.images[0] ? img(p.images[0], "") : `<span class="pcard__noimg">${ico("image")}</span>`}</span>
      <span class="pcard__body"><span class="pcard__name">${esc(p.name)}</span>
        <span class="pcard__sku"${p.brand ? ' translate="no"' : ""}>${esc(p.brand || p.category || "")}</span>${stockLine(p)}</span>
      <span class="pcard__foot"><span class="pcard-price${p.price > 0 ? "" : " pcard-price--ask"}">${priceLabel(p)}</span>
        <span class="pcard__store">${ico("shield")}<span translate="no">${esc(storeName(p))}</span></span></span>
    </a></article>`;
  }
  function storeLogo(s, cls = "store-card__logo") {
    return `<span class="${cls}" aria-hidden="true" data-initials="${esc(initials(s.name))}">${s.logo ? img(s.logo, "") : esc(initials(s.name))}</span>`;
  }
  function provCard(s, cover) {
    const bg = cover ? ` style="background-image:url(${esc(cover)})"` : "";
    return `<a class="prov reveal" href="#/s/${esc(s.id)}"${bg}>
    ${cover ? `<span class="sr">${esc(s.name)}</span>` : (s.logo ? `<span class="prov__logo">${img(s.logo, "")}</span>` : `<span class="prov__mono" aria-hidden="true">${esc(initials(s.name))}</span>`) + ico("check-circle", "prov__check") + `<span class="prov__name" translate="no">${esc(s.name)}</span>`}
    <span class="prov__chip">${esc(s.niche || "Tienda verificada")}</span>
    <span class="prov__count">${plural(s.count, "producto", "productos")}</span></a>`;
  }
  function storeCard(s, extraMeta = "") {
    return `<a class="store-card reveal" href="#/s/${esc(s.id)}">${storeLogo(s)}
    <span class="store-card__body"><span class="store-card__name" translate="no">${esc(s.name)}</span>
      <span class="store-card__meta">${[extraMeta, s.niche, s.city, plural(s.count, "producto", "productos")].filter(Boolean).map(esc).join(" · ")}</span>
      ${s.verified ? `<span class="vx-status vx-status--info">${ico("shield")}Tienda verificada</span>` : ""}</span>
    ${ico("chev-r")}</a>`;
  }
  var empty = (art, title, text, action = "") => `<div class="empty"><span class="empty__art">${ico(art)}</span><h3>${title}</h3><p>${text}</p>${action}</div>`;
  var topbar = (title, extra = "", tag = "h1") => `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico("chev-l")}</button>
   ${tag === "h1" ? `<h1 class="topbar__title" tabindex="-1" data-focus>${title}</h1>` : `<p class="topbar__title">${title}</p>`}${extra}</header>`;
  var brandbar = () => `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico("chev-l")}</button>
   <span class="topbar__brand"><img class="brandmark--on-light" src="assets/img/logo-claro.webp" width="92" height="36" alt="VEXBIZ"><img class="brandmark--on-dark" src="assets/img/logo-oscuro.webp" width="92" height="36" alt="VEXBIZ"></span></header>`;
  var rootHead = (title, sub = "", crumb = "") => `<header class="page-head" style="padding-top:var(--vx-sp-5)">${crumb ? `<span class="page-head__crumb">${crumb}</span>` : ""}
   <h1 class="page-head__title" tabindex="-1" data-focus>${title}</h1>${sub ? `<p class="page-head__sub">${sub}</p>` : ""}</header>`;
  var skeletonGrid = (n = 4) => `<div class="grid">${Array.from({ length: n }, () => '<div class="skel skel-card"></div>').join("")}</div>`;
  var skeletonScreen = () => `<div style="padding:var(--vx-sp-5) var(--app-gutter);display:flex;flex-direction:column;gap:12px" aria-busy="true" aria-label="Cargando">
  <div class="skel skel-line" style="width:40%;height:22px"></div><div class="skel skel-line" style="width:70%"></div>
  <div class="skel" style="height:150px;border-radius:var(--vx-r-lg)"></div></div>${skeletonGrid(4)}`;
  var btn = (label, cls = "vx-btn--primary", attrs = "") => `<button class="vx-btn ${cls}" type="button" ${attrs}><span class="vx-btn__label">${label}</span></button>`;
  var link = (label, href, cls = "vx-btn--secondary") => `<a class="vx-btn ${cls}" href="${href}"><span class="vx-btn__label">${label}</span></a>`;
  function success(button, text, after) {
    const label = button.querySelector(".vx-btn__label"), original = label.innerHTML;
    button.dataset.state = "done";
    label.innerHTML = ico("check", "ico--sm") + esc(text);
    setTimeout(() => {
      if (after) {
        after();
        return;
      }
      label.innerHTML = original;
      button.removeAttribute("data-state");
    }, 1200);
  }
  var toastT;
  function toast(msg, opts = {}) {
    const el = document.querySelector("[data-toast-out]");
    el.classList.toggle("has-action", !!opts.action);
    if (opts.action) {
      el.innerHTML = `<span>${esc(msg)}</span><button class="toast__act" type="button">${esc(opts.action)}</button>`;
      el.querySelector("button").addEventListener("click", () => {
        clearTimeout(toastT);
        el.classList.remove("is-on", "has-action");
        if (opts.onAction) opts.onAction();
      }, { once: true });
    } else el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove("is-on", "has-action"), opts.action ? 5e3 : 2800);
  }
  var io;
  function reveal(root) {
    const items = root.querySelectorAll(".reveal:not(.is-visible)");
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-visible"));
      return;
    }
    io = io || new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }), { threshold: 0.1 });
    items.forEach((i) => io.observe(i));
  }
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t.tagName === "IMG" && t.hasAttribute("data-fallback") && !t.dataset.broken) {
      t.dataset.broken = "1";
      const box = t.closest(".pcard__media, .row__thumb, .pd-media, .store-card__logo, .prov__logo, .niche-row__ico, .profile__ava, .order-thumb");
      if (!box) return;
      if (box.dataset.initials) {
        box.insertAdjacentText("beforeend", box.dataset.initials);
        return;
      }
      if (box.classList.contains("prov__logo")) {
        box.classList.add("prov__mono");
        box.textContent = (box.closest(".prov").querySelector(".prov__name") || {}).textContent?.slice(0, 2).toUpperCase() || "";
        return;
      }
      if (!box.querySelector(".pcard__noimg")) box.insertAdjacentHTML("beforeend", `<span class="pcard__noimg">${ico(box.classList.contains("niche-row__ico") ? "grid" : "image")}</span>`);
    }
  }, true);
  var opener = null;
  function openSheet(html, from) {
    const layer2 = document.querySelector("[data-layer]"), sheet = document.querySelector("[data-sheet]");
    opener = from || document.activeElement;
    sheet.innerHTML = '<span class="sheet__grab" aria-hidden="true"></span>' + html;
    layer2.classList.remove("is-closing");
    layer2.hidden = false;
    setTimeout(() => (sheet.querySelector("[data-autofocus]") || sheet).focus({ preventScroll: true }), 30);
    return sheet;
  }
  function closeSheet() {
    const layer2 = document.querySelector("[data-layer]");
    if (layer2.hidden) return;
    layer2.classList.add("is-closing");
    setTimeout(() => {
      layer2.hidden = true;
      layer2.classList.remove("is-closing");
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }, reduce ? 0 : 300);
  }

  // assets/js/router.js
  var ROOTS = /* @__PURE__ */ new Set(["inicio", "categorias", "carrito", "cuenta"]);
  var TAB_OF = { inicio: "inicio", categorias: "categorias", n: "categorias", carrito: "carrito", pago: "carrito", pedido: "carrito", cuenta: "cuenta", pedidos: "cuenta", favoritos: "cuenta", login: "cuenta", registro: "cuenta" };
  var TAB_INDEX = { inicio: 0, categorias: 1, carrito: 2, cuenta: 3 };
  function parse(hash) {
    const h = (hash || "").replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const [view, ...rest] = path.split("/");
    return { view: view || "inicio", param: decodeURIComponent(rest.join("/") || ""), query: Object.fromEntries(new URLSearchParams(qs || "")) };
  }
  function createRouter({ views: views2, host: host2, bar: bar2, app: app2, onRoute }) {
    let hist = [], pushes = 0, current = null, token2 = 0, curTab = "inicio", booted = false;
    const scrolls = {}, cleanups = [];
    function setTab(t) {
      bar2.querySelectorAll("[data-tab]").forEach((b) => {
        const on = b.dataset.tab === t;
        b.classList.toggle("tab--on", on);
        if (on) b.setAttribute("aria-current", "page");
        else b.removeAttribute("aria-current");
      });
      bar2.querySelector(".tabbar__pill").style.setProperty("--i", TAB_INDEX[t] || 0);
    }
    async function render(dir) {
      const r = parse(location.hash);
      const V = views2[r.view] || views2.inicio;
      const my = ++token2;
      cleanups.splice(0).forEach((fn) => {
        try {
          fn();
        } catch (e) {
        }
      });
      if (current && host2.firstChild) scrolls[current] = host2.firstChild.scrollTop;
      current = location.hash || "#/inicio";
      const el = document.createElement("section");
      el.className = "screen" + (V.cls ? " " + V.cls : "") + (booted && !reduce && dir !== "none" ? dir === "back" ? " is-back" : " is-enter" : "");
      el.innerHTML = skeletonScreen();
      host2.replaceChildren(el);
      if (ROOTS.has(r.view)) curTab = r.view;
      else if (TAB_OF[r.view]) curTab = TAB_OF[r.view];
      setTab(curTab);
      const hideBar = !!V.noBar;
      bar2.toggleAttribute("data-hidden", hideBar);
      app2.setAttribute("data-bar", hideBar ? "off" : "on");
      let html;
      try {
        html = await V.render(r.param, r.query);
      } catch (e) {
        console.error(e);
        html = views2.error.render(e);
      }
      if (my !== token2) return;
      el.innerHTML = html;
      const ctx = { onCleanup: (fn) => cleanups.push(fn), rerender: () => rerender() };
      if (V.mount) {
        try {
          await V.mount(el, r.param, r.query, ctx);
        } catch (e) {
          console.error(e);
        }
      }
      if (dir === "back" && scrolls[current]) el.scrollTop = scrolls[current];
      reveal(el);
      document.title = "VEXBIZ · " + (V.title ? V.title(r.param, el) : "Inicio");
      if (booted) {
        const f = el.querySelector("[data-focus]");
        if (f) f.focus({ preventScroll: true });
      }
      booted = true;
      onRoute && onRoute(r);
    }
    async function rerender() {
      const st = host2.firstChild ? host2.firstChild.scrollTop : 0;
      await render("none");
      if (host2.firstChild) host2.firstChild.scrollTop = st;
    }
    function go(hash, replace) {
      if (replace) {
        if (hist.length) hist.pop();
        location.replace(hash);
      } else if (location.hash === hash) rerender();
      else location.hash = hash;
    }
    function back() {
      if (pushes > 0) history.back();
      else go(hist.length > 1 ? hist[hist.length - 2] : "#/inicio");
    }
    window.addEventListener("hashchange", () => {
      const h = location.hash || "#/inicio", r = parse(h);
      let dir = "push";
      if (hist.length > 1 && hist[hist.length - 2] === h) {
        hist.pop();
        dir = "back";
        pushes = Math.max(0, pushes - 1);
      } else if (ROOTS.has(r.view) && !Object.keys(r.query).length) {
        hist = [h];
        pushes++;
      } else {
        hist.push(h);
        pushes++;
      }
      render(dir);
    });
    function start() {
      if (!location.hash) location.replace("#/inicio");
      const r = parse(location.hash);
      hist = ROOTS.has(r.view) ? [location.hash] : ["#/inicio", location.hash];
      render("none");
    }
    return { start, go, back, rerender, get tab() {
      return curTab;
    } };
  }

  // assets/js/nav.js
  var nav = { go: (h) => {
    location.hash = h;
  }, back: () => history.back(), rerender: () => {
  } };

  // assets/js/pwa.js
  var deferred = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    toast("VEXBIZ quedó instalada en tu teléfono");
  });
  var install = {
    available: () => !!deferred && !matchMedia("(display-mode: standalone)").matches,
    async prompt() {
      if (!deferred) return false;
      deferred.prompt();
      const { outcome } = await deferred.userChoice.catch(() => ({ outcome: "dismissed" }));
      deferred = null;
      return outcome === "accepted";
    }
  };
  function registerSW() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const w = reg.installing;
        w && w.addEventListener("statechange", () => {
          if (w.state === "installed" && navigator.serviceWorker.controller) {
            const el = document.querySelector("[data-toast-out]");
            toast("Hay una versión nueva de VEXBIZ. Toca aquí para actualizar.");
            el.style.pointerEvents = "auto";
            el.onclick = () => {
              w.postMessage("skip-waiting");
            };
          }
        });
      });
    }).catch((e) => console.warn("[vexbiz] SW no registrado:", e.message));
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!reloaded) {
        reloaded = true;
        location.reload();
      }
    });
  }
  function watchNetwork() {
    window.addEventListener("offline", () => toast("Sin conexión: ves el catálogo guardado en el teléfono"));
    window.addEventListener("online", () => toast("Conexión recuperada"));
  }

  // assets/js/auth.js
  var RENEW_MARGIN = 60;
  var token = "";
  var identity = null;
  var timer = null;
  var renewing = null;
  var listeners2 = /* @__PURE__ */ new Set();
  var emit2 = () => listeners2.forEach((fn) => {
    try {
      fn(identity);
    } catch (e) {
    }
  });
  var STATUS = {
    created: "Pendiente de pago",
    pending_payment: "Pendiente de pago",
    payment_failed: "Pago rechazado",
    paid: "Pagado",
    in_transit: "En camino",
    delivered: "Entregado",
    cancelled: "Cancelado"
  };
  var STATUS_TONE = { created: "warning", pending_payment: "warning", payment_failed: "danger", paid: "success", in_transit: "info", delivered: "success", cancelled: "neutral" };
  var AuthError = class extends Error {
    constructor(status, code, detail) {
      super(detail || code || "Error " + status);
      this.status = status;
      this.code = code || "";
      this.detail = detail || "";
    }
  };
  var DEMO = CONFIG.authBase === null;
  var DEMO_KEY = "vx-demo-session";
  var demoSave = (id) => {
    try {
      if (id) sessionStorage.setItem(DEMO_KEY, JSON.stringify(id));
      else sessionStorage.removeItem(DEMO_KEY);
    } catch (e) {
    }
  };
  var demoLoad = () => {
    try {
      return JSON.parse(sessionStorage.getItem(DEMO_KEY) || "null");
    } catch (e) {
      return null;
    }
  };
  var cap2 = (w) => w ? w.charAt(0).toUpperCase() + w.slice(1) : "";
  var nameFromEmail = (email) => {
    const p = String(email).split("@")[0].replace(/[^a-záéíóúñ]/gi, " ").trim().split(/\s+/);
    return [cap2(p[0]) || "Carlos", cap2(p[1] || "")].join(" ").trim();
  };
  var pause = (ms) => new Promise((r) => setTimeout(r, ms));
  var demoPending = null;
  function demoOrders() {
    const d = (n) => new Date(Date.now() - n * 864e5).toISOString();
    return [
      { order_number: "VE-DEMO-3", store_name: "Refrihogar", created_at: d(2), currency: "USD", total: 184.5, reported: 0, item_count: 3, status: "pending_payment", image: "" },
      { order_number: "VE-DEMO-2", store_name: "Total Herramientas", created_at: d(16), currency: "USD", total: 42, reported: 42, item_count: 1, status: "in_transit", image: "" },
      { order_number: "VE-DEMO-1", store_name: "MAXIFARMA", created_at: d(40), currency: "USD", total: 19.9, reported: 19.9, item_count: 2, status: "delivered", image: "" }
    ];
  }
  async function demoCall(path, { body = {} } = {}) {
    await pause(path === "/auth/me" || path === "/auth/refresh" ? 120 : 850);
    const ok = (identity2) => ({ access_token: "demo", expires_in: 0, identity: identity2 });
    switch (path) {
      case "/auth/login": {
        const e = String(body.email || "").toLowerCase();
        if (e.includes("bloquead")) throw new AuthError(423, "auth.account_locked");
        if (e.includes("sinclave")) throw new AuthError(409, "auth.password_not_set");
        if (e.includes("error") || body.password === "error") throw new AuthError(401, "auth.invalid_credentials");
        const id = { full_name: nameFromEmail(e), email: e, areas: ["account", "purchases"] };
        if (e.includes("2fa")) {
          demoPending = id;
          return { two_factor_required: true, ticket: "demo" };
        }
        return ok(id);
      }
      case "/auth/2fa/verify":
        if (String(body.code).trim() !== "123456" || !demoPending) throw new AuthError(422, "auth.invalid_code", "Ese código no es válido.");
        return ok(demoPending);
      case "/auth/register": {
        const e = String(body.email || "").toLowerCase();
        if (e.includes("existe")) throw new AuthError(409, "auth.email_taken", "Ya hay una cuenta con ese correo. Inicia sesión o recupera tu contraseña.");
        return ok({ full_name: `${body.first_name} ${body.last_name}`.trim(), email: e, areas: ["account", "purchases"] });
      }
      case "/auth/refresh": {
        const id = demoLoad();
        if (!id) throw new AuthError(401, "auth.no_session");
        return ok(id);
      }
      case "/auth/me":
        return identity;
      case "/auth/logout":
        demoSave(null);
        return {};
      case "/account-api/v1/orders":
        return { data: demoOrders(), next_cursor: "" };
      default:
        throw new AuthError(404, "demo.not_found");
    }
  }
  async function call(path, opts = {}) {
    if (DEMO) return demoCall(path, opts);
    const { method = "GET", body, params: params2 } = opts;
    let url = CONFIG.authBase + path;
    if (params2) {
      const q = new URLSearchParams(Object.entries(params2).filter(([, v]) => v !== "" && v != null));
      if ([...q].length) url += "?" + q;
    }
    const headers = { Accept: "application/json", "X-Tenant-Code": CONFIG.tenant };
    if (body !== void 0) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = "Bearer " + token;
    let r;
    try {
      r = await fetch(url, { method, headers, credentials: "include", body: body === void 0 ? void 0 : JSON.stringify(body) });
    } catch (e) {
      throw new AuthError(0, "network");
    }
    let j = null;
    try {
      j = await r.json();
    } catch (e) {
    }
    if (!r.ok) {
      const err = j && j.error || j || {};
      throw new AuthError(r.status, err.code, typeof err.detail === "string" ? err.detail : err.message || "");
    }
    return j;
  }
  function adopt(res) {
    token = res.access_token || "";
    clearTimeout(timer);
    if (token && res.expires_in) timer = setTimeout(() => {
      timer = null;
      if (token) renew().catch(() => {
      });
    }, Math.max(res.expires_in - RENEW_MARGIN, 30) * 1e3);
  }
  function forget() {
    token = "";
    clearTimeout(timer);
    timer = null;
  }
  async function loadMe(fallback) {
    if (DEMO) {
      identity = fallback || demoLoad();
      demoSave(identity);
      emit2();
      return identity;
    }
    try {
      const me = await call("/auth/me");
      identity = me && me.data || me || fallback || null;
    } catch (e) {
      identity = fallback || null;
    }
    emit2();
    return identity;
  }
  function renew() {
    if (renewing) return renewing;
    renewing = call("/auth/refresh", { method: "POST", body: {} }).then((res) => {
      adopt(res);
      if (res.identity && !identity) {
        identity = res.identity;
        emit2();
      }
      return token;
    }).catch((e) => {
      forget();
      if (identity) {
        identity = null;
        emit2();
      }
      throw e;
    }).finally(() => {
      renewing = null;
    });
    return renewing;
  }
  var hasHint = () => DEMO ? !!demoLoad() : /(?:^|;\s*)vexbiz_user_activa=1/.test(document.cookie);
  var booting = null;
  var auth = {
    available: () => true,
    demo: () => DEMO,
    user: () => identity,
    signedIn: () => !!identity && !!token,
    firstName() {
      const n = identity && (identity.full_name || identity.name) || "";
      return n.trim().split(/\s+/)[0] || (identity && identity.email || "").split("@")[0] || "";
    },
    subscribe(fn) {
      listeners2.add(fn);
      return () => listeners2.delete(fn);
    },
    /* Al abrir la app: si el sitio dejó la pista de sesión, renueva y trae la identidad. */
    boot() {
      if (booting) return booting;
      booting = !hasHint() ? Promise.resolve(null) : call("/auth/refresh", { method: "POST", body: {} }).then((res) => {
        adopt(res);
        return loadMe(res.identity);
      }).catch(() => {
        forget();
        return null;
      });
      return booting;
    },
    /* Devuelve {twoFactor:true, ticket} o {ok:true}. Lanza AuthError. */
    async login(email, password) {
      const res = await call("/auth/login", { method: "POST", body: { email, password } });
      if (res.two_factor_required) return { twoFactor: true, ticket: res.ticket || "" };
      adopt(res);
      await loadMe(res.identity);
      return { ok: true };
    },
    async verify(ticket, code) {
      const res = await call("/auth/2fa/verify", { method: "POST", body: { ticket, code } });
      adopt(res);
      await loadMe(res.identity);
      return { ok: true };
    },
    /* Alta de cuenta. En la app real el alta se hace en ve.vexbiz.com/register (endpoint no confirmado),
       así que solo el modo demostración la resuelve aquí. */
    async register(data) {
      if (!DEMO) throw new AuthError(0, "auth.register_on_site");
      const res = await call("/auth/register", { method: "POST", body: data });
      adopt(res);
      await loadMe(res.identity);
      return { ok: true };
    },
    async logout() {
      try {
        await call("/auth/logout", { method: "POST", body: {} });
      } catch (e) {
      }
      forget();
      identity = null;
      emit2();
    },
    /* Compras reales de la cuenta (paginadas por cursor). */
    async orders(cursor = "", limit = 10) {
      const run = () => call("/account-api/v1/orders", { params: { cursor, limit } });
      let r;
      try {
        r = await run();
      } catch (e) {
        if (e.status !== 401) throw e;
        await renew();
        r = await run();
      }
      return { items: r && r.data || [], next: r && r.next_cursor || "" };
    },
    leftToPay(o) {
      if (!["created", "pending_payment", "payment_failed"].includes(o.status)) return 0;
      return Math.max(0, Math.round(((o.total || 0) - (o.reported || 0)) * 100) / 100);
    },
    /* Mismo texto que el formulario del sitio para cada código de error. */
    message(e) {
      switch (e && e.code) {
        case "auth.invalid_credentials":
          return { error: "Correo o contraseña incorrectos." };
        case "auth.account_locked":
          return { notice: "Bloqueamos la cuenta un rato por demasiados intentos. Prueba de nuevo en unos minutos." };
        case "auth.password_not_set":
          return { notice: "Todavía no has creado tu contraseña. Pídenos el enlace desde «¿Olvidaste tu contraseña?»." };
        case "auth.no_tenant_access":
          return { notice: "Tu cuenta no participa en Venezuela todavía." };
        default:
          return { error: e && e.status === 0 ? "No hay conexión. Comprueba tu red e inténtalo otra vez." : e && e.detail || "No pudimos entrar. Inténtalo otra vez." };
      }
    }
  };

  // assets/js/views/home.js
  var selected = "todo";
  var TRUST_ICON = { truck: "truck", returns: "swap", shield: "shield", headset: "help" };
  function nicheEmpty(n) {
    if (!n) return "";
    if (n.count > 0) return empty(
      "store",
      "Catálogo en crecimiento",
      `${n.name} tiene ${plural(n.count, "producto", "productos")} en VEXBIZ. Nuevos proveedores cada semana.`,
      `<a class="vx-btn vx-btn--secondary" href="#/n/${esc(n.id)}"><span class="vx-btn__label">Ver ${esc(n.name)}</span></a>`
    );
    return empty(
      "box",
      `Todavía sin catálogo en ${esc(n.name)}`,
      "Los proveedores de este nicho están cargando sus productos.",
      btn("Avísame cuando haya", "vx-btn--secondary", "data-notify")
    );
  }
  async function railProducts(niche, home) {
    const order = niche === "todo" ? ["ref", "aut", "fer", "ind"] : [niche];
    const ids = order.flatMap((k) => home.bestSellers[k] || []);
    let items = await api.byIds(ids);
    if (items.length < 8) {
      const more = (await api.search({ niche, cursor: 0 })).items.filter((p) => !items.some((x) => x.id === p.id));
      items = items.concat(more).slice(0, 8);
    }
    return items;
  }
  var home_default = {
    title: () => "Inicio",
    async render() {
      const [niches, home, stores2] = await Promise.all([api.niches(), api.home(), api.stores()]);
      const map = new Map(niches.map((n) => [n.id, n]));
      const tabs = ["todo", ...CONFIG.homeNiches.filter((id) => map.has(id))];
      const trust = (home.trust || []).slice(0, 4);
      const pickIds = ["ref", "fer", "aut"].map((k) => (home.bestSellers[k] || [])[0]).filter(Boolean);
      const feats = pickIds.length ? await api.byIds(pickIds) : [];
      const art = (i, icon) => {
        const p = feats[i], src = p && p.images && p.images[0];
        return `<span class="banner__art" aria-hidden="true">${src ? img(src, "", i === 0 ? 'fetchpriority="high"' : "", 200) : ico(icon)}</span>`;
      };
      const banner = (tag, attrs, cls, kicker, title, sub, cta, artHtml) => `<${tag} class="banner${cls}" ${attrs}><span class="banner__copy"><span class="banner__kicker">${kicker}</span><span class="banner__title">${title}</span><span class="banner__sub">${sub}</span><span class="banner__cta">${cta}${ico("chev-r")}</span></span>${artHtml}</${tag}>`;
      return `<div class="home">
      <header class="hero">
        <div class="hero__bar">
          ${auth.signedIn() ? `<a class="avatar avatar--in" href="#/cuenta" aria-label="Hola, ${esc(auth.firstName())} · Mi cuenta">${esc(initials((auth.user() || {}).full_name || auth.firstName()))}</a>` : `<a class="avatar" href="${auth.available() ? "#/login?next=%23%2Finicio" : "#/cuenta"}" aria-label="${auth.available() ? "Iniciar sesión" : "Mi cuenta"}">${ico("user")}</a>`}
          <a class="searchfield" href="#/buscar">${ico("search")}<span>Buscar en <span translate="no">VEXBIZ</span>…</span></a>
          <a class="iconbtn" href="#/pedidos" aria-label="Mis pedidos">${ico("bell")}</a>
        </div>
        ${auth.signedIn() ? `<p class="hero__hello">Hola, <b>${esc(auth.firstName())}</b></p>` : ""}<h1 class="sr" tabindex="-1" data-focus>Inicio</h1>
        <button class="loc" type="button" data-open="loc" aria-haspopup="dialog">${ico("pin", "ico--sm")}<span>Enviar a <b data-city>${esc(prefs.city())}</b></span>${ico("chev-d", "ico--xs")}</button>
        <div class="niches" role="tablist" aria-label="Nichos" data-niches>
          ${tabs.map((id) => `<button class="niche" role="tab" type="button" data-niche="${id}" aria-selected="${selected === id}" tabindex="${selected === id ? 0 : -1}">${id === "todo" ? "Todo" : esc(map.get(id).name)}</button>`).join("")}
        </div>
        <section class="banners" aria-roledescription="carrusel" aria-label="Promociones">
          <div class="banners__track" data-banners tabindex="0" aria-label="Promociones, desliza para ver más">
            ${banner("a", 'href="#/categorias"', "", "Marketplace", "Todo para tu negocio en un solo lugar", "Repuestos, equipos y suministros de tiendas verificadas.", "Explorar categorías", art(0, "grid"))}
            ${banner("button", 'type="button" data-toast="Técnicos certificados: instalación, mantenimiento y reparación"', "", "Servicios", "Técnicos certificados cerca de ti", "Instalación, mantenimiento y reparación con homologación verificada.", "Conocer técnicos", art(1, "tools"))}
            ${banner("button", 'type="button" data-toast="Vender en VEXBIZ: registro de proveedor en ve.vexbiz.com"', " banner--ink", "Para proveedores", 'Vende en <span translate="no">VEXBIZ</span>', "Sin cuota de entrada: pagas una comisión solo sobre lo que vendes.", "Publicar mi catálogo", art(2, "store"))}
          </div>
          <div class="dots" data-dots>${[1, 2, 3].map((n) => `<button class="dot" type="button" aria-label="Promoción ${n} de 3"${n === 1 ? ' aria-current="true"' : ""}></button>`).join("")}${reduce ? "" : `<button class="dots__pause" type="button" data-pause aria-pressed="false" aria-label="Pausar el movimiento de las promociones">${ico("pause")}</button>`}</div>
        </section>
      </header>
      <div class="band-ticker" data-ticker>
        <button class="band" type="button" data-toast="${esc(home.academy && home.academy.title || "Academia VEXBIZ")}"><span class="band__title">Academia</span><img class="band__logo" src="assets/img/logo-oscuro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Aprende con nosotros y descubre más</span>${ico("chev-r")}</button>
        <button class="band band--alt" type="button" aria-hidden="true" tabindex="-1" data-toast="Técnicos certificados con homologación verificada"><span class="band__title">Técnicos certificados</span><img class="band__logo" src="assets/img/logo-claro.webp" width="46" height="18" alt="VEXBIZ"><span class="band__text">Homologación verificada</span>${ico("chev-r")}</button>
      </div>
      <section class="sec" aria-labelledby="t-prov"><div class="sec__head"><h2 class="sec__title" id="t-prov">Proveedores certificados</h2><a class="seeall" href="#/tiendas">Ver todo${ico("chev-r")}</a></div><div class="rail" data-providers></div></section>
      <section class="sec" aria-labelledby="t-exp"><div class="sec__head"><h2 class="sec__title" id="t-exp">Explora por interés</h2><a class="seeall" href="#/n/todo" data-seeall>Ver todo${ico("chev-r")}</a></div><div class="rail" data-products></div></section>
      ${home.brands && home.brands.length ? `<section class="sec" aria-labelledby="t-brands"><div class="sec__head"><h2 class="sec__title" id="t-brands">Marcas en VEXBIZ</h2></div>
        <div class="rail">${home.brands.slice(0, 10).map((b) => `<a class="brand-chip reveal" href="#/buscar?q=${encodeURIComponent(b.name)}"><span class="brand-chip__name" translate="no">${esc(b.name)}</span><span class="brand-chip__count">${plural(b.products, "producto", "productos")}</span></a>`).join("")}</div></section>` : ""}
      ${trust.length ? `<section class="sec" aria-label="Por qué comprar en VEXBIZ"><div class="trust-strip">${trust.map((t) => `<div class="trust-item">${ico(TRUST_ICON[t.icon] || "check-circle")}<span><b>${esc(t.title)}</b><span>${esc(t.detail)}</span></span></div>`).join("")}</div></section>` : ""}
    </div>`;
    },
    async mount(el, _p, _q, ctx) {
      const [niches, home, stores2] = await Promise.all([api.niches(), api.home(), api.stores()]);
      const map = new Map(niches.map((n) => [n.id, n]));
      const certified = stores2.filter((s) => s.verified && s.count > 0).sort((a, b) => b.count - a.count);
      const cover = (s) => /refrihogar/i.test(s.name) ? "assets/img/prov-refrihogar.webp" : "";
      async function rails() {
        const n = map.get(selected);
        const provs = certified.filter((s) => selected === "todo" || !n || s.niche === n.name);
        el.querySelector("[data-providers]").innerHTML = provs.length ? provs.map((s) => provCard(s, cover(s))).join("") : `<div style="flex:1;margin-inline:calc(var(--app-gutter) * -1)">${empty("shield", `Sin proveedores certificados en ${esc(n ? n.name : "")}`, "Estamos homologando tiendas de este nicho.")}</div>`;
        const items = selected === "todo" || n && n.count > 0 ? await railProducts(selected, home) : [];
        el.querySelector("[data-products]").innerHTML = items.length ? items.map(pcard).join("") : `<div style="flex:1;margin-inline:calc(var(--app-gutter) * -1)">${nicheEmpty(n)}</div>`;
        el.querySelector("[data-seeall]").setAttribute("href", "#/n/" + selected);
        reveal(el);
      }
      await rails();
      const tabs = el.querySelector("[data-niches]");
      tabs.addEventListener("click", (e) => {
        const b = e.target.closest("[data-niche]");
        if (!b) return;
        selected = b.dataset.niche;
        tabs.querySelectorAll("[data-niche]").forEach((x) => {
          const on = x === b;
          x.setAttribute("aria-selected", on);
          x.tabIndex = on ? 0 : -1;
        });
        b.scrollIntoView({ inline: "nearest", block: "nearest", behavior: reduce ? "auto" : "smooth" });
        rails();
      });
      tabs.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const all = [...tabs.querySelectorAll("[data-niche]")], i = all.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        const nx = all[(i + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
        nx.focus();
        nx.click();
      });
      const sel = tabs.querySelector('[aria-selected="true"]');
      if (sel) sel.scrollIntoView({ inline: "nearest", block: "nearest" });
      const track = el.querySelector("[data-banners]"), dots = [...el.querySelectorAll("[data-dots] .dot")];
      let cur = 0, auto;
      const goB = (i) => {
        cur = (i + dots.length) % dots.length;
        track.scrollTo({ left: track.children[cur].offsetLeft - track.children[0].offsetLeft, behavior: reduce ? "auto" : "smooth" });
      };
      track.addEventListener("scroll", () => {
        const w = track.children[0].getBoundingClientRect().width + 12, i = Math.round(track.scrollLeft / w);
        if (dots[i] && (i !== cur || !dots[i].hasAttribute("aria-current"))) {
          cur = i;
          dots.forEach((d, k) => k === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
        }
      }, { passive: true });
      dots.forEach((d, k) => d.addEventListener("click", () => {
        goB(k);
        restart();
      }));
      let paused = false;
      const restart = () => {
        clearInterval(auto);
        if (!reduce && !paused) auto = setInterval(() => {
          if (!track.contains(document.activeElement) && document.visibilityState === "visible") goB(cur + 1);
        }, 4500);
      };
      ["pointerdown", "focusin", "wheel"].forEach((ev) => track.addEventListener(ev, restart, { passive: true }));
      restart();
      const bands = el.querySelectorAll("[data-ticker] .band");
      let bi = 0;
      const ticker = el.querySelector("[data-ticker]");
      let hold = false;
      ["pointerenter", "focusin"].forEach((ev) => ticker.addEventListener(ev, () => {
        hold = true;
      }));
      ["pointerleave", "focusout"].forEach((ev) => ticker.addEventListener(ev, () => {
        hold = false;
      }));
      const tick = reduce ? null : setInterval(() => {
        if (paused || hold) return;
        bi = (bi + 1) % bands.length;
        bands.forEach((b, k) => {
          const on = k === bi;
          b.setAttribute("aria-hidden", on ? "false" : "true");
          b.tabIndex = on ? 0 : -1;
        });
      }, 4e3);
      const pb = el.querySelector("[data-pause]");
      if (pb) pb.addEventListener("click", () => {
        paused = !paused;
        pb.setAttribute("aria-pressed", String(paused));
        pb.setAttribute("aria-label", paused ? "Reanudar el movimiento de las promociones" : "Pausar el movimiento de las promociones");
        pb.querySelector("use").setAttribute("href", "#i-" + (paused ? "play" : "pause"));
        restart();
      });
      ctx.onCleanup(() => {
        clearInterval(auto);
        clearInterval(tick);
      });
    }
  };

  // assets/js/views/product.js
  var product_default = {
    cls: "screen--action",
    noBar: true,
    title: (_id, el) => el && el.querySelector(".pd__name") ? el.querySelector(".pd__name").textContent : "Producto",
    async render(id) {
      const p = await api.product(id);
      if (!p) return topbar("Producto") + empty("alert", "Este producto ya no está disponible", "Puede que la tienda lo haya retirado del catálogo.", link("Ir a Inicio", "#/inicio"));
      const s = storeOf(p.store) || await api.store(p.store) || { id: p.store, name: "Tienda", count: 0 };
      const niches = await api.niches();
      const niche = niches.find((n) => n.id === p.niche);
      const offers = p.offers && p.offers.length ? p.offers : [{ store: p.store, price: p.price, stock: p.stock, av: p.availability, sku: p.sku, city: p.city }];
      const imgs = (p.images || []).length ? p.images : [""];
      const [moreStore, related] = await Promise.all([api.search({ store: p.store, cursor: 0 }), api.related(p, 10)]);
      const others = moreStore.items.filter((x) => x.id !== p.id).slice(0, 10);
      const attrs = [["Marca", p.brand], ["Modelo", p.model], ["Categoría", p.category], ["Referencia", p.sku], ...p.attrs || []].filter(([, v]) => v && String(v).trim());
      const max = Math.max(1, Math.min(p.stock || 1, 99)), buy = canBuy(p);
      return topbar(esc(niche ? niche.name : "Producto"), favBtn(p, "iconbtn"), "p") + `<div class="gallery" aria-label="Fotos del producto">${imgs.map((u, i) => `<div class="pd-media">${u ? img(u, i ? "" : p.name) : `<span class="pcard__noimg">${ico("image")}</span>`}</div>`).join("")}</div>
      <div class="pd">
        <div class="pd__badges">${stock(p, true)}${p.condition === "new" ? '<span class="vx-status vx-status--neutral">Nuevo</span>' : ""}</div>
        ${p.brand ? `<span class="pd__brand" translate="no">${esc(p.brand)}</span>` : ""}
        <h1 class="pd__name" tabindex="-1" data-focus>${esc(p.name)}</h1>
        <div class="pd__price${p.price > 0 ? "" : " pd__price--ask"}">${priceLabel(p)}<small>${p.price > 0 ? "Precio en dólares (USD), con IVA. El envío se confirma con la tienda." : "La tienda publicó este producto sin precio. Pregúntale antes de comprar."}</small></div>
        ${p.stock > 0 && p.stock <= 5 ? `<p class="pd__note">${p.stock === 1 ? "Queda 1 unidad" : `Quedan ${p.stock} unidades`} en ${esc(s.name)}.</p>` : ""}
        ${storeCard(s, p.city ? "Despacha desde " + p.city : "")}
        <div class="facts">
          <div class="fact">${ico("truck")}<b>Envío o retiro</b><span>Lo eliges por tienda al pagar</span></div>
          <div class="fact">${ico("clock")}<b>Reserva 8 h</b><span>Mientras verifican tu pago</span></div>
          <div class="fact">${ico("doc")}<b>Factura</b><span>Fiscal con RIF o nota de entrega</span></div>
        </div>
      </div>
      ${offers.length > 1 ? `<section class="sec sec--pd" aria-labelledby="t-off"><div class="sec__head"><h2 class="sec__title" id="t-off">${plural(offers.length, "tienda lo vende", "tiendas lo venden")}</h2></div>
        <p class="sec__meta">Ordenadas por precio. El costo de envío lo confirma cada tienda.</p>
        <fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin:8px var(--app-gutter) 0;min-width:0"><legend class="sr">Elige a qué tienda comprar</legend>
        ${offers.map((o, i) => `<label class="offer"><input type="radio" name="offer" value="${i}" ${i === 0 ? "checked" : ""}><span class="row__body"><span class="row__title">${esc((storeOf(o.store) || {}).name || o.storeName || "Tienda")}</span><span class="row__sub">${esc([o.city, o.stock ? plural(o.stock, "unidad", "unidades") : ""].filter(Boolean).join(" · "))}</span></span><span class="offer__price">${o.price > 0 ? money(o.price) : "Consultar"}</span></label>`).join("")}
        </fieldset></section>` : ""}
      ${attrs.length ? `<section class="sec sec--pd" aria-labelledby="t-spec"><div class="sec__head"><h2 class="sec__title" id="t-spec">Características</h2></div>
        <dl class="specs">${attrs.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></section>` : ""}
      ${p.desc && p.desc.toLowerCase() !== p.raw.toLowerCase() ? `<section class="sec sec--pd" aria-labelledby="t-desc"><div class="sec__head"><h2 class="sec__title" id="t-desc">Descripción</h2></div><p class="desc">${esc(p.desc)}</p></section>` : ""}
      ${(p.compat || []).length ? `<section class="sec sec--pd" aria-labelledby="t-comp"><div class="sec__head"><h2 class="sec__title" id="t-comp">Compatible con</h2></div><div class="chips">${p.compat.map((c) => `<span class="chip">${esc(typeof c === "string" ? c : c.name || JSON.stringify(c))}</span>`).join("")}</div></section>` : ""}
      ${others.length ? `<section class="sec sec--pd" aria-labelledby="t-more"><div class="sec__head"><h2 class="sec__title" id="t-more">Más de ${esc(s.name)}</h2><a class="seeall" href="#/s/${esc(s.id)}">Ver todo${ico("chev-r")}</a></div><div class="rail">${others.map(pcard).join("")}</div></section>` : ""}
      ${related.length ? `<section class="sec sec--pd" aria-labelledby="t-rel"><div class="sec__head"><h2 class="sec__title" id="t-rel">También en ${esc(p.category)}</h2></div><div class="rail">${related.map(pcard).join("")}</div></section>` : ""}
      <div class="actionbar">
        ${buy ? `<div class="step" data-step data-max="${max}"><button type="button" data-dec aria-label="Quitar uno" disabled>${ico("minus", "ico--sm")}</button><output aria-live="polite" aria-label="Cantidad">1</output><button type="button" data-inc aria-label="Agregar uno"${max <= 1 ? " disabled" : ""}>${ico("plus", "ico--sm")}</button></div>
          ${btn(ico("cart", "ico--sm") + "Añadir al carrito", "vx-btn--primary", "data-add")}` : btn(p.price > 0 ? "Agotado" : "Consultar precio a la tienda", "vx-btn--secondary", p.price > 0 ? "disabled" : `data-toast="Escríbele a ${esc(s.name)} desde su tienda en ve.vexbiz.com para pedir el precio"`)}
      </div>`;
    },
    async mount(el, id) {
      const p = await api.product(id);
      if (!p) return;
      const offers = p.offers && p.offers.length ? p.offers : null;
      el.addEventListener("click", (e) => {
        const st = e.target.closest("[data-step]"), b = e.target.closest("[data-inc],[data-dec]");
        if (st && b) {
          const out = st.querySelector("output"), max = +st.dataset.max, v = Math.max(1, Math.min(max, +out.textContent + (b.hasAttribute("data-inc") ? 1 : -1)));
          out.textContent = v;
          st.querySelector("[data-dec]").disabled = v <= 1;
          st.querySelector("[data-inc]").disabled = v >= max;
        }
        const add = e.target.closest("[data-add]");
        if (add && !add.dataset.state) {
          const q = +el.querySelector("[data-step] output").textContent;
          const pick = el.querySelector('input[name="offer"]:checked');
          const offer = offers && pick ? offers[+pick.value] : null;
          const added = cart.add(p, q, offer);
          success(add, added ? "Añadido" : "Ya tienes el máximo");
          if (!added) toast(`No hay más unidades disponibles de este producto`);
        }
      });
    }
  };

  // assets/js/views/catalog.js
  var SORTS = [["rel", "Relevancia"], ["price_asc", "Menor precio"], ["price_desc", "Mayor precio"], ["stock", "Disponibles"]];
  async function syncNote(shown, total) {
    const m = await api.meta();
    if (api.mode === "live" || !total || shown >= total) return "";
    return `<p class="sync-note">${ico("clock")}Selección de ${plural(shown, "producto", "productos")} de ${total.toLocaleString("es-VE")} · catálogo sincronizado el ${shortDate(m.fetchedAt)}</p>`;
  }
  function pager(el, fetchPage) {
    const grid = el.querySelector("[data-grid]"), more = el.querySelector("[data-more]");
    let cursor = null, loading2 = false;
    async function load2(reset) {
      if (loading2) return;
      loading2 = true;
      if (reset) {
        cursor = null;
        grid.innerHTML = skeletonGrid(4).replace(/^<div class="grid">|<\/div>$/g, "");
      }
      more.innerHTML = "";
      const res = await fetchPage(cursor);
      if (reset) grid.innerHTML = "";
      grid.insertAdjacentHTML("beforeend", res.items.map(pcard).join(""));
      cursor = res.cursor;
      const count = el.querySelector("[data-count]");
      if (count) count.textContent = plural(res.total, "producto", "productos");
      more.innerHTML = cursor ? btn("Cargar más", "vx-btn--ghost", "data-loadmore") : "";
      if (!res.total && reset) grid.innerHTML = `<div style="grid-column:1/-1;margin-inline:calc(var(--app-gutter) * -1)">${empty("search", "Sin productos con este filtro", "Prueba con otra categoría o quita el filtro.")}</div>`;
      reveal(el);
      loading2 = false;
      return res;
    }
    more.addEventListener("click", (e) => {
      if (e.target.closest("[data-loadmore]")) load2(false);
    });
    return load2;
  }
  var categorias = {
    title: () => "Categorías",
    async render() {
      const niches = (await api.niches()).slice().sort((a, b) => (b.count > 0) - (a.count > 0) || a.name.localeCompare(b.name, "es"));
      return rootHead("Explora por nichos", `${niches.length} nichos · proveedores homologados por VEXBIZ`, "Inicio / Categorías") + `<div style="padding:0 var(--app-gutter) var(--vx-sp-4)"><label class="searchfield">${ico("search")}<span class="sr">Filtrar nichos</span><input id="niche-filter" name="nicho" type="search" placeholder="Filtrar nichos…" data-filter autocomplete="off"></label></div>
      <div class="list" data-niche-list>${niches.map((n) => `<a class="niche-row" href="#/n/${esc(n.id)}" data-name="${esc(fold(n.name))}">
        <span class="niche-row__ico niche-row__ico--img">${n.image ? img(n.image, "") : ico("grid")}</span>
        <span class="niche-row__body"><span class="niche-row__name">${esc(n.name)}</span><span class="niche-row__meta">${n.count > 0 ? plural(n.count, "producto", "productos") : "Todavía sin catálogo"}</span></span>
        <span class="niche-row__go" aria-hidden="true">${ico("chev-r")}</span></a>`).join("")}</div>
      <p class="sec__meta" data-none hidden style="padding-top:12px">Ningún nicho coincide con ese nombre.</p>`;
    },
    mount(el) {
      const input = el.querySelector("[data-filter]");
      input.addEventListener("input", () => {
        const q = fold(input.value.trim());
        let shown = 0;
        el.querySelectorAll(".niche-row").forEach((r) => {
          const ok = !q || r.dataset.name.includes(q);
          r.hidden = !ok;
          if (ok) shown++;
        });
        el.querySelector("[data-none]").hidden = shown > 0;
      });
    }
  };
  var nicho = {
    title: (_id, el) => (el.querySelector(".topbar__title") || {}).textContent || "Catálogo",
    async render(id, q) {
      const isAll = id === "todo";
      const { niche, categories } = isAll ? { niche: { id: "todo", name: "Todo el catálogo", count: 0 }, categories: [] } : await api.niche(id);
      if (!niche) return topbar("Nicho") + empty("alert", "Este nicho no existe", "Vuelve a Categorías para ver los nichos disponibles.", link("Ver categorías", "#/categorias"));
      const first = await api.search({ niche: id, category: q.cat, sort: q.sort, cursor: 0 });
      const stores2 = (await api.stores()).filter((s) => s.count > 0 && (isAll || s.niche === niche.name));
      const head = topbar(esc(niche.name), `<a class="iconbtn" href="#/buscar" aria-label="Buscar">${ico("search")}</a>`);
      const hero = isAll ? "" : `<div class="niche-hero">${niche.image ? img(niche.image, "") : ""}<div class="niche-hero__body"><h2 class="niche-hero__name">${esc(niche.name)}</h2><span class="niche-hero__meta">${niche.count > 0 ? plural(niche.count, "producto", "productos") : "Todavía sin catálogo"}</span></div></div>`;
      if (!first.total && !q.cat) return head + hero + nicheEmpty(niche);
      const cats = categories.length ? `<div class="chips" role="group" aria-label="Categorías" style="margin-bottom:10px">
      <button class="chip" type="button" data-cat="" aria-pressed="${!q.cat}">Todas</button>
      ${categories.map((c) => `<button class="chip" type="button" data-cat="${esc(c.slug)}" aria-pressed="${q.cat === c.slug}">${esc(c.name)} <span class="chip__count">${c.products}</span></button>`).join("")}</div>` : "";
      const sorts = `<div class="chips" role="group" aria-label="Ordenar" style="margin-bottom:12px">${SORTS.map(([k, l]) => `<button class="chip" type="button" data-sort="${k}" aria-pressed="${(q.sort || "rel") === k}">${l}</button>`).join("")}</div>`;
      const provs = stores2.length ? `<section class="sec" style="margin-bottom:var(--vx-sp-4)" aria-labelledby="t-np"><div class="sec__head"><h2 class="sec__title" id="t-np">Proveedores${isAll ? "" : " de " + esc(niche.name)}</h2></div><div class="stack">${stores2.slice(0, 3).map((s) => storeCard(s)).join("")}</div></section>` : "";
      return head + hero + provs + cats + sorts + await syncNote(first.total, niche.count) + `<p class="sec__meta" style="padding-bottom:12px" data-count>${plural(first.total, "producto", "productos")}</p><div class="grid" data-grid></div><div class="more" data-more></div>`;
    },
    async mount(el, id, q) {
      if (!el.querySelector("[data-grid]")) return;
      const state2 = { cat: q.cat || "", sort: q.sort || "rel" };
      const load2 = pager(el, (cursor) => api.search({ niche: id, category: state2.cat, sort: state2.sort, cursor }));
      el.addEventListener("click", (e) => {
        const c = e.target.closest("[data-cat]"), s = e.target.closest("[data-sort]");
        if (!c && !s) return;
        if (c) {
          state2.cat = c.dataset.cat;
          el.querySelectorAll("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", x === c));
        }
        if (s) {
          state2.sort = s.dataset.sort;
          el.querySelectorAll("[data-sort]").forEach((x) => x.setAttribute("aria-pressed", x === s));
        }
        history.replaceState(null, "", `#/n/${id}?${new URLSearchParams(Object.entries(state2).filter(([, v]) => v && v !== "rel"))}`);
        load2(true);
      });
      await load2(true);
    }
  };
  var tiendas = {
    title: () => "Tiendas",
    async render() {
      const all = (await api.stores()).slice().sort((a, b) => b.count - a.count);
      return topbar("Proveedores y tiendas") + `<p class="sec__meta" style="padding-bottom:12px">${plural(all.length, "tienda verificada", "tiendas verificadas")} por VEXBIZ</p><div class="stack">${all.map((s) => storeCard(s)).join("")}</div>`;
    }
  };
  var tienda = {
    title: (_id, el) => (el.querySelector(".topbar__title") || {}).textContent || "Catálogo",
    async render(id) {
      const s = await api.store(id);
      if (!s) return topbar("Tienda") + empty("store", "No encontramos esta tienda", "Puede que haya cambiado de nombre o ya no venda en VEXBIZ.", link("Ver tiendas", "#/tiendas"));
      const first = await api.search({ store: id, cursor: 0 });
      const hero = `<div class="store-hero"><div class="store-hero__cover store-hero__cover--mono" aria-hidden="true">${storeLogo(s, "store-card__logo store-card__logo--lg")}</div>
      <div class="store-hero__body"><h2 class="store-hero__name" translate="no">${esc(s.name)}</h2>
      <span class="store-hero__meta">${[s.niche, [s.city, s.state].filter(Boolean).join(", "), plural(s.count, "producto", "productos")].filter(Boolean).map(esc).join(" · ")}</span>
      ${s.verified ? `<span class="vx-status">${ico("shield")}Tienda verificada</span>` : ""}</div></div>`;
      if (!first.total) return topbar(esc(s.name)) + hero + empty("box", "Su catálogo se está sumando a la app", `${esc(s.name)} está cargando sus productos.`, btn("Avísame cuando haya", "vx-btn--secondary", "data-notify"));
      return topbar(esc(s.name)) + hero + await syncNote(first.total, s.count) + `<div class="chips" role="group" aria-label="Ordenar" style="margin-bottom:12px">${SORTS.map(([k, l]) => `<button class="chip" type="button" data-sort="${k}" aria-pressed="${k === "rel"}">${l}</button>`).join("")}</div>
      <p class="sec__meta" style="padding-bottom:12px" data-count></p><div class="grid" data-grid></div><div class="more" data-more></div>`;
    },
    async mount(el, id) {
      if (!el.querySelector("[data-grid]")) return;
      let sort = "rel";
      const load2 = pager(el, (cursor) => api.search({ store: id, sort, cursor }));
      el.addEventListener("click", (e) => {
        const s = e.target.closest("[data-sort]");
        if (!s) return;
        sort = s.dataset.sort;
        el.querySelectorAll("[data-sort]").forEach((x) => x.setAttribute("aria-pressed", x === s));
        load2(true);
      });
      await load2(true);
    }
  };
  var buscar = {
    title: () => "Buscar",
    noBar: true,
    render(_p, q) {
      return `<header class="topbar"><button class="iconbtn" type="button" data-back aria-label="Volver">${ico("chev-l")}</button>
      <form class="searchfield" role="search" data-search style="margin-right:8px">${ico("search")}<label class="sr" for="q">Buscar en VEXBIZ</label>
      <input id="q" name="q" type="search" placeholder="Producto, marca, código o tienda…" autocomplete="off" enterkeyhint="search" value="${esc(q.q || "")}" data-focus>
      <button class="iconbtn" type="button" data-clear ${q.q ? "" : "hidden"} aria-label="Borrar búsqueda">${ico("x", "ico--xs")}</button></form></header>
      <div data-results></div>`;
    },
    async mount(el, _p, q) {
      const input = el.querySelector("#q"), out = el.querySelector("[data-results]"), clear = el.querySelector("[data-clear]");
      const niches = await api.niches();
      let timer2, cursor = null, lastQ = "";
      const row2 = (p) => `<a class="row" href="#/p/${esc(p.id)}"><span class="row__thumb">${p.images && p.images[0] ? img(p.images[0], "") : ico("image")}</span>
      <span class="row__body"><span class="row__title">${esc(p.name)}</span><span class="row__sub">${esc([p.brand, storeName(p)].filter(Boolean).join(" · "))}</span></span><span class="row__end">${priceLabel(p)}</span></a>`;
      function idle() {
        const recent = prefs.recent();
        out.innerHTML = (recent.length ? `<div class="sec__head" style="padding-top:8px"><p class="label" style="padding:0">Búsquedas recientes</p><button class="seeall" type="button" data-clear-recent>Borrar</button></div>
        <div class="chips" style="padding-block:12px 16px">${recent.map((r) => `<button class="chip" type="button" data-q="${esc(r)}">${ico("clock", "ico--xs")}${esc(r)}</button>`).join("")}</div>` : "") + `<p class="label">Nichos</p><div class="chips" style="padding-block:12px 16px">${niches.filter((n) => n.count > 0).map((n) => `<a class="chip" href="#/n/${esc(n.id)}">${esc(n.name)} <span class="chip__count">${n.count.toLocaleString("es-VE")}</span></a>`).join("")}</div>
        <p class="label">Prueba con</p><div class="chips" style="padding-block:12px">${["compresor", "termostato", "rodamiento", "Whirlpool", "R134A"].map((t) => `<button class="chip" type="button" data-q="${t}">${t}</button>`).join("")}</div>`;
      }
      async function run(reset) {
        const term = input.value.trim();
        clear.hidden = !term;
        history.replaceState(null, "", term ? "#/buscar?q=" + encodeURIComponent(term) : "#/buscar");
        if (!term) {
          idle();
          return;
        }
        if (reset) {
          cursor = null;
          out.innerHTML = '<div style="padding:0 var(--app-gutter)"><div class="skel skel-row"></div></div>';
        }
        lastQ = term;
        const res = await api.search({ q: term, cursor });
        if (term !== input.value.trim()) return;
        if (!res.total) {
          out.innerHTML = '<div style="padding-top:8px">' + empty("search", `No encontramos “${esc(term)}”`, "Prueba con el código de referencia, la marca o una palabra más corta.") + "</div>";
          return;
        }
        const html = res.items.map(row2).join("");
        if (reset) out.innerHTML = `<p class="sec__meta" style="padding-bottom:8px">${plural(res.total, "resultado", "resultados")}</p><div class="list" data-list>${html}</div><div class="more" data-more></div>`;
        else out.querySelector("[data-list]").insertAdjacentHTML("beforeend", html);
        cursor = res.cursor;
        out.querySelector("[data-more]").innerHTML = cursor ? btn("Cargar más", "vx-btn--ghost", "data-loadmore") : "";
      }
      input.addEventListener("input", () => {
        clearTimeout(timer2);
        timer2 = setTimeout(() => run(true), 180);
      });
      el.querySelector("[data-search]").addEventListener("submit", (e) => {
        e.preventDefault();
        prefs.pushRecent(input.value);
        input.blur();
        run(true);
      });
      clear.addEventListener("click", () => {
        input.value = "";
        run(true);
        input.focus();
      });
      out.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-q]");
        if (chip) {
          input.value = chip.dataset.q;
          prefs.pushRecent(chip.dataset.q);
          run(true);
          return;
        }
        if (e.target.closest("[data-clear-recent]")) {
          prefs.clearRecent();
          idle();
          return;
        }
        if (e.target.closest("[data-loadmore]")) run(false);
        if (e.target.closest("a.row") && lastQ) prefs.pushRecent(lastQ);
      });
      input.value ? run(true) : idle();
    }
  };

  // assets/js/views/checkout.js
  var sname = (id) => (storeOf(id) || {}).name || "Tienda";
  var thumb = (l) => `<a class="row__thumb" href="#/p/${esc(l.id)}" aria-label="${esc(l.name)}">${l.img ? img(l.img, "") : ico("image")}</a>`;
  var carrito = {
    title: () => "Carrito",
    render() {
      const g = cart.byStore(), keys = Object.keys(g), n = cart.count();
      if (!n) return rootHead("Carrito") + empty("cart", "Tu carrito está vacío", "Toca un producto y usa “Añadir al carrito”.", link("Explorar productos", "#/inicio"));
      return rootHead("Carrito", `${plural(n, "producto", "productos")} de ${plural(keys.length, "tienda", "tiendas")}`) + `<div style="display:flex;flex-direction:column;gap:12px">${keys.map((k) => {
        const sub = g[k].reduce((s, l) => s + l.qty * l.price, 0);
        return `<section class="group" aria-label="${esc(sname(k))}"><div class="group__head">${ico("shield")}${esc(sname(k))}</div>
          ${g[k].map((l) => `<div class="cartline">${thumb(l)}
            <div class="row__body"><span class="row__title">${esc(l.name)}</span><span class="row__sub">${money(l.price)} c/u · ${l.stock <= 5 ? l.stock === 1 ? "Última unidad" : `Últimas ${l.stock}` : "Disponible"}</span></div>
            <div class="cartline__ctrl"><div class="step" data-line="${esc(l.id)}"><button type="button" data-dec aria-label="Quitar uno"${l.qty <= 1 ? " disabled" : ""}>${ico("minus", "ico--xs")}</button><output aria-label="Cantidad">${l.qty}</output><button type="button" data-inc aria-label="Agregar uno"${l.qty >= l.stock ? " disabled" : ""}>${ico("plus", "ico--xs")}</button></div>
            <b class="row__end">${money(l.qty * l.price)}</b><button class="iconbtn" type="button" data-remove="${esc(l.id)}" aria-label="Quitar ${esc(l.name)} del carrito">${ico("trash", "ico--sm")}</button></div></div>`).join("")}
          <div class="group__foot"><span>Subtotal de la tienda</span><b>${money(sub)}</b></div></section>`;
      }).join("")}
      <p class="note">${ico("info")}<span>El envío o retiro se elige por tienda en el siguiente paso. Cada tienda despacha por separado.</span></p>
      <div class="total"><div class="total__line total__line--big"><span>Total productos</span><b>${money(cart.total())}</b></div></div>
      <div style="padding:0 var(--app-gutter)"><a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/pago"><span class="vx-btn__label">Continuar a entrega y pago</span></a></div></div>`;
    },
    mount(el, _p, _q, ctx) {
      el.addEventListener("click", (e) => {
        const line = e.target.closest("[data-line]"), b = e.target.closest("[data-inc],[data-dec]"), rm = e.target.closest("[data-remove]");
        if (line && b) cart.set(line.dataset.line, cart.qty(line.dataset.line) + (b.hasAttribute("data-inc") ? 1 : -1));
        else if (rm) {
          const gone = cart.remove(rm.dataset.remove);
          toast("Quitado del carrito", { action: "Deshacer", onAction: () => {
            cart.restore(gone);
            ctx.rerender();
          } });
        } else return;
        ctx.rerender();
      });
    }
  };
  var pago = {
    title: () => "Entrega y pago",
    cls: "screen--action",
    noBar: true,
    render() {
      const g = cart.byStore(), keys = Object.keys(g);
      if (!keys.length) return topbar("Entrega y pago") + empty("cart", "No hay nada que pagar", "Tu carrito está vacío.", link("Explorar productos", "#/inicio"));
      const city = prefs.city();
      return topbar("Entrega y pago") + `<p class="label" style="padding-bottom:8px">Entrega por tienda</p><div style="display:flex;flex-direction:column;gap:12px">${keys.map((k) => {
        const items = g[k].reduce((a, l) => a + l.qty, 0), from = g[k][0].city || (storeOf(k) || {}).city || "";
        return `<fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin-inline:var(--app-gutter)"><legend class="sr">Entrega de ${esc(sname(k))}</legend>
          <div class="group__head">${ico("shield")}${esc(sname(k))} · ${plural(items, "artículo", "artículos")}</div>
          <label class="opt"><input type="radio" name="del-${esc(k)}" value="retiro" checked><span class="opt__body"><span class="opt__title">Retiro en la tienda</span><span class="opt__sub">${esc(from || "En la tienda")} · coordinas el horario con la tienda</span></span><span class="opt__end">Gratis</span></label>
          <label class="opt"><input type="radio" name="del-${esc(k)}" value="envio"><span class="opt__body"><span class="opt__title">Envío a domicilio</span><span class="opt__sub">A ${esc(city)} · la tienda confirma el costo</span></span><span class="opt__end">Por confirmar</span></label></fieldset>`;
      }).join("")}</div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Cómo pagas</p>
      <fieldset class="group" style="border:1px solid var(--app-line);padding:0;margin-inline:var(--app-gutter)"><legend class="sr">Método de pago</legend>
        <label class="opt"><input type="radio" name="pay" value="pagomovil" checked><span class="opt__body"><span class="opt__title">Pago móvil</span><span class="opt__sub">En bolívares a la tasa BCV del día. Subes el comprobante y la tienda lo verifica.</span></span></label>
        <label class="opt"><input type="radio" name="pay" value="divisas"><span class="opt__body"><span class="opt__title">Transferencia en divisas</span><span class="opt__sub">Cuenta en dólares de la tienda. Se verifica en 24 h hábiles.</span></span></label>
        <label class="opt" data-cash><input type="radio" name="pay" value="efectivo"><span class="opt__body"><span class="opt__title">Efectivo al retirar</span><span class="opt__sub">Solo si retiras todo en la tienda.</span></span></label>
      </fieldset>
      <p class="note" style="margin-top:16px">${ico("clock")}<span>Tu pedido queda reservado 8 horas mientras la tienda verifica el pago. Si no lo verifica en ese plazo, se libera la existencia y te avisamos.</span></p>
      <div class="total" style="margin-top:12px"><div class="total__line"><span>Productos</span><b>${money(cart.total())}</b></div><div class="total__line" data-ship><span>Envío</span><b>Gratis</b></div>
        <div class="total__line total__line--big"><span>Total</span><b>${money(cart.total())}</b></div></div>
      <p class="foot-note">Al confirmar aceptas los términos y la política de devoluciones de cada tienda.</p>
      <div class="actionbar"><div class="actionbar__sum"><span>Total</span><b>${money(cart.total())}</b></div>${btn("Confirmar pedido", "vx-btn--primary", "data-confirm")}</div>`;
    },
    mount(el) {
      const cash = el.querySelector("[data-cash]");
      if (!cash) return;
      const sync = () => {
        const anyShip = !!el.querySelector('input[value="envio"]:checked'), ci = cash.querySelector("input");
        ci.disabled = anyShip;
        cash.classList.toggle("opt--off", anyShip);
        if (anyShip && ci.checked) el.querySelector('input[value="pagomovil"]').checked = true;
        el.querySelector("[data-ship] b").textContent = anyShip ? "Por confirmar" : "Gratis";
      };
      el.addEventListener("change", sync);
      sync();
      el.querySelector("[data-confirm]").addEventListener("click", function() {
        if (this.dataset.state) return;
        this.dataset.state = "sending";
        const delivery = Object.fromEntries([...el.querySelectorAll('input[name^="del-"]:checked')].map((i) => [i.name.slice(4), i.value]));
        const pay = (el.querySelector('input[name="pay"]:checked') || {}).value;
        setTimeout(() => success(this, "Listo", () => {
          const code = orders.place({ pay, delivery, city: prefs.city() });
          nav.go("#/pedido/" + code, true);
        }), reduce ? 300 : 1400);
      });
    }
  };
  var pedido = {
    title: () => "Pedido recibido",
    noBar: true,
    render(code) {
      return `<div class="done"><span class="done__ico">${ico("check-circle")}</span><h1 tabindex="-1" data-focus>Pedido recibido</h1><span class="done__code">#${esc(code)}</span>
      <p>Queda reservado 8 horas mientras cada tienda verifica tu pago. Te avisamos cuando lo confirmen.</p></div>
      <div class="stack">${link("Ver mis pedidos", "#/pedidos", "vx-btn--primary vx-btn--block")}${link("Seguir comprando", "#/inicio", "vx-btn--ghost vx-btn--block")}</div>`;
    }
  };
  var PAY = { pagomovil: "Pago móvil", divisas: "Transferencia en divisas", efectivo: "Efectivo al retirar" };
  var localRows = (list) => `<div class="list">${list.map((o) => `<div class="row" style="align-items:flex-start"><span class="row__thumb row__thumb--ico">${ico("box")}</span>
      <span class="row__body"><span class="row__title">Pedido #${esc(o.code)}</span>
      <span class="row__sub">${plural(o.items, "artículo", "artículos")} · ${plural(o.stores, "tienda", "tiendas")} · ${shortDate(o.date)}${o.pay ? " · " + PAY[o.pay] : ""}</span>
      <span class="vx-status vx-status--info" style="margin-top:6px">${ico("clock")}Esperando verificación del pago</span></span><span class="row__end">${money(o.total)}</span></div>`).join("")}</div>`;
  var realRow = (o) => {
    const left = auth.leftToPay(o), tone = STATUS_TONE[o.status] || "neutral";
    const open = auth.demo() ? `<button type="button" class="row" style="align-items:flex-start" data-toast="Pedido de ejemplo: en la app publicada abre el detalle y el pago en ve.vexbiz.com">` : `<a class="row" style="align-items:flex-start" href="${CONFIG.siteUrl}/order/${encodeURIComponent(o.order_number)}" target="_blank" rel="noopener">`;
    return `${open}
    <span class="row__thumb order-thumb${o.image ? "" : " row__thumb--ico"}">${o.image ? img(o.image, "") : ico("box")}</span>
    <span class="row__body"><span class="row__title">Pedido #${esc(o.order_number)}</span>
      <span class="row__sub">${[o.store_name, o.item_count ? plural(o.item_count, "artículo", "artículos") : "", o.created_at ? shortDate(o.created_at) : ""].filter(Boolean).map(esc).join(" · ")}</span>
      <span class="vx-status vx-status--${tone}" style="margin-top:6px">${esc(STATUS[o.status] || o.status || "En proceso")}</span>
      ${left > 0 ? `<span class="row__sub" style="margin-top:4px">Falta pagar <b>${money(left, o.currency || CONFIG.currency)}</b></span>` : ""}</span>
    <span class="row__end">${money(o.total || 0, o.currency || CONFIG.currency)}</span>${auth.demo() ? "</button>" : "</a>"}`;
  };
  var pedidos = {
    title: () => "Mis pedidos",
    async render() {
      const list = orders.list();
      if (auth.signedIn()) {
        let block;
        try {
          const r = await auth.orders("", 10);
          block = r.items.length ? `<div class="list" data-real>${r.items.map(realRow).join("")}</div>${r.next ? `<div class="pager">${btn("Ver más pedidos", "vx-btn--secondary", `data-more="${esc(r.next)}"`)}</div>` : ""}` : empty("box", "Todavía no tienes compras registradas", "Cuando compres con tu cuenta, aquí verás cada pedido con su estado.", link("Explorar productos", "#/inicio"));
        } catch (e) {
          block = `<div class="msg msg--danger" role="alert" style="margin:0 var(--app-gutter)">${ico("alert")}<span>No pudimos traer tus compras de VEXBIZ. Revisa tu conexión y vuelve a intentarlo.</span></div>`;
        }
        return topbar("Mis pedidos") + `<p class="sec__meta" style="padding-bottom:12px">${auth.demo() ? "Modo demostración · pedidos de ejemplo" : `Compras de ${esc(auth.firstName())} en VEXBIZ · toca un pedido para ver el detalle y pagar`}</p>${block}` + (list.length ? `<p class="label" style="padding:20px var(--app-gutter) 8px">Hechos en esta app</p>${localRows(list)}` : "");
      }
      if (!list.length) return topbar("Mis pedidos") + empty("box", "Aún no tienes pedidos", "Cuando compres, aquí verás cada pedido con su estado y el comprobante de pago.", link("Explorar productos", "#/inicio")) + signinHint();
      return topbar("Mis pedidos") + localRows(list) + signinHint();
    },
    mount(el) {
      el.addEventListener("click", async (e) => {
        const b = e.target.closest("[data-more]");
        if (!b || b.dataset.state) return;
        b.dataset.state = "sending";
        try {
          const r = await auth.orders(b.dataset.more, 10);
          el.querySelector("[data-real]").insertAdjacentHTML("beforeend", r.items.map(realRow).join(""));
          if (r.next) {
            b.dataset.more = r.next;
            b.removeAttribute("data-state");
          } else b.closest(".pager").remove();
        } catch (err) {
          b.removeAttribute("data-state");
          toast("No pudimos traer más pedidos. Inténtalo otra vez.");
        }
      });
    }
  };
  var signinHint = () => auth.available() ? `<p class="auth__alt" style="padding:16px var(--app-gutter)">¿Compraste en ve.vexbiz.com? <a class="textlink" href="#/login?next=%23%2Fpedidos">Entra para ver esas compras</a></p>` : "";

  // assets/js/views/account.js
  var row = (href, icon, title, sub, end = "", attrs = "") => `<${href ? `a href="${href}"` : 'button type="button"'} class="row"${attrs}><span class="row__thumb row__thumb--ico">${ico(icon)}</span>
   <span class="row__body"><span class="row__title">${title}</span>${sub ? `<span class="row__sub">${sub}</span>` : ""}</span>${end || ico("chev-r")}</${href ? "a" : "button"}>`;
  var isDark = () => document.documentElement.getAttribute("data-theme") === "dark" || !document.documentElement.getAttribute("data-theme") && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  function profile() {
    const u = auth.user();
    if (auth.signedIn() && u) {
      const name = u.full_name || u.name || "";
      return `<div class="profile"><span class="profile__ava profile__ava--in" data-initials="${esc(initials(name || u.email))}">${u.avatar_url ? `<img src="${esc(u.avatar_url)}" alt="" referrerpolicy="no-referrer" data-fallback>` : esc(initials(name || u.email))}</span>
      <span class="profile__body"><b>Hola, ${esc(auth.firstName())}</b><span>${esc(name || "Tu cuenta VEXBIZ")}</span></span>
      <button class="vx-btn" type="button" data-logout><span class="vx-btn__label">Salir</span></button></div>${auth.demo() ? '<p class="auth__alt" style="padding:12px var(--app-gutter) 0">Sesión de demostración: se borra al cerrar esta pestaña.</p>' : ""}`;
    }
    return `<div class="profile"><span class="profile__ava">${ico("user")}</span><span class="profile__body"><b>Hola</b><span>Entra para ver tus compras de VEXBIZ.</span></span>
    <a class="vx-btn" href="#/login"><span class="vx-btn__label">Entrar</span></a></div>
    <p class="auth__alt" style="padding:12px var(--app-gutter) 0">¿Todavía no tienes cuenta? <a class="textlink" href="#/registro">Crear cuenta gratis</a></p>`;
  }
  var cuenta = {
    title: () => "Cuenta",
    async render() {
      const m = await api.meta();
      const canInstall = install.available();
      return rootHead("Cuenta") + profile() + `      ${canInstall ? `<div class="install" style="margin-top:16px" data-install-card><img class="install__ico" src="assets/icons/icon-192.png" alt="" width="44" height="44"><span class="install__body"><b>Instala VEXBIZ</b><span>Ábrela desde tu pantalla de inicio, también sin conexión.</span></span>${btn("Instalar", "vx-btn--primary", "data-install")}</div>` : ""}
      <p class="label" style="padding:20px var(--app-gutter) 8px">Mis compras</p><div class="list">
        ${row("#/pedidos", "box", "Mis pedidos", auth.signedIn() ? "Tus compras en VEXBIZ" : "Estado y comprobante de pago", auth.signedIn() ? "" : `<span class="count">${orders.list().length}</span>`)}
        ${row("#/favoritos", "heart", "Favoritos", "Productos guardados", `<span class="count">${favs.list().length}</span>`)}
        ${row("", "pin", "Mis direcciones", `<span data-city>${esc(prefs.city())}</span>`, "", ' data-open="loc"')}
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Preferencias</p><div class="list">
        <button class="row" type="button" role="switch" aria-checked="${isDark()}" data-theme-toggle><span class="row__thumb row__thumb--ico">${ico("moon")}</span><span class="row__body"><span class="row__title">Tema oscuro</span><span class="row__sub">Se guarda en este dispositivo</span></span><span class="switch" aria-hidden="true"></span></button>
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">VEXBIZ</p><div class="list">
        ${row("", "book", "Academia VEXBIZ", "Cursos y certificaciones", "", ' data-toast="Academia VEXBIZ: cursos para técnicos y comercios"')}
        ${row("", "store", "Vender en VEXBIZ", "Publica tu catálogo", "", ' data-toast="Vender en VEXBIZ: registro de proveedor en ve.vexbiz.com"')}
        ${row("", "help", "Soporte", "Ayuda y reclamos", "", ' data-toast="Soporte 24/7: ayuda con pedidos, pagos y reclamos"')}
        ${auth.demo() ? row("acceso-demo.html", "lock", "Estados de acceso", "Demo: todos los estados de Iniciar sesión y Crear cuenta") : ""}
      </div>
      <p class="label" style="padding:20px var(--app-gutter) 8px">Catálogo</p><div class="list">
        ${row("", "globe", m.mode === "live" ? "En vivo desde ve.vexbiz.com" : "Copia guardada de ve.vexbiz.com", `${plural(m.products, "producto", "productos")} · sincronizado el ${shortDate(m.fetchedAt)}`, "<span></span>")}
        ${row("", "trash", "Borrar datos de este teléfono", "Carrito, favoritos, pedidos y búsquedas", "<span></span>", " data-reset")}
      </div>
      <p class="foot-note">VEXBIZ · app móvil · versión ${esc(CONFIG.version || "1.0")}</p>`;
    },
    mount(el, _p, _q, ctx) {
      const lo = el.querySelector("[data-logout]");
      if (lo) lo.addEventListener("click", async () => {
        lo.dataset.state = "sending";
        await auth.logout();
        toast("Cerraste sesión en este teléfono");
      });
      const t = el.querySelector("[data-theme-toggle]");
      t.addEventListener("click", () => {
        const next = t.getAttribute("aria-checked") === "true" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem(CONFIG.themeKey, next);
        } catch (e) {
        }
        t.setAttribute("aria-checked", String(next === "dark"));
        document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
          m.content = next === "dark" ? "#1E262A" : "#FFD85E";
        });
      });
      const ib = el.querySelector("[data-install]");
      if (ib) ib.addEventListener("click", async () => {
        const ok = await install.prompt();
        if (ok) el.querySelector("[data-install-card]").remove();
      });
      const reset = el.querySelector("[data-reset]");
      let armed = false;
      reset.addEventListener("click", () => {
        if (!armed) {
          armed = true;
          reset.querySelector(".row__sub").textContent = "Toca otra vez para confirmar";
          setTimeout(() => {
            armed = false;
          }, 4e3);
          return;
        }
        prefs.reset();
        toast("Datos borrados de este teléfono");
        ctx.rerender();
      });
    }
  };
  var favoritos = {
    title: () => "Favoritos",
    render() {
      const list = favs.list();
      if (!list.length) return topbar("Favoritos") + empty("heart", "Todavía no guardas favoritos", "Toca el corazón de un producto para guardarlo aquí.", link("Explorar productos", "#/inicio"));
      const asProduct = (f) => ({ id: f.id, name: f.name, images: [f.img].filter(Boolean), price: f.price, currency: f.currency, stock: f.stock, availability: f.availability, store: f.store });
      return topbar("Favoritos") + `<p class="sec__meta" style="padding-bottom:12px">${plural(list.length, "producto guardado", "productos guardados")}</p><div class="grid">${list.map((f) => pcard(asProduct(f))).join("")}</div>`;
    }
  };
  var error = {
    title: () => "Error",
    render(e) {
      return topbar("Algo salió mal") + empty(
        "alert",
        "No pudimos cargar esta pantalla",
        "Revisa tu conexión y vuelve a intentarlo. Si sigue pasando, avísanos desde Soporte.",
        `<a class="vx-btn vx-btn--secondary" href="#/inicio"><span class="vx-btn__label">Ir a Inicio</span></a>`
      );
    }
  };

  // assets/js/views/login.js
  var site = (path) => CONFIG.siteUrl + path;
  var ext = (label, path, cls = "textlink") => `<a class="${cls}" href="${site(path)}" target="_blank" rel="noopener">${label}</a>`;
  var safeNext = (n) => n && /^#\/[a-z]/.test(n) && !n.startsWith("#/login") ? n : "#/cuenta";
  var demoNote = (kind) => auth.demo() ? `<div class="msg msg--info" role="note">${ico("help")}<span><b>Modo demostración.</b> Nada sale de este teléfono. ${kind === "register" ? "Cualquier dato válido crea la cuenta; un correo con «existe» muestra el aviso de correo ya registrado." : "Cualquier correo y contraseña entran. Un correo con «2fa» pide código (123456), uno con «bloqueada» muestra el bloqueo y la contraseña «error» falla."}</span></div>` : "";
  var safeNote = () => `<p class="auth__safe">${ico("lock")}<span>${auth.demo() ? "En la app publicada, la conexión va directo a VEXBIZ y la app no guarda tu contraseña." : "La conexión va directo a VEXBIZ. La app no guarda tu contraseña."}</span></p>`;
  var toRegister = (label) => auth.demo() ? `<a class="textlink" href="#/registro">${label}</a>` : ext(label, "/register");
  var toLogin = (label) => `<a class="textlink" href="#/login">${label}</a>`;
  function fieldError(input, text) {
    const fld = input.closest(".fld");
    if (!fld) return;
    const id = input.id + "-err";
    let p = fld.querySelector(".fld__err");
    if (!p) {
      p = document.createElement("p");
      p.className = "fld__err";
      p.id = id;
      fld.querySelector(".fld__box").after(p);
    }
    fld.classList.toggle("fld--bad", !!text);
    p.hidden = !text;
    p.innerHTML = text ? ico("alert") + `<span>${esc(text)}</span>` : "";
    const desc = (input.getAttribute("aria-describedby") || "").split(" ").filter((x) => x && x !== id);
    if (text) {
      desc.unshift(id);
      input.setAttribute("aria-invalid", "true");
    } else input.removeAttribute("aria-invalid");
    if (desc.length) input.setAttribute("aria-describedby", desc.join(" "));
    else input.removeAttribute("aria-describedby");
  }
  var stepPassword = () => `
  <form novalidate data-form="password">
    <div class="msg msg--danger" role="alert" data-error hidden></div>
    <div class="msg msg--info" role="status" data-notice hidden></div>
    <div class="fld" data-fld="email"><label for="lg-email">Correo electrónico</label>
      <div class="fld__box">${ico("mail")}<input id="lg-email" name="email" type="email" inputmode="email" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nombre@ejemplo.com" required></div></div>
    <div class="fld" data-fld="password"><div class="fld__top"><label for="lg-pass">Contraseña</label>${ext("¿Olvidaste tu contraseña?", "/recover")}</div>
      <div class="fld__box">${ico("lock")}<input id="lg-pass" name="password" type="password" autocomplete="current-password" required>
        <button class="iconbtn" type="button" data-peek aria-pressed="false" aria-label="Ver contraseña" aria-controls="lg-pass">${ico("eye")}</button></div></div>
    <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Entrar a mi cuenta</span></button>
  </form>`;
  var stepCode = () => `
  <form novalidate data-form="code">
    <div class="msg msg--danger" role="alert" data-error hidden></div>
    <div class="fld fld__code" data-fld="code"><label for="lg-code">Código de verificación</label>
      <div class="fld__box">${ico("shield")}<input id="lg-code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="12" autocapitalize="none" spellcheck="false" required></div></div>
    <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Validar y entrar</span></button>
    <button class="vx-btn vx-btn--ghost vx-btn--block" type="button" data-restart><span class="vx-btn__label">Usar otra cuenta</span></button>
  </form>`;
  var login = {
    title: () => "Iniciar sesión",
    noBar: true,
    render(_p, q) {
      if (auth.signedIn()) return topbar("Iniciar sesión") + `<div class="auth"><div class="msg msg--info">${ico("check-circle")}<span>Ya entraste como ${esc(auth.firstName())}.</span></div></div>`;
      return brandbar() + `<div class="auth"><div class="auth__card">
        <div class="auth__head"><span class="auth__badge">${ico("shield")}</span><div><h1 data-step-title tabindex="-1" data-focus>Iniciar sesión</h1><p data-step-sub>Ingresa con tu email y contraseña registrados en Venezuela.</p></div></div>
        ${demoNote("login")}
        <div data-step>${stepPassword()}</div>
        ${safeNote()}
      </div>
      <p class="auth__alt">¿Todavía no tienes cuenta en Venezuela? ${toRegister("Crear cuenta gratis")}</p></div>`;
    },
    mount(el, _p, q) {
      const next = safeNext(q && q.next);
      if (auth.signedIn()) {
        nav.go(next, true);
        return;
      }
      const host2 = el.querySelector("[data-step]");
      let ticket = "";
      const show = (form, { error: error2 = "", notice = "" }) => {
        const e = form.querySelector("[data-error]"), n = form.querySelector("[data-notice]");
        e.hidden = !error2;
        e.innerHTML = error2 ? ico("alert") + `<span>${esc(error2)}</span>` : "";
        if (n) {
          n.hidden = !notice;
          n.innerHTML = notice ? ico("help") + `<span>${esc(notice)}</span>` : "";
        }
      };
      const busy = (btn2, on, text) => {
        const label = btn2.querySelector(".vx-btn__label");
        if (on) {
          btn2.dataset.idle = label.textContent;
          btn2.dataset.state = "sending";
          btn2.setAttribute("aria-busy", "true");
          label.textContent = text;
        } else {
          btn2.removeAttribute("data-state");
          btn2.removeAttribute("aria-busy");
          label.textContent = btn2.dataset.idle || label.textContent;
        }
      };
      const finish = (btn2) => {
        busy(btn2, false);
        success(btn2, "Listo", () => nav.go(next, true));
      };
      function bindPassword() {
        const form = host2.querySelector("form"), email = form.elements.email, pass = form.elements.password, btn2 = form.querySelector("[data-submit]");
        const peek = form.querySelector("[data-peek]");
        peek.addEventListener("click", () => {
          const on = pass.type === "password";
          pass.type = on ? "text" : "password";
          peek.setAttribute("aria-pressed", String(on));
          peek.setAttribute("aria-label", on ? "Ocultar contraseña" : "Ver contraseña");
          peek.querySelector("use").setAttribute("href", "#i-" + (on ? "eye-off" : "eye"));
        });
        [email, pass].forEach((i) => i.addEventListener("input", () => {
          fieldError(i, "");
          show(form, {});
        }));
        form.addEventListener("submit", async (ev) => {
          ev.preventDefault();
          if (btn2.dataset.state) return;
          const e = email.value.trim(), p = pass.value;
          const bad = !/^\S+@\S+\.\S+$/.test(e) ? email : !p ? pass : null;
          if (bad) {
            fieldError(bad, bad === email ? "Escribe el correo con el que te registraste, por ejemplo nombre@ejemplo.com." : "Escribe tu contraseña.");
            bad.focus();
            return;
          }
          busy(btn2, true, "Entrando…");
          show(form, {});
          try {
            const r = await auth.login(e, p);
            if (r.twoFactor) {
              ticket = r.ticket;
              toCode();
              return;
            }
            finish(btn2);
          } catch (err) {
            busy(btn2, false);
            const m = auth.message(err);
            if (err.code === "auth.invalid_credentials") {
              pass.value = "";
              fieldError(pass, m.error + " Revísalos o usa «¿Olvidaste tu contraseña?».");
              pass.focus();
            } else show(form, m);
          }
        });
        setTimeout(() => email.focus({ preventScroll: true }), 60);
      }
      function toCode() {
        el.querySelector("[data-step-title]").textContent = "Verificación en dos pasos";
        el.querySelector("[data-step-sub]").textContent = "Escribe el código de tu app de autenticación para terminar de entrar.";
        host2.innerHTML = stepCode();
        const form = host2.querySelector("form"), code = form.elements.code, btn2 = form.querySelector("[data-submit]");
        code.addEventListener("input", () => {
          fieldError(code, "");
          show(form, {});
        });
        form.querySelector("[data-restart]").addEventListener("click", toPassword);
        form.addEventListener("submit", async (ev) => {
          ev.preventDefault();
          if (btn2.dataset.state) return;
          const c = code.value.trim();
          if (!c) {
            fieldError(code, "Escribe el código de 6 dígitos de tu app de autenticación.");
            code.focus();
            return;
          }
          busy(btn2, true, "Comprobando código…");
          show(form, {});
          try {
            await auth.verify(ticket, c);
            finish(btn2);
          } catch (err) {
            busy(btn2, false);
            code.value = "";
            if (err.status === 0) show(form, { error: "No hay conexión. Comprueba tu red e inténtalo otra vez." });
            else fieldError(code, (err.detail || "Ese código no es válido.") + " Escribe el código que aparece ahora en tu app.");
            code.focus();
          }
        });
        setTimeout(() => code.focus({ preventScroll: true }), 60);
      }
      function toPassword() {
        ticket = "";
        el.querySelector("[data-step-title]").textContent = "Iniciar sesión";
        el.querySelector("[data-step-sub]").textContent = "Ingresa con tu email y contraseña registrados en Venezuela.";
        host2.innerHTML = stepPassword();
        bindPassword();
      }
      bindPassword();
    }
  };
  var INTENT = {
    buy: { ico: "cart", label: "Comprar", sub: "Regístrate gratis para comprar, vender o trabajar como técnico en Venezuela." },
    sell: { ico: "store", label: "Vender", sub: "Crea tu cuenta y da de alta tu empresa en Venezuela. Sin cuota de entrada: pagas una comisión solo sobre lo que vendes." },
    tech: { ico: "tools", label: "Técnico", sub: "Crea tu cuenta y en un minuto tendrás tu perfil de técnico en Venezuela. Después te pedimos tu cédula, tus oficios y tu zona; VexBiz revisa y te avisa." }
  };
  var RULES = [
    ["Mínimo 10 caracteres", (p) => p.length >= 10],
    ["Al menos una letra", (p) => /\p{L}/u.test(p)],
    ["Al menos un número", (p) => /\d/.test(p)]
  ];
  var rulesHtml = (p) => RULES.map(([t, f]) => {
    const ok = f(p);
    return `<li class="${ok ? "is-ok" : ""}">${ico(ok ? "check-circle" : "dot")}<span>${t}</span><span class="sr">${ok ? ": cumple" : ": falta"}</span></li>`;
  }).join("");
  var registro = {
    title: () => "Crear cuenta",
    noBar: true,
    render(_p, q) {
      if (auth.signedIn()) return topbar("Crear cuenta") + `<div class="auth"><div class="msg msg--info">${ico("check-circle")}<span>Ya entraste como ${esc(auth.firstName())}.</span></div></div>`;
      const it = INTENT[(q && q.quiero) in INTENT ? q.quiero : "buy"];
      const key = Object.keys(INTENT).find((k) => INTENT[k] === it);
      if (!auth.demo()) {
        return brandbar() + `<div class="auth"><div class="auth__card">
        <div class="auth__head"><span class="auth__badge">${ico("user")}</span><div><h1 tabindex="-1" data-focus>Crear cuenta</h1><p>${esc(it.sub)}</p></div></div>
        ${ext('<span class="vx-btn__label">Crear mi cuenta en ve.vexbiz.com</span>', "/register", "vx-btn vx-btn--primary vx-btn--block vx-btn--lg")}
        </div><p class="auth__alt">¿Ya tienes una cuenta registrada? ${toLogin("Iniciar sesión")}</p></div>`;
      }
      return brandbar() + `<div class="auth" data-reg><div class="auth__card">
      <div class="auth__head"><span class="auth__badge">${ico("user")}</span><div><h1 tabindex="-1" data-focus>Crear cuenta</h1><p data-intent-sub>${esc(it.sub)}</p></div></div>
      ${demoNote("register")}
      <form novalidate data-form="register">
        <div class="msg msg--danger" role="alert" data-error hidden></div>
        <fieldset class="seg"><legend>Quiero</legend>${Object.entries(INTENT).map(([k, v]) => `<label>${ico(v.ico)}${v.label}<input type="radio" name="intent" value="${k}"${k === key ? " checked" : ""}></label>`).join("")}</fieldset>
        <div class="fld-row">
          <div class="fld"><label for="rg-name">Nombre *</label><div class="fld__box"><input id="rg-name" name="name" type="text" autocomplete="given-name" placeholder="Ej. Carlos"></div></div>
          <div class="fld"><label for="rg-last">Apellido *</label><div class="fld__box"><input id="rg-last" name="last" type="text" autocomplete="family-name" placeholder="Ej. Mendoza"></div></div>
        </div>
        <div class="fld"><label for="rg-email">Correo electrónico *</label><div class="fld__box">${ico("mail")}<input id="rg-email" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="tunombre@empresa.com"></div></div>
        <div class="fld"><label for="rg-pass">Contraseña de acceso *</label><div class="fld__box">${ico("lock")}<input id="rg-pass" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 10 caracteres" aria-describedby="rg-rules">
          <button class="iconbtn" type="button" data-peek aria-pressed="false" aria-label="Ver contraseña" aria-controls="rg-pass">${ico("eye")}</button></div>
          <ul class="rules" id="rg-rules" data-rules>${rulesHtml("")}</ul></div>
        <div class="fld"><label for="rg-ref">Código de invitación (opcional)</label><div class="fld__box"><input id="rg-ref" name="ref" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej. VX-8942"></div></div>
        <button class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" type="submit" data-submit><span class="vx-btn__label">Registrar mi cuenta</span></button>
        <p class="auth__legal">Al registrarte, confirmas que aceptas nuestros ${ext("Términos y Condiciones", "/terms")} y la ${ext("Política de Privacidad", "/privacy")}.</p>
      </form></div>
      <p class="auth__alt">¿Ya tienes una cuenta registrada? ${toLogin("Iniciar sesión")}</p></div>`;
    },
    mount(el, _p, q) {
      if (auth.signedIn()) {
        nav.go("#/cuenta", true);
        return;
      }
      const form = el.querySelector('[data-form="register"]');
      if (!form) return;
      const f = form.elements, err = form.querySelector("[data-error]"), btn2 = form.querySelector("[data-submit]");
      const show = (t) => {
        err.hidden = !t;
        err.innerHTML = t ? ico("alert") + `<span>${esc(t)}</span>` : "";
      };
      const mark = (i, text) => fieldError(i, text || "");
      form.addEventListener("input", (e) => {
        if (e.target.name === "password") form.querySelector("[data-rules]").innerHTML = rulesHtml(e.target.value);
        if (e.target.name !== "intent") {
          mark(e.target, "");
          show("");
        }
      });
      form.addEventListener("change", (e) => {
        if (e.target.name === "intent") el.querySelector("[data-intent-sub]").textContent = INTENT[e.target.value].sub;
      });
      const peek = form.querySelector("[data-peek]");
      peek.addEventListener("click", () => {
        const on = f.password.type === "password";
        f.password.type = on ? "text" : "password";
        peek.setAttribute("aria-pressed", String(on));
        peek.setAttribute("aria-label", on ? "Ocultar contraseña" : "Ver contraseña");
        peek.querySelector("use").setAttribute("href", "#i-" + (on ? "eye-off" : "eye"));
      });
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (btn2.dataset.state) return;
        const checks = [
          [f.name, !f.name.value.trim(), "Escribe tu nombre."],
          [f.last, !f.last.value.trim(), "Escribe tu apellido."],
          [f.email, !/^\S+@\S+\.\S+$/.test(f.email.value.trim()), "Escribe un correo válido, por ejemplo tunombre@empresa.com."],
          [f.password, !RULES.every(([, t]) => t(f.password.value)), "La contraseña todavía no cumple los tres requisitos de abajo."]
        ];
        const bad = checks.find((c) => c[1]);
        checks.forEach((c) => mark(c[0], ""));
        if (bad) {
          mark(bad[0], bad[2]);
          bad[0].focus();
          return;
        }
        const label = btn2.querySelector(".vx-btn__label"), idle = label.textContent;
        btn2.dataset.state = "sending";
        btn2.setAttribute("aria-busy", "true");
        label.textContent = "Creando cuenta…";
        show("");
        try {
          await auth.register({ first_name: f.name.value.trim(), last_name: f.last.value.trim(), email: f.email.value.trim(), password: f.password.value, invitation_code: f.ref.value.trim(), intent: form.querySelector('[name="intent"]:checked').value });
          const intent = form.querySelector('[name="intent"]:checked').value;
          el.querySelector("[data-reg]").outerHTML = `<div class="done done--auth"><span class="done__ico">${ico("check-circle")}</span><h1 tabindex="-1" data-focus>Cuenta creada</h1>
          <p>Bienvenido a VEXBIZ, ${esc(auth.firstName())}. ${intent === "sell" ? "El siguiente paso es dar de alta tu empresa." : intent === "tech" ? "El siguiente paso es completar tu perfil de técnico." : "Ya puedes comprar en tiendas verificadas de Venezuela."}</p></div>
          <div class="stack">${intent === "buy" ? '<a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/inicio"><span class="vx-btn__label">Empezar a comprar</span></a><a class="vx-btn vx-btn--ghost vx-btn--block" href="#/cuenta"><span class="vx-btn__label">Ir a mi cuenta</span></a>' : '<a class="vx-btn vx-btn--primary vx-btn--block vx-btn--lg" href="#/cuenta"><span class="vx-btn__label">Ir a mi cuenta</span></a><a class="vx-btn vx-btn--ghost vx-btn--block" href="#/inicio"><span class="vx-btn__label">Ver el marketplace</span></a>'}</div>`;
          const h = el.querySelector("[data-focus]");
          if (h) h.focus({ preventScroll: true });
        } catch (x) {
          btn2.removeAttribute("data-state");
          btn2.removeAttribute("aria-busy");
          label.textContent = idle;
          if (x.code === "auth.email_taken") {
            mark(f.email, x.detail);
            f.email.focus();
          } else show(x.detail || (x.status === 0 ? "No hay conexión. Comprueba tu red e inténtalo otra vez." : "No pudimos crear la cuenta. Inténtalo otra vez."));
        }
      });
    }
  };

  // assets/js/main.js
  CONFIG.version = document.documentElement.dataset.version || "1.0";
  var views = { inicio: home_default, categorias, n: nicho, p: product_default, s: tienda, tiendas, buscar, carrito, pago, pedido, pedidos, cuenta, favoritos, login, registro, error };
  var app = document.querySelector("[data-app]");
  var bar = document.querySelector("[data-tabbar]");
  var host = document.getElementById("screen-host");
  function badge(pop) {
    const b = bar.querySelector("[data-badge]"), n = cart.count();
    b.hidden = !n;
    b.textContent = n > 99 ? "99+" : n;
    bar.querySelector('[data-tab="carrito"]').setAttribute("aria-label", n ? "Carrito, " + plural(n, "producto", "productos") : "Carrito");
    if (pop && !reduce) {
      b.classList.remove("is-pop");
      void b.offsetWidth;
      b.classList.add("is-pop");
    }
  }
  subscribe((what) => {
    if (what === "cart" || what === "reset" || what === "orders") badge(what === "cart");
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-skip]")) {
      const scr = host.firstChild, t2 = scr && (scr.querySelector("[data-focus]") || scr.querySelector("main h1, h1, a, button, input"));
      if (t2) {
        if (!t2.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT)$/.test(t2.tagName)) t2.setAttribute("tabindex", "-1");
        t2.focus();
      }
      return;
    }
    if (e.target.closest("[data-back]")) {
      nav.back();
      return;
    }
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      const h = "#/" + tab.dataset.tab;
      if (location.hash === h) host.firstChild && host.firstChild.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      else nav.go(h);
      return;
    }
    const fv = e.target.closest("[data-fav]");
    if (fv) {
      e.preventDefault();
      const id = fv.dataset.fav;
      api.product(id).then((p) => {
        p = p || { id, name: fv.getAttribute("aria-label") || "", images: [] };
        const on = favs.toggle(p);
        document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`).forEach((b) => {
          b.setAttribute("aria-pressed", on);
          b.querySelector("use").setAttribute("href", "#i-" + (on ? "heart-f" : "heart"));
        });
        toast(on ? "Guardado en favoritos" : "Quitado de favoritos");
      });
      return;
    }
    if (e.target.closest('[data-open="loc"]')) {
      locSheet(e.target.closest("[data-open]"));
      return;
    }
    const nt = e.target.closest("[data-notify]");
    if (nt && !nt.dataset.state) {
      success(nt, "Te avisaremos", () => {
        nt.disabled = true;
      });
      return;
    }
    const t = e.target.closest("[data-toast]");
    if (t) {
      e.preventDefault();
      toast(t.dataset.toast);
    }
  });
  function locSheet(from) {
    const sheet = openSheet(`<div class="sheet__top"><h2 class="sheet__title" id="sheet-t">¿Dónde recibes tus pedidos?</h2><button class="iconbtn" type="button" data-close aria-label="Cerrar">${ico("x")}</button></div>
    <fieldset style="border:0;margin:0;padding:0"><legend class="sr">Ciudad de entrega</legend>
    ${CONFIG.cities.map((c, i) => `<label class="opt" for="city-${i}"><input type="radio" id="city-${i}" name="city" value="${esc(c)}"${c === prefs.city() ? " checked data-autofocus" : ""}><span class="opt__body"><span class="opt__title">${esc(c)}</span></span></label>`).join("")}
    </fieldset><p class="sec__meta" style="padding:0">El costo y el plazo del envío los confirma cada tienda según la ciudad.</p>`, from);
    sheet.onchange = (e) => {
      if (e.target.name !== "city") return;
      prefs.setCity(e.target.value);
      document.querySelectorAll("[data-city]").forEach((n) => {
        n.textContent = prefs.city();
      });
      toast("Entregas a " + prefs.city());
      setTimeout(closeSheet, 250);
    };
  }
  var layer = document.querySelector("[data-layer]");
  var sheetEl = document.querySelector("[data-sheet]");
  layer.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (layer.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSheet();
    }
    if (e.key === "Tab") {
      const f = [...sheetEl.querySelectorAll("button:not([disabled]), input:not([disabled]), [href]")];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  (async () => {
    try {
      setStores(await api.stores());
    } catch (e) {
      console.warn(e);
    }
    const router = createRouter({ views, host, bar, app });
    nav.go = router.go;
    nav.back = router.back;
    nav.rerender = router.rerender;
    router.start();
    badge(false);
    auth.subscribe(() => {
      if (!/^#\/(login|registro)/.test(location.hash)) router.rerender();
    });
    auth.boot();
    registerSW();
    watchNetwork();
  })();
})();
