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
  { path: '/admin', icon: '👥', label: 'Админ' },
];

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreTabs.some((tab) => pathname === tab.path);

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border z-50 rounded-t-xl py-3 px-4 shadow-xl">
          <div className="grid grid-cols-4 gap-2">
            {moreTabs.map((tab) => {
              const active = pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => {
                    navigate(tab.path);
                    setShowMore(false);
                  }}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center py-2 px-1 z-50">
        {mainTabs.map((tab) => {
          if (tab.path === '/more') {
            return (
              <button
                key="more"
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isMoreActive || showMore
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          const active = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => {
                navigate(tab.path);
                setShowMore(false);
              }}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
