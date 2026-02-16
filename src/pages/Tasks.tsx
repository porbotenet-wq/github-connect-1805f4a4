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
    if (objs.length > 0 && !selectedObject) setSelectedObject(objs[0].id);
  }

  const blocks = [...new Set(tasks.map((t: any) => t.block).filter(Boolean))];

  async function handleChangeStatus(taskId: string, newStatus: string) {
    await changeTaskStatus(taskId, newStatus);
    if (selectedObject) loadTasks(selectedObject, { status: filterStatus || undefined, block: filterBlock || undefined });
  }

  const isOverdue = (task: any) => task.planned_date && new Date(task.planned_date) < new Date() && task.status !== 'Выполнено' && task.status !== 'Отменено';

  return (
    <div className="p-3 pb-24">
      <div className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))] mb-3">
        📋 Задачи экосистемы
      </div>

      {/* Object selector */}
      <select
        value={selectedObject}
        onChange={(e) => setSelectedObject(e.target.value)}
        className="w-full bg-rail text-foreground font-mono text-[10px] px-3 py-2 rounded-md border border-seam mb-2"
      >
        <option value="">Выберите объект</option>
        {objects.map((o: any) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      {/* Filters */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-rail text-foreground font-mono text-[10px] px-2 py-1.5 rounded-md border border-seam"
        >
          <option value="">Все статусы</option>
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-rail text-foreground font-mono text-[10px] px-2 py-1.5 rounded-md border border-seam"
        >
          <option value="">Все блоки</option>
          {blocks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="font-mono text-[8px] text-ash uppercase tracking-widest mb-2 border-b border-wire pb-1">
        ЗАДАЧ: {tasks.length}
      </div>

      <div className="flex flex-col gap-1">
        {tasks.map((task: any) => {
          const expanded = expandedTask === task.id;
          const overdue = isOverdue(task);
          const isMyTask = task.assigned_user_id === user?.id;
          const dotClass = overdue ? 'bg-signal shadow-[0_0_4px_hsl(var(--signal-glow))] animate-blink' :
            task.status === 'Выполнено' ? 'bg-go shadow-[0_0_4px_hsl(var(--go-glow))]' :
            task.status === 'В работе' ? 'bg-arc shadow-[0_0_4px_hsl(var(--arc-glow))]' :
            'bg-amber shadow-[0_0_4px_hsl(var(--amber-glow))]';

          const priorityBorder = task.priority === 'Высокий' ? 'border-l-signal' :
            task.priority === 'Средний' ? 'border-l-amber' : 'border-l-go';

          return (
            <div
              key={task.id}
              className={`bg-rail border border-seam rounded-md p-2 border-l-[3px] ${priorityBorder} ${overdue ? 'border-signal/30 bg-signal/5' : ''} ${isMyTask ? 'bg-arc/5' : ''} cursor-pointer active:opacity-80`}
              onClick={() => setExpandedTask(expanded ? null : task.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-condensed text-[11px] font-bold uppercase tracking-tight text-[hsl(var(--white))] block truncate">
                    #{task.task_number} {task.task_name}
                  </span>
                  <div className="flex gap-2 font-mono text-[7px] text-ash">
                    <span>{task.block}</span>
                    <span>·</span>
                    <span>{task.department}</span>
                    {task.code && <><span>·</span><span>{task.code}</span></>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {task.planned_date && (
                    <div className={`font-mono text-[7px] ${overdue ? 'text-signal font-bold' : 'text-ash'}`}>
                      {overdue ? `⚠ −${Math.ceil((new Date().getTime() - new Date(task.planned_date).getTime()) / 86400000)} ДН` :
                        new Date(task.planned_date).toLocaleDateString('ru', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </div>
                  )}
                  <StatusBadge status={task.status} />
                </div>
              </div>

              {expanded && (
                <div className="mt-2 pt-2 border-t border-wire space-y-1">
                  {task.users?.full_name && <div className="font-mono text-[8px] text-ash">👤 {task.users.full_name}</div>}
                  {task.recipient && <div className="font-mono text-[8px] text-ash">📨 {task.recipient}</div>}
                  {task.incoming_doc && <div className="font-mono text-[8px] text-ash">📥 {task.incoming_doc}</div>}
                  {task.outgoing_doc && <div className="font-mono text-[8px] text-ash">📤 {task.outgoing_doc}</div>}

                  <div className="flex gap-1.5 mt-2">
                    {task.status === 'Ожидание' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'В работе'); }}
                        className="flex-1 bg-[#071828] border border-arc/35 text-arc font-condensed text-[10px] font-bold uppercase px-2 py-1.5 rounded-md"
                      >
                        ▶ В работу
                      </button>
                    )}
                    {task.status === 'В работе' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChangeStatus(task.id, 'Выполнено'); }}
                        className="flex-1 bg-[#0a1f14] border border-go/40 text-go font-condensed text-[10px] font-bold uppercase px-2 py-1.5 rounded-md"
                      >
                        ✅ Выполнено
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {tasks.length === 0 && selectedObject && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-mono text-[10px] text-ash">Нет задач по выбранным фильтрам</div>
          </div>
        )}
        {!selectedObject && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🏗</div>
            <div className="font-mono text-[10px] text-ash">Выберите объект для просмотра задач</div>
          </div>
        )}
      </div>
    </div>
  );
}
