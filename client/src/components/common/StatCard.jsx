export default function StatCard({ label, value, sub, accentColor = 'var(--accent)', icon: Icon }) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: accentColor }} />

      {Icon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center opacity-10"
          style={{ background: accentColor }}>
          <Icon size={20} />
        </div>
      )}

      <div className="text-[11.5px] font-medium tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="font-display text-[26px] leading-none tracking-tight">{value}</div>
      {sub && <div className="text-[11.5px] mt-1" style={{ color: 'var(--text-hint)' }}>{sub}</div>}
    </div>
  );
}
