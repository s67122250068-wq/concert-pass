import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { friendlyError, isEmail } from '../utils/errors';

const EMPTY = { first_name: '', last_name: '', phone: '', email: '', password: '' };

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from || '/';
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!isEmail(form.email)) return 'กรุณากรอกอีเมลให้ถูกต้อง';
    if (form.password.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (mode === 'register') {
      if (!form.first_name.trim() || !form.last_name.trim()) return 'กรุณากรอกชื่อและนามสกุล';
      if (form.phone && !/^0\d{8,9}$/.test(form.phone)) return 'เบอร์โทรต้องเป็นตัวเลข 9–10 หลักและขึ้นต้นด้วย 0';
    }
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
      nav(from, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <form className="login-card" onSubmit={submit} noValidate>
        <span className="eyebrow">{mode === 'login' ? 'SIGN IN' : 'SIGN UP'}</span>
        <h1>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h1>
        {mode === 'register' && (
          <>
            <label>ชื่อ<input value={form.first_name} onChange={set('first_name')} autoComplete="given-name" /></label>
            <label>นามสกุล<input value={form.last_name} onChange={set('last_name')} autoComplete="family-name" /></label>
            <label>เบอร์โทร (ไม่บังคับ)<input value={form.phone} onChange={set('phone')} inputMode="tel" /></label>
          </>
        )}
        <label>อีเมล<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <label>รหัสผ่าน<input type="password" value={form.password} onChange={set('password')}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'กรุณารอสักครู่...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</button>
        <button type="button" className="text-btn" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}
