import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAsync from '../hooks/useAsync';
import { useAuth } from '../context/AuthContext';
import { getMyEvaluation, submitEvaluation } from '../services/evaluationService';
import { friendlyError } from '../utils/errors';
import Status from '../components/common/Status';
import {
  SCALE, USABILITY_GROUPS, USABILITY_ITEMS, SATISFACTION_ITEMS, RESPONDENT_FIELDS, uKey, sKey,
} from '../data/evaluationQuestions';

function RatingRow({ no, text, name, value, onChange, missing }) {
  return (
    <div className={missing ? 'rating-row missing' : 'rating-row'} role="radiogroup" aria-label={text}>
      <p><b>{no}.</b> {text}</p>
      <div className="scale">
        {SCALE.map((s) => (
          <label key={s.v} className={value === s.v ? 'on' : ''} title={s.label}>
            <input type="radio" name={name} checked={value === s.v} onChange={() => onChange(s.v)} />
            <span>{s.v}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function EvaluatePage() {
  const { user } = useAuth();
  const { loading, error, data: done, reload } = useAsync(() => getMyEvaluation(user.uid), [user.uid]);
  const [resp, setResp] = useState({});
  const [rate, setRate] = useState({});
  const [comments, setComments] = useState({ liked: '', confusing: '', improve: '' });
  const [formError, setFormError] = useState('');
  const [showMissing, setShowMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  const keys = [...USABILITY_ITEMS.map((_, i) => uKey(i)), ...SATISFACTION_ITEMS.map((_, i) => sKey(i))];
  const answered = keys.filter((k) => rate[k]).length;
  const setR = (k) => (v) => setRate((r) => ({ ...r, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (answered < keys.length) {
      setShowMissing(true);
      return setFormError(`ยังตอบไม่ครบ (${answered}/${keys.length} ข้อ) กรุณาตอบข้อที่ขีดแดง`);
    }
    setBusy(true);
    setFormError('');
    try {
      await submitEvaluation(user.uid, {
        respondent: resp,
        usability: Object.fromEntries(USABILITY_ITEMS.map((_, i) => [uKey(i), rate[uKey(i)]])),
        satisfaction: Object.fromEntries(SATISFACTION_ITEMS.map((_, i) => [sKey(i), rate[sKey(i)]])),
        comments,
      });
      reload();
    } catch (err) {
      setFormError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  let n = 0;
  return (
    <div className="page narrow">
      <span className="eyebrow">EVALUATION</span>
      <h1>แบบประเมินระบบ ConcertPass</h1>
      <Status loading={loading} error={error} onRetry={reload}>
        {done ? (
          <div className="success">
            ขอบคุณที่ประเมินระบบ — บัญชีนี้ส่งแบบประเมินแล้วเมื่อ{' '}
            {new Date(done.submitted_at).toLocaleString('th-TH')} (ส่งได้ 1 ครั้งต่อบัญชี) <Link to="/">กลับหน้าหลัก</Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="muted">
              ใช้ประเมินความสามารถในการใช้งานและความพึงพอใจ ข้อมูลใช้เพื่อการศึกษาเท่านั้น ให้คะแนน 5 = มากที่สุด ถึง 1 = น้อยที่สุด
            </p>

            <section className="panel">
              <h2>ส่วนที่ 1 ข้อมูลทั่วไป (ไม่บังคับ)</h2>
              {RESPONDENT_FIELDS.map((f) => (
                <label key={f.key}>{f.label}
                  <select value={resp[f.key] || ''} onChange={(e) => setResp({ ...resp, [f.key]: e.target.value })}>
                    <option value="">— เลือก —</option>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </section>

            <section className="panel">
              <h2>ส่วนที่ 2 ความสามารถในการใช้งานระบบ</h2>
              {USABILITY_GROUPS.map((g) => (
                <div key={g.title}>
                  <h3>{g.title}</h3>
                  {g.items.map((t) => {
                    const i = n++;
                    return <RatingRow key={t} no={i + 1} text={t} name={uKey(i)} value={rate[uKey(i)]}
                      onChange={setR(uKey(i))} missing={showMissing && !rate[uKey(i)]} />;
                  })}
                </div>
              ))}
            </section>

            <section className="panel">
              <h2>ส่วนที่ 3 ความพึงพอใจของผู้ใช้งาน</h2>
              {SATISFACTION_ITEMS.map((t, i) => (
                <RatingRow key={t} no={i + 1} text={t} name={sKey(i)} value={rate[sKey(i)]}
                  onChange={setR(sKey(i))} missing={showMissing && !rate[sKey(i)]} />
              ))}
            </section>

            <section className="panel">
              <h2>ส่วนที่ 4 ข้อเสนอแนะ (ไม่บังคับ)</h2>
              {[['liked', 'สิ่งที่ชอบหรือใช้งานได้ดี'], ['confusing', 'จุดที่ใช้งานแล้วสับสน'], ['improve', 'สิ่งที่อยากให้ปรับปรุง']].map(([k, label]) => (
                <label key={k}>{label}
                  <textarea rows={2} maxLength={500} value={comments[k]} onChange={(e) => setComments({ ...comments, [k]: e.target.value })} />
                </label>
              ))}
            </section>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            <div className="eval-submit">
              <span className="muted">ตอบแล้ว {answered}/{keys.length} ข้อ</span>
              <button className="primary" disabled={busy}>{busy ? 'กำลังส่ง...' : 'ส่งแบบประเมิน'}</button>
            </div>
          </form>
        )}
      </Status>
    </div>
  );
}
