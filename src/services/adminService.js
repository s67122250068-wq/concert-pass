import { ref, get, set, remove } from 'firebase/database';
import { db } from './firebase';

// รหัสแอดมินไม่ได้อยู่ในโค้ดเว็บ: อยู่ที่ config/admin_code (อ่านไม่ได้จาก client)
// Rules จะเทียบค่าที่ส่งมากับ config/admin_code เอง ถ้าตรงจึงยอมให้บันทึก admin_sessions/{uid}
// Firebase ส่งข้อความ "Permission denied" (มีช่องว่าง) หรือ code PERMISSION_DENIED ตามเวอร์ชัน จึงเช็กทั้งสองแบบ
export const isDenied = (e) => /permission[\s_]denied/i.test(`${e?.code || ''} ${e?.message || ''}`);

export const unlockAdmin = (uid, code) => set(ref(db, `admin_sessions/${uid}`), code);
export const lockAdmin = (uid) => remove(ref(db, `admin_sessions/${uid}`));

// อ่านได้เฉพาะบัญชีที่ปลดล็อกแล้ว มิฉะนั้น Rules ตอบ PERMISSION_DENIED
export async function loadAdminData() {
  const [ev, us] = await Promise.all([get(ref(db, 'evaluations')), get(ref(db, 'users'))]);
  return {
    evaluations: ev.exists() ? Object.values(ev.val()) : [],
    users: us.exists() ? us.val() : {},
  };
}
