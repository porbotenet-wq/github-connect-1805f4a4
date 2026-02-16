import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalObjects: number;
  activeUsers: number;
  myTasks: number;
  overdueTasks: number;
  completionPct: number;
  doneTasks: number;
}

export default function Dashboard() {
  const { user, project, objects, loadObjects } = useAppStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myActiveTasks, setMyActiveTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project || !user) return;
    loadObjects(project.id);
    loadStats(project.id, user.id);
    loadMyTasks(user.id);
  }, [project, user]);

  async function loadMyTasks(userId: string) {
    const { data } = await (supabase as any).from('ecosystem_tasks').select('*')
      .eq('assigned_user_id', userId).in('status', ['В работе', 'Ожидание'])
      .order('priority', { ascending: true }).limit(5);
    setMyActiveTasks(data || []);
  }

  async function loadStats(projectId: string, userId: string) {
    const { data: objs } = await (supabase as any).from('construction_objects').select('id').eq('project_id', projectId);
    const objectIds = (objs || []).map((o: any) => o.id);
    if (objectIds.length === 0) {
      setStats({ totalTasks: 0, tasksByStatus: {}, totalObjects: 0, activeUsers: 0, myTasks: 0, overdueTasks: 0, completionPct: 0, doneTasks: 0 });
      return;
    }
    const [tasksRes, usersRes, myTasksRes] = await Promise.all([
      (supabase as any).from('ecosystem_tasks').select('status, planned_date').in('object_id', objectIds),
      (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      (supabase as any).from('ecosystem_tasks').select('id', { count: 'exact', head: true })
        .eq('assigned_user_id', userId).in('status', ['В работе', 'Ожидание']),
    ]);
    const tasksByStatus: Record<string, number> = {};
    let overdueTasks = 0;
    const now = new Date();
    tasksRes.data?.forEach((t: any) => {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
      if (t.planned_date && new Date(t.planned_date) < now && t.status !== 'Выполнено' && t.status !== 'Отменено') overdueTasks++;
    });
    const totalTasks = tasksRes.data?.length || 0;
    const doneTasks = tasksByStatus['Выполнено'] || 0;
    const completionPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
    setStats({ totalTasks, tasksByStatus, totalObjects: objectIds.length, activeUsers: usersRes.count || 0, myTasks: myTasksRes.count || 0, overdueTasks, completionPct, doneTasks });
  }

  const role = user?.role || '';
  const isGD = role === 'ГД' || role === 'ADMIN';
  const isRP = role === 'РП';
  const roleLabel = isGD ? 'ГЕН. ДИРЕКТОР' : isRP ? 'РП' : role || 'СОТРУДНИК';
  const roleBadgeStyle = isGD ? 'bg-arc/15 text-arc border-arc/30' :
    isRP ? 'bg-go/12 text-go border-go/28' :
    role === 'ПРОЕКТНЫЙ' ? 'bg-[rgba(139,92,246,.12)] text-[#8b5cf6] border-[rgba(139,92,246,.3)]' :
    role === 'СНАБЖЕНИЕ' ? 'bg-amber/12 text-amber border-amber/28' :
    role === 'ПРОИЗВОДСТВО' ? 'bg-signal/12 text-signal border-signal/30' :
    role === 'МОНТАЖНИК' ? 'bg-amber/12 text-amber border-amber/28' :
    'bg-ash/10 text-ash border-ash/20';

  return (
    <div className="p-3 pb-24">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
          ⚡ {user?.full_name || 'Пользователь'}
        </h1>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          <span className={`font-mono text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border ${roleBadgeStyle}`}>
            {roleLabel}
          </span>
          {project && (
            <span className="font-mono text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-amber/10 text-amber border border-amber/25">
              {project.name}
            </span>
          )}
          {user?.department && (
            <span className="font-mono text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-arc/10 text-arc border border-arc/25">
              {user.department}
            </span>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      {stats && (
        <div className="flex gap-1.5 mb-4">
          {isGD ? (
            <>
              <KpiBox value={stats.totalObjects} label="Объектов" color="text-arc" bgHighlight="bg-arc/5 border-arc/20" />
              <KpiBox value={stats.totalTasks} label="Задач" color="text-amber" />
              <KpiBox value={stats.overdueTasks} label="Просроч." color="text-signal" highlight={stats.overdueTasks > 0} />
              <KpiBox value={stats.doneTasks} label="Готово" color="text-go" bgHighlight="bg-go/5 border-go/20" />
            </>
          ) : (
            <>
              <KpiBox value={stats.myTasks} label="Актив." color="text-amber" />
              <KpiBox value={stats.overdueTasks} label="Просроч." color="text-signal" highlight={stats.overdueTasks > 0} />
              <KpiBox value={stats.doneTasks} label="Готово" color="text-go" bgHighlight="bg-go/5 border-go/20" />
            </>
          )}
        </div>
      )}

      {/* My Tasks (for non-GD) */}
      {!isGD && myActiveTasks.length > 0 && (
        <div className="mb-4">
          <SectionLabel>МОИ ЗАДАЧИ</SectionLabel>
          <div className="flex flex-col gap-1">
            {myActiveTasks.map((task) => {
              const isOverdue = task.planned_date && new Date(task.planned_date) < new Date() && task.status !== 'Выполнено';
              return <TaskCard key={task.id} name={task.task_name} dept={task.department} date={task.planned_date} isOverdue={isOverdue} status={task.status} onClick={() => navigate('/tasks')} />;
            })}
          </div>
        </div>
      )}

      {/* Objects */}
      <SectionLabel>↓ ОБЪЕКТЫ · {objects.length} АКТИВНЫХ · ТАП ДЛЯ ДЕТАЛЕЙ</SectionLabel>
      <div className="flex flex-col gap-1 mb-4">
        {objects.length === 0 ? (
          <div className="bg-rail border border-seam rounded-md p-4 text-center">
            <span className="font-mono text-[10px] text-ash">Нет объектов</span>
          </div>
        ) : (
          objects.slice(0, 6).map((obj: any) => (
            <ObjectCard key={obj.id} name={obj.name}
              meta={[obj.project_manager ? `РП: ${obj.project_manager}` : '', obj.work_types?.join(', ')].filter(Boolean).join(' · ')}
              status={obj.status} onClick={() => navigate(`/objects/${obj.id}`)} />
          ))
        )}
      </div>

      {/* GD: Alerts */}
      {isGD && stats && stats.overdueTasks > 0 && (
        <div className="mb-4">
          <SectionLabel>⚡ ТРЕБУЮТ ВНИМАНИЯ</SectionLabel>
          {objects.filter((o: any) => o.status === 'IN_PROGRESS').slice(0, 2).map((obj: any) => (
            <div key={obj.id} className="bg-signal/7 border border-signal/30 rounded-md p-2 mb-1" onClick={() => navigate(`/objects/${obj.id}`)}>
              <div className="flex justify-between font-condensed text-[11px] font-extrabold uppercase text-signal mb-0.5">
                <span>{obj.name}</span>
                <span>РИСК</span>
              </div>
              <div className="font-mono text-[7px] text-ash">{obj.project_manager && `РП: ${obj.project_manager}`}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons — role-based */}
      <div className="flex flex-col gap-1.5">
        {isGD && <BrutalButton variant="amber" onClick={() => navigate('/objects')}>📊 Сводка по всем объектам</BrutalButton>}

        {stats && stats.overdueTasks > 0 && (
          <BrutalButton variant="signal" onClick={() => navigate('/tasks')}>⚠️ Просрочки ({stats.overdueTasks})</BrutalButton>
        )}

        <div className="flex gap-1.5">
          <BrutalButton variant="primary" onClick={() => navigate('/tasks')}>
            📋 {isGD ? 'Все задачи' : 'Мои задачи'} {stats ? `(${isGD ? stats.totalTasks : stats.myTasks})` : ''}
          </BrutalButton>
          {stats && stats.overdueTasks > 0 && !isGD && (
            <button onClick={() => navigate('/tasks')} className="bg-signal/8 border border-signal/35 text-signal font-condensed text-[11px] font-bold uppercase px-3 py-2.5 rounded-md">
              ⚠ ({stats.overdueTasks})
            </button>
          )}
        </div>

        {isRP && <BrutalButton variant="amber" onClick={() => navigate('/objects')}>📊 Сводка объекта</BrutalButton>}

        <div className="flex gap-1.5">
          {isRP || isGD ? (
            <>
              <BrutalButton variant="ghost" onClick={() => navigate('/modules')}>📦 Модули</BrutalButton>
              <BrutalButton variant="ghost" onClick={() => navigate('/objects')}>🏢 Фасады</BrutalButton>
              <BrutalButton variant="ghost" onClick={() => navigate('/admin')}>👥 Команда</BrutalButton>
            </>
          ) : (
            <>
              <BrutalButton variant="ghost" onClick={() => navigate('/plan-fact')}>📝 План-факт</BrutalButton>
              <BrutalButton variant="ghost" onClick={() => navigate('/documents')}>📁 Отчёты</BrutalButton>
            </>
          )}
        </div>

        {!isGD && (
          <div className="flex gap-1.5">
            <BrutalButton variant="ghost" onClick={() => navigate('/workflow')}>📋 Процесс</BrutalButton>
            <BrutalButton variant="ghost" onClick={() => navigate('/gantt')}>📊 Гант</BrutalButton>
          </div>
        )}

        <BrutalButton variant="arc" onClick={() => {}}>🚀 Открыть приложение</BrutalButton>
      </div>
    </div>
  );
}

/* Sub-components */
function KpiBox({ value, label, color, highlight, bgHighlight }: { value: number | string; label: string; color: string; highlight?: boolean; bgHighlight?: string }) {
  return (
    <div className={`flex-1 bg-rail border border-seam rounded-md p-2 text-center ${highlight ? 'bg-signal/5 border-signal/25' : bgHighlight || ''}`}>
      <span className={`font-mono text-lg font-bold block leading-none ${color}`}>{value}</span>
      <span className="font-mono text-[6px] uppercase tracking-wider text-ash block mt-1">{label}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[8px] text-ash uppercase tracking-widest mb-1.5 border-b border-wire pb-1">{children}</div>;
}

function TaskCard({ name, dept, date, isOverdue, status, onClick }: {
  name: string; dept: string; date?: string; isOverdue: boolean; status: string; onClick: () => void;
}) {
  const dotClass = isOverdue ? 'bg-signal shadow-[0_0_4px_hsl(var(--signal-glow))] animate-blink' :
    status === 'В работе' ? 'bg-go shadow-[0_0_4px_hsl(var(--go-glow))]' : 'bg-amber shadow-[0_0_4px_hsl(var(--amber-glow))]';
  const formatDate = (d?: string) => {
    if (!d) return '';
    const dt = new Date(d);
    if (isOverdue) { const diff = Math.ceil((new Date().getTime() - dt.getTime()) / 86400000); return `⚠ −${diff} ДН`; }
    return dt.toLocaleDateString('ru', { day: '2-digit', month: 'short' }).toUpperCase();
  };
  return (
    <div onClick={onClick} className={`bg-rail border border-seam rounded-md p-2 flex items-center gap-2 cursor-pointer active:opacity-80 ${isOverdue ? 'border-signal/30 bg-signal/5' : ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
      <div className="flex-1 min-w-0">
        <span className="font-condensed text-[11px] font-bold uppercase tracking-tight text-[hsl(var(--white))] block truncate">{name}</span>
        <span className="font-mono text-[7px] text-ash">{dept}</span>
      </div>
      <div className={`font-mono text-[7px] text-right whitespace-nowrap ${isOverdue ? 'text-signal font-bold' : 'text-ash'}`}>{formatDate(date)}</div>
    </div>
  );
}

function ObjectCard({ name, meta, status, onClick }: { name: string; meta: string; status: string; onClick: () => void; }) {
  const borderColor = status === 'IN_PROGRESS' ? 'border-l-go' : status === 'PAUSED' ? 'border-l-amber' : status === 'CANCELLED' ? 'border-l-signal' : status === 'COMPLETED' ? 'border-l-arc' : 'border-l-ash';
  return (
    <div onClick={onClick} className={`bg-rail border border-seam rounded-md p-2.5 flex items-center gap-2.5 cursor-pointer active:opacity-80 border-l-[3px] ${borderColor}`}>
      <div className="flex-1 min-w-0">
        <span className="font-condensed text-xs font-bold uppercase tracking-tight text-[hsl(var(--white))] block">{name}</span>
        <span className="font-mono text-[7px] text-ash block mt-0.5">{meta}</span>
      </div>
      <span className="text-ash text-xs">›</span>
    </div>
  );
}

function BrutalButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'signal' | 'amber' | 'arc' | 'ghost'; onClick?: () => void; }) {
  const styles: Record<string, string> = {
    primary: 'bg-[#0a1f14] border-go/40 text-go shadow-[0_0_20px_rgba(16,185,129,.12),inset_0_0_20px_rgba(16,185,129,.05)]',
    signal: 'bg-signal/8 border-signal/35 text-signal shadow-[0_0_16px_rgba(239,68,68,.1)]',
    amber: 'bg-[#1a1000] border-amber/40 text-amber shadow-[0_0_20px_rgba(245,158,11,.1)]',
    arc: 'bg-[#071828] border-arc/35 text-arc shadow-[0_0_20px_rgba(56,189,248,.1)]',
    ghost: 'bg-rail border-wire text-ash',
  };
  return (
    <button onClick={onClick}
      className={`flex-1 border rounded-md px-2 py-2.5 font-condensed text-[11px] font-bold uppercase tracking-wide text-center cursor-pointer border-b-2 transition-transform active:translate-y-px ${styles[variant]}`}>
      {children}
    </button>
  );
}
