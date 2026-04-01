import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetFilesQuery } from '../store/api/filesApi.js';
import FileCard from '../components/files/FileCard.jsx';
import CategoryTabs from '../components/files/CategoryTabs.jsx';
import UploadModal from '../components/files/UploadModal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { formatDate, formatBytes, getFileIcon } from '../utils/helpers.js';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';

export default function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate    = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode,  setViewMode]    = useState('grid');
  const [page, setPage]             = useState(1);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';

  const { data, isLoading, isFetching } = useGetFilesQuery({
    category: category || undefined,
    search:   search   || undefined,
    page,
    limit: 12,
  });

  const files = data?.files || [];
  const pages = data?.pages || 1;
  const total = data?.total || 0;

  useEffect(() => { setPage(1); }, [category, search]);

  const setCategory = (id) => {
    const p = new URLSearchParams(searchParams);
    if (id) p.set('category', id); else p.delete('category');
    p.delete('search');
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12.5px]" style={{ color: 'var(--text-hint)' }}>
          {total} record{total !== 1 ? 's' : ''}{search && ` matching "${search}"`}
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle active={viewMode === 'grid'} onClick={() => setViewMode('grid')} icon={LayoutGrid} />
          <ViewToggle active={viewMode === 'list'} onClick={() => setViewMode('list')} icon={List} />
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-medium text-white ml-2"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            + Upload
          </button>
        </div>
      </div>

      <CategoryTabs selected={category} onChange={setCategory} />

      {isLoading || isFetching ? (
        <Spinner size={36} className="py-20" />
      ) : files.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-4 opacity-30">📭</div>
          <p className="text-[15px] font-medium mb-1">No records found</p>
          <p className="text-[13px]" style={{ color: 'var(--text-hint)' }}>
            {search ? `No results for "${search}"` : 'Upload your first record or try a different category'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {files.map(f => <FileCard key={f._id} file={f} />)}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {files.map((f, i) => (
            <div key={f._id}
              className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-all ${i < files.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--border)' }}
              onClick={() => navigate('/files/' + f._id)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="text-2xl select-none">{getFileIcon(f.fileType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium truncate">{f.title}</p>
                <p className="text-[11.5px]" style={{ color: 'var(--text-hint)' }}>
                  {f.category?.name} · {formatDate(f.documentDate || f.createdAt)}
                </p>
              </div>
              <span className="text-[11.5px] shrink-0" style={{ color: 'var(--text-hint)' }}>
                {formatBytes(f.fileSize)}
              </span>
              <a href={f.fileUrl} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[12px] font-medium px-3 h-7 rounded-lg border flex items-center shrink-0"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
                Open
              </a>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={16} />
          </PagBtn>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <PagBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PagBtn>
          ))}
          <PagBtn onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
            <ChevronRight size={16} />
          </PagBtn>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function ViewToggle({ active, onClick, icon: Icon }) {
  return (
    <button onClick={onClick}
      className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all"
      style={{
        background: active ? 'var(--surface2)' : 'transparent',
        borderColor: active ? 'var(--border-strong)' : 'var(--border)',
        color: active ? 'var(--text)' : 'var(--text-hint)',
      }}>
      <Icon size={15} />
    </button>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-lg border text-[13px] font-medium flex items-center justify-center transition-all disabled:opacity-40"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-muted)',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
      }}>
      {children}
    </button>
  );
}
