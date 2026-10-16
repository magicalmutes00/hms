import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/Toast.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import FrontDeskDashboard from './pages/FrontDeskDashboard.jsx';
import HousekeepingView from './pages/HousekeepingView.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const STAFF = ['ADMIN', 'RECEPTIONIST'];
const HK = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPER'];

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
              <Route path="/front-desk" element={<ProtectedRoute roles={STAFF}><FrontDeskDashboard /></ProtectedRoute>} />
              <Route path="/housekeeping" element={<ProtectedRoute roles={HK}><HousekeepingView /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/manage" element={<ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
