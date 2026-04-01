import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar  from './Topbar.jsx';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
