import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAppStore } from './stores/appStore';
import { NavBar } from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import PlanFact from './pages/PlanFact';
import Modules from './pages/Modules';
import ProjectInfo from './pages/ProjectInfo';
import Gantt from './pages/Gantt';
import Documents from './pages/Documents';
import Workflow from './pages/Workflow';
import Objects from './pages/Objects';
import ObjectCard from './pages/ObjectCard';
import Admin from './pages/Admin';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();

function AppContent() {
  const { user: tgUser, startParam } = useTelegram();
  const { loadUser, loadProject, user, error } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const telegramId = tgUser?.id || 8059235604;
    loadUser(telegramId);
    loadProject();
  }, [tgUser]);

  useEffect(() => {
    if (startParam) {
      if (startParam.startsWith('task_')) navigate('/tasks');
      else if (startParam === 'plan_fact') navigate('/plan-fact');
      else if (startParam === 'modules') navigate('/modules');
      else if (startParam === 'gantt') navigate('/gantt');
      else if (startParam === 'documents') navigate('/documents');
      else if (startParam === 'tasks') navigate('/tasks');
    }
  }, [startParam]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="font-condensed text-lg font-bold uppercase tracking-wide text-signal mb-2">Ошибка подключения</div>
          <div className="font-mono text-[10px] text-ash mb-4">{error}</div>
          <button onClick={() => { loadUser(tgUser?.id || 8059235604); loadProject(); }}
            className="bg-[#0f2b1a] text-go border border-go/40 px-4 py-2 rounded-md font-condensed text-xs font-bold uppercase tracking-wide">
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🏗</div>
          <div className="font-condensed text-lg font-bold uppercase tracking-wide text-ghost">Загрузка SMR·SFERA...</div>
          <div className="font-mono text-[9px] text-ash tracking-widest mt-1">// CONNECTING</div>
        </div>
      </div>
    );
  }

  if (user.status === 'PENDING') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="font-condensed text-lg font-bold uppercase text-amber">Ожидание активации</div>
          <div className="font-mono text-[10px] text-ash mt-2">Ваша заявка на рассмотрении.</div>
        </div>
      </div>
    );
  }

  if (user.status === 'BLOCKED') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <div className="font-condensed text-lg font-bold uppercase text-signal">Аккаунт заблокирован</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/plan-fact" element={<PlanFact />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/project" element={<ProjectInfo />} />
        <Route path="/gantt" element={<Gantt />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/objects" element={<Objects />} />
        <Route path="/objects/:id" element={<ObjectCard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <NavBar />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
