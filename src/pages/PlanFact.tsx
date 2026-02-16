import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';

export default function PlanFact() {
  const { project } = useAppStore();
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (project) loadObjectsList(project.id); }, [project]);
  useEffect(() => { if (selectedObject) loadPlanFact(selectedObject); }, [selectedObject]);

  async function loadObjectsList(projectId: string) {
    const { data } = await (supabase as any).from('construction_objects').select('id, name').eq('project_id', projectId).order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0) setSelectedObject(objs[0].id);
  }

  async function loadPlanFact(objectId: string) {
    setLoading(true);
    const { data } = await (supabase as any).from('plan_fact_daily').select('*').eq('object_id', objectId).order('report_date', { ascending: false }).limit(50);
    setData(data || []);
    setLoading(false);
  }

  const totals = data.reduce(
    (acc: any, row: any) => ({
      modulesPlan: acc.modulesPlan + Number(row.modules_plan || 0),
      modulesFact: acc.modulesFact + Number(row.modules_fact || 0),
      bracketsPlan: acc.bracketsPlan + Number(row.brackets_plan || 0),
      bracketsFact: acc.bracketsFact + Number(row.brackets_fact || 0),
    }),
    { modulesPlan: 0, modulesFact: 0, bracketsPlan: 0, bracketsFact: 0 }
  );

  return (
    <div className="p-3 pb-24">
      <div className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))] mb-3">
        📝 План-Факт
      </div>

      <select value={selectedObject} onChange={(e) => setSelectedObject(e.target.value)}
        className="w-full bg-rail text-foreground font-mono text-[10px] px-3 py-2 rounded-md border border-seam mb-3">
        <option value="">Выберите объект</option>
        {objects.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>

      {data.length > 0 && (
        <div className="flex gap-1.5 mb-3">
          <div className="flex-1 bg-rail border border-seam rounded-md p-2 text-center">
            <span className="font-mono text-[7px] text-ash uppercase block">Модули П/Ф</span>
            <span className="font-mono text-sm font-bold text-arc">{totals.modulesPlan}/{totals.modulesFact}</span>
          </div>
          <div className="flex-1 bg-rail border border-seam rounded-md p-2 text-center">
            <span className="font-mono text-[7px] text-ash uppercase block">Кронштейны П/Ф</span>
            <span className="font-mono text-sm font-bold text-amber">{totals.bracketsPlan}/{totals.bracketsFact}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 font-mono text-[10px] text-ash">Загрузка...</div>
      ) : data.length > 0 ? (
        <div className="flex flex-col gap-1">
          {data.map((row: any) => (
            <div key={row.id} className="bg-rail border border-seam rounded-md p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-condensed text-xs font-bold text-[hsl(var(--white))]">
                  📅 {new Date(row.report_date).toLocaleDateString('ru-RU')}
                </span>
                {row.week && <span className="font-mono text-[7px] text-ash">{row.week}</span>}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <PfCell label="Модули" plan={row.modules_plan} fact={row.modules_fact} />
                <PfCell label="Кронштейны" plan={row.brackets_plan} fact={row.brackets_fact} />
                <PfCell label="Герметик" plan={row.hermetic_plan} fact={row.hermetic_fact} />
                <PfCell label="Герметизация" plan={row.sealant_plan} fact={row.sealant_fact} />
              </div>
              {row.notes && <div className="font-mono text-[7px] text-ash mt-1.5">💬 {row.notes}</div>}
            </div>
          ))}
        </div>
      ) : selectedObject ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📝</div>
          <div className="font-mono text-[10px] text-ash">Нет данных план-факт</div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🏗</div>
          <div className="font-mono text-[10px] text-ash">Выберите объект</div>
        </div>
      )}
    </div>
  );
}

function PfCell({ label, plan, fact }: { label: string; plan: number; fact: number }) {
  const pct = plan > 0 ? (fact / plan) * 100 : 0;
  const color = pct >= 100 ? 'text-go' : pct > 50 ? 'text-amber' : 'text-signal';
  return (
    <div>
      <span className="font-mono text-[7px] text-ash">{label}:</span>
      <span className={`font-mono text-[9px] font-bold ${color} ml-1`}>{plan || 0}/{fact || 0}</span>
    </div>
  );
}
