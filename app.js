(() => {
  'use strict';

  // ================= basics =================
  const CFG = window.STOCK_CONFIG || {};
  const SEED = window.STOCK_SEED || [];
  const DEPTS = CFG.DEPARTMENTS || [{ key: 'ประปา', color: '#2f7cf6', tint: '#e8f1ff', icon: 'drop' }];
  const DEMO = new URLSearchParams(location.search).has('demo');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bh.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('bh.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };
  const fmt = (n) => Number(n || 0).toLocaleString('th-TH');
  const label = (it) => `${it.name} ${it.size}`.trim();
  const norm = (s) => String(s || '').toLowerCase().replace(/[″”“]/g, '"').replace(/นิ้ว/g, '"').replace(/\s+/g, '');
  const enc = encodeURIComponent;

  // ================= icons =================
  const sv = (p) => `<svg viewBox="0 0 24 24">${p}</svg>`;
  const I = {
    home: sv('<path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    grid: sv('<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>'),
    cart: sv('<path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>'),
    list: sv('<path d="M8 3h8a2 2 0 0 1 2 2v15l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z"/><path d="M9 8h6M9 12h6"/>'),
    buy: sv('<path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path d="M12 12v5M9.5 14.5h5"/>'),
    history: sv('<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5M12 7.5V12l3 2"/>'),
    user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    helmet: sv('<path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3"/><path d="M10 7.5V5.5h4v2"/><path d="M3 17v1.5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V17"/>'),
    office: sv('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    minus: sv('<path d="M5 12h14"/>'),
    x: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    right: sv('<path d="M9 6l6 6-6 6"/>'),
    alert: sv('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    box: sv('<path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'),
    pin: sv('<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    cal: sv('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    copy: sv('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
    trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
    refresh: sv('<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8"/><path d="M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16"/><path d="M20 20v-4h-4"/>'),
    in: sv('<path d="M12 19V5M6 11l6-6 6 6"/>'),
    out: sv('<path d="M12 5v14M6 13l6 6 6-6"/>'),
    adjust: sv('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    repeat: sv('<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>'),
  };
  I.new = I.in;
  const DICON = {
    drop: sv('<path d="M12 3s6.5 6.6 6.5 11.2a6.5 6.5 0 0 1-13 0C5.5 9.6 12 3 12 3z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>'),
    bolt: sv('<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/>'),
    roller: sv('<rect x="3" y="3.5" width="14" height="5" rx="1.5"/><path d="M17 6h3.5v5.5H11v3"/><rect x="9.5" y="14.5" width="3" height="7" rx="1"/>'),
    brick: sv('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>'),
    beam: sv('<path d="M5 4h14v3.5H5zM5 16.5h14V20H5z"/><path d="M10.5 7.5h3v9h-3z"/>'),
    door: sv('<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21"/><path d="M3.5 21h17M14.5 12.5h.01"/>'),
    screw: sv('<path d="M7.5 3h9l-1.8 4H9.3z"/><path d="M10 7v12.5l2 1.5 2-1.5V7M10 10.5l4-1.2M10 14l4-1.2M10 17.5l4-1.2"/>'),
    tools: sv('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3l3.2 3.2 5.8-5.8a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.7-.6-.6-2.7z"/>'),
  };
  const CICON = {
    'ข้องอ 90°': '<path d="M5 3.5v7.5a6 6 0 0 0 6 6h8.5"/><path d="M2.5 3.5h5M19.5 14.5v5"/>',
    'ข้องอ 45°': '<path d="M6 21v-6.5L17 3.5"/><path d="M3.5 21h5M15 1.8l3.7 3.7"/>',
    'สามทาง': '<path d="M2.5 8.5h19M12 8.5v12"/><path d="M2.5 5.5v6M21.5 5.5v6M9 20.5h6"/>',
    'ต่อตรง': '<path d="M2.5 12h19"/><rect x="7.5" y="8" width="9" height="8" rx="1.5"/>',
    'ข้อลด': '<path d="M2.5 9h6l7 1.8h6M2.5 15h6l7-1.8h6"/><path d="M8.5 7v10"/>',
    'แคลมป์ & กิ๊บ': '<circle cx="12" cy="12.5" r="5"/><path d="M3 12.5h4M17 12.5h4M3 10v5M21 10v5"/>',
    'ฝาครอบ': '<path d="M3 12h9"/><path d="M12 7h5a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-5z"/>',
  };
  const deptOf = (key) => DEPTS.find((d) => d.key === key) || { key, color: '#6b4ff6', tint: '#efebff', icon: 'box', desc: '' };
  const deptIcon = (key) => DICON[deptOf(key).icon] || I.box;
  const catIcon = (cat, dept) => (CICON[cat] ? sv(CICON[cat]) : deptIcon(dept));
  const tint = (dept) => { const d = deptOf(dept); return `--c:${d.color};--t:${d.tint}`; };
  const SEED_IMG = Object.fromEntries(SEED.filter((s) => s.img).map((s) => [s.id, s.img]));
  const imgFor = (it) => (it && (it.img || SEED_IMG[it.id])) || '';
  const pic = (it, eager) => {
    const src = imgFor(it);
    return src ? `<img src="${esc(src)}" alt="" ${eager ? '' : 'loading="lazy" '}decoding="async">` : catIcon(it && it.cat, it && it.dept);
  };
  const sizeHTML = (s) => esc(s).replace(/ ลด /g, '<span class="lo">ลด</span>');

  // ================= backends =================
  const apiUrl = () => String(store.get('apiUrl', '') || CFG.API_URL || '').trim();
  const isRemote = () => !DEMO && /^https:\/\//.test(apiUrl());

  const Local = {
    db() {
      let db = store.get('demo', null);
      if (!db || !Array.isArray(db.items)) {
        db = { items: SEED.map((x) => ({ ...x, updated: '' })), log: [], orders: [] };
        store.set('demo', db);
      }
      return db;
    },
    save(db) { db.log = db.log.slice(0, 400); store.set('demo', db); return JSON.parse(JSON.stringify(db)); },
    find(db, id) { return db.items.find((i) => i.id === id); },
    async load() { return this.db(); },
    async order({ by, site, need, note, lines }) {
      if (!by) throw new Error('กรุณาใส่ชื่อผู้สั่ง');
      if (!site) throw new Error('กรุณาใส่ไซต์งาน');
      const db = this.db();
      const ls = lines.map((l) => { const it = this.find(db, l.id); if (!it) throw new Error('ไม่พบสินค้า'); return { id: it.id, name: label(it), unit: it.unit, qty: l.qty }; });
      const no = 'RQ-' + String(db.orders.length + 1).padStart(4, '0');
      db.orders.unshift({ no, t: new Date().toISOString(), by, site, need, note, status: 'pending', lines: ls, handler: '', doneAt: '', given: null });
      const out = this.save(db); out.created = no; return out;
    },
    async fulfill({ no, by, lines }) {
      const db = this.db();
      const o = db.orders.find((x) => x.no === no);
      if (!o || o.status !== 'pending') throw new Error('ใบเบิกนี้ถูกจัดการไปแล้ว');
      const giveBy = Object.fromEntries(lines.map((l) => [l.id, l.qty]));
      const given = o.lines.map((l) => {
        const g = giveBy[l.id] ?? l.qty; const it = this.find(db, l.id);
        if (g > l.qty) throw new Error(l.name + ' จ่ายเกินที่สั่ง');
        if (g > 0 && (!it || it.qty < g)) throw new Error(`${l.name} เหลือ ${it ? it.qty : 0} ไม่พอจ่าย ${g}`);
        return { ...l, given: g };
      });
      if (!given.some((g) => g.given > 0)) throw new Error('ยังไม่ได้ใส่จำนวนที่จ่าย — ถ้าไม่จ่ายเลยให้กดยกเลิกใบเบิก');
      const now = new Date().toISOString();
      for (const g of given) {
        if (!g.given) continue;
        const it = this.find(db, g.id); it.qty -= g.given; it.updated = now;
        db.log.unshift({ t: now, kind: 'out', id: it.id, name: label(it), delta: -g.given, after: it.qty, by: o.by, site: o.site, note: `${o.no} · จ่ายโดย ${by}` });
      }
      o.status = given.every((g) => g.given >= g.qty) ? 'done' : 'partial';
      o.handler = by; o.doneAt = now; o.given = given;
      return this.save(db);
    },
    async cancel({ no, by, reason }) {
      const db = this.db();
      const o = db.orders.find((x) => x.no === no);
      if (!o || o.status !== 'pending') throw new Error('ใบเบิกนี้ถูกจัดการไปแล้ว');
      o.status = 'cancel'; o.handler = by + (reason ? ' — ' + reason : ''); o.doneAt = new Date().toISOString();
      return this.save(db);
    },
    async move({ by, site, note, lines }) {
      const db = this.db(); const now = new Date().toISOString();
      for (const l of lines) { const it = this.find(db, l.id); if (!it) throw new Error('ไม่พบรายการ'); if (it.qty + l.delta < 0) throw new Error(`${label(it)} เหลือ ${it.qty} ไม่พอ`); }
      for (const l of lines) {
        const it = this.find(db, l.id); it.qty += l.delta; it.updated = now;
        db.log.unshift({ t: now, kind: l.delta < 0 ? 'out' : 'in', id: it.id, name: label(it), delta: l.delta, after: it.qty, by, site: site || '', note: note || '' });
      }
      return this.save(db);
    },
    async adjust({ id, qty, by, note }) {
      const db = this.db(); const it = this.find(db, id); if (!it) throw new Error('ไม่พบรายการ');
      const now = new Date().toISOString(); const d = qty - it.qty; it.qty = qty; it.updated = now;
      db.log.unshift({ t: now, kind: 'adjust', id, name: label(it), delta: d, after: qty, by, site: '', note: note || 'นับสต็อกจริง' });
      return this.save(db);
    },
    async add({ item, by }) {
      const db = this.db();
      const n = Math.max(0, ...db.items.map((i) => parseInt(String(i.id).replace(/\D/g, ''), 10) || 0)) + 1;
      const id = 'P' + String(n).padStart(2, '0'); const now = new Date().toISOString();
      const it = { id, dept: item.dept, cat: item.cat || 'อื่น ๆ', name: item.name, size: item.size || '', qty: item.qty || 0, unit: item.unit || 'ชิ้น', min: item.min ?? 1, loc: CFG.STORE_NAME || '', updated: now };
      db.items.push(it);
      db.log.unshift({ t: now, kind: 'new', id, name: label(it), delta: it.qty, after: it.qty, by, site: '', note: '' });
      return this.save(db);
    },
  };

  const Remote = {
    async call(action, payload = {}) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 30000);
      try {
        const res = await fetch(apiUrl(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, pin: store.get('pin', ''), ...payload }), signal: ctrl.signal });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
        return j;
      } catch (e) {
        if (e.name === 'AbortError') throw new Error('สัญญาณช้า ลองอีกครั้ง');
        if (e instanceof TypeError) throw new Error('เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่');
        throw e;
      } finally { clearTimeout(timer); }
    },
    load() { return this.call('list'); },
  };
  ['order', 'fulfill', 'cancel', 'move', 'adjust', 'add'].forEach((a) => { Remote[a] = (p) => Remote.call(a, p); });
  const api = () => (isRemote() ? Remote : Local);

  // ================= state =================
  const S = {
    items: [], log: [], orders: [], loaded: false, error: '',
    cart: store.get('cart', {}),
    q: '', ordTab: 'pending', ordMine: null, buyTab: 'need', hKind: 'all', hq: '',
  };
  const me = () => store.get('me', '');
  const role = () => store.get('role', '');
  const isOffice = () => role() === 'office';
  const byId = (id) => S.items.find((i) => i.id === id);
  const statusOf = (it) => (it.qty <= 0 ? 'bad' : it.qty <= (it.min ?? 1) ? 'warn' : 'ok');
  const itemsIn = (dept) => S.items.filter((i) => (i.dept || 'ประปา') === dept);
  const cartCount = () => Object.keys(S.cart).length;
  const cartPcs = () => Object.values(S.cart).reduce((a, b) => a + b, 0);
  const pendingOrders = () => S.orders.filter((o) => o.status === 'pending');
  const myOrders = () => S.orders.filter((o) => me() && o.by === me());
  function demandMap() {
    const m = {};
    for (const o of pendingOrders()) for (const l of o.lines || []) m[l.id] = (m[l.id] || 0) + l.qty;
    return m;
  }
  function toBuy() {
    const dm = demandMap();
    return S.items.map((it) => {
      const dem = dm[it.id] || 0;
      const free = it.qty - dem;
      const need = free <= (it.min ?? 1);
      const suggest = Math.max(1, dem + Math.max(2, 2 * ((it.min ?? 1) + 1)) - it.qty);
      return { it, dem, free, need, suggest };
    }).filter((x) => x.need).sort((a, b) => a.free - b.free);
  }
  function setCart(id, q) {
    q = Math.max(0, Math.min(999, Math.round(Number(q) || 0)));
    if (q) S.cart[id] = q; else delete S.cart[id];
    store.set('cart', S.cart);
    $$(`.prod[data-id="${CSS.escape(id)}"]`).forEach((el) => { const it = byId(id); if (it) el.outerHTML = prodHTML(it); });
    renderChrome();
  }

  function apply(data) {
    S.items = (data.items || []).map((i) => ({ ...i, dept: i.dept || 'ประปา' }));
    S.log = data.log || [];
    S.orders = data.orders || [];
    S.loaded = true; S.error = '';
    for (const id of Object.keys(S.cart)) if (!byId(id)) delete S.cart[id];
    store.set('cart', S.cart);
    render();
  }
  async function refresh(silent) {
    try { apply(await api().load()); }
    catch (e) {
      S.loaded = true; S.error = e.message; render();
      if (e.message === 'PIN_REQUIRED') { if (!silent) openProfile(); return; }
      if (!silent) toast(e.message, true);
    }
  }

  // ================= routing =================
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const [a, b, c] = parts;
    if (!a) return { name: 'home' };
    if (a === 'd' && b) return { name: 'dept', dept: b, cat: c || '' };
    if (['depts', 'search', 'cart', 'orders', 'buy', 'history'].includes(a)) return { name: a, id: b || '' };
    return { name: 'home' };
  }
  const go = (h) => { if (location.hash !== h) location.hash = h; else render(); };

  // ================= chrome (sidebar, topbar, tabs, cartbar) =================
  function renderChrome() {
    const r = route();
    const pend = isOffice() ? pendingOrders().length : myOrders().filter((o) => o.status === 'pending').length;
    const nBuy = toBuy().length;
    const nCart = cartCount();
    const cnt = (n, hot) => (n ? `<span class="count ${hot ? 'hot' : ''}">${fmt(n)}</span>` : '');
    const nav = (href, icon, text, active, extra = '') => `<a class="nav-item ${active ? 'active' : ''}" href="${href}">${icon}<span>${text}</span>${extra}</a>`;
    const deptLinks = DEPTS.map((d) => {
      const n = itemsIn(d.key).length;
      const active = r.name === 'dept' && r.dept === d.key;
      return `<a class="nav-item dept-link ${n ? '' : 'soon'} ${active ? 'active' : ''}" style="${tint(d.key)}" href="#/d/${enc(d.key)}"><i>${deptIcon(d.key)}</i><span>${esc(d.key)}</span>${n ? cnt(n) : '<span class="soon-tag">เร็ว ๆ นี้</span>'}</a>`;
    }).join('');
    $('#side').innerHTML = `
      <a class="brand" href="#/"><img src="icon.svg" alt=""><div><b>${esc(CFG.BRAND || 'best home')}</b><span>${esc(CFG.APP_NAME || 'คลังสินค้า')} · ${esc(CFG.STORE_NAME || '')}</span></div></a>
      <div class="nav-label">เมนู</div>
      ${nav('#/', I.home, 'หน้าแรก', r.name === 'home')}
      ${nav('#/cart', I.cart, 'ตะกร้า', r.name === 'cart', cnt(nCart))}
      ${nav('#/orders', I.list, isOffice() ? 'ใบเบิกทั้งหมด' : 'ใบเบิกของฉัน', r.name === 'orders', cnt(pend, isOffice()))}
      ${isOffice() ? `<div class="nav-label">ออฟฟิศ · จัดซื้อ</div>
        ${nav('#/buy', I.buy, 'ต้องสั่งซื้อ / สต็อก', r.name === 'buy', cnt(nBuy))}
        ${nav('#/history', I.history, 'ประวัติสต็อก', r.name === 'history')}` : ''}
      <div class="nav-label">หมวดวัสดุ</div>
      ${deptLinks}
      <button class="me-card" data-act="profile">
        <span class="avatar ${isOffice() ? 'office' : ''}">${esc([...(me() || '?').replace(/^ช่าง/, '')][0] || '?')}</span>
        <div><b>${esc(me() || 'ตั้งชื่อผู้ใช้')}</b><span>${isOffice() ? 'ออฟฟิศ / จัดซื้อ' : role() === 'site' ? 'โฟร์แมน / หน้างาน' : 'ยังไม่ได้เลือกบทบาท'}</span></div>
        ${I.right}
      </button>`;

    $('#topcart').innerHTML = `${I.cart}<span>ตะกร้า</span><span class="n">${nCart || ''}</span>`;

    const tab = (href, icon, text, active, badge) => `<a class="tab ${active ? 'active' : ''}" href="${href}">${icon}<span>${text}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</a>`;
    $('#tabs').innerHTML = `
      ${tab('#/', I.home, 'หน้าแรก', r.name === 'home')}
      ${tab('#/depts', I.grid, 'หมวดสินค้า', r.name === 'depts' || r.name === 'dept')}
      <a class="tab center ${r.name === 'cart' ? 'active' : ''}" href="#/cart"><span class="bub">${I.cart}${nCart ? `<span class="badge">${nCart}</span>` : ''}</span><span>ตะกร้า</span></a>
      ${tab('#/orders', I.list, 'ใบเบิก', r.name === 'orders', pend)}
      ${isOffice() ? tab('#/buy', I.buy, 'จัดซื้อ', r.name === 'buy' || r.name === 'history', nBuy) : `<button class="tab" data-act="profile">${I.user}<span>ฉัน</span></button>`}`;

    const cb = $('#cartbar');
    if (nCart && ['home', 'dept', 'search', 'depts'].includes(r.name)) {
      const ids = Object.keys(S.cart);
      cb.hidden = false;
      cb.innerHTML = `<span class="stack">${ids.slice(0, 3).map((id) => `<span>${pic(byId(id), true)}</span>`).join('')}</span>
        <span class="ci"><b>ตะกร้า ${nCart} รายการ</b><span>รวม ${fmt(cartPcs())} ชิ้น</span></span><span class="go">ดูตะกร้า</span>`;
    } else cb.hidden = true;

    const b = $('#banner');
    if (S.error && S.error !== 'PIN_REQUIRED') b.innerHTML = `<div class="banner err">${I.alert}<span>${esc(S.error)}</span><button data-act="retry">ลองใหม่</button></div>`;
    else if (S.error === 'PIN_REQUIRED') b.innerHTML = `<div class="banner">${I.alert}<span>ต้องใส่รหัสทีมก่อนใช้งาน</span><button data-act="profile">ใส่รหัส</button></div>`;
    else if (!isRemote()) b.innerHTML = `<div class="banner">${I.info}<span>โหมดทดลอง — ข้อมูลเก็บในเครื่องนี้เท่านั้น ไม่เข้า Google Sheet</span></div>`;
    else b.innerHTML = '';
  }

  function setTitle(title, crumbs) {
    $('#ttl').innerHTML = `${crumbs && crumbs.length ? `<div class="crumb">${crumbs.map(([t, h]) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(' <span>›</span> ')}</div>` : ''}<h1>${esc(title)}</h1>`;
    document.title = `${title} · ${CFG.APP_NAME || 'คลังสินค้า'} ${CFG.BRAND || ''}`;
  }

  // ================= product card =================
  function stockBadge(it) {
    const st = statusOf(it);
    const t = st === 'bad' ? 'หมด' : st === 'warn' ? `เหลือ ${fmt(it.qty)}` : `มี ${fmt(it.qty)}`;
    return `<span class="stock ${st}">${t}</span>`;
  }
  function qtyCtl(id, q, cls = '') {
    return `<div class="qty ${cls}" data-id="${esc(id)}"><button data-cq="-1" aria-label="ลด">${I.minus}</button><input value="${q}" inputmode="numeric" data-cin aria-label="จำนวน"><button data-cq="1" aria-label="เพิ่ม">${I.plus}</button></div>`;
  }
  function prodHTML(it) {
    const q = S.cart[it.id] || 0;
    const sameAsCat = it.name === it.cat;
    return `<article class="prod ${q ? 'incart' : ''}" data-id="${esc(it.id)}" style="${tint(it.dept)}">
      <button class="pimg" data-open="${esc(it.id)}" aria-label="ดู ${esc(label(it))}">${pic(it)}${stockBadge(it)}${q ? `<span class="incart-badge">${I.cart}${q}</span>` : ''}</button>
      <button class="pbody" data-open="${esc(it.id)}" tabindex="-1">
        <div class="pcat">${esc(sameAsCat ? it.dept : it.cat)}</div>
        <div class="pname">${esc(it.name)}</div>
        ${it.size ? `<span class="psize">${sizeHTML(it.size)}</span>` : ''}
      </button>
      <div class="pfoot">${q ? qtyCtl(it.id, q) : `<button class="add" data-addcart="${esc(it.id)}">${I.plus}ใส่ตะกร้า</button>`}</div>
    </article>`;
  }
  const emptyBox = (icon, title, sub, extra = '') => `<div class="empty"><div class="ei">${icon}</div><b>${title}</b>${sub ? `<div>${sub}</div>` : ''}${extra}</div>`;
  const skeleton = (n = 8) => `<div class="grid">${Array.from({ length: n }, () => '<div class="skel"></div>').join('')}</div>`;

  // ================= pages =================
  const dateFmt = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long' });
  const dShort = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' });
  const tFmt = new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dayFmt = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  function whenTxt(iso) {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return '';
    const now = new Date(); const y = new Date(); y.setDate(now.getDate() - 1);
    return sameDay(d, now) ? `วันนี้ ${tFmt.format(d)}` : sameDay(d, y) ? `เมื่อวาน ${tFmt.format(d)}` : `${dShort.format(d)} ${tFmt.format(d)}`;
  }
  function needDate(v) {
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
    return isNaN(d) ? null : d;
  }
  function needTxt(v) {
    const d = needDate(v); if (!d) return '';
    const t = new Date(); const tm = new Date(); tm.setDate(t.getDate() + 1);
    return sameDay(d, t) ? 'วันนี้' : sameDay(d, tm) ? 'พรุ่งนี้' : dShort.format(d);
  }
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function popular() {
    const score = {};
    for (const o of S.orders) for (const l of o.lines || []) score[l.id] = (score[l.id] || 0) + l.qty;
    for (const l of S.log) if (l.kind === 'out') score[l.id] = (score[l.id] || 0) - l.delta;
    const ranked = S.items.filter((i) => score[i.id]).sort((a, b) => score[b.id] - score[a.id]);
    const rest = S.items.filter((i) => !score[i.id] && imgFor(i));
    return { list: ranked.concat(rest).slice(0, 12), real: ranked.length > 0 };
  }

  function pageHome() {
    setTitle('หน้าแรก', [[CFG.BRAND || 'best home'], [CFG.APP_NAME || 'คลังสินค้า']]);
    if (!S.loaded) return skeleton();
    const office = isOffice();
    const pend = pendingOrders();
    const mine = myOrders();
    const outToday = S.log.filter((l) => l.kind === 'out' && sameDay(new Date(l.t), new Date())).reduce((a, l) => a - l.delta, 0);
    const kpi = (cls, href, icon, n, label, small) => `<a class="kpi ${cls}" href="${href}"><i>${icon}</i><div><b>${fmt(n)}</b><span>${label}</span><small>${small}</small></div></a>`;
    const kpis = office
      ? kpi('a', '#/orders', I.list, pend.length, 'ใบเบิกรอจัด', 'กดเพื่อจ่ายของ') + kpi('b', '#/buy', I.buy, toBuy().length, 'ต้องสั่งซื้อ', 'ของน้อย/ไม่พอจ่าย') + kpi('c', '#/history', I.out, outToday, 'จ่ายออกวันนี้', 'ชิ้น')
      : kpi('b', '#/cart', I.cart, cartCount(), 'ในตะกร้า', `${fmt(cartPcs())} ชิ้น`) + kpi('a', '#/orders', I.list, mine.filter((o) => o.status === 'pending').length, 'ใบเบิกรอจัด', 'ของฉัน') + kpi('c', '#/depts', I.box, S.items.filter((i) => i.qty > 0).length, 'สินค้าพร้อมเบิก', 'รายการ');

    const deptCards = DEPTS.map((d) => {
      const arr = itemsIn(d.key);
      const thumbs = arr.filter(imgFor).slice(0, 3);
      return `<a class="dept ${arr.length ? '' : 'soon'}" style="${tint(d.key)}" href="#/d/${enc(d.key)}">
        <span class="di">${deptIcon(d.key)}</span>
        ${thumbs.length ? `<span class="thumbs">${thumbs.map((t) => `<img src="${esc(imgFor(t))}" alt="" loading="lazy">`).join('')}</span>` : ''}
        <div><b>${esc(d.key)}</b><p>${esc(d.desc || '')}</p></div>
        <div class="dfoot">${arr.length ? `<span class="pill brand" style="background:var(--t);color:var(--c)">${arr.length} รายการ</span>` : '<span class="pill grey">เร็ว ๆ นี้</span>'}<span class="go">${I.right}</span></div>
      </a>`;
    }).join('');

    const pop = popular();
    const recentOrders = (office ? pend : mine).slice(0, 3);
    return `
      <section class="hello">
        <div class="hello-card">
          <div><small>${esc(dateFmt.format(new Date()))} · ${esc(CFG.STORE_NAME || '')}</small>
          <h2>สวัสดี${me() ? `, ${esc(me())}` : 'ครับ'}</h2></div>
          <button class="role" data-act="profile">${office ? I.office : I.helmet}${office ? 'ออฟฟิศ / จัดซื้อ' : role() === 'site' ? 'โฟร์แมน / หน้างาน' : 'เลือกบทบาท'} · เปลี่ยน</button>
        </div>
        <div class="kpis">${kpis}</div>
      </section>
      <section class="sec">
        <div class="sec-head"><h2>หมวดวัสดุ</h2><span class="muted" style="font-size:13px">${S.items.length} รายการในคลัง</span></div>
        <div class="depts">${deptCards}</div>
      </section>
      <section class="sec">
        <div class="sec-head"><h2>${pop.real ? 'เบิกบ่อย' : 'สินค้าแนะนำ'}</h2><a href="#/d/${enc(DEPTS[0].key)}">ดูทั้งหมด</a></div>
        <div class="hscroll">${pop.list.map(prodHTML).join('')}</div>
      </section>
      ${recentOrders.length ? `<section class="sec">
        <div class="sec-head"><h2>${office ? 'ใบเบิกรอจัด' : 'ใบเบิกล่าสุดของฉัน'}</h2><a href="#/orders">ดูทั้งหมด</a></div>
        <div class="orders">${recentOrders.map(orderCard).join('')}</div>
      </section>` : ''}`;
  }

  function pageDepts() {
    setTitle('หมวดสินค้า', [[CFG.APP_NAME || 'คลังสินค้า', '#/']]);
    return `<div class="depts">${DEPTS.map((d) => {
      const n = itemsIn(d.key).length;
      return `<a class="dept ${n ? '' : 'soon'}" style="${tint(d.key)}" href="#/d/${enc(d.key)}"><span class="di">${deptIcon(d.key)}</span><div><b>${esc(d.key)}</b><p>${esc(d.desc || '')}</p></div>
        <div class="dfoot">${n ? `<span class="pill" style="background:var(--t);color:var(--c)">${n} รายการ</span>` : '<span class="pill grey">เร็ว ๆ นี้</span>'}<span class="go">${I.right}</span></div></a>`;
    }).join('')}</div>`;
  }

  function pageDept(r) {
    const d = deptOf(r.dept);
    setTitle(d.key, [[CFG.APP_NAME || 'คลังสินค้า', '#/'], ['หมวดวัสดุ', '#/depts']]);
    if (!S.loaded) return skeleton();
    const arr = itemsIn(d.key);
    const cats = [...new Map(arr.map((i) => [i.cat, 0])).keys()];
    const low = arr.filter((i) => statusOf(i) !== 'ok').length;
    const hero = `<div class="dept-hero" style="${tint(d.key)}"><span class="di">${deptIcon(d.key)}</span>
      <div><h2>${esc(d.key)}</h2><p>${esc(d.desc || '')}</p></div>
      ${arr.length ? `<div class="stats"><div><b>${arr.length}</b><span>รายการ</span></div><div><b>${fmt(arr.reduce((a, b) => a + b.qty, 0))}</b><span>ชิ้นในคลัง</span></div><div><b>${low}</b><span>ใกล้หมด</span></div></div>` : ''}</div>`;
    if (!arr.length) {
      return hero + emptyBox(deptIcon(d.key), 'ยังไม่มีสินค้าในหมวดนี้', 'ออฟฟิศเพิ่มสินค้าได้จากปุ่มด้านล่าง หรือเพิ่มแถวในชีตแท็บ "คลัง"',
        isOffice() ? `<div style="margin-top:16px"><button class="btn dark" data-act="add" data-dept="${esc(d.key)}">${I.plus}เพิ่มสินค้าในหมวดนี้</button></div>` : '');
    }
    const chip = (key, text, icon, n) => `<a class="chip ${r.cat === key ? 'active' : ''} ${icon ? '' : 'noicon'}" style="--c:${d.color}" href="#/d/${enc(d.key)}${key ? '/' + enc(key) : ''}">${icon ? `<i>${icon}</i>` : ''}${esc(text)} <em>${n}</em></a>`;
    const chips = chip('', 'ทั้งหมด', '', arr.length) + cats.map((c) => chip(c, c, catIcon(c, d.key), arr.filter((i) => i.cat === c).length)).join('');
    let body;
    if (r.cat) {
      const list = arr.filter((i) => i.cat === r.cat);
      body = `<div class="grid">${list.map(prodHTML).join('')}</div>`;
    } else {
      body = `<div class="grid">${cats.map((c) => {
        const list = arr.filter((i) => i.cat === c);
        return `<div class="group-h" style="${tint(d.key)}"><i>${catIcon(c, d.key)}</i>${esc(c)} <small>${list.length} รายการ</small></div>${list.map(prodHTML).join('')}`;
      }).join('')}</div>`;
    }
    return `${hero}<div class="subnav"><div class="chips">${chips}</div></div>
      <div class="toolbar"><span>${r.cat ? esc(r.cat) + ' · ' : ''}${(r.cat ? arr.filter((i) => i.cat === r.cat) : arr).length} รายการ · แตะรูปเพื่อดูรายละเอียด</span>
      ${isOffice() ? `<button class="add-btn" data-act="add" data-dept="${esc(d.key)}">${I.plus}เพิ่มสินค้า</button>` : ''}</div>${body}`;
  }

  function pageSearch() {
    setTitle(S.q ? `ค้นหา “${S.q}”` : 'ค้นหาสินค้า', [[CFG.APP_NAME || 'คลังสินค้า', '#/']]);
    if (!S.loaded) return skeleton();
    const toks = String(S.q).trim().split(/\s+/).filter(Boolean).map(norm);
    if (!toks.length) return emptyBox(I.box, 'พิมพ์ชื่อสินค้าที่ต้องการ', 'เช่น ข้องอ 1/2, สามทาง 2, ฝาครอบ');
    const list = S.items.filter((it) => { const h = norm(`${it.dept} ${it.cat} ${it.name} ${it.size} ${it.id}`); return toks.every((t) => h.includes(t)); });
    if (!list.length) return emptyBox(I.box, 'ไม่พบสินค้า', 'ลองพิมพ์คำอื่น หรือเลือกจากหมวดวัสดุ', '<div style="margin-top:14px"><a class="btn sm" href="#/depts">ดูหมวดวัสดุ</a></div>');
    return `<div class="toolbar"><span>พบ ${list.length} รายการ</span></div><div class="grid">${list.map(prodHTML).join('')}</div>`;
  }

  // ---------- cart ----------
  function sitePicks(value) {
    const recent = [...new Set(S.orders.filter((o) => o.by === me() && o.site).map((o) => o.site))];
    const sites = [...new Set(recent.concat(CFG.SITES || []))].slice(0, 8);
    return `<div class="picks" data-pickfor="site">${sites.map((s) => `<button type="button" data-pick="${esc(s)}" class="${s === value ? 'on' : ''}">${esc(s)}</button>`).join('')}</div>`;
  }
  function pageCart() {
    setTitle('ตะกร้า', [[CFG.APP_NAME || 'คลังสินค้า', '#/']]);
    const ids = Object.keys(S.cart).filter(byId);
    if (!S.loaded) return skeleton(2);
    if (!ids.length) return emptyBox(I.cart, 'ตะกร้ายังว่าง', 'เลือกสินค้าจากหมวดวัสดุ แล้วกด “ใส่ตะกร้า”', '<div style="margin-top:16px"><a class="btn dark" href="#/depts">เลือกสินค้า</a></div>');
    const dm = demandMap();
    const lines = ids.map((id) => {
      const it = byId(id); const q = S.cart[id]; const free = it.qty - (dm[id] || 0);
      const short = q > free;
      return `<div class="cline" style="${tint(it.dept)}"><div class="th">${pic(it, true)}</div>
        <div><div class="sub">${esc(it.dept)} · ${esc(it.cat)}</div><b>${esc(label(it))}</b>
        <div class="sub">คลังมี ${fmt(it.qty)} ${esc(it.unit)}${dm[id] ? ` · ติดใบเบิกอื่น ${fmt(dm[id])}` : ''}</div>
        ${short ? `<div class="warnline">ของไม่พอ ${fmt(q - Math.max(0, free))} ${esc(it.unit)} — ส่งได้ ออฟฟิศจะจัดซื้อเพิ่ม</div>` : ''}</div>
        <div class="act">${qtyCtl(id, q, 'light')}<button class="rm" data-rm="${esc(id)}">${I.trash.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} ลบ</button></div></div>`;
    }).join('');
    const today = ymd(new Date()); const tm = new Date(); tm.setDate(tm.getDate() + 1);
    const need = store.get('need', '') || today;
    return `<div class="cart-layout">
      <div><div class="toolbar" style="margin-top:0"><span>${ids.length} รายการ · ${fmt(cartPcs())} ชิ้น</span><button class="link" data-act="clearcart">ล้างตะกร้า</button></div>
        <div class="cart-lines">${lines}</div>
        <div class="note-box">${I.info}<span>ส่งใบเบิกแล้ว ออฟฟิศจะได้รับทันทีและจัดของให้ สต็อกจะตัดเมื่อออฟฟิศกด “จ่ายของ” · ติดตามสถานะได้ที่เมนูใบเบิก</span></div>
      </div>
      <form class="card summary" id="f-order">
        <h3>ส่งใบเบิก</h3>
        <div class="sumrow"><span>จำนวนรายการ</span><b>${ids.length}</b></div>
        <div class="sumrow"><span>รวม</span><b>${fmt(cartPcs())} ชิ้น</b></div>
        <label class="field"><span>ชื่อผู้สั่ง <i>*</i></span><input name="by" value="${esc(me())}" placeholder="เช่น ช่างสิงห์" required></label>
        <label class="field"><span>ไซต์งาน <i>*</i></span><input name="site" value="${esc(store.get('lastSite', ''))}" placeholder="เช่น ลาดพร้าว 80" list="sitelist" autocomplete="off" required>
          <datalist id="sitelist">${(CFG.SITES || []).map((s) => `<option value="${esc(s)}">`).join('')}</datalist></label>
        ${sitePicks(store.get('lastSite', ''))}
        <div class="field"><span>ต้องการใช้</span>
          <div class="picks" data-pickfor="need">
            <button type="button" data-pick="${today}" class="${need === today ? 'on' : ''}">วันนี้</button>
            <button type="button" data-pick="${ymd(tm)}" class="${need === ymd(tm) ? 'on' : ''}">พรุ่งนี้</button>
          </div>
          <input name="need" type="date" value="${esc(need)}" min="${today}"></div>
        <label class="field"><span>หมายเหตุ</span><textarea name="note" placeholder="ไม่บังคับ เช่น ใช้งานห้องน้ำชั้น 2 / ให้ส่งไปกับรถรอบบ่าย"></textarea></label>
        <button class="btn dark block" style="margin-top:16px" type="submit">${I.check}ส่งใบเบิก</button>
      </form></div>`;
  }

  // ---------- orders ----------
  const ST = { pending: 'รอจัด', done: 'จ่ายครบ', partial: 'จ่ายบางส่วน', cancel: 'ยกเลิก' };
  function orderCard(o) {
    const lines = o.lines || [];
    const pcs = lines.reduce((a, l) => a + l.qty, 0);
    const need = needTxt(o.need);
    return `<button class="ord" data-order="${esc(o.no)}">
      <div class="ord-top"><span class="ord-no">${esc(o.no)}</span><span class="pill dot st-${o.status}">${ST[o.status] || o.status}</span></div>
      <div class="ord-meta"><span>${I.user}${esc(o.by)}</span><span>${I.pin}${esc(o.site)}</span><span>${I.clock}${esc(whenTxt(o.t))}${need && o.status === 'pending' ? ` · <b class="ord-need">ต้องการใช้${need === 'วันนี้' || need === 'พรุ่งนี้' ? '' : 'วันที่'} ${esc(need)}</b>` : ''}</span></div>
      <div class="ord-items"><span class="stack">${lines.slice(0, 4).map((l) => `<span>${pic(byId(l.id) || { cat: '', dept: '' }, true)}</span>`).join('')}${lines.length > 4 ? `<span>+${lines.length - 4}</span>` : ''}</span>
        <small>${lines.length} รายการ · ${fmt(pcs)} ชิ้น</small></div>
    </button>`;
  }
  function pageOrders() {
    const office = isOffice();
    setTitle(office ? 'ใบเบิกทั้งหมด' : 'ใบเบิกของฉัน', [[CFG.APP_NAME || 'คลังสินค้า', '#/']]);
    if (!S.loaded) return skeleton(3);
    const mineOnly = S.ordMine ?? !office;
    const base = mineOnly ? myOrders() : S.orders;
    const groups = { pending: base.filter((o) => o.status === 'pending'), done: base.filter((o) => o.status === 'done' || o.status === 'partial'), cancel: base.filter((o) => o.status === 'cancel') };
    const list = groups[S.ordTab] || base;
    const segBtn = (k, t, n, hot) => `<button class="${S.ordTab === k ? 'on' : ''}" data-ordtab="${k}">${t}${hot && n ? ` <em>${n}</em>` : n ? ` (${n})` : ''}</button>`;
    return `<div class="ord-tools">
        <div class="seg">${segBtn('pending', 'รอจัด', groups.pending.length, true)}${segBtn('done', 'จ่ายแล้ว', groups.done.length)}${segBtn('cancel', 'ยกเลิก', groups.cancel.length)}</div>
        <div class="seg"><button class="${mineOnly ? 'on' : ''}" data-mine="1">ของฉัน</button><button class="${mineOnly ? '' : 'on'}" data-mine="0">ทุกคน</button></div>
      </div>
      ${!me() && mineOnly ? emptyBox(I.user, 'ยังไม่ได้ตั้งชื่อ', 'ตั้งชื่อเพื่อดูใบเบิกของคุณ', '<div style="margin-top:14px"><button class="btn dark" data-act="profile">ตั้งชื่อ</button></div>')
        : list.length ? `<div class="orders">${list.map(orderCard).join('')}</div>`
        : emptyBox(I.list, S.ordTab === 'pending' ? 'ไม่มีใบเบิกที่รอจัด' : 'ยังไม่มีใบเบิก', office ? '' : 'เลือกสินค้าใส่ตะกร้าแล้วส่งใบเบิกได้เลย', office ? '' : '<div style="margin-top:14px"><a class="btn dark" href="#/depts">เลือกสินค้า</a></div>')}`;
  }

  // ---------- buy (office) ----------
  function pageBuy() {
    setTitle('ต้องสั่งซื้อ / สต็อก', [[CFG.APP_NAME || 'คลังสินค้า', '#/'], ['ออฟฟิศ']]);
    if (!S.loaded) return skeleton(3);
    const need = toBuy();
    const dm = demandMap();
    const rows = S.buyTab === 'need' ? need : S.items.map((it) => ({ it, dem: dm[it.id] || 0, free: it.qty - (dm[it.id] || 0), suggest: 0 }));
    const head = `<div class="trow head"><span></span><span>สินค้า</span><span>คงเหลือ</span><span>ติดใบเบิก</span><span>${S.buyTab === 'need' ? 'แนะนำซื้อ' : 'เตือนเมื่อ ≤'}</span><span></span></div>`;
    const body = rows.map(({ it, dem, suggest }) => `<div class="trow" style="${tint(it.dept)}">
      <div class="th">${pic(it)}</div>
      <div><small>${esc(it.dept)} · ${esc(it.cat)}</small><b>${esc(label(it))}</b></div>
      <div class="cells"><span><span class="lbl">คงเหลือ</span><span class="num ${statusOf(it) === 'ok' ? '' : statusOf(it)}">${fmt(it.qty)}</span></span>
      <span><span class="lbl">ติดใบเบิก</span><span class="num">${fmt(dem)}</span></span>
      <span><span class="lbl">${S.buyTab === 'need' ? 'แนะนำซื้อ' : 'เตือน ≤'}</span><span class="num">${S.buyTab === 'need' ? fmt(suggest) : fmt(it.min ?? 1)}</span></span></div>
      <div class="acts" style="display:flex;gap:6px;justify-content:flex-end"><button class="btn sm" data-open="${esc(it.id)}">ดู</button><button class="btn sm dark" data-receive="${esc(it.id)}" data-sg="${suggest}">${I.in}รับเข้า</button></div>
    </div>`).join('');
    return `<div class="buy-head">
        <div class="seg"><button class="${S.buyTab === 'need' ? 'on' : ''}" data-buytab="need">ต้องสั่งซื้อ (${need.length})</button><button class="${S.buyTab === 'all' ? 'on' : ''}" data-buytab="all">สต็อกทั้งหมด (${S.items.length})</button></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${S.buyTab === 'need' && need.length ? `<button class="btn sm" data-act="copybuy">${I.copy}คัดลอกรายการสั่งซื้อ</button>` : ''}<a class="btn sm" href="#/history">${I.history}ประวัติสต็อก</a><button class="btn sm dark" data-act="add">${I.plus}เพิ่มสินค้า</button></div>
      </div>
      ${S.buyTab === 'need' ? '<p class="muted" style="margin:-4px 2px 12px;font-size:13px">ของที่เหลือถึงจุดเตือน หรือไม่พอจ่ายใบเบิกที่รออยู่ · ซื้อมาแล้วกด “รับเข้า” เพื่อเพิ่มสต็อก</p>' : ''}
      ${rows.length ? `<div class="tbl">${head}${body}</div>` : emptyBox(I.check, 'ไม่มีของที่ต้องสั่งซื้อ', 'สต็อกพอสำหรับใบเบิกทั้งหมด')}`;
  }

  // ---------- history ----------
  const KIND = { out: 'เบิกออก', in: 'รับเข้า', adjust: 'ปรับยอด', new: 'เพิ่มสินค้า' };
  function logRow(l) {
    const it = byId(l.id) || { id: l.id, cat: '', dept: '', name: l.name, size: '' };
    const meta = [KIND[l.kind] || l.kind, l.by, l.site && `ไซต์ ${l.site}`, tFmt.format(new Date(l.t))].filter(Boolean).map(esc).join(' · ');
    return `<div class="log-row"><div class="log-ic">${pic(it)}<span class="k ${l.kind}">${I[l.kind] || I.box}</span></div>
      <div style="min-width:0"><b>${esc(l.name)}</b><span>${meta}${l.note ? ' · ' + esc(l.note) : ''}</span></div>
      <div class="log-q"><b class="${l.kind}">${l.delta > 0 ? '+' : ''}${fmt(l.delta)}</b><span style="display:block;font-size:11.5px;color:var(--muted)">เหลือ ${fmt(l.after)}</span></div></div>`;
  }
  function pageHistory() {
    setTitle('ประวัติสต็อก', [[CFG.APP_NAME || 'คลังสินค้า', '#/'], ['ออฟฟิศ', '#/buy']]);
    if (!S.loaded) return skeleton(2);
    const q = norm(S.hq);
    const list = S.log.filter((l) => (S.hKind === 'all' || l.kind === S.hKind || (S.hKind === 'in' && l.kind === 'new')) && (!q || norm(`${l.name} ${l.by} ${l.site} ${l.note}`).includes(q)));
    const seg = [['all', 'ทั้งหมด'], ['out', 'เบิกออก'], ['in', 'รับเข้า'], ['adjust', 'ปรับยอด']].map(([k, t]) => `<button class="${S.hKind === k ? 'on' : ''}" data-hkind="${k}">${t}</button>`).join('');
    const groups = new Map();
    for (const l of list) { const k = new Date(l.t).toDateString(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(l); }
    return `<div class="ord-tools"><div class="seg">${seg}</div>
      <label class="search" style="display:flex"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="hq" value="${esc(S.hq)}" placeholder="ค้นหาของ คนเบิก ไซต์ เลขใบเบิก"></label></div>
      ${list.length ? [...groups].map(([, arr]) => `<div class="day">${esc(dayFmt.format(new Date(arr[0].t)))}<small>${(() => { const n = arr.filter((l) => l.kind === 'out').reduce((a, l) => a - l.delta, 0); return n ? `เบิกออก ${fmt(n)} ชิ้น` : ''; })()}</small></div><div class="log">${arr.map(logRow).join('')}</div>`).join('')
        : emptyBox(I.history, 'ยังไม่มีประวัติ', 'ประวัติจะขึ้นเมื่อมีการจ่ายของ รับเข้า หรือปรับยอด')}`;
  }

  // ================= render =================
  let lastRoute = '';
  function render() {
    const r = route();
    document.body.dataset.route = r.name;
    renderChrome();
    const key = location.hash;
    const scroll = key === lastRoute ? window.scrollY : 0;
    const page = { home: pageHome, depts: pageDepts, dept: pageDept, search: pageSearch, cart: pageCart, orders: pageOrders, buy: pageBuy, history: pageHistory }[r.name] || pageHome;
    const active = document.activeElement && document.activeElement.id === 'hq';
    $('#page').innerHTML = page(r);
    if (active) { const h = $('#hq'); h.focus(); h.setSelectionRange(h.value.length, h.value.length); }
    if (key !== lastRoute) window.scrollTo(0, 0); else window.scrollTo(0, scroll);
    lastRoute = key;
    wirePage(r);
    if (r.name === 'orders' && r.id) openOrder(r.id, true);
  }

  function wirePage(r) {
    if (r.name === 'cart') {
      const f = $('#f-order'); if (!f) return;
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const by = f.by.value.trim(), site = f.site.value.trim();
        if (!by) return f.by.focus();
        if (!site) return f.site.focus();
        const lines = Object.entries(S.cart).filter(([id]) => byId(id)).map(([id, qty]) => ({ id, qty }));
        const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'กำลังส่ง…';
        try {
          const data = await api().order({ by, site, need: f.need.value, note: f.note.value.trim(), lines });
          store.set('me', by); store.set('lastSite', site); store.set('need', '');
          if (!role()) store.set('role', 'site');
          S.cart = {}; store.set('cart', {});
          S.ordTab = 'pending';
          apply(data);
          toast(`ส่งใบเบิก ${data.created || ''} แล้ว`);
          go('#/orders/' + enc(data.created || ''));
        } catch (err) { btn.disabled = false; btn.innerHTML = `${I.check}ลองส่งอีกครั้ง`; toast(err.message, true); }
      });
      f.need.addEventListener('change', () => { store.set('need', f.need.value); $$('[data-pickfor=need] button', f).forEach((b) => b.classList.toggle('on', b.dataset.pick === f.need.value)); });
    }
  }

  // ================= sheets =================
  const wrap = $('#sheet-wrap'), sheet = $('#sheet');
  let sheetOnClose = null;
  function openSheet(html, after, onClose) {
    sheet.innerHTML = `<div class="grab"></div>${html}`;
    sheet.scrollTop = 0; wrap.hidden = false; document.body.style.overflow = 'hidden';
    sheetOnClose = onClose || null;
    if (after) after(sheet);
  }
  function closeSheet() {
    if (wrap.hidden) return;
    wrap.hidden = true; sheet.innerHTML = ''; document.body.style.overflow = '';
    const f = sheetOnClose; sheetOnClose = null; if (f) f();
  }
  const head = (title, sub) => `<div class="sheet-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="x" data-close aria-label="ปิด">${I.x}</button></div>`;
  async function busy(btn, text, fn) {
    const html = btn.innerHTML; btn.disabled = true; btn.textContent = text;
    try { await fn(); } catch (e) { toast(e.message, true); btn.disabled = false; btn.innerHTML = html; }
  }

  function openProduct(id) {
    const it = byId(id); if (!it) return;
    const dm = demandMap();
    const inCart = S.cart[id] || 0;
    const free = it.qty - (dm[id] || 0);
    const logs = S.log.filter((l) => l.id === id).slice(0, 3);
    openSheet(`<div class="dpic" style="${tint(it.dept)}">${pic(it, true)}${stockBadge(it)}<button class="x" data-close aria-label="ปิด">${I.x}</button></div>
      <div class="dtitle"><div class="pcat">${esc(it.dept)} · ${esc(it.cat)} · รหัส ${esc(it.id)}</div><h3>${esc(it.name)} ${it.size ? `<span class="psize" style="vertical-align:3px">${sizeHTML(it.size)}</span>` : ''}</h3></div>
      <div class="facts"><div><b>${fmt(it.qty)}</b><span>คงเหลือ (${esc(it.unit)})</span></div><div><b>${fmt(dm[id] || 0)}</b><span>ติดใบเบิกรอจัด</span></div><div><b>${fmt(Math.max(0, free))}</b><span>พร้อมเบิก</span></div></div>
      <div class="buyrow">${qtyCtl('__d', inCart || 1, 'light')}<button class="btn dark" data-act="d-add">${I.cart}${inCart ? 'อัปเดตตะกร้า' : 'ใส่ตะกร้า'}</button></div>
      ${free <= 0 ? `<div class="note-box">${I.info}<span>ของในคลังไม่พอ — ยังสั่งได้ ใบเบิกจะไปถึงออฟฟิศเพื่อจัดซื้อเพิ่ม</span></div>` : ''}
      ${isOffice() ? `<div class="office-box"><h4>${I.office}สำหรับออฟฟิศ</h4>
        <div class="row2"><button class="btn sm" data-receive="${esc(id)}">${I.in}รับของเข้า</button><button class="btn sm" data-act="d-adjust">${I.adjust}ปรับยอดนับจริง</button></div>
        ${logs.length ? `<div class="log" style="margin-top:12px">${logs.map(logRow).join('')}</div>` : ''}</div>` : ''}`, (root) => {
      const inp = $('[data-cin]', root);
      $('[data-act=d-add]', root).addEventListener('click', () => {
        setCart(id, inp.value);
        closeSheet();
        toast(Number(inp.value) > 0 ? `ใส่ตะกร้า ${label(it)} × ${inp.value}` : 'นำออกจากตะกร้าแล้ว');
      });
      const adj = $('[data-act=d-adjust]', root);
      if (adj) adj.addEventListener('click', () => openAdjust(id));
    });
  }

  function openReceive(id, suggest) {
    const it = byId(id); if (!it) return;
    openSheet(`${head('รับของเข้า', esc(label(it)) + ` · คงเหลือ ${fmt(it.qty)} ${esc(it.unit)}`)}
      <form id="f-rcv">
        <div class="field"><span>จำนวนที่รับเข้า</span>${qtyCtl('__r', Math.max(1, Number(suggest) || 1), 'light')}</div>
        <label class="field"><span>ผู้รับของ <i>*</i></span><input name="by" value="${esc(me())}" required></label>
        <label class="field"><span>หมายเหตุ</span><input name="note" placeholder="เช่น ซื้อจากร้าน… / เลขที่บิล"></label>
        <button class="btn dark block" style="margin-top:16px" type="submit">${I.check}บันทึกรับเข้า</button>
      </form>`, (root) => {
      const f = $('#f-rcv', root);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const n = Math.round(Number($('[data-cin]', root).value) || 0);
        if (n <= 0) return toast('ใส่จำนวนที่รับเข้า', true);
        if (!f.by.value.trim()) return f.by.focus();
        busy(f.querySelector('button[type=submit]'), 'กำลังบันทึก…', async () => {
          apply(await api().move({ by: f.by.value.trim(), site: '', note: f.note.value.trim() || 'รับของเข้า', lines: [{ id, delta: n }] }));
          store.set('me', f.by.value.trim());
          closeSheet(); toast(`รับเข้า ${label(it)} ${n} ${it.unit}`);
        });
      });
    });
  }

  function openAdjust(id) {
    const it = byId(id); if (!it) return;
    openSheet(`${head('ปรับยอดนับจริง', esc(label(it)) + ` · ในระบบ ${fmt(it.qty)} ${esc(it.unit)}`)}
      <form id="f-adj">
        <div class="field"><span>นับของจริงได้</span>${qtyCtl('__a', it.qty, 'light')}</div>
        <label class="field"><span>ผู้นับ <i>*</i></span><input name="by" value="${esc(me())}" required></label>
        <button class="btn dark block" style="margin-top:16px" type="submit">${I.check}บันทึกยอด</button>
      </form>`, (root) => {
      const f = $('#f-adj', root);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const qty = Math.max(0, Math.round(Number($('[data-cin]', root).value) || 0));
        if (!f.by.value.trim()) return f.by.focus();
        busy(f.querySelector('button[type=submit]'), 'กำลังบันทึก…', async () => {
          apply(await api().adjust({ id, qty, by: f.by.value.trim(), note: 'นับสต็อกจริง' }));
          closeSheet(); toast(`ปรับยอดเป็น ${qty} แล้ว`);
        });
      });
    });
  }

  function openOrder(no, fromRoute) {
    const o = S.orders.find((x) => x.no === no);
    if (!o) { if (S.loaded && fromRoute) { toast('ไม่พบใบเบิก ' + no, true); go('#/orders'); } return; }
    const office = isOffice();
    const pending = o.status === 'pending';
    const canFulfill = office && pending;
    const mine = me() && o.by === me();
    const given = o.given ? Object.fromEntries(o.given.map((g) => [g.id, g.given])) : null;
    const lines = (o.lines || []).map((l) => {
      const it = byId(l.id);
      const stock = it ? it.qty : 0;
      const g = given ? given[l.id] ?? 0 : null;
      let small;
      if (canFulfill) small = stock >= l.qty ? `<small>คลังมี ${fmt(stock)}</small>` : `<small class="short">คลังมี ${fmt(stock)} · ขาด ${fmt(l.qty - stock)}</small>`;
      else if (g != null) small = g >= l.qty ? '<small>จ่ายครบ</small>' : `<small class="short">จ่าย ${fmt(g)} จาก ${fmt(l.qty)}</small>`;
      else small = `<small>${esc(l.unit || '')}</small>`;
      const right = canFulfill
        ? `<div class="give">${qtyCtl('g:' + l.id, Math.min(l.qty, Math.max(0, stock)), 'light')}<small style="display:block;text-align:center;font-size:11px;color:var(--muted)">สั่ง ${fmt(l.qty)} · จ่ายจริง</small></div>`
        : `<div class="q">×${fmt(l.qty)}</div>`;
      return `<div class="oline"><div class="th">${pic(it || { cat: '', dept: '' }, true)}</div><div><b>${esc(l.name)}</b>${small}</div>${right}</div>`;
    }).join('');
    const pcs = (o.lines || []).reduce((a, l) => a + l.qty, 0);
    const done = !pending ? `<div><span>${o.status === 'cancel' ? 'ยกเลิกโดย' : 'จ่ายโดย'}</span><b>${esc(o.handler || '-')}</b></div><div><span>เมื่อ</span><b>${esc(whenTxt(o.doneAt))}</b></div>` : '';
    openSheet(`${head(`ใบเบิก ${esc(o.no)} <span class="pill dot st-${o.status}" style="vertical-align:3px;margin-left:4px">${ST[o.status]}</span>`, `${(o.lines || []).length} รายการ · ${fmt(pcs)} ชิ้น`)}
      <div class="meta-grid"><div><span>ผู้สั่ง</span><b>${esc(o.by)}</b></div><div><span>ไซต์งาน</span><b>${esc(o.site)}</b></div>
        <div><span>สั่งเมื่อ</span><b>${esc(whenTxt(o.t))}</b></div><div><span>ต้องการใช้</span><b>${esc(needTxt(o.need) || '-')}</b></div>${done}</div>
      ${o.note ? `<div class="note-box">${I.info}<span>${esc(o.note)}</span></div>` : ''}
      <div class="olist">${lines}</div>
      ${canFulfill ? `<label class="field"><span>ผู้จ่ายของ <i>*</i></span><input id="handler" value="${esc(me())}"></label>
        <div class="sheet-actions two"><button class="btn danger" data-act="o-cancel">${I.x}ยกเลิกใบเบิก</button><button class="btn ok" data-act="o-fulfill">${I.check}ยืนยันจ่ายของ</button></div>
        <p class="muted" style="font-size:12.5px;margin:10px 2px 0">ของที่จ่ายไม่ครบจะยังขึ้นในหน้า “ต้องสั่งซื้อ” ถ้าสต็อกต่ำ</p>`
      : pending && mine ? `<div class="sheet-actions"><button class="btn danger block" data-act="o-cancel">${I.x}ยกเลิกใบเบิกนี้</button></div><p class="muted" style="font-size:12.5px;margin:10px 2px 0">ออฟฟิศกำลังจัดของ — ถ้าต้องการแก้รายการ ให้ยกเลิกแล้วส่งใหม่</p>`
      : `<div class="sheet-actions"><button class="btn block" data-act="o-repeat">${I.repeat}สั่งซ้ำ (ใส่ตะกร้า)</button></div>`}`, (root) => {
      const act = (name, fn) => { const b = $(`[data-act=${name}]`, root); if (b) b.addEventListener('click', () => fn(b)); };
      act('o-fulfill', (b) => {
        const handler = $('#handler', root).value.trim();
        if (!handler) return $('#handler', root).focus();
        const lines2 = (o.lines || []).map((l) => ({ id: l.id, qty: Math.max(0, Math.round(Number($(`.qty[data-id="g:${CSS.escape(l.id)}"] input`, root).value) || 0)) }));
        busy(b, 'กำลังบันทึก…', async () => {
          apply(await api().fulfill({ no: o.no, by: handler, lines: lines2 }));
          store.set('me', handler);
          closeSheet(); toast(`จ่ายของใบเบิก ${o.no} แล้ว`);
        });
      });
      act('o-cancel', (b) => {
        const reason = prompt('เหตุผลที่ยกเลิก (ไม่บังคับ)', '');
        if (reason === null) return;
        const by = ($('#handler', root) && $('#handler', root).value.trim()) || me() || 'ไม่ระบุ';
        busy(b, 'กำลังยกเลิก…', async () => {
          apply(await api().cancel({ no: o.no, by, reason }));
          closeSheet(); toast(`ยกเลิกใบเบิก ${o.no} แล้ว`);
        });
      });
      act('o-repeat', () => {
        for (const l of o.lines || []) if (byId(l.id)) S.cart[l.id] = (S.cart[l.id] || 0) + l.qty;
        store.set('cart', S.cart);
        closeSheet(); toast('ใส่ตะกร้าแล้ว'); go('#/cart');
      });
    }, () => { if (route().name === 'orders' && route().id) { history.replaceState(null, '', '#/orders'); lastRoute = location.hash; } render(); });
  }

  function openAdd(dept) {
    const d0 = dept || DEPTS[0].key;
    const catsOf = (k) => [...new Set(itemsIn(k).map((i) => i.cat))];
    openSheet(`${head('เพิ่มสินค้าใหม่', 'สินค้าจะขึ้นในหมวดวัสดุที่เลือก')}
      <form id="f-add">
        <label class="field"><span>หมวดวัสดุ</span><select name="dept">${DEPTS.map((d) => `<option ${d.key === d0 ? 'selected' : ''}>${esc(d.key)}</option>`).join('')}</select></label>
        <label class="field"><span>หมวดย่อย</span><input name="cat" list="catlist" placeholder="เช่น ข้องอ 90°, สายไฟ, กาว"><datalist id="catlist"></datalist></label>
        <label class="field"><span>ชื่อสินค้า <i>*</i></span><input name="name" required placeholder="เช่น ข้องอ 90° เกลียวนอก"></label>
        <div class="row2"><label class="field"><span>ขนาด/รุ่น</span><input name="size" placeholder='เช่น 1/2"'></label><label class="field"><span>หน่วย</span><input name="unit" value="ชิ้น"></label></div>
        <div class="row2"><label class="field"><span>จำนวนเริ่มต้น</span><input name="qty" type="number" inputmode="numeric" min="0" value="0"></label><label class="field"><span>เตือนเมื่อเหลือ</span><input name="min" type="number" inputmode="numeric" min="0" value="1"></label></div>
        <label class="field"><span>ผู้เพิ่ม <i>*</i></span><input name="by" value="${esc(me())}" required></label>
        <p class="muted" style="font-size:12.5px;margin:10px 2px 0">รูปสินค้า: ส่งรูปให้ทีมดูแลเว็บใส่ภายหลัง (ระหว่างนี้แสดงเป็นไอคอน)</p>
        <button class="btn dark block" style="margin-top:14px" type="submit">${I.plus}เพิ่มสินค้า</button>
      </form>`, (root) => {
      const f = $('#f-add', root);
      const fill = () => { $('#catlist', root).innerHTML = catsOf(f.dept.value).map((c) => `<option value="${esc(c)}">`).join(''); };
      fill(); f.dept.addEventListener('change', fill);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = f.name.value.trim(), by = f.by.value.trim();
        if (!name) return f.name.focus();
        if (!by) return f.by.focus();
        const item = { dept: f.dept.value, cat: f.cat.value.trim() || 'อื่น ๆ', name, size: f.size.value.trim(), unit: f.unit.value.trim() || 'ชิ้น', qty: Math.max(0, Math.round(Number(f.qty.value) || 0)), min: Math.max(0, Math.round(Number(f.min.value) || 0)) };
        busy(f.querySelector('button[type=submit]'), 'กำลังบันทึก…', async () => {
          apply(await api().add({ item, by }));
          closeSheet(); toast('เพิ่มสินค้าแล้ว'); go('#/d/' + enc(item.dept));
        });
      });
    });
  }

  function openProfile(first) {
    let r = role() || 'site';
    const remote = isRemote();
    openSheet(`${head(first ? 'ยินดีต้อนรับ 👋' : 'ข้อมูลของฉัน', first ? 'ตั้งชื่อและเลือกบทบาทครั้งเดียว ระบบจำไว้ในเครื่องนี้' : 'เก็บไว้ในเครื่องนี้')}
      <form id="f-prof">
        <label class="field"><span>ชื่อของฉัน <i>*</i></span><input name="me" value="${esc(me())}" placeholder="เช่น ช่างสิงห์ / ปาล์ม" required></label>
        <div class="roles">
          <button type="button" class="role-opt ${r === 'site' ? 'on' : ''}" data-role="site"><i>${I.helmet}</i><b>โฟร์แมน / หน้างาน</b><span>เลือกของ ใส่ตะกร้า ส่งใบเบิก ติดตามสถานะ</span></button>
          <button type="button" class="role-opt ${r === 'office' ? 'on' : ''}" data-role="office"><i>${I.office}</i><b>ออฟฟิศ / จัดซื้อ</b><span>จ่ายของตามใบเบิก รับของเข้า ดูของที่ต้องซื้อ</span></button>
        </div>
        <label class="field"><span>รหัสทีม (PIN)</span><input name="pin" type="password" inputmode="numeric" value="${esc(store.get('pin', ''))}" placeholder="ถ้าออฟฟิศตั้งไว้"></label>
        <button class="btn dark block" style="margin-top:16px" type="submit">${I.check}บันทึก</button>
      </form>
      <div class="status-box"><span class="dot ${remote && !S.error ? 'on' : 'off'}"></span><div><b>${remote ? (S.error ? 'เชื่อมต่อไม่สำเร็จ' : 'เชื่อม Google Sheet แล้ว') : 'โหมดทดลอง'}</b>
        <p>${remote ? 'ทุกเครื่องเห็นข้อมูลเดียวกัน อัปเดตอัตโนมัติทุก 30 วินาที' : 'ข้อมูลอยู่ในเครื่องนี้เท่านั้น'}</p></div></div>
      ${!remote ? '<button class="btn block" style="margin-top:10px" data-act="reset-demo">ล้างข้อมูลทดลอง</button>' : ''}`, (root) => {
      $$('[data-role]', root).forEach((b) => b.addEventListener('click', () => { r = b.dataset.role; $$('[data-role]', root).forEach((x) => x.classList.toggle('on', x === b)); }));
      const f = $('#f-prof', root);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = f.me.value.trim(); if (!name) return f.me.focus();
        const pinChanged = f.pin.value.trim() !== store.get('pin', '');
        store.set('me', name); store.set('role', r); store.set('pin', f.pin.value.trim());
        S.ordMine = null;
        closeSheet(); render(); toast('บันทึกแล้ว');
        if (pinChanged || S.error) refresh();
      });
    });
  }

  // ================= toast =================
  let toastTimer;
  function toast(msg, err) {
    const t = $('#toast');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = `${err ? I.alert : I.check}<span>${esc(msg)}</span>`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), err ? 4500 : 2400);
  }

  // ================= events =================
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) return closeSheet();
    const ds = t.dataset;
    if (ds.cq) {
      const box = t.closest('.qty'); const inp = $('input', box);
      const v = Math.max(0, (Math.round(Number(inp.value) || 0)) + Number(ds.cq));
      const id = box.dataset.id;
      if (id.startsWith('__') || id.startsWith('g:')) { inp.value = Math.max(id === '__d' || id === '__r' ? 1 : 0, v); return; }
      setCart(id, v);
      if (route().name === 'cart') render();
      return;
    }
    if (ds.addcart) { e.preventDefault(); setCart(ds.addcart, 1); if (navigator.vibrate && navigator.userActivation?.hasBeenActive) navigator.vibrate(8); return; }
    if (ds.open) { e.preventDefault(); return openProduct(ds.open); }
    if (ds.order) return go('#/orders/' + enc(ds.order));
    if (ds.rm) { setCart(ds.rm, 0); return render(); }
    if (ds.receive) return openReceive(ds.receive, ds.sg);
    if (ds.pick != null) {
      const grp = t.closest('[data-pickfor]'); const f = t.closest('form'); const name = grp.dataset.pickfor;
      if (f && f[name]) { f[name].value = ds.pick; if (name === 'need') store.set('need', ds.pick); }
      $$('button', grp).forEach((b) => b.classList.toggle('on', b === t));
      return;
    }
    if (ds.ordtab) { S.ordTab = ds.ordtab; return render(); }
    if (ds.mine) { S.ordMine = ds.mine === '1'; return render(); }
    if (ds.buytab) { S.buyTab = ds.buytab; return render(); }
    if (ds.hkind) { S.hKind = ds.hkind; return render(); }
    switch (ds.act) {
      case 'profile': return openProfile();
      case 'retry': return refresh();
      case 'add': return openAdd(ds.dept);
      case 'clearcart': if (confirm('ล้างของทั้งหมดในตะกร้า?')) { S.cart = {}; store.set('cart', {}); render(); } return;
      case 'copybuy': {
        const list = toBuy();
        const txt = `รายการสั่งซื้อ ${CFG.BRAND || ''} (${dShort.format(new Date())})\n` + list.map((x, i) => `${i + 1}. ${label(x.it)} — ${x.suggest} ${x.it.unit}`).join('\n');
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('คัดลอกแล้ว วางใน LINE ได้เลย'), () => { prompt('คัดลอกข้อความนี้', txt); });
        return;
      }
      case 'reset-demo': if (confirm('ล้างข้อมูลทดลองทั้งหมดในเครื่องนี้?')) { store.set('demo', null); closeSheet(); refresh(); } return;
    }
  });
  document.addEventListener('change', (e) => {
    const inp = e.target.closest('.qty input'); if (!inp) return;
    const id = inp.closest('.qty').dataset.id;
    if (id.startsWith('__') || id.startsWith('g:')) return;
    setCart(id, inp.value);
    if (route().name === 'cart') render();
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'hq') { S.hq = e.target.value; render(); }
  });
  document.addEventListener('focusin', (e) => { if (e.target.matches('.qty input')) e.target.select(); });
  const q = $('#q');
  q.addEventListener('input', () => {
    S.q = q.value;
    if (S.q && route().name !== 'search') location.hash = '#/search';
    else render();
  });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { q.blur(); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !wrap.hidden) closeSheet(); });
  window.addEventListener('hashchange', () => {
    if (!wrap.hidden) { sheetOnClose = null; wrap.hidden = true; sheet.innerHTML = ''; document.body.style.overflow = ''; }
    if (route().name !== 'search' && q.value) { q.value = ''; S.q = ''; }
    render();
  });

  setInterval(() => { if (isRemote() && document.visibilityState === 'visible' && wrap.hidden) refresh(true); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && isRemote() && wrap.hidden) refresh(true); });

  render();
  refresh().then(() => { if (!me() || !role()) openProfile(true); });
})();
