import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setReady(true);
      }),
    []
  );

  const value = useMemo(
    () => ({
      user,
      ready,
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
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
