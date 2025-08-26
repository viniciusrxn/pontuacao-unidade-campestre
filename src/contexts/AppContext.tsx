import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  User,
  Unit, 
  Task, 
  TaskSubmission, 
  WeeklyAttendance, 
  FormSettings,
  SupabaseUnit,
  SupabaseTask,
  SupabaseTaskSubmission,
  SupabaseWeeklyAttendance
} from '@/types';

interface SavedSession {
  user: User;
  unitData: {
    id: string;
    name: string;
    logo?: string;
  };
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
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (unitId: string, password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  adminLogin: (password: string, keepLoggedIn?: boolean) => Promise<boolean>;
  logout: () => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  submitTask: (taskId: string, proof: string) => Promise<void>;
  validateTask: (submissionId: string, approved: boolean) => Promise<void>;
  updateUnitScore: (unitId: string, newScore: number) => Promise<void>;
  updateUnitLogo: (unitId: string, newLogo: string) => Promise<void>;
  submitWeeklyAttendance: (attendance: Omit<WeeklyAttendance, 'id' | 'submittedAt' | 'status'>) => Promise<boolean>;
  validateAttendance: (attendanceId: string, approved: boolean, customScore?: number) => Promise<void>;
  toggleAttendanceFormAvailability: (enabled: boolean, enabledUnits?: string[]) => Promise<boolean>;
  resetAllStatistics: () => Promise<boolean>;
  fetchUnits: () => Promise<void>;
  isTaskAvailableForUnit: (task: Task, unitId: string) => boolean;
  getTasksForUnit: (unitId: string) => Task[];
  getTasksWithHistoryForUnit: (unitId: string) => Promise<{
    available: Task[];
    completed: Task[];
    pending: Task[];
  }>;
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

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  try {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [attendances, setAttendances] = useState<WeeklyAttendance[]>([]);
    const [formSettings, setFormSettings] = useState<FormSettings | null>(null);
    const [loading, setLoading] = useState(true);

    // Transform functions
    const transformUnit = (unit: SupabaseUnit): Unit => ({
      id: unit.id,
      name: unit.name,
      logo: unit.logo || undefined,
      password: unit.password,
      score: unit.score,
      tasks: [] // Will be populated based on submissions
    });

    // Helper function to get task targeting from localStorage
    const getTaskTargeting = (taskId: string): string[] | null => {
      try {
        const taskTargeting = JSON.parse(localStorage.getItem('taskTargeting') || '{}');
        return taskTargeting[taskId] || null;
      } catch (error) {
        console.error('Error getting task targeting:', error);
        return null;
      }
    };

    const transformTask = (task: SupabaseTask): Task => {
      // Get targeting from database or localStorage fallback
      let targetUnits = task.target_units;
      if (!targetUnits) {
        const storedTargeting = getTaskTargeting(task.id);
        targetUnits = storedTargeting;
      }

      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        points: task.points,
        deadline: task.deadline,
        status: task.status as 'active' | 'expired' | 'removed',
        createdAt: task.created_at,
        difficulty: (task.difficulty as 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary') || 'easy',
        category: task.category || 'geral',
        targetUnits: targetUnits
      };
    };

    const transformSubmission = (submission: SupabaseTaskSubmission): TaskSubmission => ({
      id: submission.id,
      taskId: submission.task_id,
      unitId: submission.unit_id,
      proof: submission.proof,
      submittedAt: submission.submitted_at,
      status: submission.status as 'pending' | 'completed' | 'rejected'
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
      score: attendance.score
    });

    // Check if form is enabled for a specific unit
    const isFormEnabledForUnit = (unitId: string): boolean => {
      if (!formSettings || !formSettings.isEnabled) {
        return false;
      }
      
      // If enabledUnits is empty or null, form is enabled for all units
      if (!formSettings.enabledUnits || formSettings.enabledUnits.length === 0) {
        return true;
      }
      
      // Check if this unit is in the enabled list
      return formSettings.enabledUnits.includes(unitId);
    };

    // Fetch functions
    const fetchUnits = async () => {
      try {
        const client = supabase;
        const { data, error } = await client.from('units').select('*');
        if (error) throw error;
        const transformedUnits = (data || []).map(transformUnit);
        setUnits(transformedUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    const fetchTasks = async () => {
      try {
        const client = supabase;
        // Buscar apenas tarefas que não foram removidas (para interface de admin e unidades)
        const { data, error } = await client
          .from('tasks')
          .select('*')
          .neq('status', 'removed');
        
        if (error) throw error;
        const transformedTasks = (data || []).map(transformTask);
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase.from('task_submissions').select('*');
        if (error) throw error;
        setSubmissions((data || []).map(transformSubmission));
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    const fetchAttendances = async () => {
      try {
        const { data, error } = await supabase.from('weekly_attendances').select('*');
        if (error) throw error;
        setAttendances((data || []).map(transformAttendance));
      } catch (error) {
        console.error('Error fetching attendances:', error);
      }
    };

    const fetchFormSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('form_settings')
          .select('*')
          .eq('form_type', 'weekly_attendance')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          const settings = {
            id: data.id,
            formType: data.form_type,
            isEnabled: data.is_enabled,
            enabledUnits: data.enabled_units || [],
            updatedAt: data.updated_at
          };
          setFormSettings(settings);
        } else {
          setFormSettings({
            id: '',
            formType: 'weekly_attendance',
            isEnabled: false,
            enabledUnits: [],
            updatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error fetching form settings:', error);
      }
    };

    const saveSession = (user: User, unit: Unit, keepLoggedIn: boolean) => {
      if (keepLoggedIn) {
        const session: SavedSession = {
          user,
          unitData: { id: unit.id, name: unit.name, logo: unit.logo },
          timestamp: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          keepLoggedIn: true
        };
        localStorage.setItem('authSession', JSON.stringify(session));
      }
    };

    const login = async (unitId: string, password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
      try {
        const unit = units.find(u => u.id === unitId && u.password === password);
        if (unit) {
          const user = { type: 'unit' as const, unitId: unit.id };
          setCurrentUser(user);
          
          // Create session token
          const sessionToken = `unit-${unit.id}-${Date.now()}`;
          
          // Save session in localStorage if requested
          if (keepLoggedIn) {
            saveSession(user, unit, keepLoggedIn);
          }
          
          // Note: Session will be handled by the client interceptor
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    };

    const saveAdminSession = (user: User, keepLoggedIn: boolean) => {
      if (keepLoggedIn) {
        const session: SavedAdminSession = {
          user,
          timestamp: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          keepLoggedIn: true
        };
        localStorage.setItem('adminAuthSession', JSON.stringify(session));
      }
    };

    const adminLogin = async (password: string, keepLoggedIn: boolean = false): Promise<boolean> => {
      try {
        // Use the new admin password
        if (password === '@AdminCampestre') {
          const user = { type: 'admin' as const, password };
          setCurrentUser(user);
          
          // Create session token
          const sessionToken = `admin-${Date.now()}`;
          
          // Save admin session if requested
          if (keepLoggedIn) {
            saveAdminSession(user, keepLoggedIn);
          }
          
          // Note: Session will be handled by the client interceptor
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Admin login error:', error);
        return false;
      }
    };

    const logout = async () => {
      // Get current session token before clearing
      const adminSession = localStorage.getItem('adminAuthSession');
      const unitSession = localStorage.getItem('authSession');
      
      let sessionToken = '';
      if (adminSession) {
        try {
          const parsed = JSON.parse(adminSession);
          sessionToken = `admin-${parsed.timestamp}`;
        } catch (e) {
          console.error('Error parsing admin session:', e);
        }
      } else if (unitSession) {
        try {
          const parsed = JSON.parse(unitSession);
          sessionToken = `unit-${parsed.user.unitId}-${parsed.timestamp}`;
        } catch (e) {
          console.error('Error parsing unit session:', e);
        }
      }
      
      // Note: Sessions are managed in localStorage only for now
      
      setCurrentUser(null);
      localStorage.removeItem('authSession'); // Always clear saved unit session
      localStorage.removeItem('adminAuthSession'); // Always clear saved admin session
    };

    const createTask = async (taskData: {
      title: string;
      description: string;
      points: number;
      deadline: string;
      difficulty?: string;
      category?: string;
      targetUnits?: string[];
    }): Promise<void> => {
      try {
        console.log('Creating task with data:', taskData);
        const client = supabase;
        // Try to insert with target_units field, fallback if column doesn't exist
        let taskToInsert = {
          title: taskData.title,
          description: taskData.description,
          points: taskData.points,
          deadline: taskData.deadline,
          difficulty: taskData.difficulty || 'easy',
          category: taskData.category || 'geral',
          status: 'active'
        };

        // First attempt: try with target_units field
        let { data, error } = await client
          .from('tasks')
          .insert([{
            ...taskToInsert,
            target_units: taskData.targetUnits || null
          }])
          .select();

        // If error suggests column doesn't exist, retry without target_units
        if (error && (error.message.includes('target_units') || error.code === '42703')) {
          console.log('target_units column not found, retrying without it...');
          const result = await client
            .from('tasks')
            .insert([taskToInsert])
            .select();
          
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('Error creating task:', error);
          throw error;
        }

        console.log('Task created successfully:', data);
        
        // If target_units field doesn't exist and we have targetUnits, store them separately
        if (taskData.targetUnits && data && data[0]) {
          const taskId = data[0].id;
          await storeTaskTargeting(taskId, taskData.targetUnits);
        }
        
        // Refresh tasks to show the new task
        await fetchTasks();
      } catch (error) {
        console.error('Error in createTask:', error);
        throw error;
      }
    };

    const deleteTask = async (taskId: string) => {
      try {
        // Verificar se há submissões aprovadas para esta tarefa
        const { data: completedSubmissions, error: submissionError } = await supabase
          .from('task_submissions')
          .select('*')
          .eq('task_id', taskId)
          .eq('status', 'completed');

        if (submissionError) throw submissionError;

        if (completedSubmissions && completedSubmissions.length > 0) {
          // Se há submissões aprovadas, marcar como removida em vez de deletar
          const { error } = await supabase
            .from('tasks')
            .update({ 
              status: 'removed',
              updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

          if (error) throw error;
          
          console.log(`Tarefa arquivada (tinha ${completedSubmissions.length} submissões aprovadas)`);
        } else {
          // Se não há submissões aprovadas, pode deletar normalmente
          await supabase.from('task_submissions').delete().eq('task_id', taskId);
          const { error } = await supabase.from('tasks').delete().eq('id', taskId);
          if (error) throw error;
          
          console.log('Tarefa deletada (sem submissões aprovadas)');
        }
        
        await fetchTasks();
        await fetchSubmissions();
      } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    };

    const submitTask = async (taskId: string, proof: string) => {
      if (!currentUser || currentUser.type !== 'unit') return;

      try {
        const { error } = await supabase
          .from('task_submissions')
          .insert({
            task_id: taskId,
            unit_id: currentUser.unitId,
            proof,
            status: 'pending'
          });

        if (error) throw error;
        await fetchSubmissions();
      } catch (error) {
        console.error('Error submitting task:', error);
        throw error;
      }
    };

    const validateTask = async (submissionId: string, approved: boolean) => {
      try {
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) return;

        // Update submission status
        const { error: submissionError } = await supabase
          .from('task_submissions')
          .update({ status: approved ? 'completed' : 'rejected' })
          .eq('id', submissionId);

        if (submissionError) throw submissionError;

        // If approved, update unit score
        if (approved) {
          const task = tasks.find(t => t.id === submission.taskId);
          const unit = units.find(u => u.id === submission.unitId);
          
          if (task && unit) {
            await updateUnitScore(unit.id, unit.score + task.points);
          }
        }

        await fetchSubmissions();
      } catch (error) {
        console.error('Error validating task:', error);
        throw error;
      }
    };

    const updateUnitScore = async (unitId: string, newScore: number) => {
      try {
        const client = supabase;
        const { error } = await client
          .from('units')
          .update({ score: newScore })
          .eq('id', unitId);

        if (error) throw error;

        // Update local state immediately
        setUnits(prevUnits => 
          prevUnits.map(unit => 
            unit.id === unitId ? { ...unit, score: newScore } : unit
          )
        );
        
        // Refetch units to ensure we have the latest data
        await fetchUnits();
      } catch (error) {
        console.error('Error updating unit score:', error);
        throw error;
      }
    };

    const updateUnitLogo = async (unitId: string, newLogo: string) => {
      try {
        const { error } = await supabase
          .from('units')
          .update({ logo: newLogo || null })
          .eq('id', unitId);

        if (error) throw error;
        await fetchUnits();
      } catch (error) {
        console.error('Error updating unit logo:', error);
        throw error;
      }
    };

    const submitWeeklyAttendance = async (attendanceData: Omit<WeeklyAttendance, 'id' | 'submittedAt' | 'status'>): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('weekly_attendances')
          .insert({
            unit_id: attendanceData.unitId,
            date: attendanceData.date,
            present_members: attendanceData.presentMembers,
            punctual_count: attendanceData.punctualCount,
            neckerchief_count: attendanceData.neckerchiefCount,
            uniform_count: attendanceData.uniformCount,
            brought_flag: attendanceData.broughtFlag,
            brought_bible: attendanceData.broughtBible,
            photo_url: attendanceData.photoUrl,
            score: attendanceData.score,
            status: 'pending'
          });

        if (error) throw error;
        await fetchAttendances();
        return true;
      } catch (error) {
        console.error('Error submitting attendance:', error);
        return false;
      }
    };

    const validateAttendance = async (attendanceId: string, approved: boolean, customScore?: number) => {
      try {
        const attendance = attendances.find(a => a.id === attendanceId);
        if (!attendance) return;

        // Use custom score if provided, otherwise use original score
        const finalScore = customScore !== undefined ? customScore : attendance.score;

        // Update attendance status and score in database
        const { error: attendanceError } = await supabase
          .from('weekly_attendances')
          .update({ 
            status: approved ? 'validated' : 'rejected',
            score: finalScore
          })
          .eq('id', attendanceId);

        if (attendanceError) throw attendanceError;

        // If approved, update unit score
        if (approved) {
          const unit = units.find(u => u.id === attendance.unitId);
          if (unit) {
            await updateUnitScore(unit.id, unit.score + finalScore);
          }
        }

        await fetchAttendances();
      } catch (error) {
        console.error('Error validating attendance:', error);
        throw error;
      }
    };

    const toggleAttendanceFormAvailability = async (enabled: boolean, enabledUnits: string[] = []): Promise<boolean> => {
      try {
        console.log('Toggling form availability:', enabled, enabledUnits);
        
        const { data, error } = await supabase
          .from('form_settings')
          .upsert({
            form_type: 'weekly_attendance',
            is_enabled: enabled,
            enabled_units: enabledUnits.length > 0 ? enabledUnits : [],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'form_type'
          })
          .select();

        if (error) {
          console.error('Error in toggleAttendanceFormAvailability:', error);
          throw error;
        }
        
        console.log('Form settings updated:', data);
        await fetchFormSettings();
        return true;
      } catch (error) {
        console.error('Error toggling form availability:', error);
        return false;
      }
    };

    // Utility function to check if a task is available for a specific unit
    const isTaskAvailableForUnit = (task: Task, unitId: string): boolean => {
      // If targetUnits is null/undefined or empty, task is available for all units (global task)
      if (!task.targetUnits || task.targetUnits.length === 0) {
        return true;
      }
      // Check if unitId is in the targetUnits array (targeted task)
      return task.targetUnits.includes(unitId);
    };

    // Function to get tasks available for a specific unit
    const getTasksForUnit = (unitId: string): Task[] => {
      return tasks.filter(task => isTaskAvailableForUnit(task, unitId));
    };

    // Function to get tasks with history for unit dashboard (includes removed tasks if completed)
    const getTasksWithHistoryForUnit = async (unitId: string): Promise<{
      available: Task[];
      completed: Task[];
      pending: Task[];
    }> => {
      try {
        // Buscar submissões da unidade
        const unitSubmissions = submissions.filter(sub => sub.unitId === unitId);
        const completedSubmissionTaskIds = new Set(
          unitSubmissions.filter(sub => sub.status === 'completed').map(sub => sub.taskId)
        );
        const pendingSubmissionTaskIds = new Set(
          unitSubmissions.filter(sub => sub.status === 'pending').map(sub => sub.taskId)
        );

        // Para tarefas concluídas, buscar também as removidas se houver submissão aprovada
        const { data: allTasks, error } = await supabase
          .from('tasks')
          .select('*')
          .or(`status.neq.removed,and(status.eq.removed,id.in.(${Array.from(completedSubmissionTaskIds).join(',') || 'null'}))`);

        if (error) throw error;

        const allTransformedTasks = (allTasks || []).map(transformTask);
        
        // Separar tarefas por categoria
        const available = allTransformedTasks.filter(task => 
          task.status !== 'removed' && 
          isTaskAvailableForUnit(task, unitId) && 
          !completedSubmissionTaskIds.has(task.id) && 
          !pendingSubmissionTaskIds.has(task.id)
        );

        const completed = allTransformedTasks.filter(task => 
          completedSubmissionTaskIds.has(task.id)
        );

        const pending = allTransformedTasks.filter(task => 
          task.status !== 'removed' &&
          pendingSubmissionTaskIds.has(task.id)
        );

        return { available, completed, pending };
      } catch (error) {
        console.error('Error fetching tasks with history:', error);
        // Fallback para método normal se houver erro
        const availableTasks = getTasksForUnit(unitId);
        const unitSubmissions = submissions.filter(sub => sub.unitId === unitId);
        const completedTaskIds = new Set(
          unitSubmissions.filter(sub => sub.status === 'completed').map(sub => sub.taskId)
        );
        const pendingTaskIds = new Set(
          unitSubmissions.filter(sub => sub.status === 'pending').map(sub => sub.taskId)
        );

        return {
          available: availableTasks.filter(task => 
            !completedTaskIds.has(task.id) && !pendingTaskIds.has(task.id)
          ),
          completed: availableTasks.filter(task => completedTaskIds.has(task.id)),
          pending: availableTasks.filter(task => pendingTaskIds.has(task.id))
        };
      }
    };

    // Alternative storage for task targeting when migration is not applied
    const storeTaskTargeting = async (taskId: string, targetUnits: string[]) => {
      try {
        // Store in localStorage as fallback
        const taskTargeting = JSON.parse(localStorage.getItem('taskTargeting') || '{}');
        taskTargeting[taskId] = targetUnits;
        localStorage.setItem('taskTargeting', JSON.stringify(taskTargeting));
        console.log('Task targeting stored in localStorage:', { taskId, targetUnits });
      } catch (error) {
        console.error('Error storing task targeting:', error);
      }
    };

    const resetAllStatistics = async (): Promise<boolean> => {
      try {
        // Delete all task submissions
        await supabase.from('task_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // Delete all attendances
        await supabase.from('weekly_attendances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // Delete all tasks
        await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
                // Reset all unit scores to 0
        await supabase.from('units').update({ score: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');
        
        // Clear task targeting from localStorage
        localStorage.removeItem('taskTargeting');
        
        // Refresh all data
        await Promise.all([
          fetchUnits(),
          fetchTasks(),
          fetchSubmissions(),
          fetchAttendances()
        ]);
        
        return true;
      } catch (error) {
        console.error('Error resetting statistics:', error);
        return false;
      }
    };

    const restoreAdminSession = async (): Promise<boolean> => {
      try {
        const saved = localStorage.getItem('adminAuthSession');
        if (saved) {
          const session: SavedAdminSession = JSON.parse(saved);
          
          // Check if session hasn't expired
          if (Date.now() < session.expiresAt) {
            setCurrentUser(session.user);
            return true; // Admin session restored
          } else {
            localStorage.removeItem('adminAuthSession'); // Clear expired session
          }
        }
      } catch (error) {
        console.error('Error restoring admin session:', error);
        localStorage.removeItem('adminAuthSession');
      }
      return false; // No valid admin session
    };

    const restoreSession = async (): Promise<boolean> => {
      try {
        // Try to restore admin session first
        const adminSessionRestored = await restoreAdminSession();
        if (adminSessionRestored) {
          return true;
        }

        // Then try to restore unit session
        const saved = localStorage.getItem('authSession');
        if (saved) {
          const session: SavedSession = JSON.parse(saved);
          
          // Check if session hasn't expired
          if (Date.now() < session.expiresAt) {
            setCurrentUser(session.user);
            return true; // Session restored
          } else {
            localStorage.removeItem('authSession'); // Clear expired session
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        localStorage.removeItem('authSession');
        localStorage.removeItem('adminAuthSession');
      }
      return false; // No valid session
    };

    useEffect(() => {
      const initializeData = async () => {
        setLoading(true);
        
        // Try to restore session first
        await restoreSession();
        
        // Load data regardless of session restoration
        await Promise.all([
          fetchUnits(),
          fetchTasks(),
          fetchSubmissions(),
          fetchAttendances(),
          fetchFormSettings()
        ]);
        
        setLoading(false);
      };

      initializeData();
    }, []);

    const attendanceFormEnabled = formSettings?.isEnabled || false;

    const value = {
      currentUser,
      units,
      tasks,
      submissions,
      attendances,
      formSettings,
      attendanceFormEnabled,
      loading,
      setCurrentUser,
      login,
      adminLogin,
      logout,
      createTask,
      deleteTask,
      submitTask,
      validateTask,
      updateUnitScore,
      updateUnitLogo,
      submitWeeklyAttendance,
      validateAttendance,
      toggleAttendanceFormAvailability,
      resetAllStatistics,
      fetchUnits,
      isTaskAvailableForUnit,
      getTasksForUnit,
      getTasksWithHistoryForUnit,
      isFormEnabledForUnit
    };

    
    
    return (
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    );
  } catch (error) {
    console.error('Error in AppProvider:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee', color: '#c33' }}>
        <h2>Erro no AppProvider</h2>
        <p>Ocorreu um erro na inicialização do contexto da aplicação:</p>
        <pre>{error?.toString()}</pre>
      </div>
    );
  }
};
