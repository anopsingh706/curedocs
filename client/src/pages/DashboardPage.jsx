import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, Database, Tag, UploadCloud } from 'lucide-react';
import { useGetFilesQuery, useGetStatsQuery } from '../store/api/filesApi.js';
import StatCard from '../components/common/StatCard.jsx';
import FileCard  from '../components/files/FileCard.jsx';
import UploadModal from '../components/files/UploadModal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { formatBytes, timeAgo, getCatConfig, getFileIcon } from '../utils/helpers.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: filesData, isLoading: filesLoading } = useGetFilesQuery({ limit: 6 });

  const files = filesData?.files || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8">
        <StatCard
          label="Total Records"
          value={statsLoading ? '…' : stats?.total ?? 0}
          sub="All categories"
          accentColor="var(--accent)"
          icon={FileText}
        />
        <StatCard
          label="Published"
          value={statsLoading ? '…' : stats?.published ?? 0}
          sub={`${statsLoading ? '…' : stats?.drafts ?? 0} drafts`}
          accentColor="var(--blue)"
          icon={ShieldCheck}
        />
        <StatCard
          label="Storage Used"
          value={statsLoading ? '…' : formatBytes(stats?.totalSize)}
          sub="Cloudinary CDN"
          accentColor="var(--amber)"
          icon={Database}
        />
        <StatCard
          label="Categories"
          value="5"
          sub="All active"
          accentColor="var(--purple)"
          icon={Tag}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* Recent Records */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Recent Records</h2>
            <button onClick={() => navigate('/gallery')}
              className="text-[12.5px] font-medium"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>

          {filesLoading ? (
            <Spinner size={32} className="py-16" />
          ) : files.length === 0 ? (
            <EmptyState onUpload={() => setShowUpload(true)} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
              {files.map(f => <FileCard key={f._id} file={f} />)}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          {/* Quick upload */}
          <Panel title="Quick Upload">
            <div
              onClick={() => setShowUpload(true)}
              className="m-4 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all"
              style={{ borderColor: 'var(--border-strong)', background: 'var(--bg)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg)'; }}
            >
              <div className="w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-2.5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <UploadCloud size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-[13px] font-medium mb-1">Drop files here</p>
              <p className="text-[11.5px]" style={{ color: 'var(--text-hint)' }}>PDF, JPG, PNG, DOCX, DICOM</p>
            </div>
          </Panel>

          {/* Storage */}
          <Panel title="Storage">
            <div className="px-5 py-4">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="font-medium">{formatBytes(stats?.totalSize || 0)} used</span>
                <span style={{ color: 'var(--text-hint)' }}>of 5 GB</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(((stats?.totalSize || 0) / (5 * 1024 * 1024 * 1024)) * 100, 100)}%`,
                    background: 'var(--accent)',
                  }} />
              </div>
              <p className="text-[11.5px] mt-1.5" style={{ color: 'var(--text-hint)' }}>
                {(5 - ((stats?.totalSize || 0) / (1024 * 1024 * 1024))).toFixed(1)} GB remaining
              </p>
            </div>
          </Panel>

          {/* Recent activity */}
          <Panel title="Recent Activity">
            <div>
              {files.slice(0, 5).map(f => {
                const conf = getCatConfig(f.category?.slug);
                return (
                  <div key={f._id} onClick={() => navigate(`/files/${f._id}`)}
                    className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-all"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
                      style={{ background: conf.hexBg }}>
                      {getFileIcon(f.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium truncate">{f.title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-hint)' }}>{conf.label}</p>
                    </div>
                    <span className="text-[10.5px] shrink-0" style={{ color: 'var(--text-hint)' }}>
                      {timeAgo(f.createdAt)}
                    </span>
                  </div>
                );
              })}
              {files.length === 0 && (
                <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-hint)' }}>No activity yet</p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[13.5px] font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ onUpload }) {
  return (
    <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
      <div className="text-5xl mb-4 opacity-30">📭</div>
      <p className="text-[15px] font-medium mb-1">No records yet</p>
      <p className="text-[13px] mb-5" style={{ color: 'var(--text-hint)' }}>Upload your first medical document to get started</p>
      <button onClick={onUpload}
        className="px-5 h-9 rounded-xl text-[13px] font-medium text-white"
        style={{ background: 'var(--accent)' }}>
        + Upload Record
      </button>
    </div>
  );
}
