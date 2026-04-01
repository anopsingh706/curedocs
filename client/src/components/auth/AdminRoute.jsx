import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const { userInfo } = useSelector((s) => s.auth);
  return userInfo?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}
