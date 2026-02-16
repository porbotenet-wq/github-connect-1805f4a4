import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { supabase } from '@/integrations/supabase/client';

export default function ProjectInfo() {
  const { project } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [objectCount, setObjectCount] = useState(0);

  useEffect(() => {
    if (project) {
      loadUsers();
      loadObjectCount(project.id);
    }
  }, [project]);

  async function loadUsers() {
    const { data } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('full_name');
    setUsers(data || []);
  }

  async function loadObjectCount(projectId: string) {
    const { count } = await (supabase as any)
      .from('construction_objects')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);
    setObjectCount(count || 0);
  }

  if (!project) {
    return (
      <div className="p-4 text-center text-muted-foreground py-12">
        <p className="text-3xl mb-2">🏗</p>
        <p>Проект не найден</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-foreground">🏗 {project.name}</h1>
      <div className="bg-card rounded-xl p-4 border border-border mb-4">
        <div className="space-y-2 text-sm">
          <Row label="Название" value={project.name} />
          <Row label="Описание" value={project.description || '—'} />
          <Row label="Объектов" value={String(objectCount)} />
          <Row label="Создан" value={new Date(project.created_at).toLocaleDateString('ru-RU')} />
        </div>
      </div>

      <div>
        <button onClick={() => setShowUsers(!showUsers)} className="flex items-center justify-between w-full mb-3">
          <h2 className="text-lg font-semibold text-foreground">👥 Команда ({users.length})</h2>
          <span className="text-muted-foreground text-sm">{showUsers ? '▲' : '▼'}</span>
        </button>
        {showUsers && (
          <div className="space-y-2">
            {users.map((u: any) => (
              <div key={u.id} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm">
                  {u.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">{u.full_name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {u.role}{u.department && ` • ${u.department}`}
                  </div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  u.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                  u.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{u.status}</span>
              </div>
            ))}
            {users.length === 0 && <div className="text-center text-muted-foreground py-4">Нет пользователей</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
