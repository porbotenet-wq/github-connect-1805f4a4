import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { OBJECT_STATUSES } from '../data/gprTemplate';

interface WorkScheduleItem {
  id: string;
  section: string;
  subsection: string;
  sort_order: number;
  work_name: string;
  unit: string;
  volume_plan: number | null;
  volume_fact: number | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  status: string;
}

export default function ObjectCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obj, setObj] = useState<any>(null);
  const [schedule, setSchedule] = useState<WorkScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'gpr'>('info');

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(objectId: string) {
    setLoading(true);
    const [objRes, schedRes] = await Promise.all([
      (supabase as any).from('construction_objects').select('*').eq('id', objectId).single(),
      (supabase as any).from('work_schedule_items').select('*').eq('object_id', objectId).order('sort_order'),
    ]);
    setObj(objRes.data);
    setSchedule(schedRes.data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!obj) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <div className="text-muted-foreground">Объект не найден</div>
          <button onClick={() => navigate('/objects')} className="mt-3 text-primary text-sm">
            Назад к объектам
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = OBJECT_STATUSES[obj.status as keyof typeof OBJECT_STATUSES] || { label: obj.status, color: '#6b7280' };
  const sections = [...new Set(schedule.map(s => s.section))];
  const totalItems = schedule.length;
  const doneItems = schedule.filter(s => s.status === 'DONE').length;
  const progressPct = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/objects')} className="text-primary text-sm">← Назад</button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">STSphera • Карточка объекта</div>
              <h1 className="text-lg font-bold text-foreground">{obj.name}</h1>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          <CardRow label="Наименование" value={obj.name} />
          <CardRow label="Заказчик" value={obj.customer_name || '—'} />
          <CardRow label="Адрес" value={obj.customer_address || '—'} />
          <CardRow label="Виды работ" value={obj.work_types?.join(', ') || '—'} />
          <CardRow label="Общий объём" value={obj.total_volume_m2 ? `${obj.total_volume_m2} м²` : '—'} />
          <CardRow label="РП" value={obj.project_manager || '—'} />
          <CardRow label="Контакты" value={obj.customer_contacts || '—'} />
          <CardRow label="Начало" value={obj.start_date ? new Date(obj.start_date).toLocaleDateString('ru-RU') : '—'} />
          <CardRow label="Завершение" value={obj.end_date ? new Date(obj.end_date).toLocaleDateString('ru-RU') : '—'} />
        </div>
      </div>

      {totalItems > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Прогресс ГПР</span>
            <span className="text-foreground font-semibold">{doneItems}/{totalItems} ({progressPct.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('info')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'info' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📋 Информация
        </button>
        <button onClick={() => setActiveTab('gpr')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'gpr' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          📊 ГПР ({totalItems})
        </button>
      </div>

      {activeTab === 'gpr' && (
        <div className="space-y-4">
          {sections.map(section => {
            const sectionItems = schedule.filter(s => s.section === section);
            const subsections = [...new Set(sectionItems.map(s => s.subsection))];
            return (
              <div key={section} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2.5 bg-primary/10 border-b border-border">
                  <h3 className="text-xs font-bold text-foreground">{section}</h3>
                </div>
                {subsections.map(sub => {
                  const subItems = sectionItems.filter(s => s.subsection === sub);
                  return (
                    <div key={sub}>
                      <div className="px-4 py-1.5 bg-muted/50">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{sub}</span>
                      </div>
                      {subItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-4 py-2 border-t border-border">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.status === 'DONE' ? 'bg-green-500' :
                            item.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-foreground truncate">{item.work_name}</div>
                            <div className="text-[10px] text-muted-foreground">{item.unit}</div>
                          </div>
                          {item.volume_plan && (
                            <span className="text-[10px] text-muted-foreground">{item.volume_plan}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Сводная информация</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Всего позиций ГПР</span>
              <span className="text-foreground">{totalItems}</span>
            </div>
            {sections.map(s => (
              <div key={s} className="flex justify-between">
                <span className="text-muted-foreground">{s}</span>
                <span className="text-foreground">{schedule.filter(i => i.section === s).length} работ</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Создан</span>
              <span className="text-foreground">{new Date(obj.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-5 py-3">
      <div className="w-[40%] text-xs text-muted-foreground flex-shrink-0">{label}</div>
      <div className="flex-1 text-xs text-foreground font-medium">{value}</div>
    </div>
  );
}
