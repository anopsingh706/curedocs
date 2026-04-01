import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { LogIn } from 'lucide-react';
import { useLoginMutation } from '../store/api/authApi.js';
import { setCredentials } from '../store/slices/authSlice.js';
import Spinner from '../components/common/Spinner.jsx';

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const user = await login(data).unwrap();
      dispatch(setCredentials(user));
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12"
        style={{ background: 'var(--accent)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3a1 1 0 011 1v2h2a1 1 0 010 2h-2v2a1 1 0 01-2 0v-2H9a1 1 0 010-2h2V7a1 1 0 011-1z"/>
            </svg>
          </div>
          <span className="font-display text-2xl text-white">CureDocs</span>
        </div>
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Your entire medical history,<br />
            <span className="italic opacity-80">in one secure place.</span>
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed">
            Upload, organise, and access your health records anytime — from lab results
            and prescriptions to imaging reports and surgical notes.
          </p>
        </div>
        <p className="text-white/40 text-[12px]">CureDocs v1.0 · MERN Stack · 2026</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--text)' }}>Sign in</h1>
          <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)' }} className="font-medium hover:underline">
              Register
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="you@example.com" className="auth-input" />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input {...register('password')} type="password" placeholder="••••••••" className="auth-input" />
            </Field>

            <button type="submit" disabled={isLoading}
              className="w-full h-11 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}>
              {isLoading ? <Spinner size={18} /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .auth-input {
          width: 100%; padding: 10px 14px;
          border: 1px solid var(--border); border-radius: 10px;
          font-family: inherit; font-size: 14px;
          color: var(--text); background: var(--surface);
          outline: none; transition: border-color 0.15s;
        }
        .auth-input:focus { border-color: var(--accent); }
      `}</style>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
      {error && <p className="text-[11.5px] mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}
