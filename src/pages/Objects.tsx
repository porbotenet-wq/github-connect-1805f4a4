import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { GPR_TEMPLATE, OBJECT_STATUSES, WORK_TYPES } from '../data/gprTemplate';
import { workflowStages } from '../data/workflowStages';

interface ConstructionObject {
  id: string;
  created_at: string;
  project_id: string;
  name: string;
  customer_name: string;
  customer_address: string;
  customer_contacts: string;
  work_types: string[];
  total_volume_m2: number;
  start_date: string | null;
  end_date: string | null;
  contract_date: string | null;
  contract_link: string;
  estimate_link: string;
  project_manager: string;
  status: string;
  created_by: string;
}

interface GPRItem {
  object_id: string;
  section: string;
  subsection: string;
  sort_order: number;
  work_name: string;
  unit: string;
  status: string;
}

interface EcosystemTask {
  object_id: string;
  task_number: number;
  task_name: string;
  block: string;
  department: string;
  code: string;
  responsible: string;
  recipient: string;
  incoming_doc: string;
  outgoing_doc: string;
  bot_trigger: string;
  priority: string;
  status: string;
  planned_date: string | null;
  duration_days: number;
}

interface CreateForm {
  name: string; customer_name: string; customer_address: string; customer_contacts: string;
  work_types: string[]; total_volume_m2: string; start_date: string; end_date: string;
  contract_date: string; contract_link: string; estimate_link: string; project_manager: string;
}

const emptyForm: CreateForm = {
  name: '', customer_name: '', customer_address: '', customer_contacts: '',
  work_types: [], total_volume_m2: '', start_date: '', end_date: '',
  contract_date: '', contract_link: '', estimate_link: '', project_manager: '',
};

function deadlineToDays(deadline: string): number | null {
  const lower = deadline.toLowerCase();
  if (lower.includes('сутки с момента подписания') || lower.includes('дата подписания')) return 1;
  if (lower.includes('двое суток')) return 2;
  if (lower.includes('2 дня')) return 2;
  if (lower.includes('2-3 дня')) return 3;
  if (lower.includes('3 дня')) return 3;
  if (lower.includes('1 день')) return 1;
  if (lower.includes('за 7 дней')) return 7;
  if (lower.includes('за сутки')) return 1;
  if (lower.includes('за двое суток')) return 2;
  if (lower.includes('в течение суток')) return 1;
  if (lower.includes('заблаговременно')) return 0;
  return null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function Objects() {
  const { user, project } = useAppStore();
  const navigate = useNavigate();
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [importMode, setImportMode] = useState<'manual' | 'file'>('manual');

  useEffect(() => { if (project) loadObjects(); }, [project]);

  async function loadObjects() {
    setLoading(true);
    const { data } = await (supabase as any).from('construction_objects').select('*').eq('project_id', project!.id).order('created_at', { ascending: false });
    setObjects(data || []);
    setLoading(false);
  }

  function toggleWorkType(wt: string) {
    setForm(prev => ({ ...prev, work_types: prev.work_types.includes(wt) ? prev.work_types.filter(w => w !== wt) : [...prev.work_types, wt] }));
  }

  async function handleCreate() {
    if (!form.name || !user || !project) return;
    setSaving(true);
    try {
      const { data: obj, error } = await (supabase as any).from('construction_objects').insert({
        name: form.name, customer_name: form.customer_name, customer_address: form.customer_address,
        customer_contacts: form.customer_contacts, work_types: form.work_types,
        total_volume_m2: parseFloat(form.total_volume_m2) || 0, start_date: form.start_date || null,
        end_date: form.end_date || null, contract_date: form.contract_date || null,
        contract_link: form.contract_link, estimate_link: form.estimate_link,
        project_manager: form.project_manager, status: 'NEW', project_id: project.id, created_by: user.id,
      }).select().single();
      if (error) throw error;

      const gprItems = GPR_TEMPLATE.filter(item => form.work_types.includes(item.workType) || item.workType === 'BOTH')
        .map(item => ({ object_id: obj.id, section: item.section, subsection: item.subsection, sort_order: item.sortOrder, work_name: item.workName, unit: item.unit, status: 'PLANNED' }));
      if (gprItems.length > 0) await (supabase as any).from('work_schedule_items').insert(gprItems);

      const contractDate = form.contract_date || form.start_date || new Date().toISOString().split('T')[0];
      let taskNumber = 1;
      const ecosystemTasks: any[] = [];
      for (const stage of workflowStages) {
        for (const step of stage.steps) {
          const offsetDays = deadlineToDays(step.deadline);
          ecosystemTasks.push({
            object_id: obj.id, task_number: taskNumber++, task_name: step.action, block: stage.name,
            department: step.initiator, code: step.id, responsible: step.initiator, recipient: step.receiver,
            incoming_doc: step.document, outgoing_doc: step.document, bot_trigger: step.trigger || '',
            priority: 'Средний', status: 'Ожидание', planned_date: offsetDays !== null ? addDays(contractDate, offsetDays) : null,
            duration_days: offsetDays || 0,
          });
        }
      }
      if (ecosystemTasks.length > 0) await (supabase as any).from('ecosystem_tasks').insert(ecosystemTasks);

      setForm({ ...emptyForm }); setShowCreate(false); loadObjects();
    } catch (e: any) { alert('Ошибка: ' + e.message); } finally { setSaving(false); }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Файл "${file.name}" выбран. Парсинг спецификаций из Excel будет доступен в следующем обновлении.`);
  }

  const totalWorkflowSteps = workflowStages.reduce((sum, s) => sum + s.steps.length, 0);

  const statusBorder = (s: string) => s === 'IN_PROGRESS' ? 'border-l-go' : s === 'PAUSED' ? 'border-l-amber' : s === 'CANCELLED' ? 'border-l-signal' : s === 'COMPLETED' ? 'border-l-arc' : 'border-l-ash';

  const inputClass = "w-full bg-rail text-foreground rounded-md px-3 py-2 text-sm border border-seam focus:border-arc outline-none font-mono text-[11px]";
  const labelClass = "font-mono text-[8px] text-ash uppercase tracking-wider mb-1 block";

  return (
    <div className="p-3 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
          🏗 Объекты
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-[#0a1f14] border border-go/40 text-go font-condensed text-[11px] font-bold uppercase px-3 py-1.5 rounded-md">
          + Создать
        </button>
      </div>

      <div className="font-mono text-[8px] text-ash uppercase tracking-widest mb-2 border-b border-wire pb-1">
        ВСЕГО: {objects.length}
      </div>

      {loading ? (
        <div className="text-center py-10 font-mono text-[10px] text-ash">Загрузка...</div>
      ) : objects.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🏗</div>
          <div className="font-mono text-[10px] text-ash">Нет объектов</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {objects.map((obj: any) => (
            <div key={obj.id} onClick={() => navigate(`/objects/${obj.id}`)}
              className={`bg-rail border border-seam rounded-md p-2.5 flex items-center gap-2.5 cursor-pointer active:opacity-80 border-l-[3px] ${statusBorder(obj.status)}`}>
              <div className="flex-1 min-w-0">
                <span className="font-condensed text-xs font-bold uppercase tracking-tight text-[hsl(var(--white))] block">{obj.name}</span>
                <div className="font-mono text-[7px] text-ash mt-0.5">
                  {obj.project_manager && `РП: ${obj.project_manager}`}
                  {obj.work_types?.length > 0 && ` · ${obj.work_types.join(', ')}`}
                  {obj.total_volume_m2 > 0 && ` · ${obj.total_volume_m2} м²`}
                </div>
              </div>
              <span className="text-ash text-xs">›</span>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-panel w-full max-w-lg rounded-t-lg p-4 max-h-[90vh] overflow-y-auto border-t border-wire" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-condensed text-lg font-extrabold uppercase text-[hsl(var(--white))]">Новый объект</div>
              <button onClick={() => setShowCreate(false)} className="text-ash text-xl">✕</button>
            </div>

            <div className="flex gap-1.5 mb-4">
              <button onClick={() => setImportMode('manual')} className={`flex-1 py-2 rounded-md font-condensed text-[10px] font-bold uppercase ${importMode === 'manual' ? 'bg-[#0a1f14] border border-go/40 text-go' : 'bg-rail border border-seam text-ash'}`}>✏️ Ручной</button>
              <button onClick={() => setImportMode('file')} className={`flex-1 py-2 rounded-md font-condensed text-[10px] font-bold uppercase ${importMode === 'file' ? 'bg-[#071828] border border-arc/35 text-arc' : 'bg-rail border border-seam text-ash'}`}>📄 Из файла</button>
            </div>

            {importMode === 'file' && (
              <div className="mb-4 p-4 border border-dashed border-seam rounded-md text-center bg-rail">
                <div className="text-3xl mb-2">📂</div>
                <div className="font-mono text-[9px] text-ash mb-2">Загрузите Excel или PDF</div>
                <label className="cursor-pointer bg-[#071828] border border-arc/35 text-arc px-3 py-1.5 rounded-md font-condensed text-[10px] font-bold uppercase">
                  Выбрать файл
                  <input type="file" accept=".xlsx,.xls,.pdf" className="hidden" onChange={handleFileImport} />
                </label>
              </div>
            )}

            <div className="space-y-2">
              <div><label className={labelClass}>Название *</label><input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="ЖК «Сити-4»" className={inputClass} /></div>
              <div><label className={labelClass}>РП</label><input value={form.project_manager} onChange={e => setForm(prev => ({ ...prev, project_manager: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>Заказчик</label><input value={form.customer_name} onChange={e => setForm(prev => ({ ...prev, customer_name: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>Дата договора</label><input type="date" value={form.contract_date} onChange={e => setForm(prev => ({ ...prev, contract_date: e.target.value }))} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Виды работ</label>
                <div className="flex gap-1.5">
                  {WORK_TYPES.map(wt => (
                    <button key={wt.value} onClick={() => toggleWorkType(wt.value)}
                      className={`flex-1 py-2 rounded-md font-condensed text-[10px] font-bold uppercase border ${form.work_types.includes(wt.value) ? 'bg-[#0a1f14] border-go/40 text-go' : 'bg-rail border-seam text-ash'}`}>
                      {wt.value}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelClass}>Объём (м²)</label><input type="number" value={form.total_volume_m2} onChange={e => setForm(prev => ({ ...prev, total_volume_m2: e.target.value }))} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className={labelClass}>Начало</label><input type="date" value={form.start_date} onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Конец</label><input type="date" value={form.end_date} onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))} className={inputClass} /></div>
              </div>
            </div>

            <button onClick={handleCreate} disabled={!form.name || saving}
              className="w-full mt-4 bg-[#0a1f14] border border-go/40 text-go py-2.5 rounded-md font-condensed text-xs font-bold uppercase disabled:opacity-40">
              {saving ? 'Создание...' : `Создать (+ ${totalWorkflowSteps} задач)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
