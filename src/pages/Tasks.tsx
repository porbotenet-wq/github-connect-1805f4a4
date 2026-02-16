import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge } from '../components/StatusBadge';

const TASK_STATUSES = ['Ожидание', 'В работе', 'Выполнено', 'Отменено'];

export default function Tasks() {
  const { user, project, tasks, loadTasks, changeTaskStatus } = useAppStore();
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterBlock, setFilterBlock] = useState<string>('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    loadObjectsList(project.id);
  }, [project]);

  useEffect(() => {
    if (!selectedObject) return;
    const filters: any = {};
    if (filterStatus) filters.status = filterStatus;
    if (filterBlock) filters.block = filterBlock;
    loadTasks(selectedObject, filters);
  }, [selectedObject, filterStatus, filterBlock]);

  async function loadObjectsList(projectId: string) {
    const { data } = await (supabase as any)
      .from('construction_objects')
      .select('id, name')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0 && !selectedObject) {
      setSelectedObject(objs[0].id);
    }
  }

  const blocks = [...new Set(tasks.map((t: any) => t.block).filter(Boolean))];

  async function handleChangeStatus(taskId: string, newStatus: string) {
    await changeTaskStatus(taskId, newStatus);
    if (selectedObject) loadTasks(selectedObject, { status: filterStatus || undefined, block: filterBlock || undefined });
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3 text-foreground">📋 Задачи экосистемы</h1>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <select
          value={selectedObject}
          onChange={(e) => setSelectedObject(e.target.value)}
          className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border flex-1"
        >
          <option value="">Выберите объект</option>
          {objects.map((o: any) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border"
        >
          <option value="">Все статусы</option>
          {TASK_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border"
        >
          <option value="">Все блоки</option>
          {blocks.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Задач: {tasks.length}
      </p>

      <div className="space-y-2">
        {tasks.map((task: any) => {
          const expanded = expandedTask === task.id;
          const isMyTask = task.assigned_user_id === user?.id;
          const priorityColors: Record<string, string> = {
            'Высокий': 'border-l-red-500',
            'Средний': 'border-l-yellow-500',
            'Низкий': 'border-l-green-500',
          };

          return (
            <div
              key={task.id}
              className={`bg-card rounded-xl p-3 border border-border border-l-4 ${
                priorityColors[task.priority] || 'border-l-gray-500'
              } ${isMyTask ? 'bg-primary/5' : ''}`}
              onClick={() => setExpandedTask(expanded ? null : task.id)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm text-foreground leading-tight block">
                    #{task.task_number} {task.task_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{task.code}</span>
                </div>
                <StatusBadge status={task.status} />
              </div>

              <div className="flex gap-3 text-[10px] text-muted-foreground mt-2 flex-wrap">
                <span>📋 {task.block}</span>
                <span>🏢 {task.department}</span>
                {task.responsible && <span>👤 {task.responsible}</span>}
              </div>

              {task.planned_date && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  📅 Срок: {new Date(task.planned_date).toLocaleDateString('ru-RU')}
                </div>
              )}

              {expanded && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  {task.recipient && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Получатель:</span> {task.recipient}
                    </div>
                  )}
                  {task.incoming_doc && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Входящий док:</span> {task.incoming_doc}
                    </div>
                  )}
                  {task.outgoing_doc && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Исходящий док:</span> {task.outgoing_doc}
                    </div>
                  )}
                  {task.users?.full_name && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Назначен:</span> {task.users.full_name}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-2">
                {task.status === 'Ожидание' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'В работе'); }}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg active:opacity-80"
                  >
                    ▶ В работу
                  </button>
                )}
                {task.status === 'В работе' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'Выполнено'); }}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg active:opacity-80"
                  >
                    ✅ Выполнено
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && selectedObject && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-3xl mb-2">📋</p>
            <p>Нет задач по выбранным фильтрам</p>
          </div>
        )}
        {!selectedObject && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-3xl mb-2">🏗</p>
            <p>Выберите объект для просмотра задач</p>
          </div>
        )}
      </div>
    </div>
  );
}
