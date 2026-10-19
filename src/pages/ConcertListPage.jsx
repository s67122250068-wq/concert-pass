import { useSearchParams } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { filterConcerts, getCategories, getConcerts } from '../services/concertService';
import Status from '../components/common/Status';
import SearchBar from '../components/features/SearchBar';
import ConcertCard from '../components/common/ConcertCard';

export default function ConcertListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const cat = params.get('category') || '';
  const { loading, error, data, reload } = useAsync(
    async () => ({ concerts: await getConcerts(), cats: await getCategories() }),
    []
  );
  const setFilter = (next) => {
    const p = {};
    if (next.q) p.q = next.q;
    if (next.category) p.category = next.category;
    setParams(p);
  };
  const items = data ? filterConcerts(data.concerts, q, cat) : [];

  return (
    <div className="page">
      <div className="page-head">
        <div><span className="eyebrow">CONCERTS</span><h1>คอนเสิร์ตทั้งหมด</h1></div>
        <SearchBar key={q} initialValue={q} onSearch={(v) => setFilter({ q: v, category: cat })} />
      </div>
      <Status loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="filter-row">
              <button className={!cat ? 'filter active' : 'filter'} onClick={() => setFilter({ q })}>ทั้งหมด</button>
              {data.cats.map((c) => (
                <button key={c.category_id} className={cat === c.category_id ? 'filter active' : 'filter'}
                  onClick={() => setFilter({ q, category: c.category_id })}>{c.name_th}</button>
              ))}
            </div>
            <p className="muted">พบ {items.length} รายการ{q && ` สำหรับ “${q}”`}</p>
            <Status empty={!items.length} emptyText="ไม่พบคอนเสิร์ตที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหาหรือหมวดหมู่">
              <div className="concert-grid">{items.map((c) => <ConcertCard key={c.concert_id} concert={c} />)}</div>
            </Status>
          </>
        )}
      </Status>
    </div>
  );
}
