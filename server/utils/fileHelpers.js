export const detectFileType = (mimetype = '') => {
  if (mimetype.startsWith('image/'))                          return 'image';
  if (mimetype === 'application/pdf')                         return 'pdf';
  if (mimetype === 'application/dicom')                       return 'dicom';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  if (['text/csv', 'application/vnd.ms-excel',
       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimetype)) return 'spreadsheet';
  return 'pdf'; // default fallback
};

export const formatBytes = (bytes = 0, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
