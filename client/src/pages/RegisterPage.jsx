import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';
import { useRegisterMutation } from '../store/api/authApi.js';
import { setCredentials } from '../store/slices/authSlice.js';
import Spinner from '../components/common/Spinner.jsx';

const schema = z.object({
  name:     z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
  role:     z.enum(['viewer', 'admin']),
});

export default function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [register_, { isLoading }] = useRegisterMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'viewer' },
  });

  const onSubmit = async (data) => {
    try {
      const user = await register_(data).unwrap();
      dispatch(setCredentials(user));
      toast.success(`Welcome, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-2 0v-2H9a1 1 0 010-2h2V7a1 1 0 011-1z"/>
            </svg>
          </div>
          <span className="font-display text-xl">CureDocs</span>
        </div>

        <h1 className="font-display text-3xl mb-1">Create account</h1>
        <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Arjun Rao' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
              <input {...register(name)} type={type} placeholder={placeholder} className="auth-input" />
              {errors[name] && <p className="text-[11.5px] mt-1" style={{ color: 'var(--danger)' }}>{errors[name].message}</p>}
            </div>
          ))}

          <div>
            <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Account Role</label>
            <select {...register('role')} className="auth-input">
              <option value="viewer">Viewer (Patient)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full h-11 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'var(--accent-dark)')}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
            {isLoading ? <Spinner size={18} /> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>
      </div>
      <style>{`.auth-input{width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:14px;color:var(--text);background:var(--surface);outline:none;transition:border-color .15s}.auth-input:focus{border-color:var(--accent)}`}</style>
    </div>
  );
}
