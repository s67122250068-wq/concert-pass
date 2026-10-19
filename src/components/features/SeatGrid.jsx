import SeatItem from './SeatItem';

export default function SeatGrid({ seats, selectedSeats, onSeatSelect }) {
  const zones = [...new Set(seats.map((s) => s.zone))];
  return (
    <div className="seat-grid-wrap">
      <div className="stage">STAGE</div>
      {zones.map((z) => {
        const inZone = seats.filter((s) => s.zone === z);
        return (
          <section key={z} className="zone">
            <h3>โซน {z} · ฿{inZone[0].price.toLocaleString()}</h3>
            <div className="seats">
              {inZone.map((s) => (
                <SeatItem key={s.seat_id} seat={s} selected={selectedSeats.includes(s.seat_id)} onSelect={onSeatSelect} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
