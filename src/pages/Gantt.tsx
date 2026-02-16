import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays, eachWeekOfInterval, endOfWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const BLOCK_COLORS: Record<string, string> = {
  'Договорной отдел': '#4f8ef7',
  'Запуск проекта': '#36d9a0',
  'Проектирование': '#f7a84f',
  'Снабжение': '#f74f7a',
  'Производство': '#b44ff7',
  'Монтаж': '#ef4444',
  'ПТО': '#38bdf8',
  'Контроль качества': '#10b981',
};

const STATUS_COLORS: Record<string, string> = {
  'Ожидание': '#4a6080',
  'В работе': '#38bdf8',
  'Выполнено': '#10b981',
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
      .from('construction_objects').select('id, name')
      .eq('project_id', projectId).order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0) setSelectedObject(objs[0].id);
  }

  async function loadGanttTasks(objectId: string) {
    let query = (supabase as any).from('ecosystem_tasks').select('*')
      .eq('object_id', objectId).not('planned_date', 'is', null)
      .order('task_number', { ascending: true });
    if (filterBlock) query = query.eq('block', filterBlock);
    const { data } = await query.limit(200);
    setTasks(data || []);
  }

  const tasksWithDates = tasks.filter((t: any) => t.planned_date);

  const emptyState = (
    <div className="p-3 pb-24">
      <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
        📊 Диаграмма Ганта
      </h1>
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mt-1 mb-4">
        Временная шкала задач
      </div>
      <BrutalSelect value={selectedObject} onChange={setSelectedObject} options={objects.map(o => ({ value: o.id, label: o.name }))} placeholder="Выберите объект" />
      <div className="text-center py-12">
        <div className="font-condensed text-lg font-bold uppercase text-[hsl(var(--ash))] mb-2">📊</div>
        <div className="font-mono text-[10px] text-[hsl(var(--ash))]">Нет задач с датами для отображения</div>
      </div>
    </div>
  );

  if (tasksWithDates.length === 0) return emptyState;

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
    <div className="p-3 pb-24">
      {/* Header */}
      <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
        📊 Диаграмма Ганта
      </h1>
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mt-1 mb-4">
        {tasksWithDates.length} задач · {format(minDate, 'dd.MM.yyyy')} — {format(maxDate, 'dd.MM.yyyy')}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-3">
        <BrutalSelect value={selectedObject} onChange={setSelectedObject}
          options={objects.map(o => ({ value: o.id, label: o.name }))} />
        <BrutalSelect value={filterBlock} onChange={setFilterBlock}
          options={blocks.map(b => ({ value: b, label: b }))} placeholder="Все блоки" />
      </div>

      {/* Legend */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {blocks.map(block => (
          <div key={block} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: BLOCK_COLORS[block] || '#4a6080' }} />
            <span className="font-mono text-[7px] text-[hsl(var(--ash))] uppercase tracking-wider">{block}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[hsl(var(--rail))] rounded-md border border-[hsl(var(--seam))] overflow-hidden">
        <div className="overflow-x-auto" ref={scrollRef}>
          <div style={{ minWidth: LABEL_WIDTH + totalDays * DAY_WIDTH + 20 }}>
            {/* Header row */}
            <div className="flex border-b border-[hsl(var(--wire))] sticky top-0 bg-[hsl(var(--rail))] z-10">
              <div className="flex-shrink-0 font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-wider p-2 font-bold" style={{ width: LABEL_WIDTH }}>
                Задача
              </div>
              <div className="flex-1 flex relative">
                {weeks.map((weekStart, i) => {
                  const we = endOfWeek(weekStart, { weekStartsOn: 1 });
                  const width = Math.min(7, differenceInDays(we, weekStart) + 1) * DAY_WIDTH;
                  return (
                    <div key={i} className="font-mono text-[7px] text-[hsl(var(--ash))] text-center border-r border-[hsl(var(--wire))] flex-shrink-0 py-1"
                      style={{ width, minWidth: width }}>
                      {format(weekStart, 'dd.MM', { locale: ru })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasks */}
            {tasksWithDates.map((task: any) => {
              const barColor = BLOCK_COLORS[task.block] || STATUS_COLORS[task.status] || '#4a6080';
              const barLeft = differenceInDays(parseISO(task.planned_date), minDate) * DAY_WIDTH;
              const duration = Math.max(task.duration_days || 1, 1);
              const barWidth = duration * DAY_WIDTH;

              return (
                <div key={task.id} className="flex items-center border-b border-[hsl(var(--wire))] hover:bg-[hsl(var(--plate))]" style={{ height: ROW_HEIGHT }}>
                  <div className="flex-shrink-0 px-2 truncate font-mono text-[8px] text-[hsl(var(--ghost))]" style={{ width: LABEL_WIDTH }} title={task.task_name}>
                    <span className="text-[hsl(var(--ash))]">#{task.task_number}</span> {task.task_name}
                  </div>
                  <div className="flex-1 relative" style={{ height: ROW_HEIGHT }}>
                    <div
                      className="absolute top-1 rounded-sm"
                      style={{
                        left: barLeft,
                        width: barWidth,
                        height: ROW_HEIGHT - 8,
                        backgroundColor: barColor + '25',
                        borderLeft: `3px solid ${barColor}`,
                        boxShadow: `0 0 8px ${barColor}15`,
                      }}
                    >
                      {barWidth > 40 && (
                        <span className="absolute font-mono text-[7px] font-bold px-1 top-0.5 left-1 truncate" style={{ color: barColor, maxWidth: barWidth - 10 }}>
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
    </div>
  );
}

function BrutalSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[hsl(var(--rail))] text-[hsl(var(--ghost))] font-mono text-[9px] uppercase tracking-wider px-2 py-1.5 rounded-md border border-[hsl(var(--wire))] focus:border-[hsl(var(--arc))]"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
