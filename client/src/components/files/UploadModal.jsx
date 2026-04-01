import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { X, UploadCloud } from 'lucide-react';
import { useUploadFileMutation } from '../../store/api/filesApi.js';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi.js';
import Spinner from '../common/Spinner.jsx';

const schema = z.object({
  title:        z.string().min(2, 'Title is required'),
  category:     z.string().min(1,  'Select a category'),
  doctorName:   z.string().optional(),
  documentDate: z.string().optional(),
  tags:         z.string().optional(),
  description:  z.string().optional(),
  visibility:   z.enum(['private', 'shared']),
  isPublished:  z.string().optional(),
});

export default function UploadModal({ onClose }) {
  const [file, setFile]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const { data: categories = [] } = useGetCategoriesQuery();
  const [uploadFile, { isLoading }] = useUploadFileMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { visibility: 'private', isPublished: 'false' },
  });

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const onSubmit = async (data) => {
    if (!file) { toast.error('Please select a file'); return; }
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(data).forEach(([k, v]) => v && fd.append(k, v));
    try {
      await uploadFile(fd).unwrap();
      toast.success('Record uploaded successfully!');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: 'var(--surface)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0 z-10"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-display text-xl">Upload New Record</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragOver ? 'var(--accent)' : 'var(--border-strong)',
              background:  dragOver ? 'var(--accent-light)' : 'var(--bg)',
            }}
          >
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.dcm,.csv,.xlsx"
              onChange={e => setFile(e.target.files[0])} />
            <UploadCloud size={28} className="mx-auto mb-2" style={{ color: 'var(--accent)' }} />
            {file
              ? <p className="text-[13px] font-medium">{file.name} <span className="font-normal" style={{ color: 'var(--text-hint)' }}>({(file.size / 1024 / 1024).toFixed(2)} MB)</span></p>
              : <>
                  <p className="text-[13px] font-medium">Drop file here or <span style={{ color: 'var(--accent)' }}>browse</span></p>
                  <p className="text-[11.5px] mt-1" style={{ color: 'var(--text-hint)' }}>PDF, JPG, PNG, DOCX, DICOM, CSV · Max 50 MB</p>
                </>
            }
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Document Title *" error={errors.title?.message} colSpan>
              <input {...register('title')} placeholder="e.g. Blood Test Report" className="form-input" />
            </Field>
            <Field label="Category *" error={errors.category?.message}>
              <select {...register('category')} className="form-input">
                <option value="">Select…</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Doctor / Hospital">
              <input {...register('doctorName')} placeholder="Optional" className="form-input" />
            </Field>
            <Field label="Document Date">
              <input {...register('documentDate')} type="date" className="form-input" />
            </Field>
            <Field label="Tags" colSpan>
              <input {...register('tags')} placeholder="blood, CBC, annual (comma separated)" className="form-input" />
            </Field>
            <Field label="Notes" colSpan>
              <textarea {...register('description')} rows={2} placeholder="Optional notes…"
                className="form-input resize-none" />
            </Field>
            <Field label="Visibility">
              <select {...register('visibility')} className="form-input">
                <option value="private">Private</option>
                <option value="shared">Shared</option>
              </select>
            </Field>
            <Field label="Publish">
              <select {...register('isPublished')} className="form-input">
                <option value="false">Save as Draft</option>
                <option value="true">Publish Now</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-2.5 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 h-9 rounded-lg border text-[13px] font-medium transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 h-9 rounded-lg text-[13px] font-medium text-white flex items-center gap-2 disabled:opacity-60 transition-all"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              {isLoading ? <><Spinner size={16} /> Uploading…</> : <><UploadCloud size={14} /> Upload Record</>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .form-input {
          width: 100%; padding: 8px 12px;
          border: 1px solid var(--border); border-radius: 8px;
          font-family: inherit; font-size: 13.5px;
          color: var(--text); background: var(--bg);
          outline: none; transition: border-color 0.15s;
        }
        .form-input:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function Field({ label, children, error, colSpan }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
      {error && <p className="text-[11px] mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}
