import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { getConcerts, getFavorites } from '../services/concertService';
import Status from '../components/common/Status';
import ConcertCard from '../components/common/ConcertCard';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { loading, error, data, reload } = useAsync(async () => {
    const [concerts, favs] = await Promise.all([getConcerts(), getFavorites(user.uid)]);
    return concerts.filter((c) => favs.some((f) => f.concert_id === c.concert_id));
  }, [user.uid]);
  return (
    <div className="page">
      <span className="eyebrow">MY LIST</span>
      <h1>รายการโปรด</h1>
      <p className="muted">คอนเสิร์ตที่คุณบันทึกไว้</p>
      <Status loading={loading} error={error} empty={data && !data.length} emptyText="ยังไม่มีรายการโปรด — กดหัวใจที่หน้ารายละเอียดคอนเสิร์ตเพื่อบันทึก" onRetry={reload}>
        <div className="concert-grid">{data?.map((c) => <ConcertCard key={c.concert_id} concert={c} />)}</div>
      </Status>
    </div>
  );
}
