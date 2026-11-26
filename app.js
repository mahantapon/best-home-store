(() => {
  'use strict';

  const CFG = window.STOCK_CONFIG || {};
  const SEED = window.STOCK_SEED || [];
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('stock.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('stock.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };
  const fmt = (n) => Number(n || 0).toLocaleString('th-TH');
  const label = (it) => `${it.name} ${it.size}`.trim();

  // ---------- icons ----------
  const ICON = {
    'ข้องอ 90°': '<path d="M5 3.5v7.5a6 6 0 0 0 6 6h8.5"/><path d="M2.5 3.5h5M19.5 14.5v5"/>',
    'ข้องอ 45°': '<path d="M6 21v-6.5L17 3.5"/><path d="M3.5 21h5M15 1.8l3.7 3.7"/>',
    'สามทาง': '<path d="M2.5 8.5h19M12 8.5v12"/><path d="M2.5 5.5v6M21.5 5.5v6M9 20.5h6"/>',
    'ต่อตรง': '<path d="M2.5 12h19"/><rect x="7.5" y="8" width="9" height="8" rx="1.5"/>',
    'ข้อลด': '<path d="M2.5 9h6l7 1.8h6M2.5 15h6l7-1.8h6"/><path d="M8.5 7v10"/>',
    'แคลมป์ & กิ๊บ': '<circle cx="12" cy="12.5" r="5"/><path d="M3 12.5h4M17 12.5h4M3 10v5M21 10v5"/>',
    'ฝาครอบ': '<path d="M3 12h9"/><path d="M12 7h5a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-5z"/>',
  };
  const iconFor = (cat) => `<svg viewBox="0 0 24 24">${ICON[cat] || '<path d="M4 7h7a4 4 0 0 1 4 4v9"/><path d="M2.5 5v4M15 21.5h4"/>'}</svg>`;
  const I = {
    minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
    in: '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
    adjust: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
    alert: '<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  };
  I.new = I.in;

  // ---------- backends ----------
  const apiUrl = () => String(store.get('apiUrl', '') || CFG.API_URL || '').trim();
  const isRemote = () => /^https:\/\//.test(apiUrl());

  const Local = {
    db() {
      let db = store.get('db', null);
      if (!db || !Array.isArray(db.items)) {
        db = { items: SEED.map((x) => ({ ...x, updated: '' })), log: [] };
        store.set('db', db);
      }
      return db;
    },
    save(db) { db.log = db.log.slice(0, 400); store.set('db', db); return JSON.parse(JSON.stringify(db)); },
    async load() { return this.db(); },
    async move({ by, site, note, lines }) {
      const db = this.db();
      const now = new Date().toISOString();
      for (const l of lines) {
        const it = db.items.find((i) => i.id === l.id);
        if (!it) throw new Error('ไม่พบรายการ');
        if (it.qty + l.delta < 0) throw new Error(`${label(it)} เหลือ ${it.qty} ${it.unit} ไม่พอเบิก ${-l.delta}`);
      }
      const rows = [];
      for (const l of lines) {
        const it = db.items.find((i) => i.id === l.id);
        it.qty += l.delta; it.updated = now;
        rows.push({ t: now, kind: l.delta < 0 ? 'out' : 'in', id: it.id, name: label(it), delta: l.delta, after: it.qty, by, site: l.delta < 0 ? site : site || '', note });
      }
      db.log = rows.reverse().concat(db.log);
      return this.save(db);
    },
    async adjust({ id, qty, by, note }) {
      const db = this.db();
      const it = db.items.find((i) => i.id === id);
      if (!it) throw new Error('ไม่พบรายการ');
      const now = new Date().toISOString();
      const d = qty - it.qty;
      it.qty = qty; it.updated = now;
      db.log.unshift({ t: now, kind: 'adjust', id, name: label(it), delta: d, after: qty, by, site: '', note: note || 'นับสต็อกจริง' });
      return this.save(db);
    },
    async add({ item, by }) {
      const db = this.db();
      const n = Math.max(0, ...db.items.map((i) => parseInt(String(i.id).replace(/\D/g, ''), 10) || 0)) + 1;
      const id = 'P' + String(n).padStart(2, '0');
      const now = new Date().toISOString();
      const it = { id, cat: item.cat || 'อื่น ๆ', name: item.name, size: item.size || '', qty: item.qty || 0, unit: item.unit || 'ชิ้น', min: item.min || 1, loc: item.loc || CFG.STORE_NAME || '', updated: now };
      db.items.push(it);
      db.log.unshift({ t: now, kind: 'new', id, name: label(it), delta: it.qty, after: it.qty, by, site: '', note: '' });
      return this.save(db);
    },
  };

  const Remote = {
    async call(action, payload = {}) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 25000);
      try {
        const res = await fetch(apiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, pin: store.get('pin', ''), ...payload }),
          signal: ctrl.signal,
          redirect: 'follow',
        });
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
    move(p) { return this.call('move', p); },
    adjust(p) { return this.call('adjust', p); },
    add(p) { return this.call('add', p); },
  };
  const api = () => (isRemote() ? Remote : Local);

  // ---------- state ----------
  const S = {
    items: [], log: [], loaded: false, error: '',
    pending: {}, // id -> delta
    q: '', cat: 'all',
    hq: '', hkind: 'all',
    view: 'stock', busy: false,
  };

  const statusOf = (it) => (it.qty <= 0 ? 'danger' : it.qty <= (it.min ?? 1) ? 'warn' : 'ok');
  const STATUS_TXT = { ok: 'มีของ', warn: 'ใกล้หมด', danger: 'หมด' };
  const norm = (s) => String(s || '').toLowerCase().replace(/[″”“]/g, '"').replace(/นิ้ว/g, '"').replace(/\s+/g, '');
  const cats = () => {
    const m = new Map();
    for (const it of S.items) m.set(it.cat, (m.get(it.cat) || 0) + 1);
    return [...m];
  };

  function apply(data) {
    S.items = data.items || [];
    S.log = data.log || [];
    S.loaded = true;
    S.error = '';
    for (const id of Object.keys(S.pending)) {
      const it = S.items.find((i) => i.id === id);
      if (!it) delete S.pending[id];
      else if (it.qty + S.pending[id] < 0) S.pending[id] = -it.qty;
      if (S.pending[id] === 0) delete S.pending[id];
    }
    renderAll();
  }

  async function refresh(silent) {
    try {
      apply(await api().load());
    } catch (e) {
      if (e.message === 'PIN_REQUIRED') { S.loaded = true; S.error = 'PIN_REQUIRED'; renderAll(); if (!silent) openSettings(true); return; }
      S.error = e.message; S.loaded = true;
      renderAll();
      if (!silent) toast(e.message, true);
    }
  }

  // ---------- render: hero ----------
  function renderStats() {
    const total = S.items.reduce((a, b) => a + (b.qty || 0), 0);
    const low = S.items.filter((i) => statusOf(i) === 'warn').length;
    const out = S.items.filter((i) => statusOf(i) === 'danger').length;
    const today = new Date().toDateString();
    const outToday = S.log.filter((l) => l.kind === 'out' && new Date(l.t).toDateString() === today).reduce((a, l) => a + -l.delta, 0);
    $('#stats').innerHTML = `
      <div class="stat"><b>${fmt(S.items.length)}</b><span>รายการ</span></div>
      <div class="stat"><b>${fmt(total)}</b><span>ชิ้นในคลัง</span></div>
      <button class="stat warn" data-jump="low"><b>${fmt(low + out)}</b><span>ใกล้หมด</span></button>
      <button class="stat" data-jump="history"><b>${fmt(outToday)}</b><span>เบิกวันนี้</span></button>`;
    $('#store-name').textContent = CFG.STORE_NAME || 'คลังสินค้า';

    const b = $('#banner');
    if (S.error && S.error !== 'PIN_REQUIRED') b.innerHTML = `<div class="banner err">${I.alert}<span>${esc(S.error)}</span><button data-act="retry">ลองใหม่</button></div>`;
    else if (S.error === 'PIN_REQUIRED') b.innerHTML = `<div class="banner">${I.alert}<span>ต้องใส่รหัสทีมก่อนใช้งาน</span><button data-act="settings">ใส่รหัส</button></div>`;
    else if (!isRemote()) b.innerHTML = `<div class="banner">${I.alert}<span>โหมดทดลอง — ข้อมูลเก็บในเครื่องนี้เท่านั้น ยังไม่เชื่อม Google Sheet</span><button data-act="settings">ตั้งค่า</button></div>`;
    else b.innerHTML = '';
  }

  // ---------- render: stock ----------
  function renderChips() {
    const low = S.items.filter((i) => statusOf(i) !== 'ok').length;
    const all = [['all', 'ทั้งหมด', S.items.length, '']].concat(cats().map(([c, n]) => [c, c, n, iconFor(c)]));
    $('#chips').innerHTML = all.map(([k, t, n, ic]) =>
      `<button class="chip ${S.cat === k ? 'active' : ''}" data-cat="${esc(k)}">${ic}${esc(t)} <em>${n}</em></button>`).join('') +
      `<button class="chip alert ${S.cat === 'low' ? 'active' : ''}" data-cat="low">ใกล้หมด <em>${low}</em></button>`;
  }

  function cardHTML(it) {
    const p = S.pending[it.id] || 0;
    const st = statusOf(it);
    const size = esc(it.size).replace(/ ลด /g, '<span class="lo">ลด</span>');
    const nextTxt = p ? `<span class="next">→ ${fmt(it.qty + p)}</span>` : '';
    return `<article class="card ${p ? 'pending' : ''}" data-id="${esc(it.id)}">
      <div class="ic">${iconFor(it.cat)}</div>
      <button class="tx" data-open="${esc(it.id)}" aria-label="ดูรายละเอียด ${esc(label(it))}">
        <div class="nm">${esc(it.name)}</div>
        <div class="sz">${size || '—'}</div>
      </button>
      <div class="qt"><b>${fmt(it.qty)}</b><span>${esc(it.unit)}</span>${nextTxt}</div>
      <div class="st"><span class="pill ${st}">${STATUS_TXT[st]}</span></div>
      <div class="sp">
        <div class="stepper">
          <button class="minus" data-step="-1" aria-label="เบิกออก 1" ${it.qty + p <= 0 ? 'disabled' : ''}>${I.minus}</button>
          <output class="${p < 0 ? 'neg' : p > 0 ? 'pos' : ''}">${p > 0 ? '+' + p : p}</output>
          <button class="plus" data-step="1" aria-label="รับเข้า 1">${I.plus}</button>
        </div>
      </div>
    </article>`;
  }

  function filtered() {
    const toks = tokens(S.q);
    return S.items.filter((it) => {
      if (S.cat === 'low' && statusOf(it) === 'ok') return false;
      if (S.cat !== 'all' && S.cat !== 'low' && it.cat !== S.cat) return false;
      if (!toks.length) return true;
      const hay = norm(`${it.cat} ${it.name} ${it.size} ${it.id}`);
      return toks.every((t) => hay.includes(t));
    });
  }
  const tokens = (q) => String(q).trim().split(/\s+/).filter(Boolean).map(norm);

  function renderList() {
    const el = $('#list');
    if (!S.loaded) { el.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton"></div>').join(''); return; }
    const list = filtered();
    if (!list.length) {
      el.innerHTML = `<div class="empty">${I.box}<div>${S.items.length ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการในคลัง'}</div></div>`;
      return;
    }
    if (S.cat === 'all' && !S.q) {
      const groups = new Map();
      for (const it of list) { if (!groups.has(it.cat)) groups.set(it.cat, []); groups.get(it.cat).push(it); }
      el.innerHTML = [...groups].map(([c, arr]) =>
        `<div class="group-title">${esc(c)} <small>${arr.length} รายการ · ${fmt(arr.reduce((a, b) => a + b.qty, 0))} ชิ้น</small></div>` + arr.map(cardHTML).join('')).join('');
    } else {
      el.innerHTML = list.map(cardHTML).join('');
    }
  }

  function updateCard(id) {
    const it = S.items.find((i) => i.id === id);
    const old = document.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
    if (it && old) old.outerHTML = cardHTML(it);
  }

  // ---------- render: cart ----------
  function renderCart() {
    const ids = Object.keys(S.pending);
    const cart = $('#cart');
    if (!ids.length) { cart.hidden = true; cart.innerHTML = ''; return; }
    let outN = 0, inN = 0;
    for (const id of ids) { const d = S.pending[id]; if (d < 0) outN += -d; else inN += d; }
    const names = ids.map((id) => { const it = S.items.find((i) => i.id === id); return it ? `${it.size} ${it.name}` : ''; }).join(' · ');
    const parts = [outN && `เบิก ${outN} ชิ้น`, inN && `รับเข้า ${inN} ชิ้น`].filter(Boolean).join(' · ');
    cart.hidden = false;
    cart.innerHTML = `<div class="cart-info"><b>${ids.length} รายการ</b> · ${parts}<span>${esc(names)}</span></div>
      <button class="clear" data-act="clear">ล้าง</button>
      <button class="btn gold sm" data-act="confirm">ยืนยัน</button>`;
  }

  // ---------- render: history ----------
  const KIND_TXT = { out: 'เบิกออก', in: 'รับเข้า', adjust: 'ปรับยอด', new: 'เพิ่มรายการ' };
  const dayFmt = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const timeFmt = new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' });

  function logRow(l) {
    const meta = [l.by, l.site && `ไซต์ ${l.site}`, timeFmt.format(new Date(l.t))].filter(Boolean).map(esc).join(' · ');
    const sign = l.delta > 0 ? '+' : '';
    return `<div class="log-row">
      <div class="log-ic ${l.kind}">${I[l.kind] || I.box}</div>
      <div class="log-main"><b>${esc(l.name)}</b><span>${KIND_TXT[l.kind] || esc(l.kind)} · ${meta}${l.note ? ' · ' + esc(l.note) : ''}</span></div>
      <div class="log-qty"><b class="${l.kind}">${sign}${fmt(l.delta)}</b><span>เหลือ ${fmt(l.after)}</span></div>
    </div>`;
  }

  function renderHistory() {
    const kinds = [['all', 'ทั้งหมด'], ['out', 'เบิกออก'], ['in', 'รับเข้า'], ['adjust', 'ปรับยอด']];
    $('#hchips').innerHTML = kinds.map(([k, t]) => `<button class="chip ${S.hkind === k ? 'active' : ''}" data-hkind="${k}">${t}</button>`).join('');
    const q = norm(S.hq);
    const list = S.log.filter((l) => (S.hkind === 'all' || l.kind === S.hkind || (S.hkind === 'in' && l.kind === 'new')) &&
      (!q || norm(`${l.name} ${l.by} ${l.site} ${l.note}`).includes(q)));
    const el = $('#history');
    if (!S.loaded) { el.innerHTML = '<div class="skeleton"></div>'; return; }
    if (!list.length) { el.innerHTML = `<div class="empty">${I.box}<div>${S.log.length ? 'ไม่พบประวัติที่ค้นหา' : 'ยังไม่มีการเบิกหรือรับเข้า'}</div></div>`; return; }
    const groups = new Map();
    for (const l of list) { const k = new Date(l.t).toDateString(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(l); }
    el.innerHTML = [...groups].map(([, arr]) => {
      const outN = arr.filter((l) => l.kind === 'out').reduce((a, l) => a - l.delta, 0);
      return `<div class="day">${esc(dayFmt.format(new Date(arr[0].t)))}<small>${outN ? `เบิก ${fmt(outN)} ชิ้น` : ''}</small></div>
        <div class="log">${arr.map(logRow).join('')}</div>`;
    }).join('');
  }

  function renderAll() {
    renderStats();
    if (S.view === 'stock') { renderChips(); renderList(); } else renderHistory();
    renderCart();
  }

  // ---------- sheet ----------
  const wrap = $('#sheet-wrap'), sheet = $('#sheet');
  let onSheetClose = null;
  function openSheet(html, after) {
    sheet.innerHTML = `<div class="grab"></div>${html}`;
    wrap.hidden = false;
    document.body.style.overflow = 'hidden';
    if (after) after(sheet);
  }
  function closeSheet() {
    wrap.hidden = true; sheet.innerHTML = ''; document.body.style.overflow = '';
    if (onSheetClose) { const f = onSheetClose; onSheetClose = null; f(); }
  }
  const head = (title, sub) => `<div class="sheet-head"><div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div><button class="x" data-close aria-label="ปิด">${I.x}</button></div>`;

  function sitePicker(value) {
    const recent = [...new Set(S.log.filter((l) => l.site).map((l) => l.site))].slice(0, 6);
    const sites = [...new Set(recent.concat(CFG.SITES || []))].slice(0, 10);
    return `<label class="field"><span>ไซต์งานที่เบิกไป <i>*</i></span>
      <input name="site" list="sites" value="${esc(value)}" placeholder="เช่น ลาดพร้าว 80" autocomplete="off" required>
      <datalist id="sites">${sites.map((s) => `<option value="${esc(s)}">`).join('')}</datalist>
      <div class="suggest">${sites.slice(0, 6).map((s) => `<button type="button" data-site="${esc(s)}" class="${s === value ? 'on' : ''}">${esc(s)}</button>`).join('')}</div>
    </label>`;
  }
  function wireSuggest(root) {
    root.querySelectorAll('[data-site]').forEach((b) => b.addEventListener('click', () => {
      root.querySelector('[name=site]').value = b.dataset.site;
      root.querySelectorAll('[data-site]').forEach((x) => x.classList.toggle('on', x === b));
    }));
  }

  function openConfirm() {
    const ids = Object.keys(S.pending);
    if (!ids.length) return;
    const lines = ids.map((id) => ({ it: S.items.find((i) => i.id === id), d: S.pending[id] })).filter((x) => x.it);
    const hasOut = lines.some((x) => x.d < 0);
    const hasIn = lines.some((x) => x.d > 0);
    const title = hasOut && hasIn ? 'ยืนยันเบิก / รับเข้า' : hasOut ? 'ยืนยันการเบิก' : 'ยืนยันรับของเข้า';
    const outSum = lines.filter((x) => x.d < 0).reduce((a, x) => a - x.d, 0);
    const inSum = lines.filter((x) => x.d > 0).reduce((a, x) => a + x.d, 0);
    openSheet(`${head(title, 'ตรวจรายการ แล้วใส่ชื่อผู้ทำรายการ')}
      <div class="lines">${lines.map(({ it, d }) => `<div class="line"><div><b>${esc(label(it))}</b><small>คงเหลือ ${fmt(it.qty)} → ${fmt(it.qty + d)} ${esc(it.unit)}</small></div>
        <div class="d ${d < 0 ? 'out' : 'in'}">${d > 0 ? '+' : ''}${d}</div></div>`).join('')}
        <div class="lines-sum"><span>${lines.length} รายการ</span><span>${[outSum && `เบิกออก ${outSum}`, inSum && `รับเข้า ${inSum}`].filter(Boolean).join(' · ')} ชิ้น</span></div>
      </div>
      <form id="f-confirm">
        <label class="field"><span>ชื่อผู้ทำรายการ <i>*</i></span><input name="by" value="${esc(store.get('me', ''))}" placeholder="เช่น ช่างสิงห์" autocomplete="name" required></label>
        ${hasOut ? sitePicker(store.get('lastSite', '')) : ''}
        <label class="field"><span>หมายเหตุ</span><input name="note" placeholder="ไม่บังคับ เช่น งานเปลี่ยนท่อห้องน้ำชั้น 2" autocomplete="off"></label>
        <button class="btn gold block" type="submit">${I.check}${hasOut ? 'บันทึกการเบิก' : 'บันทึกรับเข้า'}</button>
      </form>`, (root) => {
      wireSuggest(root);
      const f = $('#f-confirm', root);
      if (!f.by.value) setTimeout(() => f.by.focus(), 250);
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const by = f.by.value.trim();
        const site = f.site ? f.site.value.trim() : '';
        if (!by) return f.by.focus();
        if (hasOut && !site) return f.site.focus();
        const btn = f.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'กำลังบันทึก…';
        try {
          const data = await api().move({ by, site, note: f.note.value.trim(), lines: lines.map(({ it, d }) => ({ id: it.id, delta: d })) });
          store.set('me', by); if (site) store.set('lastSite', site);
          S.pending = {};
          closeSheet();
          apply(data);
          toast(hasOut ? `บันทึกการเบิก ${outSum} ชิ้นแล้ว` : `รับเข้า ${inSum} ชิ้นแล้ว`);
        } catch (err) {
          btn.disabled = false; btn.innerHTML = `${I.check}ลองอีกครั้ง`;
          toast(err.message, true);
          refresh(true);
        }
      });
    });
  }

  function openItem(id) {
    const it = S.items.find((i) => i.id === id);
    if (!it) return;
    const st = statusOf(it);
    const logs = S.log.filter((l) => l.id === id).slice(0, 8);
    const lastOut = S.log.find((l) => l.id === id && l.kind === 'out');
    openSheet(`${head('', '')}
      <div class="detail-hero" style="margin-top:-46px">
        <div class="ic">${iconFor(it.cat)}</div>
        <div><div class="nm">${esc(it.name)} · ${esc(it.id)}</div><div class="sz">${esc(it.size) || '—'}</div></div>
      </div>
      <div class="detail-qty">
        <div><b>${fmt(it.qty)}</b><span>คงเหลือ (${esc(it.unit)})</span></div>
        <div><b class="pill ${st}" style="font:inherit;font-size:13px;height:28px;margin-top:2px">${STATUS_TXT[st]}</b><span>เตือนเมื่อเหลือ ≤ ${fmt(it.min ?? 1)}</span></div>
        <div><b style="font-size:15px;line-height:1.6">${lastOut ? esc(lastOut.site || lastOut.by) : '—'}</b><span>เบิกล่าสุด</span></div>
      </div>
      <div class="big-stepper">
        <button type="button" data-b="-1" aria-label="ลด">${I.minus}</button>
        <input id="amt" type="number" inputmode="numeric" min="1" value="1" aria-label="จำนวน">
        <button type="button" data-b="1" aria-label="เพิ่ม">${I.plus}</button>
      </div>
      <div class="act-row">
        <button class="btn out" data-do="out" ${it.qty <= 0 ? 'disabled' : ''}>${I.out}เบิกออก</button>
        <button class="btn in" data-do="in">${I.in}รับเข้า</button>
      </div>
      <div class="divider"></div>
      <form id="f-adjust" class="row2" style="align-items:end">
        <label class="field" style="margin:0"><span>นับของจริงได้</span><input name="qty" type="number" inputmode="numeric" min="0" placeholder="${fmt(it.qty)}"></label>
        <button class="btn" type="submit">${I.adjust}ปรับยอด</button>
      </form>
      <div class="mini-log"><h4>ความเคลื่อนไหวล่าสุด</h4>
        ${logs.length ? `<div class="log">${logs.map(logRow).join('')}</div>` : '<p style="color:var(--muted);font-size:13.5px;margin:0">ยังไม่มีประวัติ</p>'}
      </div>`, (root) => {
      const amt = $('#amt', root);
      const val = () => Math.max(1, Math.round(Number(amt.value) || 1));
      root.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => { amt.value = Math.max(1, val() + Number(b.dataset.b)); }));
      root.querySelectorAll('[data-do]').forEach((b) => b.addEventListener('click', () => {
        const n = val();
        if (b.dataset.do === 'out') {
          if (n > it.qty) { toast(`เหลือแค่ ${it.qty} ${it.unit}`, true); amt.value = it.qty; return; }
          S.pending[id] = -n;
        } else S.pending[id] = n;
        closeSheet();
        renderAll();
        openConfirm();
      }));
      $('#f-adjust', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const raw = e.target.qty.value;
        if (raw === '') return e.target.qty.focus();
        const qty = Math.max(0, Math.round(Number(raw)));
        askName(`ปรับยอด ${label(it)} เป็น ${qty} ${it.unit}`, async (by) => {
          apply(await api().adjust({ id, qty, by, note: 'นับสต็อกจริง' }));
          delete S.pending[id];
          toast(`ปรับยอดเป็น ${qty} แล้ว`);
        });
      });
    });
  }

  function askName(title, fn) {
    openSheet(`${head('ยืนยัน', esc(title))}
      <form id="f-name"><label class="field"><span>ชื่อผู้ทำรายการ <i>*</i></span><input name="by" value="${esc(store.get('me', ''))}" required></label>
      <button class="btn gold block" type="submit">${I.check}ยืนยัน</button></form>`, (root) => {
      const f = $('#f-name', root);
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const by = f.by.value.trim(); if (!by) return;
        const btn = f.querySelector('button'); btn.disabled = true; btn.textContent = 'กำลังบันทึก…';
        try { await fn(by); store.set('me', by); closeSheet(); renderAll(); } catch (err) { btn.disabled = false; btn.innerHTML = `${I.check}ลองอีกครั้ง`; toast(err.message, true); }
      });
    });
  }

  function openAdd() {
    const cs = cats().map(([c]) => c);
    openSheet(`${head('เพิ่มรายการใหม่', 'ของที่ยังไม่มีในคลัง')}
      <form id="f-add">
        <label class="field"><span>หมวด</span><select name="cat">${cs.map((c) => `<option>${esc(c)}</option>`).join('')}<option value="__new">+ หมวดใหม่…</option></select></label>
        <label class="field" id="newcat" hidden><span>ชื่อหมวดใหม่</span><input name="newcat" placeholder="เช่น วาล์ว"></label>
        <label class="field"><span>ชื่อรายการ <i>*</i></span><input name="name" placeholder="เช่น ข้องอ 90° เกลียวนอก" required></label>
        <div class="row2">
          <label class="field"><span>ขนาด</span><input name="size" placeholder='เช่น 1/2"'></label>
          <label class="field"><span>หน่วย</span><input name="unit" value="ชิ้น"></label>
        </div>
        <div class="row2">
          <label class="field"><span>จำนวนเริ่มต้น</span><input name="qty" type="number" inputmode="numeric" min="0" value="0"></label>
          <label class="field"><span>เตือนเมื่อเหลือ</span><input name="min" type="number" inputmode="numeric" min="0" value="1"></label>
        </div>
        <label class="field"><span>ชื่อผู้เพิ่ม <i>*</i></span><input name="by" value="${esc(store.get('me', ''))}" required></label>
        <button class="btn gold block" type="submit">${I.plus}เพิ่มเข้าคลัง</button>
      </form>`, (root) => {
      const f = $('#f-add', root);
      f.cat.addEventListener('change', () => { $('#newcat', root).hidden = f.cat.value !== '__new'; });
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const by = f.by.value.trim(); const name = f.name.value.trim();
        if (!name) return f.name.focus();
        if (!by) return f.by.focus();
        const cat = f.cat.value === '__new' ? (f.newcat.value.trim() || 'อื่น ๆ') : f.cat.value;
        const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'กำลังบันทึก…';
        try {
          const item = { cat, name, size: f.size.value.trim(), unit: f.unit.value.trim() || 'ชิ้น', qty: Math.max(0, Math.round(Number(f.qty.value) || 0)), min: Math.max(0, Math.round(Number(f.min.value) || 1)), loc: CFG.STORE_NAME };
          apply(await api().add({ item, by }));
          store.set('me', by);
          closeSheet();
          toast('เพิ่มรายการแล้ว');
        } catch (err) { btn.disabled = false; btn.innerHTML = `${I.plus}ลองอีกครั้ง`; toast(err.message, true); }
      });
    });
  }

  function openSettings(pinFocus) {
    const remote = isRemote();
    openSheet(`${head('ตั้งค่า', 'เก็บไว้ในเครื่องนี้')}
      <div class="status-box"><span class="dot ${remote && !S.error ? 'on' : 'off'}"></span>
        <div><b>${remote ? (S.error ? 'เชื่อมต่อไม่สำเร็จ' : 'เชื่อม Google Sheet แล้ว') : 'โหมดทดลอง'}</b>
        <p>${remote ? 'ทุกเครื่องเห็นยอดเดียวกัน อัปเดตอัตโนมัติทุก 30 วินาที' : 'ข้อมูลอยู่ในเครื่องนี้เครื่องเดียว — ใส่ลิงก์ Apps Script เพื่อให้ทุกคนใช้ร่วมกัน'}</p></div></div>
      <form id="f-set">
        <label class="field"><span>ชื่อของฉัน</span><input name="me" value="${esc(store.get('me', ''))}" placeholder="ใช้เติมให้อัตโนมัติตอนเบิก"></label>
        <label class="field"><span>รหัสทีม (PIN)</span><input name="pin" type="password" inputmode="numeric" value="${esc(store.get('pin', ''))}" placeholder="ถ้าออฟฟิศตั้งไว้"></label>
        <label class="field"><span>ลิงก์ Apps Script</span><input name="api" value="${esc(store.get('apiUrl', ''))}" placeholder="${esc(CFG.API_URL || 'https://script.google.com/macros/s/…/exec')}">
          <span class="hint">ปกติไม่ต้องใส่ — ใช้ค่าจาก config.js ของเว็บ</span></label>
        <button class="btn gold block" type="submit">${I.check}บันทึก</button>
      </form>
      ${!remote ? '<div class="divider"></div><button class="btn block" data-act="reset-local">ล้างข้อมูลทดลอง กลับเป็นยอดตั้งต้น</button>' : ''}`, (root) => {
      const f = $('#f-set', root);
      if (pinFocus) setTimeout(() => f.pin.focus(), 250);
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        store.set('me', f.me.value.trim());
        store.set('pin', f.pin.value.trim());
        const a = f.api.value.trim();
        if (a && !/^https:\/\/script\.google(usercontent)?\.com\//.test(a)) { toast('ลิงก์ต้องขึ้นต้นด้วย https://script.google.com/', true); return; }
        store.set('apiUrl', a);
        closeSheet();
        S.loaded = false; renderAll();
        refresh();
        toast('บันทึกการตั้งค่าแล้ว');
      });
    });
  }

  // ---------- toast ----------
  let toastTimer;
  function toast(msg, err) {
    const t = $('#toast');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = `${err ? I.alert : I.check}<span>${esc(msg)}</span>`;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), err ? 4200 : 2400);
  }

  // ---------- view switching ----------
  function setView(v) {
    S.view = v;
    $('#view-stock').hidden = v !== 'stock';
    $('#view-history').hidden = v !== 'history';
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) return closeSheet();
    if (t.dataset.step) {
      const id = t.closest('.card').dataset.id;
      const it = S.items.find((i) => i.id === id);
      const next = (S.pending[id] || 0) + Number(t.dataset.step);
      if (it.qty + next < 0) return;
      if (next === 0) delete S.pending[id]; else S.pending[id] = next;
      if (navigator.vibrate) navigator.vibrate(8);
      updateCard(id); renderCart();
      return;
    }
    if (t.dataset.open) return openItem(t.dataset.open);
    if (t.dataset.cat) { S.cat = t.dataset.cat; renderChips(); renderList(); return; }
    if (t.dataset.hkind) { S.hkind = t.dataset.hkind; renderHistory(); return; }
    if (t.dataset.view) return setView(t.dataset.view);
    if (t.dataset.jump === 'low') { if (S.view !== 'stock') setView('stock'); S.cat = 'low'; renderChips(); renderList(); $('#view-stock .toolbar').scrollIntoView({ behavior: 'smooth' }); return; }
    if (t.dataset.jump === 'history') { S.hkind = 'out'; return setView('history'); }
    switch (t.dataset.act) {
      case 'clear': S.pending = {}; renderAll(); break;
      case 'confirm': openConfirm(); break;
      case 'retry': refresh(); break;
      case 'settings': openSettings(S.error === 'PIN_REQUIRED'); break;
      case 'reset-local':
        if (confirm('ล้างข้อมูลทดลองทั้งหมดในเครื่องนี้?')) { store.set('db', null); S.pending = {}; closeSheet(); refresh(); toast('กลับเป็นยอดตั้งต้นแล้ว'); }
        break;
    }
  });
  $('#btn-settings').addEventListener('click', () => openSettings());
  $('#btn-add').addEventListener('click', openAdd);
  $('#btn-refresh').addEventListener('click', () => { refresh(); toast('อัปเดตแล้ว'); });
  $('#q').addEventListener('input', (e) => { S.q = e.target.value; renderList(); });
  $('#hq').addEventListener('input', (e) => { S.hq = e.target.value; renderHistory(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !wrap.hidden) closeSheet(); });

  // sticky toolbar background only once it sticks
  const tb = $('#view-stock .toolbar');
  const sentinel = document.createElement('div');
  tb.before(sentinel);
  new IntersectionObserver(([en]) => tb.classList.toggle('stuck', !en.isIntersecting)).observe(sentinel);

  // auto refresh shared data
  setInterval(() => {
    if (isRemote() && document.visibilityState === 'visible' && wrap.hidden && !Object.keys(S.pending).length) refresh(true);
  }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && isRemote() && wrap.hidden) refresh(true); });
  window.addEventListener('beforeunload', (e) => { if (Object.keys(S.pending).length) { e.preventDefault(); e.returnValue = ''; } });

  renderAll();
  refresh();
})();
