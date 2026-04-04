import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Download, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useGetFileQuery,
  useDeleteFileMutation,
  useTogglePublishMutation,
} from '../store/api/filesApi.js';
import CategoryBadge from '../components/common/CategoryBadge.jsx';
import EditFileModal  from '../components/files/EditFileModal.jsx';
import Spinner        from '../components/common/Spinner.jsx';
import { formatDate, formatBytes, getFileIcon, getCatConfig } from '../utils/helpers.js';

// All file access goes through our authenticated proxy — never direct Cloudinary
const RENDER_URL = 'https://curedocs.onrender.com';
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : import.meta.env.DEV
    ? '/api'
    : `${RENDER_URL}/api`;
const proxyUrl = (id, dl = false) => `${API_BASE}/files/${id}/stream${dl ? '?dl=1' : ''}`;

// Fetch a file blob with the JWT token attached
const fetchWithAuth = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } });

export default function FileDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { userInfo } = useSelector(s => s.auth);
  const token        = userInfo?.token;

  const [showEdit,    setShowEdit]    = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: file, isLoading, isError } = useGetFileQuery(id);
  const [deleteFile,    { isLoading: deleting }] = useDeleteFileMutation();
  const [togglePublish, { isLoading: toggling }] = useTogglePublishMutation();

  if (isLoading) return <Spinner size={40} className="py-32" />;
  if (isError || !file) return (
    <div className="text-center py-32">
      <p className="text-[15px] font-medium">Record not found</p>
      <button onClick={() => navigate('/gallery')}
        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
        className="mt-4 text-[13px]">
        ← Back to Gallery
      </button>
    </div>
  );

  const conf    = getCatConfig(file.category?.slug);
  const isAdmin = userInfo?.role === 'admin';
  const isImage = file.fileType === 'image';
  const isPdf   = file.fileType === 'pdf';

  const handleDelete = async () => {
    if (!window.confirm('Delete this record permanently?')) return;
    try {
      await deleteFile(id).unwrap();
      toast.success('Record deleted');
      navigate('/gallery');
    } catch { toast.error('Delete failed'); }
  };

  const handleTogglePublish = async () => {
    try {
      const res = await togglePublish(id).unwrap();
      toast.success(res.message);
    } catch { toast.error('Failed to update publish status'); }
  };

  // Download: fetch blob through proxy, force browser save-as dialog
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetchWithAuth(proxyUrl(id, true), token);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const blob      = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a         = document.createElement('a');
      a.href          = objectUrl;

      const disposition = res.headers.get('Content-Disposition') || '';
      const match       = disposition.match(/filename="?([^"]+)"?/);
      const ext         = file.fileUrl?.split('.').pop()?.split('?')[0] || 'file';
      a.download        = match ? match[1] : `${file.title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed — ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] mb-6"
        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">

        {/* ── Left: preview + actions ── */}
        <div>
          <div className="rounded-2xl border overflow-hidden mb-4"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

            {/* Image preview */}
            {isImage && <ImageViewer fileId={id} token={token} conf={conf} />}

            {/* PDF preview */}
            {isPdf && <PdfViewer fileId={id} token={token} />}

            {/* Other file types */}
            {!isImage && !isPdf && (
              <div className="h-52 flex flex-col items-center justify-center gap-2"
                style={{ background: conf.hexBg }}>
                <span className="text-[64px] select-none">{getFileIcon(file.fileType)}</span>
                <p className="text-[12.5px] font-medium" style={{ color: conf.hex }}>
                  {file.fileType?.toUpperCase()} file — use Download button below
                </p>
              </div>
            )}

            {/* Title + description + tags */}
            <div className="p-5">
              <CategoryBadge category={file.category} />
              <h1 className="font-display text-2xl mt-2 mb-1 leading-snug">{file.title}</h1>
              {file.description && (
                <p className="text-[13.5px] leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>
                  {file.description}
                </p>
              )}
              {file.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {file.tags.map(t => (
                    <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-full border"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface2)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-[13px] font-medium text-white disabled:opacity-60 transition-all"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => !downloading && (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              <Download size={14} />
              {downloading ? 'Downloading…' : 'Download'}
            </button>

            <button onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-[13px] font-medium border transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
              <Edit2 size={14} /> Edit
            </button>

            {isAdmin && (
              <button onClick={handleTogglePublish} disabled={toggling}
                className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-[13px] font-medium border disabled:opacity-50 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
                {file.isPublished ? <Lock size={14} /> : <Globe size={14} />}
                {file.isPublished ? 'Unpublish' : 'Publish'}
              </button>
            )}

            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-[13px] font-medium border disabled:opacity-50 transition-all ml-auto"
              style={{ borderColor: 'var(--border)', color: 'var(--danger)', background: 'var(--danger-light)' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fbe4dc'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-light)'}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* ── Right: metadata ── */}
        <div className="rounded-2xl border overflow-hidden h-fit"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-[13.5px] font-semibold">File Details</span>
          </div>
          <div className="px-5 py-2">
            {[
              { label: 'Doctor',        value: file.doctorName || '—' },
              { label: 'Document Date', value: formatDate(file.documentDate) },
              { label: 'File Type',     value: file.fileType?.toUpperCase() },
              { label: 'File Size',     value: formatBytes(file.fileSize) },
              { label: 'Visibility',    value: file.visibility === 'shared' ? '🌐 Shared' : '🔒 Private' },
              { label: 'Status',        value: file.isPublished ? '✅ Published' : '📝 Draft' },
              { label: 'Uploaded',      value: formatDate(file.createdAt) },
              { label: 'Last Updated',  value: formatDate(file.updatedAt) },
              { label: 'Owner',         value: file.owner?.name || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex py-2.5 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}>
                <span className="w-28 shrink-0 text-[12px]" style={{ color: 'var(--text-hint)' }}>{label}</span>
                <span className="text-[13px]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEdit && <EditFileModal file={file} onClose={() => setShowEdit(false)} />}
    </div>
  );
}

// ── Image viewer: fetch blob with JWT, render via object URL ──────────────────
function ImageViewer({ fileId, token, conf }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let objectUrl;
    fetchWithAuth(proxyUrl(fileId), token)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => { objectUrl = URL.createObjectURL(b); setSrc(objectUrl); })
      .catch(() => setErr(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileId, token]);

  if (err) return (
    <div className="h-52 flex items-center justify-center text-[13px]"
      style={{ background: conf.hexBg, color: conf.hex }}>
      Could not load image preview.
    </div>
  );
  if (!src) return (
    <div className="h-52 flex items-center justify-center" style={{ background: conf.hexBg }}>
      <Spinner size={28} />
    </div>
  );
  return (
    <div className="w-full flex items-center justify-center"
      style={{ background: conf.hexBg, minHeight: 200 }}>
      <img src={src} alt="preview" className="max-w-full max-h-[420px] object-contain" />
    </div>
  );
}

// ── PDF viewer: fetch blob with JWT, create object URL for iframe ─────────────
function PdfViewer({ fileId, token }) {
  const [src, setSrc] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let objectUrl;
    fetchWithAuth(proxyUrl(fileId), token)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(b => {
        objectUrl = URL.createObjectURL(new Blob([b], { type: 'application/pdf' }));
        setSrc(objectUrl);
      })
      .catch(() => setErr(true));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [fileId, token]);

  if (err) return (
    <div className="h-52 flex items-center justify-center text-[13px]"
      style={{ color: 'var(--text-hint)' }}>
      Could not load PDF preview — use the Download button.
    </div>
  );
  if (!src) return (
    <div className="h-52 flex items-center justify-center">
      <Spinner size={28} />
    </div>
  );
  return (
    <iframe
      src={src}
      title="PDF Preview"
      className="w-full border-none"
      style={{ height: 520 }}
    />
  );
}
