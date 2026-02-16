import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';

export default function PlanFact() {
  const { project } = useAppStore();
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedObject, setSelectedObject] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) loadObjectsList(project.id);
  }, [project]);

  useEffect(() => {
    if (selectedObject) loadPlanFact(selectedObject);
  }, [selectedObject]);

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

  async function loadPlanFact(objectId: string) {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('plan_fact_daily')
      .select('*')
      .eq('object_id', objectId)
      .order('report_date', { ascending: false })
      .limit(50);
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3 text-foreground">📝 План-Факт</h1>

      <select
        value={selectedObject}
        onChange={(e) => setSelectedObject(e.target.value)}
        className="w-full bg-card text-foreground text-xs px-3 py-2 rounded-lg border border-border mb-4"
      >
        <option value="">Выберите объект</option>
        {objects.map((o: any) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>

      {data.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-[10px] text-muted-foreground">Модули (план/факт)</div>
            <div className="text-sm font-bold text-foreground">
              {totals.modulesPlan} / {totals.modulesFact}
            </div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-[10px] text-muted-foreground">Кронштейны (план/факт)</div>
            <div className="text-sm font-bold text-foreground">
              {totals.bracketsPlan} / {totals.bracketsFact}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Загрузка...</div>
      ) : data.length > 0 ? (
        <div className="space-y-2">
          {data.map((row: any) => (
            <div key={row.id} className="bg-card rounded-xl p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  📅 {new Date(row.report_date).toLocaleDateString('ru-RU')}
                </span>
                {row.week && <span className="text-[10px] text-muted-foreground">{row.week}</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Модули:</span>{' '}
                  <span className="text-foreground">{row.modules_plan || 0} / {row.modules_fact || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Кронштейны:</span>{' '}
                  <span className="text-foreground">{row.brackets_plan || 0} / {row.brackets_fact || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Герметик:</span>{' '}
                  <span className="text-foreground">{row.hermetic_plan || 0} / {row.hermetic_fact || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Герметизация:</span>{' '}
                  <span className="text-foreground">{row.sealant_plan || 0} / {row.sealant_fact || 0}</span>
                </div>
              </div>
              {row.notes && (
                <div className="text-[10px] text-muted-foreground mt-2">💬 {row.notes}</div>
              )}
            </div>
          ))}
        </div>
      ) : selectedObject ? (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-3xl mb-2">📝</p>
          <p>Нет данных план-факт</p>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-3xl mb-2">🏗</p>
          <p>Выберите объект</p>
        </div>
      )}
    </div>
  );
}
