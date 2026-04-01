import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice.js';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi.js';
import { getCatConfig } from '../../utils/helpers.js';
import {
  LayoutDashboard, Images, ShieldCheck, LogOut,
  Stethoscope, FlaskConical, Building2, Pill, FileText, Plus,
} from 'lucide-react';

const catIcons = {
  stethoscope: Stethoscope,
  'flask-conical': FlaskConical,
  'building-2': Building2,
  pill: Pill,
  'file-text': FileText,
};

const navBase =
  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] transition-all duration-150 w-full text-left border-none bg-transparent cursor-pointer';
const navInactive = 'text-[var(--text-muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]';
const navActive   = '!bg-[var(--accent-light)] !text-[var(--accent-dark)] font-medium';

export default function Sidebar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const { data: categories = [] } = useGetCategoriesQuery();

  const initials = userInfo?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside
      className="flex flex-col border-r shrink-0"
      style={{ width: 248, background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-2 0v-2H9a1 1 0 010-2h2V7a1 1 0 011-1z"/>
            </svg>
          </div>
          <div>
            <div className="font-display text-xl leading-tight" style={{ color: 'var(--text)' }}>CureDocs</div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-hint)' }}>Secure Medical Vault</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavLabel>Overview</NavLabel>
        <NavLink to="/" end className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          <LayoutDashboard size={15} /> Dashboard
        </NavLink>
        <NavLink to="/gallery" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
          <Images size={15} /> My Records
        </NavLink>

        <NavLabel>Categories</NavLabel>
        {categories.map((cat) => {
          const conf = getCatConfig(cat.slug);
          const Icon = catIcons[cat.icon] || FileText;
          return (
            <NavLink
              key={cat._id}
              to={`/gallery?category=${cat._id}`}
              className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}
            >
              <Icon size={15} />
              <span className="truncate">{cat.name}</span>
            </NavLink>
          );
        })}

        {userInfo?.role === 'admin' && (
          <>
            <NavLabel>Management</NavLabel>
            <NavLink to="/admin" className={({ isActive }) => `${navBase} ${isActive ? navActive : navInactive}`}>
              <ShieldCheck size={15} /> Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer group"
          style={{ transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-mid))' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">{userInfo?.name}</div>
            <div className="text-[11px] capitalize" style={{ color: 'var(--text-hint)' }}>{userInfo?.role}</div>
          </div>
          <button
            onClick={() => { dispatch(logout()); navigate('/login'); }}
            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-hint)' }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavLabel({ children }) {
  return (
    <div className="text-[10.5px] font-semibold uppercase tracking-widest px-2 pt-3 pb-1.5"
      style={{ color: 'var(--text-hint)' }}>
      {children}
    </div>
  );
}
