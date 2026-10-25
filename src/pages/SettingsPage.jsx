import { useState } from 'react';
import { changePassword } from '../services/userService';
import { friendlyError } from '../utils/errors';

export default function SettingsPage() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 6) return setMsg({ type: 'err', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
    if (form.next !== form.confirm) return setMsg({ type: 'err', text: 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน' });
    if (form.next === form.current) return setMsg({ type: 'err', text: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม' });
    setBusy(true);
    setMsg({ type: '', text: '' });
    try {
      await changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setMsg({ type: 'ok', text: 'เปลี่ยนรหัสผ่านเรียบร้อย' });
    } catch (err) {
      setMsg({ type: 'err', text: friendlyError(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <span className="eyebrow">SETTINGS</span>
      <h1>ตั้งค่า</h1>
      <form className="panel" onSubmit={submit} noValidate>
        <h2>เปลี่ยนรหัสผ่าน</h2>
        <label>รหัสผ่านปัจจุบัน<input type="password" value={form.current} onChange={set('current')} autoComplete="current-password" /></label>
        <label>รหัสผ่านใหม่<input type="password" value={form.next} onChange={set('next')} autoComplete="new-password" /></label>
        <label>ยืนยันรหัสผ่านใหม่<input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" /></label>
        {msg.text && <p className={msg.type === 'ok' ? 'success' : 'form-error'} role="status">{msg.text}</p>}
        <button className="primary" disabled={busy}>{busy ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}</button>
      </form>
    </div>
  );
}
