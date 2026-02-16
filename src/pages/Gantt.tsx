import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, eachWeekOfInterval, endOfWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const BLOCK_COLORS: Record<string, string> = {
  'Договорной отдел': '#8b5cf6',
  'Запуск проекта': '#3b82f6',
  'Проектирование': '#22c55e',
  'Снабжение': '#f59e0b',
  'Производство': '#06b6d4',
  'Монтаж': '#ef4444',
  'ПТО': '#ec4899',
  'Контроль качества': '#14b8a6',
};

const STATUS_COLORS: Record<string, string> = {
  'Ожидание': '#6b7280',
  'В работе': '#3b82f6',
  'Выполнено': '#22c55e',
  'Отменено': '#ef4444',
};

export default function Gantt() {
  const { project } = useAppStore();
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [filterBlock, setFilterBlock] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) loadObjectsList(project.id);
  }, [project]);

  useEffect(() => {
    if (selectedObject) loadGanttTasks(selectedObject);
  }, [selectedObject, filterBlock]);

  async function loadObjectsList(projectId: string) {
    const { data } = await (supabase as any)
      .from('construction_objects')
      .select('id, name')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0) setSelectedObject(objs[0].id);
  }

  async function loadGanttTasks(objectId: string) {
    let query = (supabase as any)
      .from('ecosystem_tasks')
      .select('*')
      .eq('object_id', objectId)
      .not('planned_date', 'is', null)
      .order('task_number', { ascending: true });
    if (filterBlock) query = query.eq('block', filterBlock);
    const { data } = await query.limit(200);
    setTasks(data || []);
  }

  const tasksWithDates = tasks.filter((t: any) => t.planned_date);

  if (tasksWithDates.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-3 text-foreground">📊 Диаграмма Ганта</h1>
        <select
          value={selectedObject}
          onChange={(e) => setSelectedObject(e.target.value)}
          className="w-full bg-card text-foreground text-xs px-3 py-2 rounded-lg border border-border mb-4"
        >
          <option value="">Выберите объект</option>
          {objects.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <div className="text-center text-muted-foreground py-12">
          <p className="text-3xl mb-2">📊</p>
          <p>Нет задач с датами для отображения</p>
        </div>
      </div>
    );
  }

  const allDates = tasksWithDates.map((t: any) => t.planned_date);
  const minDate = new Date(allDates.sort()[0]);
  const maxDateStr = [...allDates].sort().reverse()[0];
  const maxDate = new Date(maxDateStr);
  const totalDays = differenceInDays(maxDate, minDate) + 30;
  const weeks = eachWeekOfInterval({ start: minDate, end: new Date(maxDate.getTime() + 30 * 86400000) }, { weekStartsOn: 1 });
  const DAY_WIDTH = 8;
  const ROW_HEIGHT = 28;
  const LABEL_WIDTH = 200;

  const blocks = [...new Set(tasks.map((t: any) => t.block).filter(Boolean))];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3 text-foreground">📊 Диаграмма Ганта</h1>
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <select
          value={selectedObject}
          onChange={(e) => setSelectedObject(e.target.value)}
          className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border"
        >
          {objects.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <select
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value)}
          className="bg-card text-foreground text-xs px-3 py-1.5 rounded-lg border border-border"
        >
          <option value="">Все блоки</option>
          {blocks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="flex gap-3 mb-3 flex-wrap">
        {blocks.map(block => (
          <div key={block} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: BLOCK_COLORS[block] || '#6b7280' }} />
            {block}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto" ref={scrollRef}>
          <div style={{ minWidth: LABEL_WIDTH + totalDays * DAY_WIDTH + 20 }}>
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="flex-shrink-0 text-[10px] text-muted-foreground p-2 font-medium" style={{ width: LABEL_WIDTH }}>Задача</div>
              <div className="flex-1 flex relative">
                {weeks.map((weekStart, i) => {
                  const we = endOfWeek(weekStart, { weekStartsOn: 1 });
                  const width = Math.min(7, differenceInDays(we, weekStart) + 1) * DAY_WIDTH;
                  return (
                    <div key={i} className="text-[9px] text-muted-foreground text-center border-r border-border flex-shrink-0 py-1" style={{ width, minWidth: width }}>
                      {format(weekStart, 'dd.MM', { locale: ru })}
                    </div>
                  );
                })}
              </div>
            </div>

            {tasksWithDates.map((task: any) => {
              const barColor = BLOCK_COLORS[task.block] || STATUS_COLORS[task.status] || '#6b7280';
              const barLeft = differenceInDays(parseISO(task.planned_date), minDate) * DAY_WIDTH;
              const duration = Math.max(task.duration_days || 1, 1);
              const barWidth = duration * DAY_WIDTH;

              return (
                <div key={task.id} className="flex items-center border-b border-border hover:bg-muted/50" style={{ height: ROW_HEIGHT }}>
                  <div className="flex-shrink-0 px-2 truncate text-[10px] text-foreground" style={{ width: LABEL_WIDTH }} title={task.task_name}>
                    #{task.task_number} {task.task_name}
                  </div>
                  <div className="flex-1 relative" style={{ height: ROW_HEIGHT }}>
                    <div
                      className="absolute top-1 rounded-sm"
                      style={{
                        left: barLeft,
                        width: barWidth,
                        height: ROW_HEIGHT - 8,
                        backgroundColor: barColor + '33',
                        borderLeft: `3px solid ${barColor}`,
                      }}
                    >
                      {barWidth > 40 && (
                        <span className="absolute text-[8px] text-white font-medium px-1 top-0.5 left-1 truncate" style={{ maxWidth: barWidth - 10 }}>
                          {task.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Задач: {tasksWithDates.length} | Период: {format(minDate, 'dd.MM.yyyy')} — {format(maxDate, 'dd.MM.yyyy')}
      </div>
    </div>
  );
}
