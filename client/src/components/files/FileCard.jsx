import { useNavigate } from 'react-router-dom';
import { Eye, Download, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDeleteFileMutation } from '../../store/api/filesApi.js';
import { getCatConfig, getFileIcon, formatDate, formatBytes } from '../../utils/helpers.js';
import CategoryBadge from '../common/CategoryBadge.jsx';

export default function FileCard({ file }) {
  const navigate = useNavigate();
  const [deleteFile, { isLoading }] = useDeleteFileMutation();
  const conf = getCatConfig(file.category?.slug);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this record permanently?')) return;
    try {
      await deleteFile(file._id).unwrap();
      toast.success('Record deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div
      onClick={() => navigate(`/files/${file._id}`)}
      className="group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Published dot */}
      {file.isPublished && (
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white z-10"
          style={{ background: '#2d8848' }} />
      )}

      {/* Thumbnail */}
      <div className="h-[120px] flex items-center justify-center relative"
        style={{ background: conf.hexBg }}>
        <span className="text-[40px] select-none">{getFileIcon(file.fileType)}</span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <ActionBtn icon={Eye} label="View" onClick={e => { e.stopPropagation(); navigate(`/files/${file._id}`); }} />
          <ActionBtn icon={Download} label="Download" onClick={e => { e.stopPropagation(); window.open(file.fileUrl, '_blank'); }} />
          <ActionBtn icon={Trash2} label="Delete" onClick={handleDelete} danger />
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <CategoryBadge category={file.category} />
        <p className="text-[13px] font-medium mt-1.5 mb-1 leading-snug line-clamp-2">{file.title}</p>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-hint)' }}>
          <span className="uppercase font-semibold">{file.fileType}</span>
          <span>·</span>
          <span>{formatBytes(file.fileSize)}</span>
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-hint)' }}>
          {formatDate(file.documentDate || file.createdAt)}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
      style={{
        background: 'white',
        borderColor: 'var(--border)',
        color: danger ? 'var(--danger)' : 'var(--text)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--danger-light)' : 'var(--surface2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <Icon size={13} />
    </button>
  );
}
