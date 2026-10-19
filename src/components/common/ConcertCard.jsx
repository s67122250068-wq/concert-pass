import { useNavigate } from 'react-router-dom';

export default function ConcertCard({ concert }) {
  const nav = useNavigate();
  return (
    <article className="concert-card" onClick={() => nav(`/concerts/${concert.concert_id}`)}>
      <img
        src={`/assets/${concert.image_thumbnail || 'concert-default.svg'}`}
        alt={concert.name_en}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = '/assets/concert-default.svg'; }}
      />
      <div className="card-body">
        <span className="pill">{concert.category}</span>
        <h3>{concert.name_en || concert.name_th}</h3>
        <p className="artist">{concert.artist}</p>
        <p>📍 {concert.venue}</p>
        <p>📅 {concert.event_date} · {concert.start_time}</p>
        <div className="price">฿{Number(concert.ticket_price).toLocaleString()}</div>
      </div>
    </article>
  );
}
