import { ref, update } from 'firebase/database';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth, db } from './firebase';

// บันทึกโปรไฟล์ที่ users/{uid}; photo = '' หมายถึงลบรูป, undefined = ไม่แก้รูป
export async function saveProfile(uid, { first_name, last_name, phone, photo }) {
  const data = {
    user_id: uid,
    email: auth.currentUser.email,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    phone: (phone || '').trim(),
  };
  if (photo !== undefined) data.photo = photo;
  await update(ref(db, `users/${uid}`), data);
  await updateProfile(auth.currentUser, { displayName: `${data.first_name} ${data.last_name}` });
}

// เปลี่ยนรหัสผ่าน: ยืนยันรหัสผ่านเดิมก่อน (Firebase บังคับให้ล็อกอินล่าสุด)
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}
