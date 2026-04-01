import { useGetCategoriesQuery } from '../../store/api/categoriesApi.js';
import { getCatConfig } from '../../utils/helpers.js';

export default function CategoryTabs({ selected, onChange }) {
  const { data: categories = [] } = useGetCategoriesQuery();

  return (
    <div className="flex gap-2 flex-wrap mb-5">
      <PillBtn
        active={!selected}
        onClick={() => onChange(null)}
        style={{ background: !selected ? 'var(--text)' : 'var(--surface)', color: !selected ? 'white' : 'var(--text-muted)', borderColor: !selected ? 'var(--text)' : 'var(--border)' }}
      >
        All Records
      </PillBtn>

      {categories.map(cat => {
        const conf  = getCatConfig(cat.slug);
        const active = selected === cat._id;
        return (
          <PillBtn
            key={cat._id}
            active={active}
            onClick={() => onChange(active ? null : cat._id)}
            style={{
              background:   active ? conf.hexBg : 'var(--surface)',
              color:        active ? conf.hex   : 'var(--text-muted)',
              borderColor:  active ? conf.hex   : 'var(--border)',
            }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: conf.hex }} />
            {cat.name}
          </PillBtn>
        );
      })}
    </div>
  );
}

function PillBtn({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium border transition-all duration-150"
      style={style}
    >
      {children}
    </button>
  );
}
