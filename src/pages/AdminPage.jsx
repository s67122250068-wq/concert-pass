import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { unlockAdmin, lockAdmin, loadAdminData, isDenied } from '../services/adminService';
import { friendlyError } from '../utils/errors';
import { mean, sd, level, fmt } from '../utils/stats';
import Status from '../components/common/Status';
import { USABILITY_GROUPS, USABILITY_ITEMS, SATISFACTION_ITEMS, uKey, sKey } from '../data/evaluationQuestions';

const vals = (rows, group, key) => rows.map((r) => r[group]?.[key]).filter(Number.isFinite);
const personMean = (r, group, keys) => mean(keys.map((k) => r[group]?.[k]).filter(Number.isFinite));

function StatRow({ code, text, arr, bold }) {
  const m = mean(arr);
  return (
    <tr className={bold ? 'strong' : ''}>
      <td>{code}</td><td>{text}</td><td>{arr.length}</td><td>{fmt(m)}</td><td>{fmt(sd(arr))}</td><td>{level(m)}</td>
    </tr>
  );
}

function Dashboard({ data, onLock }) {
  const rows = useMemo(() => [...data.evaluations].sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)), [data]);
  const uKeys = USABILITY_ITEMS.map((_, i) => uKey(i));
  const sKeys = SATISFACTION_ITEMS.map((_, i) => sKey(i));
  const nameOf = (uid) => {
    const u = data.users[uid];
    return u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email : uid;
  };

  const downloadCsv = () => {
    const head = ['ผู้ตอบคนที่', ...uKeys, ...sKeys];
    const lines = rows.map((r, i) => [i + 1, ...uKeys.map((k) => r.usability?.[k] ?? ''), ...sKeys.map((k) => r.satisfaction?.[k] ?? '')]);
    const csv = '\ufeff' + [head, ...lines].map((l) => l.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'evaluation_scores.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  let idx = 0;
  return (
    <>
      <div className="row admin-bar">
        <b>ผู้ตอบแบบประเมินทั้งหมด {rows.length} คน</b>
        <button className="primary" onClick={downloadCsv} disabled={!rows.length}>ดาวน์โหลดคะแนน (CSV)</button>
        <button className="text-btn" onClick={onLock}>ล็อกแอดมิน</button>
      </div>

      <section className="panel">
        <h2>ตารางที่ 1 ความสามารถในการใช้งาน (วัตถุประสงค์ข้อ 2)</h2>
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>ข้อ</th><th>รายการ</th><th>n</th><th>x̄</th><th>S.D.</th><th>ระดับ</th></tr></thead>
          <tbody>
            {USABILITY_GROUPS.map((g) => {
              const start = idx;
              const body = g.items.map((t) => { const i = idx++; return <StatRow key={t} code={uKey(i)} text={t} arr={vals(rows, 'usability', uKey(i))} />; });
              const groupVals = rows.flatMap((r) => g.items.map((_, j) => r.usability?.[uKey(start + j)]).filter(Number.isFinite));
              return [...body, <StatRow key={g.title} code="" text={g.title} arr={groupVals} bold />];
            })}
            <StatRow code="" text="ภาพรวม (ค่าเฉลี่ยรายคน)" arr={rows.map((r) => personMean(r, 'usability', uKeys)).filter((x) => x != null)} bold />
          </tbody>
        </table></div>
      </section>

      <section className="panel">
        <h2>ตารางที่ 2 ความพึงพอใจ (วัตถุประสงค์ข้อ 3)</h2>
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>ข้อ</th><th>รายการ</th><th>n</th><th>x̄</th><th>S.D.</th><th>ระดับ</th></tr></thead>
          <tbody>
            {SATISFACTION_ITEMS.map((t, i) => <StatRow key={t} code={sKey(i)} text={t} arr={vals(rows, 'satisfaction', sKey(i))} />)}
            <StatRow code="" text="ภาพรวม (ค่าเฉลี่ยรายคน)" arr={rows.map((r) => personMean(r, 'satisfaction', sKeys)).filter((x) => x != null)} bold />
          </tbody>
        </table></div>
      </section>

      <section className="panel">
        <h2>รายชื่อผู้ประเมินและข้อเสนอแนะ</h2>
        {!rows.length && <p className="muted">ยังไม่มีผู้ส่งแบบประเมิน</p>}
        <div className="table-wrap"><table className="data-table">
          <thead><tr><th>#</th><th>ผู้ตอบ</th><th>ส่งเมื่อ</th><th>x̄ ใช้งาน</th><th>x̄ พึงพอใจ</th><th>ข้อเสนอแนะ</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.user_id}>
                <td>{i + 1}</td>
                <td>{nameOf(r.user_id)}<br /><small className="muted">{data.users[r.user_id]?.email}</small></td>
                <td>{new Date(r.submitted_at).toLocaleString('th-TH')}</td>
                <td>{fmt(personMean(r, 'usability', uKeys))}</td>
                <td>{fmt(personMean(r, 'satisfaction', sKeys))}</td>
                <td>{['liked', 'confusing', 'improve'].map((k) => r.comments?.[k]).filter(Boolean).join(' / ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'checking', data: null, error: null });
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setState({ status: 'open', data: await loadAdminData(), error: null });
    } catch (e) {
      setState(isDenied(e) ? { status: 'locked', data: null, error: null } : { status: 'error', data: null, error: e });
    }
  };
  useEffect(() => { load(); }, []); // ถ้าเคยปลดล็อกไว้ จะเข้าได้เลย

  const unlock = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setMsg('กรุณากรอกรหัสแอดมิน');
    setBusy(true);
    setMsg('');
    try {
      await unlockAdmin(user.uid, code.trim());
      setCode('');
      await load();
    } catch (err) {
      setMsg(isDenied(err) ? 'รหัสแอดมินไม่ถูกต้อง (หรือยังไม่ได้ตั้งรหัสใน Firebase)' : friendlyError(err));
    } finally {
      setBusy(false);
    }
  };
  const lock = async () => { await lockAdmin(user.uid); setState({ status: 'locked', data: null, error: null }); };

  return (
    <div className={state.status === 'open' ? 'page' : 'page narrow'}>
      <span className="eyebrow">ADMIN</span>
      <h1>ผลการประเมินระบบ (ผู้ดูแล)</h1>
      <Status loading={state.status === 'checking'} error={state.error} onRetry={load}>
        {state.status === 'locked' && (
          <form className="panel" onSubmit={unlock} noValidate>
            <h2>ใส่รหัสแอดมินเพื่อดูผลการประเมิน</h2>
            <label>รหัสแอดมิน<input type="password" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" /></label>
            {msg && <p className="form-error" role="alert">{msg}</p>}
            <button className="primary" disabled={busy}>{busy ? 'กำลังตรวจสอบ...' : 'เข้าดูข้อมูล'}</button>
          </form>
        )}
        {state.status === 'open' && <Dashboard data={state.data} onLock={lock} />}
      </Status>
    </div>
  );
}
