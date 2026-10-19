import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => nav('/')}>🎫 ConcertPass</button>
        <nav>
          <NavLink to="/" end>หน้าหลัก</NavLink>
          <NavLink to="/concerts">คอนเสิร์ต</NavLink>
          <NavLink to="/favorites">รายการโปรด</NavLink>
          <NavLink to="/my-tickets">ตั๋วของฉัน</NavLink>
        </nav>
        {user ? (
          <div className="user-box">
            <span>{user.displayName || user.email}</span>
            <button className="login-btn" onClick={() => logout().then(() => nav('/'))}>ออกจากระบบ</button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => nav('/login')}>เข้าสู่ระบบ</button>
        )}
      </div>
    </header>
  );
}
