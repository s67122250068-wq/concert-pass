import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveProfile } from '../services/userService';
import { resizeToDataUrl } from '../utils/image';
import { friendlyError } from '../utils/errors';
import Avatar from '../components/common/Avatar';

export default function AccountPage() {
  const { user, profile, displayName, refreshProfile } = useAuth();
  const [params] = useSearchParams();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const run = async (job, okText) => {
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await job();
      await refreshProfile();
      setMsg({ type: 'ok', text: okText });
    } catch (e) {
      setMsg({ type: 'err', text: friendlyError(e) });
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return setMsg({ type: 'err', text: 'กรุณากรอกชื่อและนามสกุล' });
    if (form.phone && !/^0\d{8,9}$/.test(form.phone)) return setMsg({ type: 'err', text: 'เบอร์โทรต้องเป็นตัวเลข 9–10 หลักและขึ้นต้นด้วย 0' });
    run(() => saveProfile(user.uid, form), 'บันทึกข้อมูลเรียบร้อย');
  };

  const pickPhoto = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    run(async () => saveProfile(user.uid, { ...form, photo: await resizeToDataUrl(file) }), 'อัปเดตรูปโปรไฟล์เรียบร้อย');
  };

  const joined = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('th-TH', { dateStyle: 'long' }) : '-';

  return (
    <div className="page narrow">
      <span className="eyebrow">ACCOUNT</span>
      <h1>ข้อมูลของฉัน</h1>

      <section className="panel profile-head">
        <Avatar photo={profile?.photo} name={displayName} size={88} />
        <div>
          <h2>{displayName}</h2>
          <p className="muted">{user.email}</p>
          <div className="row">
            <button className="primary" disabled={busy} onClick={() => fileRef.current.click()}>
              {profile?.photo ? 'เปลี่ยนรูปโปรไฟล์' : 'เพิ่มรูปโปรไฟล์'}
            </button>
            {profile?.photo && (
              <button className="text-btn" disabled={busy} onClick={() => run(() => saveProfile(user.uid, { ...form, photo: '' }), 'ลบรูปโปรไฟล์แล้ว')}>
                ลบรูป
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        </div>
      </section>

      {msg.text && <p className={msg.type === 'ok' ? 'success' : 'form-error'} role="status">{msg.text}</p>}

      <form className="panel" onSubmit={submit} noValidate>
        <h2>แก้ไขชื่อและข้อมูลติดต่อ</h2>
        <label>ชื่อ<input value={form.first_name} onChange={set('first_name')} maxLength={50} autoFocus={params.get('edit') === '1'} /></label>
        <label>นามสกุล<input value={form.last_name} onChange={set('last_name')} maxLength={50} /></label>
        <label>เบอร์โทร<input value={form.phone} onChange={set('phone')} inputMode="tel" maxLength={10} /></label>
        <button className="primary" disabled={busy}>{busy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </form>

      <section className="panel">
        <h2>ข้อมูลบัญชี</h2>
        <dl className="info-list">
          <div><dt>อีเมล</dt><dd>{user.email}</dd></div>
          <div><dt>ประเภทบัญชี</dt><dd>{profile?.role || 'Customer'}</dd></div>
          <div><dt>สมัครเมื่อ</dt><dd>{joined}</dd></div>
        </dl>
      </section>
    </div>
  );
}
