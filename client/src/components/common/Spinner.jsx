export default function Spinner({ size = 24, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="rounded-full border-2 border-t-transparent animate-spin"
        style={{
          width: size, height: size,
          borderColor: 'var(--border-strong)',
          borderTopColor: 'var(--accent)',
        }}
      />
    </div>
  );
}
