import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { isFirebaseConfigured } from './services/firebase';

function ConfigNotice() {
  return (
    <main className="page narrow">
      <div className="login-card">
        <h1>ยังไม่ได้ตั้งค่า Firebase</h1>
        <p className="muted">
          สร้างไฟล์ <code>.env</code> จาก <code>.env.example</code> แล้วใส่ค่า VITE_FIREBASE_* จาก Firebase Console
          จากนั้นรีสตาร์ท <code>npm run dev</code>
        </p>
      </div>
    </main>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <ConfigNotice />;
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
