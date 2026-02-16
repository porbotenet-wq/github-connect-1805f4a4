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
      .from('construction_objects')
      .select('id, name')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    const objs = data || [];
    setObjects(objs);
    if (objs.length > 0) setSelectedObject(objs[0].id);
  }

  async function loadFacades(objectId: string) {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('facades')
      .select('*')
      .eq('object_id', objectId)
      .order('sort_order');
    setFacades(data || []);
    setLoading(false);
  }

  const totalModulesPlan = facades.reduce((s: number, f: any) => s + (f.modules_plan || 0), 0);
  const totalModulesFact = facades.reduce((s: number, f: any) => s + (f.modules_fact || 0), 0);
  const totalBracketsPlan = facades.reduce((s: number, f: any) => s + (f.brackets_plan || 0), 0);
  const totalBracketsFact = facades.reduce((s: number, f: any) => s + (f.brackets_fact || 0), 0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3 text-foreground">📦 Фасады и модули</h1>

      <select
        value={selectedObject}
        onChange={(e) => setSelectedObject(e.target.value)}
        className="w-full bg-card text-foreground text-xs px-3 py-2 rounded-lg border border-border mb-4"
      >
        <option value="">Выберите объект</option>
        {objects.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>

      {facades.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-[10px] text-muted-foreground">Модули (план/факт)</div>
            <div className="text-sm font-bold text-foreground">
              {totalModulesPlan} / {totalModulesFact}
            </div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-[10px] text-muted-foreground">Кронштейны (план/факт)</div>
            <div className="text-sm font-bold text-foreground">
              {totalBracketsPlan} / {totalBracketsFact}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-8">Загрузка...</div>
      ) : facades.length > 0 ? (
        <div className="space-y-2">
          {facades.map((f: any) => {
            const modulesPct = f.modules_plan > 0 ? (f.modules_fact / f.modules_plan) * 100 : 0;
            return (
              <div key={f.id} className="bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{f.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    f.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    f.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(modulesPct, 100)}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>📦 Модули: {f.modules_fact || 0}/{f.modules_plan || 0}</div>
                  <div>🔩 Кронштейны: {f.brackets_fact || 0}/{f.brackets_plan || 0}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : selectedObject ? (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-3xl mb-2">🏢</p>
          <p>Нет фасадов для этого объекта</p>
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
