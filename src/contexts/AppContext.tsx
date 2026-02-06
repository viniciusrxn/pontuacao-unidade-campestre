import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  User, Unit, Task, TaskSubmission, WeeklyAttendance, FormSettings,
  SupabaseUnit, SupabaseTask, SupabaseTaskSubmission, SupabaseWeeklyAttendance
} from '@/types';
import { SESSION_DURATION_MS, ARCHIVE_DEADLINE } from '@/constants';

interface SavedSession {
  user: User;
  unitData: { id: string; name: string; logo?: string };
  timestamp: number;
  expiresAt: number;
  keepLoggedIn: boolean;
}

interface SavedAdminSession {
  user: User;
  timestamp: number;
  expiresAt: number;
  keepLoggedIn: boolean;
}

interface AppContextType {
  currentUser: User | null;
  units: Unit[];
  tasks: Task[];
  submissions: TaskSubmission[];
  attendances: WeeklyAttendance[];
  formSettings: FormSettings | null;
  attendanceFormEnabled: boolean;
  rankingVisible: boolean;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (unitId: string, password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  adminLogin: (password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  logout: () => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  submitTask: (taskId: string, proof: string) => Promise<void>;
  validateTask: (submissionId: string, approved: boolean, feedback?: string) => Promise<void>;
  updateUnitScore: (unitId: string, newScore: number) => Promise<void>;
  updateUnitLogo: (unitId: string, newLogo: string) => Promise<void>;
  submitWeeklyAttendance: (attendance: Omit<WeeklyAttendance, 'id' | 'submittedAt' | 'status'>) => Promise<boolean>;
  validateAttendance: (attendanceId: string, approved: boolean, customScore?: number, feedback?: string) => Promise<void>;
  toggleAttendanceFormAvailability: (enabled: boolean, enabledUnits?: string[]) => Promise<boolean>;
  toggleRankingVisibility: () => Promise<void>;
  resetAllStatistics: () => Promise<boolean>;
  fetchUnits: () => Promise<void>;
  isTaskAvailableForUnit: (task: Task, unitId: string) => boolean;
  getTasksForUnit: (unitId: string) => Task[];
  getTasksWithHistoryForUnit: (unitId: string) => Promise<{ available: Task[]; completed: Task[]; pending: Task[] }>;
  isFormEnabledForUnit: (unitId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const transformUnit = (unit: SupabaseUnit): Unit => ({
  id: unit.id,
  name: unit.name,
  logo: unit.logo || undefined,
  password: '',
  score: unit.score,
  tasks: []
});

const transformTask = (task: SupabaseTask): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  points: task.points,
  deadline: task.deadline,
  status: task.status as 'active' | 'expired' | 'removed',
  createdAt: task.created_at,
  difficulty: (task.difficulty as 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary') || 'easy',
  category: task.category || 'geral',
  targetUnits: task.target_units
});

const transformSubmission = (submission: SupabaseTaskSubmission): TaskSubmission => ({
  id: submission.id,
  taskId: submission.task_id,
  unitId: submission.unit_id,
  proof: submission.proof,
  submittedAt: submission.submitted_at,
  status: submission.status as 'pending' | 'completed' | 'rejected',
  adminFeedback: (submission as any).admin_feedback || undefined
});

const transformAttendance = (attendance: SupabaseWeeklyAttendance): WeeklyAttendance => ({
  id: attendance.id,
  unitId: attendance.unit_id,
  date: attendance.date,
  presentMembers: attendance.present_members || [],
  punctualCount: attendance.punctual_count,
  neckerchiefCount: attendance.neckerchief_count,
  uniformCount: attendance.uniform_count,
  broughtFlag: attendance.brought_flag,
  broughtBible: attendance.brought_bible,
  photoUrl: attendance.photo_url || undefined,
  submittedAt: attendance.submitted_at,
  status: attendance.status as 'pending' | 'validated' | 'rejected',
  score: attendance.score,
  adminFeedback: (attendance as any).admin_feedback || undefined
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [attendances, setAttendances] = useState<WeeklyAttendance[]>([]);
  const [formSettings, setFormSettings] = useState<FormSettings | null>(null);
  const [rankingVisible, setRankingVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const isFormEnabledForUnit = useCallback((unitId: string): boolean => {
    if (!formSettings || !formSettings.isEnabled) return false;
    if (!formSettings.enabledUnits || formSettings.enabledUnits.length === 0) return true;
    return formSettings.enabledUnits.includes(unitId);
  }, [formSettings]);

  const fetchUnits = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('units').select('*');
      if (error) throw error;
      setUnits((data || []).map(transformUnit));
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').not('deadline', 'eq', ARCHIVE_DEADLINE);
      if (error) throw error;
      setTasks((data || []).map(transformTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('task_submissions').select('*');
      if (error) throw error;
      setSubmissions((data || []).map(transformSubmission));
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }, []);

  const fetchAttendances = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('weekly_attendances').select('*');
      if (error) throw error;
      setAttendances((data || []).map(transformAttendance));
    } catch (error) {
      console.error('Error fetching attendances:', error);
    }
  }, []);

  const fetchFormSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('form_settings').select('*').eq('form_type', 'weekly_attendance').maybeSingle();
      if (error) throw error;
      if (data) {
        setFormSettings({
          id: data.id, formType: data.form_type, isEnabled: data.is_enabled,
          enabledUnits: data.enabled_units || [], updatedAt: data.updated_at
        });
      } else {
        setFormSettings({ id: '', formType: 'weekly_attendance', isEnabled: false, enabledUnits: [], updatedAt: new Date().toISOString() });
      }
    } catch (error) {
      console.error('Error fetching form settings:', error);
    }
  }, []);

  const fetchRankingSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('form_settings').select('*').eq('form_type', 'ranking_visibility').maybeSingle();
      if (error) throw error;
      setRankingVisible(data ? data.is_enabled : true);
    } catch (error) {
      console.error('Error fetching ranking settings:', error);
      setRankingVisible(true);
    }
  }, []);

  const login = useCallback(async (unitId: string, password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
    try {
      const unit = units.find(u => u.id === unitId);
      if (!unit) return false;

      const { data, error } = await supabase.rpc('authenticate_unit', {
        unit_name_param: unit.name,
        password_param: password
      });

      if (error) {
        console.error('Unit auth error:', error);
        return false;
      }

      const response = data as unknown as { success: boolean; unit_id?: string; unit_name?: string; unit_score?: number };
      if (!response.success) return false;

      const user = { type: 'unit' as const, unitId: unit.id };
      setCurrentUser(user);

      if (keepLoggedIn) {
        const session: SavedSession = {
          user, unitData: { id: unit.id, name: unit.name, logo: unit.logo },
          timestamp: Date.now(), expiresAt: Date.now() + SESSION_DURATION_MS, keepLoggedIn: true
        };
        localStorage.setItem('authSession', JSON.stringify(session));
      }
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [units]);

  const adminLogin = useCallback(async (password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('authenticate_admin', {
        username_param: 'admin', password_param: password
      });
      if (error) {
        console.error('Admin auth error:', error);
        return false;
      }
      const response = data as unknown as { success: boolean };
      if (!response.success) return false;

      const user = { type: 'admin' as const };
      setCurrentUser(user);

      if (keepLoggedIn) {
        const session: SavedAdminSession = {
          user, timestamp: Date.now(), expiresAt: Date.now() + SESSION_DURATION_MS, keepLoggedIn: true
        };
        localStorage.setItem('adminAuthSession', JSON.stringify(session));
      }
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('authSession');
    localStorage.removeItem('adminAuthSession');
  }, []);

  const createTask = useCallback(async (taskData: {
    title: string; description: string; points: number; deadline: string;
    difficulty?: string; category?: string; targetUnits?: string[];
  }): Promise<void> => {
    try {
      const { error } = await supabase.from('tasks').insert([{
        title: taskData.title, description: taskData.description,
        points: taskData.points, deadline: taskData.deadline,
        difficulty: taskData.difficulty || 'easy', category: taskData.category || 'geral',
        target_units: taskData.targetUnits || null, status: 'active'
      }]).select();
      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { data: completedSubmissions, error: subErr } = await supabase
        .from('task_submissions').select('*').eq('task_id', taskId).eq('status', 'completed');
      if (subErr) throw subErr;

      if (completedSubmissions && completedSubmissions.length > 0) {
        const { error } = await supabase.from('tasks')
          .update({ status: 'expired', updated_at: new Date().toISOString(), deadline: ARCHIVE_DEADLINE })
          .eq('id', taskId);
        if (error) throw error;
      } else {
        await supabase.from('task_submissions').delete().eq('task_id', taskId);
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw error;
      }
      await fetchTasks();
      await fetchSubmissions();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }, [fetchTasks, fetchSubmissions]);

  const submitTask = useCallback(async (taskId: string, proof: string) => {
    if (!currentUser || currentUser.type !== 'unit') return;
    try {
      const { error } = await supabase.from('task_submissions').insert({
        task_id: taskId, unit_id: currentUser.unitId, proof, status: 'pending'
      });
      if (error) throw error;
      await fetchSubmissions();
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  }, [currentUser, fetchSubmissions]);

  const validateTask = useCallback(async (submissionId: string, approved: boolean, feedback?: string) => {
    try {
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission) return;

      const updateData: Record<string, unknown> = { status: approved ? 'completed' : 'rejected' };
      if (feedback !== undefined) updateData.admin_feedback = feedback;

      const { error } = await supabase.from('task_submissions').update(updateData).eq('id', submissionId);
      if (error) throw error;

      if (approved) {
        const task = tasks.find(t => t.id === submission.taskId);
        const unit = units.find(u => u.id === submission.unitId);
        if (task && unit) {
          await supabase.from('units').update({ score: unit.score + task.points }).eq('id', unit.id);
          await fetchUnits();
        }
      }
      await fetchSubmissions();
    } catch (error) {
      console.error('Error validating task:', error);
      throw error;
    }
  }, [submissions, tasks, units, fetchSubmissions, fetchUnits]);

  const updateUnitScore = useCallback(async (unitId: string, newScore: number) => {
    try {
      const { error } = await supabase.from('units').update({ score: newScore }).eq('id', unitId);
      if (error) throw error;
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, score: newScore } : u));
      await fetchUnits();
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }, [fetchUnits]);

  const updateUnitLogo = useCallback(async (unitId: string, newLogo: string) => {
    try {
      const { error } = await supabase.from('units').update({ logo: newLogo || null }).eq('id', unitId);
      if (error) throw error;
      await fetchUnits();
    } catch (error) {
      console.error('Error updating logo:', error);
      throw error;
    }
  }, [fetchUnits]);

  const submitWeeklyAttendance = useCallback(async (attendanceData: Omit<WeeklyAttendance, 'id' | 'submittedAt' | 'status'>): Promise<boolean> => {
    try {
      const { error } = await supabase.from('weekly_attendances').insert({
        unit_id: attendanceData.unitId, date: attendanceData.date,
        present_members: attendanceData.presentMembers, punctual_count: attendanceData.punctualCount,
        neckerchief_count: attendanceData.neckerchiefCount, uniform_count: attendanceData.uniformCount,
        brought_flag: attendanceData.broughtFlag, brought_bible: attendanceData.broughtBible,
        photo_url: attendanceData.photoUrl, score: attendanceData.score, status: 'pending'
      });
      if (error) throw error;
      await fetchAttendances();
      return true;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      return false;
    }
  }, [fetchAttendances]);

  const validateAttendance = useCallback(async (attendanceId: string, approved: boolean, customScore?: number, feedback?: string) => {
    try {
      const attendance = attendances.find(a => a.id === attendanceId);
      if (!attendance) return;
      const finalScore = customScore !== undefined ? customScore : attendance.score;

      const updateData: Record<string, unknown> = { status: approved ? 'validated' : 'rejected', score: finalScore };
      if (feedback !== undefined) updateData.admin_feedback = feedback;

      const { error } = await supabase.from('weekly_attendances').update(updateData).eq('id', attendanceId);
      if (error) throw error;

      if (approved) {
        const unit = units.find(u => u.id === attendance.unitId);
        if (unit) {
          await supabase.from('units').update({ score: unit.score + finalScore }).eq('id', unit.id);
          await fetchUnits();
        }
      }
      await fetchAttendances();
    } catch (error) {
      console.error('Error validating attendance:', error);
      throw error;
    }
  }, [attendances, units, fetchAttendances, fetchUnits]);

  const toggleAttendanceFormAvailability = useCallback(async (enabled: boolean, enabledUnits: string[] = []): Promise<boolean> => {
    try {
      const { error } = await supabase.from('form_settings').upsert({
        form_type: 'weekly_attendance', is_enabled: enabled,
        enabled_units: enabledUnits.length > 0 ? enabledUnits : [],
        updated_at: new Date().toISOString()
      }, { onConflict: 'form_type' }).select();
      if (error) throw error;
      await fetchFormSettings();
      return true;
    } catch (error) {
      console.error('Error toggling form:', error);
      return false;
    }
  }, [fetchFormSettings]);

  const toggleRankingVisibility = useCallback(async (): Promise<void> => {
    try {
      const newVisibility = !rankingVisible;
      const { error } = await supabase.from('form_settings').upsert({
        form_type: 'ranking_visibility', is_enabled: newVisibility,
        enabled_units: [], updated_at: new Date().toISOString()
      }, { onConflict: 'form_type' });
      if (error) throw error;
      setRankingVisible(newVisibility);
    } catch (error) {
      console.error('Error toggling ranking:', error);
      throw error;
    }
  }, [rankingVisible]);

  const isTaskAvailableForUnit = useCallback((task: Task, unitId: string): boolean => {
    if (!task.targetUnits || task.targetUnits.length === 0) return true;
    return task.targetUnits.includes(unitId);
  }, []);

  const getTasksForUnit = useCallback((unitId: string): Task[] => {
    return tasks.filter(task => isTaskAvailableForUnit(task, unitId));
  }, [tasks, isTaskAvailableForUnit]);

  const getTasksWithHistoryForUnit = useCallback(async (unitId: string) => {
    try {
      const unitSubmissions = submissions.filter(sub => sub.unitId === unitId);
      const completedIds = new Set(unitSubmissions.filter(s => s.status === 'completed').map(s => s.taskId));
      const pendingIds = new Set(unitSubmissions.filter(s => s.status === 'pending').map(s => s.taskId));

      const { data: normalTasks, error } = await supabase.from('tasks').select('*').not('deadline', 'eq', ARCHIVE_DEADLINE);
      if (error) throw error;

      let archivedTasks: any[] = [];
      if (completedIds.size > 0) {
        const { data } = await supabase.from('tasks').select('*')
          .eq('deadline', ARCHIVE_DEADLINE).in('id', Array.from(completedIds));
        archivedTasks = data || [];
      }

      const allTasks = [...(normalTasks || []), ...archivedTasks].map(transformTask);

      return {
        available: allTasks.filter(t => t.deadline !== ARCHIVE_DEADLINE && isTaskAvailableForUnit(t, unitId) && !completedIds.has(t.id) && !pendingIds.has(t.id)),
        completed: allTasks.filter(t => completedIds.has(t.id)),
        pending: allTasks.filter(t => t.deadline !== ARCHIVE_DEADLINE && pendingIds.has(t.id))
      };
    } catch (error) {
      console.error('Error fetching tasks with history:', error);
      const available = getTasksForUnit(unitId);
      const unitSubs = submissions.filter(s => s.unitId === unitId);
      const cIds = new Set(unitSubs.filter(s => s.status === 'completed').map(s => s.taskId));
      const pIds = new Set(unitSubs.filter(s => s.status === 'pending').map(s => s.taskId));
      return {
        available: available.filter(t => !cIds.has(t.id) && !pIds.has(t.id)),
        completed: available.filter(t => cIds.has(t.id)),
        pending: available.filter(t => pIds.has(t.id))
      };
    }
  }, [submissions, isTaskAvailableForUnit, getTasksForUnit]);

  const resetAllStatistics = useCallback(async (): Promise<boolean> => {
    try {
      await supabase.from('task_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('weekly_attendances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('units').update({ score: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
      await Promise.all([fetchUnits(), fetchTasks(), fetchSubmissions(), fetchAttendances()]);
      return true;
    } catch (error) {
      console.error('Error resetting statistics:', error);
      return false;
    }
  }, [fetchUnits, fetchTasks, fetchSubmissions, fetchAttendances]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      try {
        const adminSaved = localStorage.getItem('adminAuthSession');
        if (adminSaved) {
          const session: SavedAdminSession = JSON.parse(adminSaved);
          if (Date.now() < session.expiresAt) {
            setCurrentUser(session.user);
          } else {
            localStorage.removeItem('adminAuthSession');
          }
        } else {
          const unitSaved = localStorage.getItem('authSession');
          if (unitSaved) {
            const session: SavedSession = JSON.parse(unitSaved);
            if (Date.now() < session.expiresAt) {
              setCurrentUser(session.user);
            } else {
              localStorage.removeItem('authSession');
            }
          }
        }
      } catch {
        localStorage.removeItem('authSession');
        localStorage.removeItem('adminAuthSession');
      }

      await Promise.all([
        fetchUnits(), fetchTasks(), fetchSubmissions(),
        fetchAttendances(), fetchFormSettings(), fetchRankingSettings()
      ]);
      setLoading(false);
    };
    initializeData();
  }, [fetchUnits, fetchTasks, fetchSubmissions, fetchAttendances, fetchFormSettings, fetchRankingSettings]);

  const attendanceFormEnabled = useMemo(() => formSettings?.isEnabled || false, [formSettings]);

  const value = useMemo(() => ({
    currentUser, units, tasks, submissions, attendances, formSettings,
    attendanceFormEnabled, rankingVisible, loading, setCurrentUser,
    login, adminLogin, logout, createTask, deleteTask, submitTask,
    validateTask, updateUnitScore, updateUnitLogo, submitWeeklyAttendance,
    validateAttendance, toggleAttendanceFormAvailability, toggleRankingVisibility,
    resetAllStatistics, fetchUnits, isTaskAvailableForUnit, getTasksForUnit,
    getTasksWithHistoryForUnit, isFormEnabledForUnit
  }), [
    currentUser, units, tasks, submissions, attendances, formSettings,
    attendanceFormEnabled, rankingVisible, loading, login, adminLogin,
    logout, createTask, deleteTask, submitTask, validateTask, updateUnitScore,
    updateUnitLogo, submitWeeklyAttendance, validateAttendance,
    toggleAttendanceFormAvailability, toggleRankingVisibility, resetAllStatistics,
    fetchUnits, isTaskAvailableForUnit, getTasksForUnit, getTasksWithHistoryForUnit,
    isFormEnabledForUnit
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
