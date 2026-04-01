import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

import AppLayout     from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute    from './components/auth/AdminRoute.jsx';

import LoginPage    from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GalleryPage  from './pages/GalleryPage.jsx';
import FileDetailPage from './pages/FileDetailPage.jsx';
import AdminPage    from './pages/AdminPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  const { userInfo } = useSelector((s) => s.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={userInfo ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={userInfo ? <Navigate to="/" /> : <RegisterPage />} />

        {/* Protected — needs login */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="gallery"       element={<GalleryPage />} />
            <Route path="files/:id"     element={<FileDetailPage />} />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        toastClassName="!bg-[#1a1714] !text-white !rounded-xl !text-sm !font-medium"
      />
    </BrowserRouter>
  );
}
