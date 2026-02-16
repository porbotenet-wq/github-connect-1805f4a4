import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DEPARTMENTS = ['Договорной отдел', 'Руководитель проекта', 'Проектный отдел', 'Отдел снабжения', 'Производственный отдел', 'Монтажное подразделение', 'ПТО'];
const ROLES = ['ГД', 'РП', 'ПРОЕКТНЫЙ', 'СНАБЖЕНИЕ', 'ПРОИЗВОДСТВО', 'МОНТАЖНИК', 'ПТО', 'ADMIN', 'WORKER'];

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    let query = (supabase as any).from('users').select('*').order('created_at', { ascending: false });
    if (filter !== 'ALL') query = query.eq('status', filter);
    const { data, error } = await query;
    if (error) toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const updateUser = async (id: string, updates: Record<string, any>) => {
    const { error } = await (supabase as any).from('users').update(updates).eq('id', id);
    if (error) { toast({ title: 'Ошибка', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Обновлено' });
    fetchUsers();
  };

  const pendingCount = users.filter(u => u.status === 'PENDING').length;

  const roleColor = (role: string) => {
    const m: Record<string, string> = {
      'ГД': 'bg-arc/15 text-arc border-arc/30',
      'РП': 'bg-go/12 text-go border-go/28',
      'ПРОЕКТНЫЙ': 'bg-[rgba(139,92,246,.12)] text-[#8b5cf6] border-[rgba(139,92,246,.3)]',
      'СНАБЖЕНИЕ': 'bg-amber/12 text-amber border-amber/28',
      'ПРОИЗВОДСТВО': 'bg-signal/12 text-signal border-signal/30',
      'МОНТАЖНИК': 'bg-amber/12 text-amber border-amber/28',
    };
    return m[role] || 'bg-ash/10 text-ash border-ash/20';
  };

  return (
    <div className="p-3 pb-24">
      <div className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))] mb-3">
        👥 Команда
      </div>

      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {(['ALL', 'PENDING', 'ACTIVE', 'BLOCKED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-1.5 rounded-md font-condensed text-[10px] font-bold uppercase whitespace-nowrap border ${
              filter === f ? 'bg-[#071828] border-arc/35 text-arc' : 'bg-rail border-seam text-ash'}`}>
            {f === 'ALL' ? `Все (${users.length})` : f === 'PENDING' ? `⏳ Заявки (${pendingCount})` : f === 'ACTIVE' ? '✅ Активные' : '🚫 Блокированные'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 font-mono text-[10px] text-ash">Загрузка...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 font-mono text-[10px] text-ash">Нет пользователей</div>
      ) : (
        <div className="flex flex-col gap-1">
          {users.map(user => {
            const isActive = user.status === 'ACTIVE';
            const isPending = user.status === 'PENDING';
            const isBlocked = user.status === 'BLOCKED';

            return (
              <div key={user.id} className={`bg-rail border border-seam rounded-md p-2.5 ${isPending ? 'border-l-[3px] border-l-amber' : isBlocked ? 'border-l-[3px] border-l-signal' : 'border-l-[3px] border-l-go'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-condensed text-xs font-bold uppercase text-[hsl(var(--white))]">{user.full_name || 'Без имени'}</span>
                  <span className={`font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase border ${roleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="font-mono text-[7px] text-ash mb-2">
                  {user.department && `🏢 ${user.department}`}
                  {user.telegram_id && ` · TG: ${user.telegram_id}`}
                </div>

                <div className="flex gap-1 mb-1.5">
                  <select value={user.department || ''} onChange={(e) => updateUser(user.id, { department: e.target.value || null })}
                    className="flex-1 bg-panel text-foreground font-mono text-[9px] px-2 py-1 rounded-md border border-wire">
                    <option value="">Без отдела</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={user.role} onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    className="bg-panel text-foreground font-mono text-[9px] px-2 py-1 rounded-md border border-wire">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="flex gap-1">
                  {isPending && (
                    <button onClick={() => updateUser(user.id, { status: 'ACTIVE' })}
                      className="flex-1 bg-[#0a1f14] border border-go/40 text-go font-condensed text-[10px] font-bold uppercase py-1.5 rounded-md">
                      ✅ Одобрить
                    </button>
                  )}
                  {isActive && (
                    <button onClick={() => updateUser(user.id, { status: 'BLOCKED' })}
                      className="flex-1 bg-signal/8 border border-signal/35 text-signal font-condensed text-[10px] font-bold uppercase py-1.5 rounded-md">
                      🚫 Блокировать
                    </button>
                  )}
                  {isBlocked && (
                    <button onClick={() => updateUser(user.id, { status: 'ACTIVE' })}
                      className="flex-1 bg-[#071828] border border-arc/35 text-arc font-condensed text-[10px] font-bold uppercase py-1.5 rounded-md">
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
