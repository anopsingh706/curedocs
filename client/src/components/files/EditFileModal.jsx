import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { X, Save } from 'lucide-react';
import { useUpdateFileMutation } from '../../store/api/filesApi.js';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi.js';
import Spinner from '../common/Spinner.jsx';

export default function EditFileModal({ file, onClose }) {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateFile, { isLoading }] = useUpdateFileMutation();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      title:        file.title,
      category:     file.category?._id || '',
      doctorName:   file.doctorName || '',
      documentDate: file.documentDate ? file.documentDate.slice(0, 10) : '',
      tags:         file.tags?.join(', ') || '',
      description:  file.description || '',
      visibility:   file.visibility || 'private',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateFile({ id: file._id, ...data }).unwrap();
      toast.success('Record updated');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-display text-xl">Edit Record</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border flex items-center justify-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-3">
          {[
            { label: 'Title', name: 'title', type: 'text' },
            { label: 'Doctor / Hospital', name: 'doctorName', type: 'text' },
            { label: 'Document Date', name: 'documentDate', type: 'date' },
            { label: 'Tags (comma separated)', name: 'tags', type: 'text' },
          ].map(({ label, name, type }) => (
            <div key={name}>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
              <input type={type} {...register(name)} className="form-input w-full" />
            </div>
          ))}

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
            <select {...register('category')} className="form-input w-full">
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Visibility</label>
            <select {...register('visibility')} className="form-input w-full">
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea {...register('description')} rows={3} className="form-input w-full resize-none" />
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 h-9 rounded-lg border text-[13px] font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 h-9 rounded-lg text-[13px] font-medium text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {isLoading ? <Spinner size={16} /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
      <style>{`.form-input{width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-family:inherit;font-size:13.5px;color:var(--text);background:var(--bg);outline:none;transition:border-color .15s}.form-input:focus{border-color:var(--accent)}`}</style>
    </div>
  );
}
