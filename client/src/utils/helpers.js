// ── Category config ────────────────────────────────────
export const CAT_CONFIG = {
  'clinical-consultation': {
    label: 'Clinical & Consultation',
    color: 'text-green-800', bg: 'bg-green-50', dot: 'bg-green-600', border: 'border-green-200',
    hex: '#1a5c2e', hexBg: '#e8f5ec', emoji: '🩺',
  },
  'lab-diagnostics': {
    label: 'Lab & Diagnostics',
    color: 'text-blue-800', bg: 'bg-blue-50', dot: 'bg-blue-600', border: 'border-blue-200',
    hex: '#1a4a80', hexBg: '#eaf1fa', emoji: '🔬',
  },
  'hospital-surgical': {
    label: 'Hospital & Surgical',
    color: 'text-amber-800', bg: 'bg-amber-50', dot: 'bg-amber-500', border: 'border-amber-200',
    hex: '#7a4f0a', hexBg: '#fdf5e6', emoji: '🏥',
  },
  'medications-preventive': {
    label: 'Medications & Preventive',
    color: 'text-purple-800', bg: 'bg-purple-50', dot: 'bg-purple-600', border: 'border-purple-200',
    hex: '#3d3078', hexBg: '#f0eefb', emoji: '💊',
  },
  'administrative-legal': {
    label: 'Administrative & Legal',
    color: 'text-red-800', bg: 'bg-red-50', dot: 'bg-red-600', border: 'border-red-200',
    hex: '#8a2f1a', hexBg: '#fdf0ec', emoji: '📋',
  },
};

export const getCatConfig = (slug) =>
  CAT_CONFIG[slug] || {
    label: slug, color: 'text-gray-700', bg: 'bg-gray-100',
    dot: 'bg-gray-400', border: 'border-gray-200',
    hex: '#555', hexBg: '#f0f0f0', emoji: '📄',
  };

// ── File type helpers ──────────────────────────────────
export const FILE_TYPE_ICONS = {
  image:       '🖼️',
  pdf:         '📄',
  dicom:       '🫁',
  docx:        '📝',
  spreadsheet: '📊',
};

export const getFileIcon = (type) => FILE_TYPE_ICONS[type] || '📁';

// ── Formatters ─────────────────────────────────────────
export const formatBytes = (bytes = 0) => {
  if (bytes === 0) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
};
