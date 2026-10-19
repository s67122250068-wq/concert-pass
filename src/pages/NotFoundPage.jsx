import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page narrow">
      <div className="empty">
        <h1>404</h1>
        <p>ไม่พบหน้าที่ต้องการ</p>
        <Link to="/">กลับหน้าหลัก</Link>
      </div>
    </div>
  );
}
