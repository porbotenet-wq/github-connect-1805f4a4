import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AppState {
  user: any | null;
  project: any | null;
  objects: any[];
  facades: any[];
  tasks: any[];
  loading: boolean;
  error: string | null;

  loadUser: (telegramId: number) => Promise<void>;
  loadProject: () => Promise<void>;
  loadObjects: (projectId: string) => Promise<void>;
  loadFacades: (objectId: string) => Promise<void>;
  loadTasks: (objectId: string, filters?: any) => Promise<void>;
  changeTaskStatus: (taskId: string, newStatus: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  project: null,
  objects: [],
  facades: [],
  tasks: [],
  loading: false,
  error: null,

  setError: (error: string | null) => set({ error }),

  loadUser: async (telegramId: number) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();
      if (error) throw error;
      set({ user: data, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  loadProject: async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      set({ project: data });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  loadObjects: async (projectId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('construction_objects')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ objects: data || [] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  loadFacades: async (objectId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('facades')
        .select('*')
        .eq('object_id', objectId)
        .order('sort_order');
      if (error) throw error;
      set({ facades: data || [] });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  loadTasks: async (objectId: string, filters?: any) => {
    set({ loading: true });
    try {
      let query = (supabase as any)
        .from('ecosystem_tasks')
        .select('*, users:assigned_user_id(id, full_name)')
        .eq('object_id', objectId)
        .order('task_number', { ascending: true });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.department) query = query.eq('department', filters.department);
      if (filters?.block) query = query.eq('block', filters.block);
      if (filters?.assigneeId) query = query.eq('assigned_user_id', filters.assigneeId);

      const { data, error } = await query.limit(200);
      if (error) throw error;
      set({ tasks: data || [], loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
    }
  },

  changeTaskStatus: async (taskId: string, newStatus: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'Выполнено') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await (supabase as any)
        .from('ecosystem_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      await (supabase as any).from('audit_logs').insert({
        action: 'TASK_STATUS_CHANGED',
        entity_type: 'EcosystemTask',
        entity_id: taskId,
        user_id: user.id,
        new_value: { status: newStatus },
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },
}));
