import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const mainTabs = [
  { path: '/', icon: '📊', label: 'Сводка' },
  { path: '/tasks', icon: '📋', label: 'Задачи' },
  { path: '/plan-fact', icon: '📝', label: 'Факт' },
  { path: '/more', icon: '⋯', label: 'Ещё' },
];

const moreTabs = [
  { path: '/workflow', icon: '📋', label: 'Процесс' },
  { path: '/gantt', icon: '📊', label: 'Гант' },
  { path: '/modules', icon: '📦', label: 'Модули' },
  { path: '/documents', icon: '📁', label: 'Документы' },
  { path: '/project', icon: '🏗', label: 'Объект' },
  { path: '/objects', icon: '🏢', label: 'Объекты' },
  { path: '/admin', icon: '👥', label: 'Админ' },
];

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreTabs.some((tab) => pathname === tab.path || pathname.startsWith(tab.path + '/'));

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div className="fixed bottom-14 left-0 right-0 bg-plate border-t border-wire z-50 rounded-t-lg py-3 px-3">
          <div className="grid grid-cols-4 gap-1.5">
            {moreTabs.map((tab) => {
              const active = pathname === tab.path || pathname.startsWith(tab.path + '/');
              return (
                <button
                  key={tab.path}
                  onClick={() => { navigate(tab.path); setShowMore(false); }}
                  className={`flex flex-col items-center gap-1 px-1.5 py-2 rounded-md transition-colors font-condensed text-[10px] font-bold uppercase tracking-wider
                    ${active ? 'text-arc bg-arc/10 border border-arc/25' : 'text-ash hover:text-ghost border border-transparent'}`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-plate border-t border-wire flex justify-around items-center py-1.5 px-1 z-50">
        {mainTabs.map((tab) => {
          if (tab.path === '/more') {
            return (
              <button
                key="more"
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors font-condensed text-[9px] font-bold uppercase tracking-wider
                  ${isMoreActive || showMore ? 'text-arc bg-arc/10' : 'text-ash hover:text-ghost'}`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          }

          const active = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => { navigate(tab.path); setShowMore(false); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors font-condensed text-[9px] font-bold uppercase tracking-wider
                ${active ? 'text-arc bg-arc/10' : 'text-ash hover:text-ghost'}`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
