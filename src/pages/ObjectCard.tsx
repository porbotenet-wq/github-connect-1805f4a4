import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function ObjectCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obj, setObj] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<{ active: number; overdue: number; done: number; total: number }>({ active: 0, overdue: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'gpr' | 'stages'>('stages');

  useEffect(() => { if (id) loadData(id); }, [id]);

  async function loadData(objectId: string) {
    setLoading(true);
    const [objRes, schedRes, tasksRes] = await Promise.all([
      (supabase as any).from('construction_objects').select('*').eq('id', objectId).single(),
      (supabase as any).from('work_schedule_items').select('*').eq('object_id', objectId).order('sort_order'),
      (supabase as any).from('ecosystem_tasks').select('status, planned_date').eq('object_id', objectId),
    ]);
    setObj(objRes.data);
    setSchedule(schedRes.data || []);

    const tasks = tasksRes.data || [];
    const now = new Date();
    setTaskStats({
      total: tasks.length,
      active: tasks.filter((t: any) => t.status === 'В работе' || t.status === 'Ожидание').length,
      overdue: tasks.filter((t: any) => t.planned_date && new Date(t.planned_date) < now && t.status !== 'Выполнено' && t.status !== 'Отменено').length,
      done: tasks.filter((t: any) => t.status === 'Выполнено').length,
    });
    setLoading(false);
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="font-mono text-[10px] text-ash">Загрузка...</div></div>;
  if (!obj) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-3">❌</div>
        <div className="font-mono text-[10px] text-ash">Объект не найден</div>
        <button onClick={() => navigate('/objects')} className="mt-3 text-arc font-mono text-[10px]">← Назад</button>
      </div>
    </div>
  );

  const sections = [...new Set(schedule.map(s => s.section))];
  const totalItems = schedule.length;
  const doneItems = schedule.filter(s => s.status === 'DONE').length;
  const progressPct = taskStats.total > 0 ? (taskStats.done / taskStats.total) * 100 : 0;
  const progressColor = progressPct > 60 ? 'bg-go' : progressPct > 30 ? 'bg-amber' : 'bg-signal';

  // Fake stages data from blocks
  const stages = [
    { name: 'Договорной', pct: 100 },
    { name: 'Проектирование', pct: obj.status === 'NEW' ? 0 : 100 },
    { name: 'Снабжение', pct: obj.status === 'NEW' ? 0 : 68 },
    { name: 'Производство', pct: obj.status === 'NEW' ? 0 : 45 },
    { name: 'Монтаж', pct: obj.status === 'NEW' ? 0 : Math.round(progressPct) },
  ];

  return (
    <div className="p-3 pb-24">
      <button onClick={() => navigate('/objects')} className="font-mono text-[9px] text-ash mb-3 block">← ВСЕ ОБЪЕКТЫ</button>

      <div className="font-condensed text-lg font-extrabold uppercase tracking-wide text-[hsl(var(--white))] mb-1">
        🏗 {obj.name}
      </div>
      <div className="font-mono text-[8px] text-ash mb-3 leading-relaxed">
        РП: {obj.project_manager || '—'} · Срок: {obj.end_date ? new Date(obj.end_date).toLocaleDateString('ru', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        {obj.total_volume_m2 > 0 && <><br/>Площадь: {obj.total_volume_m2} м²</>}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-3">
        <div className="font-mono text-[8px] text-ash">ПРОГРЕСС</div>
        <div className="flex-1 h-1 bg-wire rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progressPct}%` }} />
        </div>
        <div className={`font-mono text-[9px] ${progressPct > 60 ? 'text-go' : progressPct > 30 ? 'text-amber' : 'text-signal'}`}>
          {progressPct.toFixed(0)}%
        </div>
      </div>

      {/* KPI */}
      <div className="flex gap-1.5 mb-4">
        <div className="flex-1 bg-rail border border-seam rounded-md p-2 text-center">
          <span className="font-mono text-lg font-bold text-amber block leading-none">{taskStats.active}</span>
          <span className="font-mono text-[6px] uppercase tracking-wider text-ash">Актив.</span>
        </div>
        <div className={`flex-1 bg-rail border border-seam rounded-md p-2 text-center ${taskStats.overdue > 0 ? 'bg-signal/5 border-signal/25' : ''}`}>
          <span className="font-mono text-lg font-bold text-signal block leading-none">{taskStats.overdue}</span>
          <span className="font-mono text-[6px] uppercase tracking-wider text-ash">Просроч.</span>
        </div>
        <div className="flex-1 bg-rail border border-seam rounded-md p-2 text-center bg-go/5 border-go/20">
          <span className="font-mono text-lg font-bold text-go block leading-none">{taskStats.done}</span>
          <span className="font-mono text-[6px] uppercase tracking-wider text-ash">Готово</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {(['stages', 'info', 'gpr'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-md font-condensed text-[10px] font-bold uppercase border ${activeTab === tab ? 'bg-[#071828] border-arc/35 text-arc' : 'bg-rail border-seam text-ash'}`}>
            {tab === 'stages' ? '📊 Этапы' : tab === 'info' ? '📋 Инфо' : `📐 ГПР (${totalItems})`}
          </button>
        ))}
      </div>

      {activeTab === 'stages' && (
        <div className="flex flex-col gap-1">
          {stages.map(stage => (
            <div key={stage.name} className="bg-rail border border-seam rounded-md p-2">
              <div className="flex justify-between items-center font-condensed text-[10px] font-bold uppercase text-ghost mb-1">
                <span>{stage.name}</span>
                <span className={stage.pct === 100 ? 'text-go' : stage.pct > 50 ? 'text-amber' : 'text-signal'}>
                  {stage.pct === 100 ? '✓ ' : ''}{stage.pct}%
                </span>
              </div>
              <div className="h-[3px] bg-wire rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${stage.pct === 100 ? 'bg-go' : stage.pct > 50 ? 'bg-amber' : 'bg-signal'}`} style={{ width: `${stage.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="bg-rail border border-seam rounded-md p-3">
          <div className="space-y-2">
            <InfoRow label="Наименование" value={obj.name} />
            <InfoRow label="Заказчик" value={obj.customer_name || '—'} />
            <InfoRow label="Виды работ" value={obj.work_types?.join(', ') || '—'} />
            <InfoRow label="РП" value={obj.project_manager || '—'} />
            <InfoRow label="Начало" value={obj.start_date ? new Date(obj.start_date).toLocaleDateString('ru-RU') : '—'} />
            <InfoRow label="Завершение" value={obj.end_date ? new Date(obj.end_date).toLocaleDateString('ru-RU') : '—'} />
          </div>
        </div>
      )}

      {activeTab === 'gpr' && (
        <div className="flex flex-col gap-1">
          {sections.map(section => {
            const sectionItems = schedule.filter(s => s.section === section);
            return (
              <div key={section} className="bg-rail border border-seam rounded-md overflow-hidden">
                <div className="px-3 py-1.5 border-b border-wire">
                  <span className="font-condensed text-[10px] font-bold uppercase text-[hsl(var(--white))]">{section}</span>
                  <span className="font-mono text-[7px] text-ash ml-2">{sectionItems.length} работ</span>
                </div>
                {sectionItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 border-t border-wire/50">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.status === 'DONE' ? 'bg-go' : item.status === 'IN_PROGRESS' ? 'bg-arc' : 'bg-ash'}`} />
                    <span className="font-mono text-[8px] text-ghost flex-1 truncate">{item.work_name}</span>
                    <span className="font-mono text-[7px] text-ash">{item.unit}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-1.5 mt-4">
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/tasks')} className="flex-1 bg-[#0a1f14] border border-go/40 text-go font-condensed text-[11px] font-bold uppercase py-2 rounded-md">
            📋 Задачи ({taskStats.total})
          </button>
          {taskStats.overdue > 0 && (
            <button className="bg-signal/8 border border-signal/35 text-signal font-condensed text-[11px] font-bold uppercase px-3 py-2 rounded-md">
              ⚠ ({taskStats.overdue})
            </button>
          )}
        </div>
        <button onClick={() => navigate('/plan-fact')} className="bg-[#1a1000] border border-amber/40 text-amber font-condensed text-[11px] font-bold uppercase py-2 rounded-md">
          📊 План-факт
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <div className="w-[35%] font-mono text-[8px] text-ash uppercase">{label}</div>
      <div className="flex-1 font-mono text-[9px] text-ghost">{value}</div>
    </div>
  );
}
