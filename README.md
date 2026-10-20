# ConcertPass — ระบบจองตั๋วคอนเสิร์ตผ่านมือถือ (Group 08, งานที่ 7)

เว็บแอปพลิเคชัน React + Vite + Firebase (Realtime Database + Authentication) พัฒนาต่อจากงานที่ 5

- **URL เว็บไซต์ที่ Deploy:** https://concert-pass.web.app
- **GitHub Repository:** https://github.com/s67122250068-wq/concert-pass

## ฟังก์ชันที่พัฒนาเสร็จ
| รหัส | ฟังก์ชัน | หน้า / Component |
|---|---|---|
| F01 | ดูรายการคอนเสิร์ต + หมวดหมู่ | HomePage, ConcertListPage, ConcertCard, CategoryCard |
| F02 | ค้นหา / กรองตามหมวด | SearchBar, ConcertListPage (`/search?q=`, `?category=`) |
| F03 | รายละเอียดคอนเสิร์ต | ConcertDetailPage |
| F04 | เลือกที่นั่ง (สูงสุด 6 ที่/ครั้ง) | SeatBookingPage, SeatGrid, SeatItem |
| F05 | ยืนยันการจอง (atomic, กันจองซ้ำ) | `createBooking()`, BookingSummaryBar |
| F06 | E-Ticket + QR | ETicketPage, TicketCard, QRCodeDisplay |
| F07 | รายการโปรด | FavoritesPage, FavoriteButton |
| F08 | ประวัติการจอง | ETicketPage |
| F09 | สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ | LoginPage, AuthContext (Firebase Auth) |

## โครงสร้างโฟลเดอร์
```
src/
  components/{common,features,layout}   # ConcertCard, SeatGrid, Status, Navbar, Layout ...
  context/AuthContext.jsx               # Firebase Auth state
  hooks/useAsync.js                     # loading / error / reload
  pages/                                # 8 หน้า + NotFound
  routes/AppRoutes.jsx                  # Routing + Protected route
  services/{firebase,concertService}.js # เชื่อมต่อและเข้าถึง Realtime Database
  utils/errors.js                       # แปลง error เป็นข้อความไทย + validate อีเมล
firebase/{firebase_data.json,database.rules.json}
docs/TEST_PLAN.md
```

## Routing
`/` · `/concerts` · `/search?q=` · `/concerts/:id` · `/booking/:id`🔒 · `/favorites`🔒 · `/my-tickets`🔒 · `/login` · `*` (404)  
🔒 = ต้องเข้าสู่ระบบ (Protected route → redirect ไป `/login` แล้วกลับมาหน้าเดิมหลัง login)

## โครงสร้างข้อมูล Firebase Realtime Database
| Node | คีย์ | หมายเหตุ |
|---|---|---|
| `categories` | `cat_001`… | อ่านได้สาธารณะ |
| `concerts` | `C001`–`C019` | อ่านได้สาธารณะ |
| `seats` | `S001`–`S950` | 50 ที่นั่ง/คอนเสิร์ต (VIP 10, Standard 20, Economy 20); `status` = Available/Booked, `booked_by` |
| `bookings` | push id | `user_id`, `concert_id`, `seat_ids`, `seat_numbers`, `total_price`, `booking_date`, `payment_status` |
| `favorites` | `{uid}_{concertId}` | `user_id`, `concert_id`, `created_at` |
| `users` | `{uid}` | โปรไฟล์ที่สร้างตอนสมัครสมาชิก |

> ข้อมูล `users` U001/U002, `bookings` B001 และ `favorites` FAV001 ใน JSON เป็นข้อมูลตั้งต้นจากงานที่ 5 ผู้ใช้จริงที่สมัครผ่านหน้าเว็บจะใช้ `uid` ของ Firebase Auth

## วิธีติดตั้งและใช้งาน
1. **Firebase Console** → Create project → Build → **Realtime Database** → Create database (เลือก region, เริ่มแบบ locked mode)
2. Realtime Database → ⋮ → **Import JSON** → เลือก `firebase/firebase_data.json`
3. Realtime Database → **Rules** → วางเนื้อหาจาก `firebase/database.rules.json` → Publish
4. Build → **Authentication** → Get started → เปิด **Email/Password**
5. Project settings → Your apps → เพิ่ม **Web app** → คัดลอกค่า config
6. ในเครื่อง:
   ```bash
   npm install
   cp .env.example .env     # ใส่ค่า VITE_FIREBASE_* ให้ครบ
   npm run dev              # http://localhost:5173
   ```

## Git / GitHub
```bash
git init && git add . && git commit -m "feat: initial React + Firebase project"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
ควร commit ต่อเนื่องตามงาน เช่น `feat: firebase connection`, `feat: auth + protected routes`, `feat: seat booking`, `fix: ...`  
`.gitignore` ป้องกัน `.env`, `node_modules`, `dist` ไม่ให้ขึ้น repository แล้ว

## Deploy (Firebase Hosting)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting        # public directory = dist, single-page app = Yes, GitHub deploy = No
npm run build                # สร้าง Production Build ใน dist/
firebase deploy --only hosting,database
```
หลัง deploy: เพิ่มโดเมน `*.web.app` ใน Authentication → Settings → Authorized domains (ปกติเพิ่มให้อัตโนมัติ) แล้วทดสอบทุก route จาก URL สาธารณะ

## ความปลอดภัย
- Web API key ของ Firebase ไม่ใช่ความลับ แต่ความปลอดภัยของข้อมูลอยู่ที่ **Database Rules**
- `.env` ไม่ถูก commit; `.env.example` ไม่มีค่าจริง
- Rules: concerts/categories อ่านอย่างเดียว · ผู้ใช้อ่านได้เฉพาะ `bookings`/`favorites`/`users` ของตัวเอง · เขียน `seats` ได้เฉพาะ Available → Booked โดย `booked_by` = uid ตัวเอง และห้ามแก้ราคา
- การจองใช้ multi-path update ชุดเดียว: ถ้ามีที่นั่งใดถูกจองไปก่อน Rules จะปฏิเสธทั้งรายการ

## ข้อจำกัดที่ทราบ
- ชำระเงินเป็นแบบจำลอง (ตามขอบเขตงานที่ 5) ไม่มีการตัดเงินจริง
- QR เป็นภาพ pattern จากรหัสการจอง (ไม่ใช่ QR มาตรฐานที่สแกนได้)
- ผู้ใช้ที่เขียน client เองยังเขียน `bookings` ของตัวเองโดยไม่จองที่นั่งได้ — ถ้าจะใช้งานจริงควรย้ายการจองไป Cloud Functions
