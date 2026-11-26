/**
 * คลังอะไหล่ประปา — หลังบ้านบน Google Sheet
 *
 * วิธีติดตั้ง (ทำครั้งเดียว ดู README.md):
 *   1) สร้าง Google Sheet ใหม่ → ส่วนขยาย → Apps Script → วางไฟล์นี้ทั้งไฟล์ → บันทึก
 *   2) (ไม่บังคับ) ตั้งรหัสทีม: การตั้งค่าโปรเจกต์ → คุณสมบัติสคริปต์ → เพิ่ม TEAM_PIN
 *   3) ทำให้ใช้งานได้ → การทำให้ใช้งานได้รายการใหม่ → เว็บแอป
 *        เรียกใช้ในฐานะ: ฉัน · ผู้ที่มีสิทธิ์เข้าถึง: ทุกคน
 *   4) คัดลอก URL ที่ลงท้าย /exec ไปใส่ใน config.js ของเว็บ
 *
 * แท็บ "คลัง" = ยอดคงเหลือ (แก้ชื่อ/หน่วย/จุดเตือนในชีตได้ แต่ห้ามแก้คอลัมน์รหัส)
 * แท็บ "ประวัติ" = ทุกการเบิก/รับเข้า/ปรับยอด (อย่าลบแถว)
 */

var SHEET_ITEMS = 'คลัง';
var SHEET_LOG = 'ประวัติ';
var HEAD_ITEMS = ['รหัส', 'หมวด', 'รายการ', 'ขนาด', 'คงเหลือ', 'หน่วย', 'เตือนเมื่อเหลือ', 'สถานที่เก็บ', 'อัปเดตล่าสุด'];
var HEAD_LOG = ['เวลา', 'ประเภท', 'รหัส', 'รายการ', 'จำนวน', 'คงเหลือหลังทำ', 'ผู้ทำรายการ', 'ไซต์งาน', 'หมายเหตุ'];
var KIND_TH = { out: 'เบิกออก', in: 'รับเข้า', adjust: 'ปรับยอด', new: 'เพิ่มรายการ' };
var KIND_EN = { 'เบิกออก': 'out', 'รับเข้า': 'in', 'ปรับยอด': 'adjust', 'เพิ่มรายการ': 'new' };
var LOG_LIMIT = 400;

// ---- SEED START (สร้างจาก data/seed.json ด้วย tools/build-seed.mjs) ----
var SEED = [
  {
    "id": "P01",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90° เกลียวในทองเหลือง",
    "size": "1/2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P01.jpg"
  },
  {
    "id": "P02",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90° เกลียวใน",
    "size": "1/2\"",
    "qty": 5,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P02.jpg"
  },
  {
    "id": "P03",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "3/4\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P03.jpg"
  },
  {
    "id": "P04",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "1/2\"",
    "qty": 9,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P04.jpg"
  },
  {
    "id": "P05",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "1\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P05.jpg"
  },
  {
    "id": "P06",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "1-1/2\"",
    "qty": 5,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P06.jpg"
  },
  {
    "id": "P07",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "1-1/4\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P07.jpg"
  },
  {
    "id": "P08",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P08.jpg"
  },
  {
    "id": "P09",
    "cat": "ข้องอ 90°",
    "name": "ข้องอ 90°",
    "size": "3\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P09.jpg"
  },
  {
    "id": "P10",
    "cat": "ข้องอ 45°",
    "name": "ข้องอ 45°",
    "size": "1/2\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P10.jpg"
  },
  {
    "id": "P11",
    "cat": "ข้องอ 45°",
    "name": "ข้องอ 45°",
    "size": "3/4\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P11.jpg"
  },
  {
    "id": "P12",
    "cat": "ข้องอ 45°",
    "name": "ข้องอ 45°",
    "size": "1-1/2\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P12.jpg"
  },
  {
    "id": "P13",
    "cat": "ข้องอ 45°",
    "name": "ข้องอ 45°",
    "size": "2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P13.jpg"
  },
  {
    "id": "P14",
    "cat": "ข้องอ 45°",
    "name": "ข้องอ 45°",
    "size": "3\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P14.jpg"
  },
  {
    "id": "P15",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "1/2\"",
    "qty": 5,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P15.jpg"
  },
  {
    "id": "P16",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "3/4\"",
    "qty": 4,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P16.jpg"
  },
  {
    "id": "P17",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "1\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P17.jpg"
  },
  {
    "id": "P18",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "1-1/2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P18.jpg"
  },
  {
    "id": "P19",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P19.jpg"
  },
  {
    "id": "P20",
    "cat": "สามทาง",
    "name": "สามทาง",
    "size": "4\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P20.jpg"
  },
  {
    "id": "P21",
    "cat": "สามทาง",
    "name": "สามทางลด",
    "size": "1\" ลด 3/4\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P21.jpg"
  },
  {
    "id": "P22",
    "cat": "สามทาง",
    "name": "สามทางลด",
    "size": "2\" ลด 1\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P22.jpg"
  },
  {
    "id": "P23",
    "cat": "สามทาง",
    "name": "สามทางลด",
    "size": "4\" ลด 2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P23.jpg"
  },
  {
    "id": "P24",
    "cat": "สามทาง",
    "name": "สามทาง Y",
    "size": "2\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P24.jpg"
  },
  {
    "id": "P25",
    "cat": "สามทาง",
    "name": "สามทาง Y",
    "size": "4\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P25.jpg"
  },
  {
    "id": "P26",
    "cat": "ต่อตรง",
    "name": "ต่อตรง",
    "size": "1/2\"",
    "qty": 15,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P26.jpg"
  },
  {
    "id": "P27",
    "cat": "ต่อตรง",
    "name": "ต่อตรง",
    "size": "3/4\"",
    "qty": 10,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P27.jpg"
  },
  {
    "id": "P28",
    "cat": "ต่อตรง",
    "name": "ต่อตรง",
    "size": "1\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P28.jpg"
  },
  {
    "id": "P29",
    "cat": "ต่อตรง",
    "name": "ต่อตรง",
    "size": "1-1/2\"",
    "qty": 7,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P29.jpg"
  },
  {
    "id": "P30",
    "cat": "ต่อตรง",
    "name": "ต่อตรง",
    "size": "4\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P30.jpg"
  },
  {
    "id": "P31",
    "cat": "ต่อตรง",
    "name": "ข้อต่อตรงลด",
    "size": "2\" ลด 1-1/2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P31.jpg"
  },
  {
    "id": "P32",
    "cat": "ต่อตรง",
    "name": "ต่อตรงเกลียวนอก",
    "size": "3/4\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P32.jpg"
  },
  {
    "id": "P33",
    "cat": "ข้อลด",
    "name": "ข้อลด",
    "size": "1\" ลด 3/4\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P33.jpg"
  },
  {
    "id": "P34",
    "cat": "ข้อลด",
    "name": "ข้อลด",
    "size": "3/4\" ลด 1/2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P34.jpg"
  },
  {
    "id": "P35",
    "cat": "ข้อลด",
    "name": "ข้อลด",
    "size": "3\" ลด 1-1/2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P35.jpg"
  },
  {
    "id": "P36",
    "cat": "แคลมป์ & กิ๊บ",
    "name": "แคลมป์รัดท่อ",
    "size": "1\"",
    "qty": 3,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P36.jpg"
  },
  {
    "id": "P37",
    "cat": "แคลมป์ & กิ๊บ",
    "name": "แคลมป์รัดท่อ SCG",
    "size": "2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P37.jpg"
  },
  {
    "id": "P38",
    "cat": "ฝาครอบ",
    "name": "ฝาครอบ",
    "size": "1\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P38.jpg"
  },
  {
    "id": "P39",
    "cat": "ฝาครอบ",
    "name": "ฝาครอบ",
    "size": "1-1/2\"",
    "qty": 1,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P39.jpg"
  },
  {
    "id": "P40",
    "cat": "ฝาครอบ",
    "name": "ฝาครอบ",
    "size": "3\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P40.jpg"
  },
  {
    "id": "P41",
    "cat": "ข้อลด",
    "name": "ข้อต่อลดเหลี่ยม",
    "size": "1\" ลด 3/4\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P41.jpg"
  },
  {
    "id": "P42",
    "cat": "แคลมป์ & กิ๊บ",
    "name": "กิ๊บก้ามปู",
    "size": "1/2\"",
    "qty": 2,
    "unit": "ชิ้น",
    "min": 1,
    "loc": "Office ตลิ่งชัน",
    "img": "images/P42.jpg"
  }
];
// ---- SEED END ----

function doGet(e) {
  return handle_(Object.assign({ action: 'list' }, (e && e.parameter) || {}));
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
  return handle_(body);
}

function handle_(p) {
  try {
    checkPin_(p.pin);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheets_(ss);
    var out;
    switch (p.action) {
      case 'list': out = snapshot_(ss); break;
      case 'move': out = withLock_(function () { return move_(ss, p); }); break;
      case 'adjust': out = withLock_(function () { return adjust_(ss, p); }); break;
      case 'add': out = withLock_(function () { return add_(ss, p); }); break;
      default: throw new Error('ไม่รู้จักคำสั่ง ' + p.action);
    }
    out.ok = true;
    return json_(out);
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkPin_(pin) {
  var want = PropertiesService.getScriptProperties().getProperty('TEAM_PIN');
  if (want && String(pin || '') !== String(want)) throw new Error('PIN_REQUIRED');
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function ensureSheets_(ss) {
  var items = ss.getSheetByName(SHEET_ITEMS);
  if (!items) {
    items = ss.insertSheet(SHEET_ITEMS, 0);
    items.getRange(1, 1, 1, HEAD_ITEMS.length).setValues([HEAD_ITEMS]).setFontWeight('bold');
    items.setFrozenRows(1);
    items.getRange(1, 4, 1000, 1).setNumberFormat('@'); // ขนาด เช่น 1/2 ต้องเป็นข้อความ ไม่ใช่วันที่
    if (SEED.length) {
      var now = new Date();
      var rows = SEED.map(function (s) { return [s.id, s.cat, s.name, s.size, s.qty, s.unit, s.min, s.loc, now]; });
      items.getRange(2, 1, rows.length, HEAD_ITEMS.length).setValues(rows);
    }
    items.autoResizeColumns(1, HEAD_ITEMS.length);
    var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('ชีต1');
    if (first && first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  }
  var log = ss.getSheetByName(SHEET_LOG);
  if (!log) {
    log = ss.insertSheet(SHEET_LOG);
    log.getRange(1, 1, 1, HEAD_LOG.length).setValues([HEAD_LOG]).setFontWeight('bold');
    log.setFrozenRows(1);
  }
}

function readItems_(ss) {
  var sh = ss.getSheetByName(SHEET_ITEMS);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, HEAD_ITEMS.length).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var r = vals[i];
    if (!r[0]) continue;
    out.push({
      row: i + 2,
      id: String(r[0]), cat: String(r[1] || 'อื่น ๆ'), name: String(r[2] || ''), size: String(r[3] || ''),
      qty: Number(r[4]) || 0, unit: String(r[5] || 'ชิ้น'), min: r[6] === '' ? 1 : Number(r[6]) || 0,
      loc: String(r[7] || ''), updated: r[8] instanceof Date ? r[8].toISOString() : String(r[8] || '')
    });
  }
  return out;
}

function readLog_(ss) {
  var sh = ss.getSheetByName(SHEET_LOG);
  var last = sh.getLastRow();
  if (last < 2) return [];
  var start = Math.max(2, last - LOG_LIMIT + 1);
  var vals = sh.getRange(start, 1, last - start + 1, HEAD_LOG.length).getValues();
  return vals.reverse().map(function (r) {
    return {
      t: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      kind: KIND_EN[r[1]] || String(r[1]), id: String(r[2]), name: String(r[3]),
      delta: Number(r[4]) || 0, after: Number(r[5]) || 0,
      by: String(r[6] || ''), site: String(r[7] || ''), note: String(r[8] || '')
    };
  });
}

function snapshot_(ss) {
  return {
    items: readItems_(ss).map(function (it) { delete it.row; return it; }),
    log: readLog_(ss)
  };
}

function label_(it) { return (it.name + ' ' + it.size).trim(); }

function clean_(s, max) { return String(s || '').replace(/^[=+\-@]/, "'$&").slice(0, max || 120).trim(); }

function appendLog_(ss, rows) {
  if (!rows.length) return;
  var sh = ss.getSheetByName(SHEET_LOG);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD_LOG.length).setValues(rows);
}

function move_(ss, p) {
  var by = clean_(p.by, 60), site = clean_(p.site, 80), note = clean_(p.note, 200);
  if (!by) throw new Error('กรุณาใส่ชื่อผู้ทำรายการ');
  var lines = (p.lines || []).filter(function (l) { return l && l.id && Number(l.delta); });
  if (!lines.length) throw new Error('ยังไม่ได้เลือกรายการ');
  if (lines.some(function (l) { return Number(l.delta) < 0; }) && !site) throw new Error('กรุณาใส่ไซต์งานที่เบิกไป');

  var items = readItems_(ss), byId = {};
  items.forEach(function (it) { byId[it.id] = it; });
  lines.forEach(function (l) {
    var it = byId[l.id];
    if (!it) throw new Error('ไม่พบรายการรหัส ' + l.id + ' (อาจถูกลบในชีต)');
    var d = Math.round(Number(l.delta));
    if (it.qty + d < 0) throw new Error(label_(it) + ' เหลือ ' + it.qty + ' ' + it.unit + ' ไม่พอเบิก ' + (-d));
  });

  var sh = ss.getSheetByName(SHEET_ITEMS), now = new Date(), logRows = [];
  lines.forEach(function (l) {
    var it = byId[l.id], d = Math.round(Number(l.delta));
    it.qty += d;
    sh.getRange(it.row, 5).setValue(it.qty);
    sh.getRange(it.row, 9).setValue(now);
    logRows.push([now, d < 0 ? KIND_TH.out : KIND_TH.in, it.id, label_(it), d, it.qty, by, d < 0 ? site : (site || ''), note]);
  });
  appendLog_(ss, logRows);
  return snapshot_(ss);
}

function adjust_(ss, p) {
  var by = clean_(p.by, 60);
  if (!by) throw new Error('กรุณาใส่ชื่อผู้ทำรายการ');
  var qty = Math.round(Number(p.qty));
  if (!(qty >= 0)) throw new Error('จำนวนไม่ถูกต้อง');
  var items = readItems_(ss), it = null;
  items.forEach(function (x) { if (x.id === String(p.id)) it = x; });
  if (!it) throw new Error('ไม่พบรายการ');
  var sh = ss.getSheetByName(SHEET_ITEMS), now = new Date();
  var d = qty - it.qty;
  sh.getRange(it.row, 5).setValue(qty);
  sh.getRange(it.row, 9).setValue(now);
  appendLog_(ss, [[now, KIND_TH.adjust, it.id, label_(it), d, qty, by, '', clean_(p.note, 200) || 'นับสต็อกจริง']]);
  return snapshot_(ss);
}

function add_(ss, p) {
  var by = clean_(p.by, 60);
  if (!by) throw new Error('กรุณาใส่ชื่อผู้ทำรายการ');
  var x = p.item || {};
  var name = clean_(x.name, 120);
  if (!name) throw new Error('กรุณาใส่ชื่อรายการ');
  var items = readItems_(ss), maxN = 0;
  items.forEach(function (it) { var n = parseInt(String(it.id).replace(/\D/g, ''), 10); if (n > maxN) maxN = n; });
  var id = 'P' + ('0' + (maxN + 1)).slice(-2);
  if (maxN + 1 >= 100) id = 'P' + (maxN + 1);
  var qty = Math.max(0, Math.round(Number(x.qty) || 0));
  var now = new Date();
  var row = [id, clean_(x.cat, 40) || 'อื่น ๆ', name, clean_(x.size, 40), qty, clean_(x.unit, 20) || 'ชิ้น',
    Math.max(0, Math.round(Number(x.min))) || 1, clean_(x.loc, 60) || 'Office ตลิ่งชัน', now];
  var sh = ss.getSheetByName(SHEET_ITEMS);
  sh.getRange(sh.getLastRow() + 1, 1, 1, HEAD_ITEMS.length).setValues([row]);
  appendLog_(ss, [[now, KIND_TH.new, id, (row[2] + ' ' + row[3]).trim(), qty, qty, by, '', '']]);
  return snapshot_(ss);
}
