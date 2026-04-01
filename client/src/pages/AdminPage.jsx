import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, Edit2, Trash2, Upload } from 'lucide-react';
import { useGetFilesQuery, useDeleteFileMutation, useTogglePublishMutation, useGetStatsQuery } from '../store/api/filesApi.js';
import UploadModal from '../components/files/UploadModal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import CategoryBadge from '../components/common/CategoryBadge.jsx';
import { formatDate, formatBytes, getFileIcon } from '../utils/helpers.js';

export default function AdminPage() {
  const navigate    = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading }    = useGetFilesQuery({ page, limit: 15 });
  const { data: stats }        = useGetStatsQuery();
  const [deleteFile]           = useDeleteFileMutation();
  const [togglePublish]        = useTogglePublishMutation();

  const files = data?.files || [];
  const pages = data?.pages || 1;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete permanently?')) return;
    try { await deleteFile(id).unwrap(); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try { const r = await togglePublish(id).unwrap(); toast.success(r.message); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap mb-6">
        {[
          { label: 'Total Files',  value: stats?.total     ?? '—', color: 'var(--text)' },
          { label: 'Published',    value: stats?.published ?? '—', color: 'var(--accent)' },
          { label: 'Drafts',       value: stats?.drafts    ?? '—', color: 'var(--amber)' },
          { label: 'Storage Used', value: formatBytes(stats?.totalSize), color: 'var(--blue)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <span className="font-display text-[22px] leading-none" style={{ color }}>{value}</span>
            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium text-white ml-auto"
          style={{ background: 'var(--accent)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
          <Upload size={14} /> Upload File
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {isLoading ? (
          <Spinner size={36} className="py-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                  {['File', 'Category', 'Type', 'Date', 'Size', 'Status', 'Published', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f, i) => (
                  <tr key={f._id}
                    className="border-b last:border-b-0 transition-all"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* File */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                          style={{ background: 'var(--surface2)' }}>
                          {getFileIcon(f.fileType)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate max-w-[180px]">{f.title}</p>
                          <p className="text-[11px] truncate max-w-[180px]" style={{ color: 'var(--text-hint)' }}>
                            {f.doctorName || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3">
                      <CategoryBadge category={f.category} />
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3">
                      <span className="text-[11.5px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                        {f.fileType}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 text-[12.5px]" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(f.documentDate || f.createdAt)}
                    </td>
                    {/* Size */}
                    <td className="px-4 py-3 text-[12.5px]" style={{ color: 'var(--text-muted)' }}>
                      {formatBytes(f.fileSize)}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={f.visibility === 'shared'
                          ? { background: '#e8f5ec', color: '#1a5c2e' }
                          : f.isPublished
                          ? { background: '#e8f5ec', color: '#1a5c2e' }
                          : { background: 'var(--amber-light)', color: '#7a4f0a' }
                        }>
                        {f.visibility === 'shared' ? 'Shared' : f.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    {/* Publish toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(f._id)}
                        className="relative w-9 h-5 rounded-full transition-all"
                        style={{ background: f.isPublished ? 'var(--accent)' : 'var(--border-strong)' }}
                      >
                        <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: f.isPublished ? '18px' : '2px' }} />
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <IconBtn icon={Eye}   title="View"   onClick={() => navigate(`/files/${f._id}`)} />
                        <IconBtn icon={Edit2} title="Edit"   onClick={() => navigate(`/files/${f._id}`)} />
                        <IconBtn icon={Trash2} title="Delete" danger onClick={() => handleDelete(f._id)} />
                      </div>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-[13px]" style={{ color: 'var(--text-hint)' }}>
                    No records yet. Upload your first file.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg border text-[13px] font-medium"
                style={{
                  background: p === page ? 'var(--accent)' : 'var(--surface)',
                  color: p === page ? 'white' : 'var(--text-muted)',
                  borderColor: p === page ? 'var(--accent)' : 'var(--border)',
                }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function IconBtn({ icon: Icon, title, onClick, danger }) {
  return (
    <button onClick={onClick} title={title}
      className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
      style={{ background: 'transparent', borderColor: 'var(--border)', color: danger ? 'var(--danger)' : 'var(--text-muted)' }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--danger-light)' : 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <Icon size={13} />
    </button>
  );
}
