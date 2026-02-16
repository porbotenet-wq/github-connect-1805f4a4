import { useNavigate } from 'react-router-dom';

const DOC_CATEGORIES = [
  { icon: '📝', name: 'Договоры', count: 0, color: 'var(--arc)' },
  { icon: '📐', name: 'Проектная документация', count: 0, color: 'var(--amber)' },
  { icon: '📊', name: 'Отчёты', count: 0, color: 'var(--go)' },
  { icon: '📋', name: 'Акты', count: 0, color: 'var(--signal)' },
];

export default function Documents() {
  const navigate = useNavigate();

  return (
    <div className="p-3 pb-24">
      {/* Header */}
      <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
        📁 Документы
      </h1>
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mt-1 mb-4">
        Хранилище документов проекта
      </div>

      {/* Categories */}
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mb-1.5 border-b border-[hsl(var(--wire))] pb-1">
        Категории
      </div>
      <div className="grid grid-cols-2 gap-1.5 mb-6">
        {DOC_CATEGORIES.map((cat) => (
          <div key={cat.name} className="bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md p-3 flex items-center gap-2.5 border-l-[3px]"
            style={{ borderLeftColor: `hsl(${cat.color})` }}>
            <span className="text-base">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-condensed text-[11px] font-bold uppercase tracking-tight text-[hsl(var(--white))] truncate">{cat.name}</div>
              <div className="font-mono text-[7px] text-[hsl(var(--ash))]">{cat.count} файлов</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md p-6 text-center">
        <div className="font-condensed text-2xl mb-3">🔧</div>
        <div className="font-condensed text-sm font-bold uppercase text-[hsl(var(--amber))] mb-1">
          Модуль в разработке
        </div>
        <div className="font-mono text-[9px] text-[hsl(var(--ash))] mb-4 leading-relaxed">
          Загрузка и управление документами<br/>будет доступна в следующем обновлении
        </div>
        <button
          onClick={() => navigate('/')}
          className="border border-[hsl(var(--wire))] bg-[hsl(var(--plate))] text-[hsl(var(--arc))] font-condensed text-[11px] font-bold uppercase tracking-wide px-4 py-2 rounded-md transition-transform active:translate-y-px"
        >
          ← На главную
        </button>
      </div>
    </div>
  );
}
