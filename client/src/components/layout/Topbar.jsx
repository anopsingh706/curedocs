import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Upload, Plus } from 'lucide-react';
import UploadModal from '../files/UploadModal.jsx';

const PAGE_TITLES = {
  '/':       'Dashboard',
  '/gallery':'My Medical Records',
  '/admin':  'Admin Panel',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const [search,     setSearch]     = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const title = PAGE_TITLES[pathname] || 'CureDocs';

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate('/gallery?search=' + encodeURIComponent(search.trim()));
  };

  return (
    <>
      <header
        className="flex items-center gap-4 px-7 shrink-0 border-b z-10"
        style={{ height: 60, background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h1 className="font-display text-xl flex-1 leading-none" style={{ letterSpacing: '-0.2px' }}>
          {title}
        </h1>

        <form onSubmit={handleSearch}
          className="flex items-center gap-2 px-3 rounded-lg border h-9"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', width: 240 }}
        >
          <Search size={14} style={{ color: 'var(--text-hint)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search records…"
            className="bg-transparent border-none outline-none text-[13px] w-full"
            style={{ color: 'var(--text)', fontFamily: 'inherit' }}
          />
        </form>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg border text-[13px] font-medium transition-all"
          style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Upload size={14} /> Upload
        </button>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-medium text-white transition-all"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          <Plus size={14} /> New Record
        </button>
      </header>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}
