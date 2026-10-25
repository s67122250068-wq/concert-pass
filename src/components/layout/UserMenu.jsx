import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function UserMenu() {
  const { user, profile, displayName, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  // ปิดเมนูเมื่อคลิกนอกกล่องหรือกด Esc
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    nav(path);
  };
  const signOutNow = async () => {
    setOpen(false);
    await logout();
    nav('/');
  };

  return (
    <div className="user-menu" ref={box}>
      <button className="user-trigger" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Avatar photo={profile?.photo} name={displayName} />
        <span className="user-name">{displayName}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu-head">
            <b>{displayName}</b>
            <small>{user.email}</small>
          </div>
          <button role="menuitem" onClick={() => go('/account')}>👤 ข้อมูลของฉัน</button>
          <button role="menuitem" onClick={() => go('/account?edit=1')}>✏️ แก้ไขชื่อ / รูปโปรไฟล์</button>
          <button role="menuitem" onClick={() => go('/evaluate')}>📝 ประเมินระบบ</button>
          <button role="menuitem" onClick={() => go('/settings')}>⚙️ ตั้งค่า</button>
          <button role="menuitem" onClick={() => go('/admin')}>🔐 ผู้ดูแล (ดูผลประเมิน)</button>
          <hr />
          <button role="menuitem" className="danger" onClick={signOutNow}>↩ ออกจากระบบ</button>
        </div>
      )}
    </div>
  );
}
