// ตั้งค่าคลังสินค้า best home
// API_URL = ลิงก์เว็บแอป Apps Script (ลงท้าย /exec) — ดูวิธีทำใน README.md
// ถ้าเว้นว่าง (หรือเปิดเว็บด้วย ?demo=1) เว็บจะทำงาน "โหมดทดลอง" เก็บข้อมูลไว้ในเครื่องนั้นเครื่องเดียว
window.STOCK_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzjmD6G6eZxKAhG0Z1jnddalBGEOZMcvcDq7aST6EiG375y0di_yWtQ0N9E270QqK5E/exec',
  BRAND: 'best home',
  APP_NAME: 'คลังสินค้า',
  STORE_NAME: 'Office ตลิ่งชัน',
  SITES: ['ลาดพร้าว 8', 'ลาดพร้าว 80', 'รามคำแหง 92', 'สุขาภิบาล 5', 'ราชเทวี', 'พระยาสุเรนทร์', 'บางกรวย', 'สโตร์ตลิ่งชัน'],

  // หมวดวัสดุ — key ต้องตรงกับคอลัมน์ "หมวดวัสดุ" ในแท็บ คลัง
  DEPARTMENTS: [
    { key: 'ประปา', desc: 'ท่อ ข้อต่อ วาล์ว อุปกรณ์ประปา', color: '#2f7cf6', tint: '#e8f1ff', icon: 'drop' },
    { key: 'ไฟฟ้า', desc: 'สายไฟ ปลั๊ก สวิตช์ หลอดไฟ', color: '#e59a00', tint: '#fff4d9', icon: 'bolt' },
    { key: 'สีและเคมีภัณฑ์', desc: 'สี กาว ซิลิโคน กันซึม', color: '#e0457b', tint: '#ffe9f1', icon: 'roller' },
    { key: 'ปูนและวัสดุก่อ', desc: 'ปูน อิฐ ทราย กระเบื้อง', color: '#a0663f', tint: '#f7ece4', icon: 'brick' },
    { key: 'เหล็กและโครงสร้าง', desc: 'เหล็กเส้น เหล็กกล่อง ตะแกรง', color: '#56677f', tint: '#ebeff5', icon: 'beam' },
    { key: 'ไม้ ประตู หน้าต่าง', desc: 'ไม้แบบ ประตู วงกบ บานพับ', color: '#c46a24', tint: '#fdefe3', icon: 'door' },
    { key: 'ฮาร์ดแวร์ น็อต สกรู', desc: 'น็อต สกรู พุก ตะปู มือจับ', color: '#7259f5', tint: '#efeaff', icon: 'screw' },
    { key: 'อุปกรณ์ไซต์งาน', desc: 'เครื่องมือ ผ้าใบ นั่งร้าน ความปลอดภัย', color: '#1c9a5e', tint: '#e3f6ec', icon: 'tools' },
  ],
};
