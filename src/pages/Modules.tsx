import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';

export default function Modules() {
  const { project } = useAppStore();
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [facades, setFacades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) loadObjectsList(project.id);
  }, [project]);

  useEffect(() => {
    if (selectedObject) loadFacades(selectedObject);
  }, [selectedObject]);

  async function loadObjectsList(projectId: string) {
    const { data } = await (supabase as any)
      .from('construction_objects').select('id, name')
      .eq('project_id', projectId).order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0) setSelectedObject(objs[0].id);
  }

  async function loadFacades(objectId: string) {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('facades').select('*').eq('object_id', objectId).order('sort_order');
    setFacades(data || []);
    setLoading(false);
  }

  const totalModulesPlan = facades.reduce((s: number, f: any) => s + (f.modules_plan || 0), 0);
  const totalModulesFact = facades.reduce((s: number, f: any) => s + (f.modules_fact || 0), 0);
  const totalBracketsPlan = facades.reduce((s: number, f: any) => s + (f.brackets_plan || 0), 0);
  const totalBracketsFact = facades.reduce((s: number, f: any) => s + (f.brackets_fact || 0), 0);
  const totalModulesPct = totalModulesPlan > 0 ? (totalModulesFact / totalModulesPlan) * 100 : 0;

  return (
    <div className="p-3 pb-24">
      {/* Header */}
      <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
        📦 Фасады и модули
      </h1>
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mt-1 mb-4">
        Трекер монтажа фасадных конструкций
      </div>

      {/* Object selector */}
      <select
        value={selectedObject}
        onChange={(e) => setSelectedObject(e.target.value)}
        className="w-full bg-[hsl(var(--rail))] text-[hsl(var(--ghost))] font-mono text-[9px] uppercase tracking-wider px-2 py-2 rounded-md border border-[hsl(var(--wire))] mb-4 focus:border-[hsl(var(--arc))]"
      >
        <option value="">Выберите объект</option>
        {objects.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>

      {/* KPI strip */}
      {facades.length > 0 && (
        <>
          <div className="flex gap-1.5 mb-3">
            <KpiBox value={totalModulesFact} total={totalModulesPlan} label="Модули" color="text-[hsl(var(--arc))]" />
            <KpiBox value={totalBracketsFact} total={totalBracketsPlan} label="Кронштейны" color="text-[hsl(var(--amber))]" />
            <KpiBox value={`${totalModulesPct.toFixed(0)}%`} label="Прогресс" color={totalModulesPct >= 80 ? 'text-[hsl(var(--go))]' : totalModulesPct >= 50 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--signal))]'} />
          </div>

          {/* Progress bar */}
          <div className="bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md p-2 mb-4">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[7px] text-[hsl(var(--ash))] uppercase">Общий прогресс</span>
              <span className="font-mono text-[7px] text-[hsl(var(--arc))]">{totalModulesPct.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[hsl(var(--plate))] rounded-sm h-1.5">
              <div className="h-1.5 rounded-sm transition-all bg-[hsl(var(--arc))] shadow-[0_0_8px_hsl(var(--arc-glow))]"
                style={{ width: `${Math.min(totalModulesPct, 100)}%` }} />
            </div>
          </div>
        </>
      )}

      {/* Facades list */}
      <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mb-1.5 border-b border-[hsl(var(--wire))] pb-1">
        Фасады
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="font-mono text-[10px] text-[hsl(var(--ash))] animate-blink">Загрузка...</div>
        </div>
      ) : facades.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {facades.map((f: any) => {
            const modulesPct = f.modules_plan > 0 ? (f.modules_fact / f.modules_plan) * 100 : 0;
            const statusColor = f.status === 'COMPLETED' ? 'var(--go)' : f.status === 'IN_PROGRESS' ? 'var(--arc)' : 'var(--ash)';
            return (
              <div key={f.id} className="bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md p-3 border-l-[3px]"
                style={{ borderLeftColor: `hsl(${statusColor})` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-condensed text-xs font-bold uppercase tracking-tight text-[hsl(var(--white))]">{f.name}</span>
                  <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
                    style={{
                      backgroundColor: `hsl(${statusColor} / 0.12)`,
                      color: `hsl(${statusColor})`,
                      border: `1px solid hsl(${statusColor} / 0.3)`,
                    }}>
                    {f.status === 'COMPLETED' ? 'Готово' : f.status === 'IN_PROGRESS' ? 'В работе' : f.status}
                  </span>
                </div>
                <div className="w-full bg-[hsl(var(--plate))] rounded-sm h-1 mb-2">
                  <div className="h-1 rounded-sm transition-all" style={{
                    width: `${Math.min(modulesPct, 100)}%`,
                    backgroundColor: `hsl(${statusColor})`,
                    boxShadow: `0 0 6px hsl(${statusColor} / 0.3)`,
                  }} />
                </div>
                <div className="flex gap-3 font-mono text-[8px] text-[hsl(var(--ash))]">
                  <span>📦 Модули: <span className="text-[hsl(var(--ghost))]">{f.modules_fact || 0}/{f.modules_plan || 0}</span></span>
                  <span>🔩 Кронштейны: <span className="text-[hsl(var(--ghost))]">{f.brackets_fact || 0}/{f.brackets_plan || 0}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : selectedObject ? (
        <div className="text-center py-8">
          <div className="font-condensed text-lg font-bold uppercase text-[hsl(var(--ash))] mb-2">🏢</div>
          <div className="font-mono text-[10px] text-[hsl(var(--ash))]">Нет фасадов для этого объекта</div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="font-condensed text-lg font-bold uppercase text-[hsl(var(--ash))] mb-2">🏗</div>
          <div className="font-mono text-[10px] text-[hsl(var(--ash))]">Выберите объект</div>
        </div>
      )}
    </div>
  );
}

function KpiBox({ value, total, label, color }: { value: number | string; total?: number; label: string; color: string }) {
  return (
    <div className="flex-1 bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md p-2 text-center">
      <span className={`font-mono text-lg font-bold block leading-none ${color}`}>
        {value}{total !== undefined && <span className="text-[hsl(var(--ash))] text-[10px]">/{total}</span>}
      </span>
      <span className="font-mono text-[6px] uppercase tracking-wider text-[hsl(var(--ash))] block mt-1">{label}</span>
    </div>
  );
}
