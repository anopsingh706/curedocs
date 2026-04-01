import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-8"
      style={{ background: 'var(--bg)' }}>
      <div>
        <div className="font-display text-[120px] leading-none" style={{ color: 'var(--border-strong)' }}>404</div>
        <h1 className="font-display text-2xl mt-4 mb-2">Page not found</h1>
        <p className="text-[14px] mb-8" style={{ color: 'var(--text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate('/')}
          className="px-6 h-11 rounded-xl font-medium text-white text-[14px]"
          style={{ background: 'var(--accent)' }}>
          ← Go to Dashboard
        </button>
      </div>
    </div>
  );
}
