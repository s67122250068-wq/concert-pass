export default function BookingSummaryBar({ selectedSeats = [], total = 0, onConfirm, busy }) {
  return (
    <div className="summary">
      <div>
        <b>{selectedSeats.length}</b> ที่นั่ง
        <span>{selectedSeats.map((s) => s.seat_number).join(', ')}</span>
        <span>รวม ฿{total.toLocaleString()}</span>
      </div>
      <button disabled={!selectedSeats.length || busy} onClick={onConfirm}>
        {busy ? 'กำลังจอง...' : 'ยืนยันการจอง'}
      </button>
    </div>
  );
}
