import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Status from '../components/common/Status';
import HomePage from '../pages/HomePage';
import ConcertListPage from '../pages/ConcertListPage';
import ConcertDetailPage from '../pages/ConcertDetailPage';
import SeatBookingPage from '../pages/SeatBookingPage';
import FavoritesPage from '../pages/FavoritesPage';
import ETicketPage from '../pages/ETicketPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

// หน้าที่ต้องเข้าสู่ระบบก่อน (จอง / รายการโปรด / ตั๋วของฉัน)
function Protected({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Status loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/concerts" element={<ConcertListPage />} />
          <Route path="/search" element={<ConcertListPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          <Route path="/booking/:id" element={<Protected><SeatBookingPage /></Protected>} />
          <Route path="/favorites" element={<Protected><FavoritesPage /></Protected>} />
          <Route path="/my-tickets" element={<Protected><ETicketPage /></Protected>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
