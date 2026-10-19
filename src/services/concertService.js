import { ref, get, query, orderByChild, equalTo, update, remove, push } from 'firebase/database';
import { db } from './firebase';

const toList = (snap) => (snap.exists() ? Object.values(snap.val()) : []);

export async function getCategories() {
  return toList(await get(ref(db, 'categories')));
}

export async function getConcerts() {
  return toList(await get(ref(db, 'concerts')));
}

export async function getConcertById(id) {
  const snap = await get(ref(db, `concerts/${id}`));
  return snap.exists() ? snap.val() : null;
}

// ค้นหา/กรองฝั่ง client จากข้อมูลที่โหลดมาแล้ว (ข้อมูลมีเพียงหลักสิบรายการ)
export function filterConcerts(concerts, term = '', categoryId = '') {
  const q = term.trim().toLowerCase();
  return concerts.filter((c) => {
    const text = `${c.name_th} ${c.name_en} ${c.artist} ${c.venue}`.toLowerCase();
    return (!q || text.includes(q)) && (!categoryId || c.category_id === categoryId);
  });
}

export async function getSeats(concertId) {
  const snap = await get(query(ref(db, 'seats'), orderByChild('concert_id'), equalTo(concertId)));
  return toList(snap).sort((a, b) => a.seat_number.localeCompare(b.seat_number));
}

/**
 * จองที่นั่งแบบ atomic: multi-path update เขียน seats/* และ bookings/* พร้อมกัน
 * ถ้าที่นั่งใดถูกจองไปก่อนแล้ว Database Rules จะปฏิเสธทั้งชุด (ไม่มีการจองครึ่งๆ กลางๆ)
 */
export async function createBooking({ userId, concertId, seats }) {
  const bookingId = push(ref(db, 'bookings')).key;
  const updates = {};
  seats.forEach((s) => {
    const { seat_id, ...rest } = s;
    updates[`seats/${seat_id}`] = { ...rest, seat_id, status: 'Booked', booked_by: userId };
  });
  const booking = {
    booking_id: bookingId,
    user_id: userId,
    concert_id: concertId,
    seat_ids: seats.map((s) => s.seat_id),
    seat_numbers: seats.map((s) => s.seat_number),
    total_price: seats.reduce((sum, s) => sum + s.price, 0),
    booking_date: new Date().toISOString(),
    payment_status: 'Paid', // ระบบชำระเงินจำลอง (ตามขอบเขตงานที่ 5)
  };
  updates[`bookings/${bookingId}`] = booking;
  await update(ref(db), updates);
  return booking;
}

export async function getBookings(userId) {
  const snap = await get(query(ref(db, 'bookings'), orderByChild('user_id'), equalTo(userId)));
  return toList(snap).sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
}

export async function getFavorites(userId) {
  const snap = await get(query(ref(db, 'favorites'), orderByChild('user_id'), equalTo(userId)));
  return toList(snap);
}

// key แบบกำหนดเอง (uid_concertId) ทำให้ toggle ได้โดยไม่ต้อง query ก่อน
export async function setFavorite(userId, concertId, on) {
  const id = `${userId}_${concertId}`;
  if (on) {
    await update(ref(db, `favorites/${id}`), {
      favorite_id: id,
      user_id: userId,
      concert_id: concertId,
      created_at: new Date().toISOString(),
    });
  } else {
    await remove(ref(db, `favorites/${id}`));
  }
}
