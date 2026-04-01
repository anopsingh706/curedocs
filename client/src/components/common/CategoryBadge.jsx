import { getCatConfig } from '../../utils/helpers.js';

export default function CategoryBadge({ category }) {
  if (!category) return null;
  const conf = getCatConfig(category.slug);
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ background: conf.hexBg, color: conf.hex }}
    >
      {conf.emoji} {conf.label}
    </span>
  );
}
