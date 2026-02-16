import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = [
  'Договорной отдел',
  'Руководитель проекта',
  'Проектный отдел',
  'Отдел снабжения',
  'Производственный отдел',
  'Монтажное подразделение',
  'ПТО',
];

const ROLES = ['ADMIN', 'MANAGER', 'ENGINEER', 'WORKER', 'VIEWER'];

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  PENDING: { label: 'Ожидает', emoji: '⏳', color: 'bg-yellow-500/20 text-yellow-400' },
  ACTIVE: { label: 'Активен', emoji: '✅', color: 'bg-green-500/20 text-green-400' },
  BLOCKED: { label: 'Заблокирован', emoji: '🚫', color: 'bg-red-500/20 text-red-400' },
};

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (filter !== 'ALL') query = query.eq('status', filter);
    const { data, error } = await query;
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const updateUser = async (id: string, updates: Record<string, any>) => {
    const { error } = await (supabase as any).from('users').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Обновлено' });
    fetchUsers();
  };

  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">👥 Управление пользователями</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['ALL', 'PENDING', 'ACTIVE', 'BLOCKED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground'
            }`}
          >
            {f === 'ALL' ? `Все (${users.length})` :
             f === 'PENDING' ? `⏳ Заявки (${pendingCount})` :
             f === 'ACTIVE' ? '✅ Активные' : '🚫 Заблокированные'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 opacity-50">Загрузка...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 opacity-50">Нет пользователей</div>
      ) : (
        <div className="space-y-3">
          {users.map(user => {
            const st = STATUS_LABELS[user.status] || STATUS_LABELS.PENDING;
            return (
              <div key={user.id} className="bg-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-medium">{user.full_name || 'Без имени'}</span>
                    {user.telegram_id && (
                      <span className="text-xs opacity-50 ml-2">TG: {user.telegram_id}</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${st.color}`}>
                    {st.emoji} {st.label}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mb-2">
                  🔑 {user.role} {user.department && `• 🏢 ${user.department}`}
                </div>

                <div className="flex gap-2 mb-2">
                  <select
                    value={user.department || ''}
                    onChange={(e) => updateUser(user.id, { department: e.target.value || null })}
                    className="flex-1 bg-background text-foreground text-xs px-2 py-1.5 rounded-lg border border-border"
                  >
                    <option value="">Без отдела</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    className="bg-background text-foreground text-xs px-2 py-1.5 rounded-lg border border-border"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="flex gap-2">
                  {user.status === 'PENDING' && (
                    <button onClick={() => updateUser(user.id, { status: 'ACTIVE' })} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 rounded-lg transition-colors">
                      ✅ Одобрить
                    </button>
                  )}
                  {user.status === 'ACTIVE' && (
                    <button onClick={() => updateUser(user.id, { status: 'BLOCKED' })} className="flex-1 bg-red-600/80 hover:bg-red-700 text-white text-sm py-1.5 rounded-lg transition-colors">
                      🚫 Заблокировать
                    </button>
                  )}
                  {user.status === 'BLOCKED' && (
                    <button onClick={() => updateUser(user.id, { status: 'ACTIVE' })} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 rounded-lg transition-colors">
                      🔓 Разблокировать
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
