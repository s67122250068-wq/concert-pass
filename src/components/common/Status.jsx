import { friendlyError } from '../../utils/errors';

// แสดงสถานะ: กำลังโหลด / ผิดพลาด / ไม่พบข้อมูล — ไม่เข้าเงื่อนไขใดจึงแสดง children
export default function Status({ loading, error, empty, emptyText = 'ไม่พบข้อมูล', onRetry, children }) {
  if (loading)
    return (
      <div className="state" role="status">
        <div className="spinner" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  if (error)
    return (
      <div className="state error" role="alert">
        <p>เกิดข้อผิดพลาด: {friendlyError(error)}</p>
        {onRetry && <button className="primary" onClick={onRetry}>ลองอีกครั้ง</button>}
      </div>
    );
  if (empty) return <div className="empty">{emptyText}</div>;
  return children ?? null;
}
