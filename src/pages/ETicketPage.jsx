import { useSearchParams } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { getBookings, getConcerts } from '../services/concertService';
import Status from '../components/common/Status';
import TicketCard from '../components/features/TicketCard';

export default function ETicketPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { loading, error, data, reload } = useAsync(async () => {
    const [bookings, concerts] = await Promise.all([getBookings(user.uid), getConcerts()]);
    return bookings.map((b) => ({ booking: b, concert: concerts.find((c) => c.concert_id === b.concert_id) }));
  }, [user.uid]);
  return (
    <div className="page">
      <span className="eyebrow">MY TICKETS</span>
      <h1>E-Ticket และประวัติการจอง</h1>
      <p className="muted">ตั๋วที่ชำระเงินแล้วทั้งหมดของคุณ</p>
      {params.get('booking') && <div className="success">จองสำเร็จ! รหัสการจอง {params.get('booking')} ✓</div>}
      <Status loading={loading} error={error} empty={data && !data.length} emptyText="ยังไม่มีประวัติการจอง" onRetry={reload}>
        {data?.map((x) => <TicketCard key={x.booking.booking_id} {...x} />)}
      </Status>
    </div>
  );
}
