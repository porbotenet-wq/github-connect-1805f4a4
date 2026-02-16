import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';
import { GPR_TEMPLATE, OBJECT_STATUSES, WORK_TYPES } from '../data/gprTemplate';
import { workflowStages } from '../data/workflowStages';

interface CreateForm {
  name: string;
  customer_name: string;
  customer_address: string;
  customer_contacts: string;
  work_types: string[];
  total_volume_m2: string;
  start_date: string;
  end_date: string;
  contract_date: string;
  contract_link: string;
  estimate_link: string;
  project_manager: string;
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

  useEffect(() => {
    if (project) loadObjects();
  }, [project]);

  async function loadObjects() {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('construction_objects')
      .select('*')
      .eq('project_id', project!.id)
      .order('created_at', { ascending: false });
    setObjects(data || []);
    setLoading(false);
  }

  function toggleWorkType(wt: string) {
    setForm(prev => ({
      ...prev,
      work_types: prev.work_types.includes(wt)
        ? prev.work_types.filter(w => w !== wt)
        : [...prev.work_types, wt],
    }));
  }

  async function handleCreate() {
    if (!form.name || !user || !project) return;
    setSaving(true);
    try {
      const { data: obj, error } = await (supabase as any)
        .from('construction_objects')
        .insert({
          name: form.name,
          customer_name: form.customer_name,
          customer_address: form.customer_address,
          customer_contacts: form.customer_contacts,
          work_types: form.work_types,
          total_volume_m2: parseFloat(form.total_volume_m2) || 0,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          contract_date: form.contract_date || null,
          contract_link: form.contract_link,
          estimate_link: form.estimate_link,
          project_manager: form.project_manager,
          status: 'NEW',
          project_id: project.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const gprItems = GPR_TEMPLATE
        .filter(item => form.work_types.includes(item.workType) || item.workType === 'BOTH')
        .map(item => ({
          object_id: obj.id,
          section: item.section,
          subsection: item.subsection,
          sort_order: item.sortOrder,
          work_name: item.workName,
          unit: item.unit,
          status: 'PLANNED',
        }));

      if (gprItems.length > 0) {
        await (supabase as any).from('work_schedule_items').insert(gprItems);
      }

      const contractDate = form.contract_date || form.start_date || new Date().toISOString().split('T')[0];
      let taskNumber = 1;
      const ecosystemTasks: any[] = [];

      for (const stage of workflowStages) {
        for (const step of stage.steps) {
          const offsetDays = deadlineToDays(step.deadline);
          const plannedDate = offsetDays !== null ? addDays(contractDate, offsetDays) : null;

          ecosystemTasks.push({
            object_id: obj.id,
            task_number: taskNumber++,
            task_name: step.action,
            block: stage.name,
            department: step.initiator,
            code: step.id,
            responsible: step.initiator,
            recipient: step.receiver,
            incoming_doc: step.document,
            outgoing_doc: step.document,
            bot_trigger: step.trigger || '',
            notification_type: '',
            dependency_ids: '',
            priority: 'Средний',
            status: 'Ожидание',
            planned_date: plannedDate,
            duration_days: offsetDays || 0,
          });
        }
      }

      if (ecosystemTasks.length > 0) {
        await (supabase as any).from('ecosystem_tasks').insert(ecosystemTasks);
      }

      await (supabase as any).from('audit_logs').insert({
        action: 'OBJECT_CREATED',
        entity_type: 'ConstructionObject',
        entity_id: obj.id,
        user_id: user.id,
        new_value: { name: form.name, work_types: form.work_types, tasks_created: ecosystemTasks.length },
      });

      setForm({ ...emptyForm });
      setShowCreate(false);
      loadObjects();
    } catch (e: any) {
      alert('Ошибка: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Файл "${file.name}" выбран. Парсинг спецификаций из Excel будет доступен в следующем обновлении.`);
  }

  const totalWorkflowSteps = workflowStages.reduce((sum, s) => sum + s.steps.length, 0);
  const statusInfo = (s: string) => OBJECT_STATUSES[s as keyof typeof OBJECT_STATUSES] || { label: s, color: '#6b7280' };

  const inputClass = "w-full bg-background text-foreground rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary outline-none";
  const labelClass = "text-xs text-muted-foreground mb-1 block";

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Объекты</h1>
          <p className="text-xs text-muted-foreground">Всего: {objects.length}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium active:opacity-80"
        >
          + Создать
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Загрузка...</div>
      ) : objects.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🏗</div>
          <div className="text-muted-foreground">Нет объектов</div>
          <button onClick={() => setShowCreate(true)} className="mt-3 text-primary text-sm">
            Создать первый объект
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {objects.map((obj: any) => (
            <div
              key={obj.id}
              onClick={() => navigate(`/objects/${obj.id}`)}
              className="bg-card rounded-xl p-4 border border-border cursor-pointer active:opacity-80"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground flex-1">{obj.name}</h3>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                  style={{ backgroundColor: statusInfo(obj.status).color + '20', color: statusInfo(obj.status).color }}
                >
                  {statusInfo(obj.status).label}
                </span>
              </div>
              {obj.customer_name && <div className="text-xs text-muted-foreground mb-1">👤 {obj.customer_name}</div>}
              {obj.project_manager && <div className="text-xs text-muted-foreground mb-1">👷 РП: {obj.project_manager}</div>}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {obj.work_types?.length > 0 && <span>{obj.work_types.join(', ')}</span>}
                {obj.total_volume_m2 > 0 && <span>{obj.total_volume_m2} м²</span>}
                {obj.contract_date && <span>📄 {new Date(obj.contract_date).toLocaleDateString('ru-RU')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-card w-full max-w-lg rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Новый объект</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground text-xl">✕</button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setImportMode('manual')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${importMode === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>✏️ Ручной ввод</button>
              <button onClick={() => setImportMode('file')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${importMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>📄 Из спецификации</button>
            </div>

            {importMode === 'file' && (
              <div className="mb-4 p-4 border-2 border-dashed border-border rounded-xl text-center">
                <div className="text-3xl mb-2">📂</div>
                <p className="text-xs text-muted-foreground mb-2">Загрузите Excel или PDF спецификацию</p>
                <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs">
                  Выбрать файл
                  <input type="file" accept=".xlsx,.xls,.pdf" className="hidden" onChange={handleFileImport} />
                </label>
              </div>
            )}

            <div className="space-y-3">
              <div><label className={labelClass}>Название объекта *</label><input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Жилой комплекс «Сити-4»" className={inputClass} /></div>
              <div><label className={labelClass}>Руководитель проекта</label><input value={form.project_manager} onChange={e => setForm(prev => ({ ...prev, project_manager: e.target.value }))} placeholder="Иванов И.И." className={inputClass} /></div>
              <div><label className={labelClass}>Заказчик</label><input value={form.customer_name} onChange={e => setForm(prev => ({ ...prev, customer_name: e.target.value }))} placeholder="ООО «Заказчик»" className={inputClass} /></div>
              <div><label className={labelClass}>Адрес</label><input value={form.customer_address} onChange={e => setForm(prev => ({ ...prev, customer_address: e.target.value }))} placeholder="г. Казань, ул. Примерная, 1" className={inputClass} /></div>
              <div><label className={labelClass}>Контакты заказчика</label><input value={form.customer_contacts} onChange={e => setForm(prev => ({ ...prev, customer_contacts: e.target.value }))} placeholder="Телефон, email" className={inputClass} /></div>
              <div><label className={labelClass}>Дата подписания договора</label><input type="date" value={form.contract_date} onChange={e => setForm(prev => ({ ...prev, contract_date: e.target.value }))} className={inputClass} /></div>
              <div><label className={labelClass}>Ссылка на договор</label><input value={form.contract_link} onChange={e => setForm(prev => ({ ...prev, contract_link: e.target.value }))} placeholder="https://..." className={inputClass} /></div>
              <div><label className={labelClass}>Ссылка на смету</label><input value={form.estimate_link} onChange={e => setForm(prev => ({ ...prev, estimate_link: e.target.value }))} placeholder="https://..." className={inputClass} /></div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Виды работ</label>
                <div className="flex gap-2">
                  {WORK_TYPES.map(wt => (
                    <button key={wt.value} onClick={() => toggleWorkType(wt.value)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-colors ${form.work_types.includes(wt.value) ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent border-border text-muted-foreground'}`}>
                      {wt.value}
                    </button>
                  ))}
                </div>
              </div>

              <div><label className={labelClass}>Общий объём (м²)</label><input type="number" value={form.total_volume_m2} onChange={e => setForm(prev => ({ ...prev, total_volume_m2: e.target.value }))} placeholder="5000" className={inputClass} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>Дата начала ГПР</label><input type="date" value={form.start_date} onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))} className={inputClass} /></div>
                <div><label className={labelClass}>Дата завершения ГПР</label><input type="date" value={form.end_date} onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))} className={inputClass} /></div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="text-xs text-primary font-medium mb-1">📋 Автоматически будет создано:</div>
                <div className="text-[10px] text-muted-foreground space-y-1">
                  <div>🔄 <b>{totalWorkflowSteps}</b> задач по всем этапам (8 блоков)</div>
                  {form.work_types.length > 0 && (
                    <div>📐 {GPR_TEMPLATE.filter(i => form.work_types.includes(i.workType)).length} позиций ГПР ({form.work_types.join(', ')})</div>
                  )}
                  {form.contract_date && (
                    <div>📅 Дедлайны рассчитаны от даты договора: {new Date(form.contract_date).toLocaleDateString('ru-RU')}</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!form.name || saving}
              className="w-full mt-5 bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm disabled:opacity-40 active:opacity-80"
            >
              {saving ? 'Создание...' : `Создать объект (+ ${totalWorkflowSteps} задач)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
