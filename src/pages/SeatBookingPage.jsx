import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { createBooking, getConcertById, getSeats } from '../services/concertService';
import Status from '../components/common/Status';
import SeatGrid from '../components/features/SeatGrid';
import BookingSummaryBar from '../components/features/BookingSummaryBar';
import { friendlyError } from '../utils/errors';

const MAX_SEATS = 6;

export default function SeatBookingPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const { loading, error, data, reload } = useAsync(
    async () => ({ concert: await getConcertById(id), seats: await getSeats(id) }),
    [id]
  );

  const chosen = useMemo(() => (data ? data.seats.filter((s) => selected.includes(s.seat_id)) : []), [data, selected]);
  const total = chosen.reduce((sum, s) => sum + s.price, 0);

  const choose = (s) => {
    setFormError('');
    if (!selected.includes(s.seat_id) && selected.length >= MAX_SEATS) {
      return setFormError(`เลือกได้สูงสุด ${MAX_SEATS} ที่นั่งต่อการจอง`);
    }
    setSelected((x) => (x.includes(s.seat_id) ? x.filter((i) => i !== s.seat_id) : [...x, s.seat_id]));
  };

  const confirm = async () => {
    setBusy(true);
    setFormError('');
    try {
      const b = await createBooking({ userId: user.uid, concertId: id, seats: chosen });
      nav(`/my-tickets?booking=${b.booking_id}`);
    } catch (e) {
      setFormError(friendlyError(e));
      setSelected([]);
      reload(); // โหลดสถานะที่นั่งล่าสุด
    } finally {
      setBusy(false);
    }
  };

  const c = data?.concert;
  return (
    <div className="page">
      <button className="back" onClick={() => nav(`/concerts/${id}`)}>← รายละเอียดคอนเสิร์ต</button>
      <Status loading={loading} error={error} empty={!loading && !error && (!c || !data.seats.length)}
        emptyText="ไม่พบข้อมูลที่นั่งของคอนเสิร์ตนี้" onRetry={reload}>
        {data && c && (
          <>
            <div className="page-head">
              <div><span className="eyebrow">BOOKING</span><h1>เลือกที่นั่ง</h1><p className="muted">{c.name_en} · {c.venue}</p></div>
            </div>
            <div className="legend"><span><i />ว่าง</span><span><i className="sel" />เลือกแล้ว</span><span><i className="book" />ถูกจองแล้ว</span></div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <SeatGrid seats={data.seats} selectedSeats={selected} onSeatSelect={choose} />
            <BookingSummaryBar selectedSeats={chosen} total={total} onConfirm={confirm} busy={busy} />
          </>
        )}
      </Status>
    </div>
  );
}
