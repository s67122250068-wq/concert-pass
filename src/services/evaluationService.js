import { ref, get, set } from 'firebase/database';
import { db } from './firebase';

export async function getMyEvaluation(uid) {
  const snap = await get(ref(db, `evaluations/${uid}`));
  return snap.exists() ? snap.val() : null;
}

// 1 บัญชี = 1 แบบประเมิน (Rules ไม่ให้เขียนทับ)
export function submitEvaluation(uid, { respondent, usability, satisfaction, comments }) {
  return set(ref(db, `evaluations/${uid}`), {
    user_id: uid,
    submitted_at: new Date().toISOString(),
    respondent,
    usability,
    satisfaction,
    comments,
  });
}
