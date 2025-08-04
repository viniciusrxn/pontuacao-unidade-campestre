
import type { Database } from '@/integrations/supabase/types';

// Define type aliases for convenience
export type Units = Database['public']['Tables']['units']['Row'];
export type Tasks = Database['public']['Tables']['tasks']['Row'];
export type TaskSubmissions = Database['public']['Tables']['task_submissions']['Row'];
export type WeeklyAttendances = Database['public']['Tables']['weekly_attendances']['Row'];

// You can also define insert types for when you're creating new records
export type UnitsInsert = Database['public']['Tables']['units']['Insert'];
export type TasksInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskSubmissionsInsert = Database['public']['Tables']['task_submissions']['Insert'];
export type WeeklyAttendancesInsert = Database['public']['Tables']['weekly_attendances']['Insert'];

// Additional types for your app that reference the Supabase types
export type Unit = Units;
export type Task = Tasks;
export type TaskSubmission = TaskSubmissions;
export type WeeklyAttendance = WeeklyAttendances;

export type User = {
  type: 'unit' | 'admin';
  unitId?: string;
};
