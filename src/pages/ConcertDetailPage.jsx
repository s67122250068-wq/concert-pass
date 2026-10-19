import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { getConcertById, getFavorites, setFavorite } from '../services/concertService';
import Status from '../components/common/Status';
import FavoriteButton from '../components/features/FavoriteButton';
import { friendlyError } from '../utils/errors';

export default function ConcertDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [favOverride, setFavOverride] = useState(null);
  const [favError, setFavError] = useState('');
  const { loading, error, data, reload } = useAsync(async () => {
    const [concert, favs] = await Promise.all([getConcertById(id), user ? getFavorites(user.uid) : []]);
    return { concert, isFav: favs.some((f) => f.concert_id === id) };
  }, [id, user?.uid]);

  const c = data?.concert;
  const isFav = favOverride ?? data?.isFav ?? false;

  const toggleFav = async () => {
    if (!user) return nav('/login', { state: { from: `/concerts/${id}` } });
    try {
      setFavError('');
      await setFavorite(user.uid, id, !isFav);
      setFavOverride(!isFav);
    } catch (e) {
      setFavError(friendlyError(e));
    }
  };

  return (
    <div className="page">
      <button className="back" onClick={() => nav(-1)}>← ย้อนกลับ</button>
      <Status loading={loading} error={error} empty={!loading && !error && !c} emptyText="ไม่พบคอนเสิร์ตนี้" onRetry={reload}>
        {c && (
          <section className="detail">
            <img src={`/assets/${c.image_detail}`} alt={c.name_en}
              onError={(e) => { e.currentTarget.src = '/assets/concert-default.svg'; }} />
            <div className="detail-info">
              <div className="detail-title">
                <span className="pill">{c.category}</span>
                <FavoriteButton isFavorite={isFav} onToggle={toggleFav} />
              </div>
              {favError && <p className="form-error">{favError}</p>}
              <h1>{c.name_en}</h1>
              <h2>{c.artist}</h2>
              <p>{c.description}</p>
              <dl>
                <div><dt>วันที่</dt><dd>{c.event_date}</dd></div>
                <div><dt>เวลา</dt><dd>{c.start_time}–{c.end_time}</dd></div>
                <div><dt>สถานที่</dt><dd>{c.venue}</dd></div>
                <div><dt>ราคาเริ่มต้น</dt><dd className="price">฿{Number(c.ticket_price).toLocaleString()}</dd></div>
              </dl>
              <button className="primary big" onClick={() => nav(`/booking/${id}`)}>เลือกที่นั่ง →</button>
            </div>
          </section>
        )}
      </Status>
    </div>
  );
}
