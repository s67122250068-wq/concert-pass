import { useNavigate } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { getCategories, getConcerts } from '../services/concertService';
import Status from '../components/common/Status';
import SearchBar from '../components/features/SearchBar';
import ConcertCard from '../components/common/ConcertCard';
import CategoryCard from '../components/common/CategoryCard';

export default function HomePage() {
  const nav = useNavigate();
  const { loading, error, data, reload } = useAsync(
    async () => ({ concerts: await getConcerts(), cats: await getCategories() }),
    []
  );
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">MOBILE CONCERT TICKET BOOKING</span>
          <h1>ค้นหาเพลงที่ใช่<br /><em>แล้วไปเจอกันที่เวที</em></h1>
          <p>ค้นหา เลือกที่นั่ง จอง และรับ E-Ticket ได้ในที่เดียว</p>
          <SearchBar onSearch={(q) => nav(`/search?q=${encodeURIComponent(q)}`)} />
        </div>
        <div className="hero-art">🎵<br /><b>LIVE</b></div>
      </section>
      <Status loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <section>
              <div className="section-head"><div><span className="eyebrow">EXPLORE</span><h2>หมวดหมู่</h2></div></div>
              <div className="categories">{data.cats.map((c) => <CategoryCard key={c.category_id} category={c} />)}</div>
            </section>
            <section>
              <div className="section-head">
                <div><span className="eyebrow">UPCOMING</span><h2>คอนเสิร์ตแนะนำ</h2></div>
                <button className="text-btn" onClick={() => nav('/concerts')}>ดูทั้งหมด →</button>
              </div>
              <div className="concert-grid">{data.concerts.slice(0, 6).map((c) => <ConcertCard key={c.concert_id} concert={c} />)}</div>
            </section>
          </>
        )}
      </Status>
    </>
  );
}
