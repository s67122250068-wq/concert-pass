import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // ข้อมูลจาก users/{uid}
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null);
    try {
      const snap = await get(ref(db, `users/${u.uid}`));
      setProfile(snap.exists() ? snap.val() : null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        await loadProfile(u);
        setReady(true);
      }),
    [loadProfile]
  );

  const value = useMemo(() => {
    const displayName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : user?.displayName || user?.email || '';
    return {
      user,
      profile,
      displayName,
      ready,
      refreshProfile: () => loadProfile(auth.currentUser),
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
      register: async ({ email, password, first_name, last_name, phone }) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: `${first_name} ${last_name}` });
        await set(ref(db, `users/${cred.user.uid}`), {
          user_id: cred.user.uid,
          first_name,
          last_name,
          email,
          phone: phone || '',
          role: 'Customer',
          status: 'Active',
          created_at: new Date().toISOString(),
        });
        await loadProfile(cred.user);
      },
    };
  }, [user, profile, ready, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
