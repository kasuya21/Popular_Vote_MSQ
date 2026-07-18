import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner small />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== 'SUPER_ADMIN' && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        <button onClick={() => window.history.back()} className="text-violet-600 font-medium">กลับไปหน้าก่อนหน้า</button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
