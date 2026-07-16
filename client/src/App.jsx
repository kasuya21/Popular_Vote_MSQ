import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Ranking from './pages/Ranking';
import TrackOrder from './pages/TrackOrder';
import Terms from './pages/Terms';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/admin/Login';
import AdminCandidates from './pages/admin/AdminCandidates';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminPackages from './pages/admin/AdminPackages';



function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        {/* Main Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="candidate/:id" element={<CandidateDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/:orderNo" element={<Payment />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin Routes */}
        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
