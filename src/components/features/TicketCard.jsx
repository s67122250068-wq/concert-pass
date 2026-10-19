import QRCodeDisplay from './QRCodeDisplay';

export default function TicketCard({ booking, concert }) {
  const seats = booking.seat_numbers || booking.seat_ids || [];
  return (
    <article className="ticket-card">
      <div>
        <span className="pill">{booking.payment_status === 'Paid' ? 'PAID' : booking.payment_status}</span>
        <h3>{concert?.name_en || booking.concert_id}</h3>
        <p>{concert?.artist}</p>
        <p>📅 {concert?.event_date} · {concert?.start_time}</p>
        <p>📍 {concert?.venue}</p>
        <p><b>ที่นั่ง:</b> {seats.join(', ')}</p>
        <strong>฿{Number(booking.total_price).toLocaleString()}</strong>
      </div>
      <QRCodeDisplay value={booking.booking_id} />
    </article>
  );
}
