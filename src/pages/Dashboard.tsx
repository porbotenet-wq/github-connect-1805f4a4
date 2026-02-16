import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { OBJECT_STATUSES } from '../data/gprTemplate';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TASK_STATUS_COLORS: Record<string, string> = {
  'Ожидание': '#6b7280',
  'В работе': '#3b82f6',
  'Выполнено': '#22c55e',
  'Отменено': '#ef4444',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  'Ожидание': 'Ожидание',
  'В работе': 'В работе',
  'Выполнено': 'Выполнено',
  'Отменено': 'Отменено',
};

interface DashboardStats {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  totalObjects: number;
  activeUsers: number;
  myTasks: number;
  completionPct: number;
}

export default function Dashboard() {
  const { user, project, objects, loadObjects } = useAppStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project || !user) return;
    loadObjects(project.id);
    loadStats(project.id, user.id);
  }, [project, user]);

  async function loadStats(projectId: string, userId: string) {
    const { data: objs } = await (supabase as any)
      .from('construction_objects')
      .select('id')
      .eq('project_id', projectId);

    const objectIds = (objs || []).map((o: any) => o.id);

    if (objectIds.length === 0) {
      setStats({
        totalTasks: 0, tasksByStatus: {}, totalObjects: 0,
        activeUsers: 0, myTasks: 0, completionPct: 0,
      });
      return;
    }

    const [tasksRes, usersRes, myTasksRes] = await Promise.all([
      (supabase as any).from('ecosystem_tasks').select('status').in('object_id', objectIds),
      (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      (supabase as any).from('ecosystem_tasks').select('id', { count: 'exact', head: true })
        .eq('assigned_user_id', userId).eq('status', 'В работе'),
    ]);

    const tasksByStatus: Record<string, number> = {};
    tasksRes.data?.forEach((t: any) => {
      tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
    });

    const totalTasks = tasksRes.data?.length || 0;
    const doneTasks = tasksByStatus['Выполнено'] || 0;
    const completionPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

    setStats({
      totalTasks,
      tasksByStatus,
      totalObjects: objectIds.length,
      activeUsers: usersRes.count || 0,
      myTasks: myTasksRes.count || 0,
      completionPct,
    });
  }

  const taskPieData = stats ? Object.entries(stats.tasksByStatus).map(([status, count]) => ({
    name: TASK_STATUS_LABELS[status] || status,
    value: count,
    color: TASK_STATUS_COLORS[status] || '#6b7280',
  })) : [];

  return (
    <div className="p-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">STSphera</h1>
        <p className="text-sm text-muted-foreground">
          {user?.full_name || 'Пользователь'} — {user?.role || 'Роль не назначена'}
          {user?.department && ` • ${user.department}`}
        </p>
      </div>

      {project && (
        <div
          className="bg-card rounded-xl p-4 mb-4 border border-border cursor-pointer active:opacity-80"
          onClick={() => navigate('/project')}
        >
          <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
          )}
          {stats && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Прогресс задач</span>
                <span className="text-foreground font-semibold">{stats.completionPct.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.completionPct, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {stats && stats.myTasks > 0 && (
        <div
          className="bg-primary/10 border border-primary/30 rounded-xl p-3 mb-4 cursor-pointer active:opacity-80"
          onClick={() => navigate('/tasks')}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div>
              <div className="text-sm font-medium text-foreground">
                У вас {stats.myTasks} задач в работе
              </div>
              <div className="text-[10px] text-muted-foreground">Нажмите чтобы посмотреть</div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon="📋" label="Задачи" value={stats.totalTasks} onClick={() => navigate('/tasks')} />
          <StatCard icon="🏗" label="Объекты" value={stats.totalObjects} onClick={() => navigate('/objects')} />
          <StatCard icon="👥" label="Сотрудники" value={stats.activeUsers} onClick={() => navigate('/admin')} />
          <StatCard icon="📊" label="Завершено" value={`${stats.completionPct.toFixed(0)}%`} />
        </div>
      )}

      <div className="bg-card rounded-xl border border-border mb-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Объекты</h3>
          <button onClick={() => navigate('/objects')} className="text-[10px] text-primary">
            Все →
          </button>
        </div>
        {objects.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-2">Нет объектов</div>
            <button onClick={() => navigate('/objects')} className="text-xs text-primary">
              + Создать объект
            </button>
          </div>
        ) : (
          objects.slice(0, 5).map((obj: any) => {
            const si = OBJECT_STATUSES[obj.status as keyof typeof OBJECT_STATUSES] || { label: obj.status, color: '#6b7280' };
            return (
              <div
                key={obj.id}
                onClick={() => navigate(`/objects/${obj.id}`)}
                className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer active:opacity-80"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{obj.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {obj.work_types?.join(', ')} {obj.total_volume_m2 ? `• ${obj.total_volume_m2} м²` : ''}
                  </div>
                </div>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: si.color + '20', color: si.color }}
                >
                  {si.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {stats && taskPieData.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Задачи по статусам</h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={22} outerRadius={40} paddingAngle={2} dataKey="value">
                    {taskPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {taskPieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Быстрые действия</h3>
        <div className="grid grid-cols-3 gap-2">
          <ActionButton icon="📋" label="Процесс" onClick={() => navigate('/workflow')} />
          <ActionButton icon="📝" label="План-факт" onClick={() => navigate('/plan-fact')} />
          <ActionButton icon="📊" label="Гант" onClick={() => navigate('/gantt')} />
          <ActionButton icon="🏗" label="Объекты" onClick={() => navigate('/objects')} />
          <ActionButton icon="👥" label="Админ" onClick={() => navigate('/admin')} />
          <ActionButton icon="🏢" label="Проект" onClick={() => navigate('/project')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, onClick }: { icon: string; label: string; value: number | string; onClick?: () => void }) {
  return (
    <div
      className={`bg-card rounded-xl p-3 border border-border ${onClick ? 'cursor-pointer active:opacity-80' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 bg-background rounded-lg p-3 hover:bg-muted active:opacity-80 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] text-foreground">{label}</span>
    </button>
  );
}
