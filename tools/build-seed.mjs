// สร้าง data/seed.js และฝัง SEED ลงใน apps-script/Code.gs จาก data/seed.json
// รัน: node tools/build-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(readFileSync(join(root, 'data/seed.json'), 'utf8'));
const items = raw.map(([cat, name, size, qty], i) => ({
  id: 'P' + String(i + 1).padStart(2, '0'),
  cat, name, size, qty, unit: 'ชิ้น', min: 1, loc: 'Office ตลิ่งชัน',
}));
const lit = JSON.stringify(items, null, 2);

writeFileSync(join(root, 'data/seed.js'),
  `// สร้างอัตโนมัติจาก data/seed.json — แท็บ "ประปา สโตร์ ตลิ่งชัน" ในชีต วัสดุ\nwindow.STOCK_SEED = ${lit};\n`);

const gsPath = join(root, 'apps-script/Code.gs');
const gs = readFileSync(gsPath, 'utf8');
const next = gs.replace(/(\/\/ ---- SEED START[^\n]*\n)[\s\S]*?(\/\/ ---- SEED END ----)/, `$1var SEED = ${lit};\n$2`);
if (next === gs && !gs.includes('var SEED = [\n')) throw new Error('ไม่เจอตำแหน่ง SEED ใน Code.gs');
writeFileSync(gsPath, next);
console.log(`seed: ${items.length} รายการ, รวม ${items.reduce((a, b) => a + b.qty, 0)} ชิ้น`);
