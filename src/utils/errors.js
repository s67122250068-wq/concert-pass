// แปลงข้อผิดพลาดของ Firebase เป็นข้อความภาษาไทยที่ผู้ใช้เข้าใจ
const MESSAGES = {
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/user-not-found': 'ไม่พบบัญชีนี้',
  'auth/wrong-password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้สมัครแล้ว',
  'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
  'auth/too-many-requests': 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่',
  'auth/network-request-failed': 'เชื่อมต่ออินเทอร์เน็ตไม่ได้',
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่อีกครั้งแล้วลองใหม่',
  PERMISSION_DENIED: 'ไม่มีสิทธิ์ทำรายการนี้ (อาจมีผู้อื่นจองที่นั่งไปก่อน หรือยังไม่ได้เข้าสู่ระบบ)',
};

export function friendlyError(err) {
  if (!err) return '';
  const text = `${err.code || ''} ${err.message || ''}`.replace(/permission denied/i, 'PERMISSION_DENIED');
  const hit = Object.keys(MESSAGES).find((k) => text.includes(k));
  return hit ? MESSAGES[hit] : err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
