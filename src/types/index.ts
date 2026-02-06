export interface User {
  type: 'admin' | 'unit';
  unitId?: string;
  password?: string; // Add password property for admin verification
}

export interface Unit {
  id: string;
  name: string;
  logo?: string;
  password: string;
  score: number;
  tasks: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  deadline: string;
  status: 'active' | 'expired' | 'removed';
  createdAt: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'very_hard' | 'legendary';
  category?: string;
  targetUnits?: string[]; // Array de IDs das unidades alvo. null/undefined = todas as unidades
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  unitId: string;
  proof: string;
  submittedAt: string;
  status: 'pending' | 'completed' | 'rejected';
  adminFeedback?: string;
}

export interface WeeklyAttendance {
  id: string;
  unitId: string;
  date: string;
  presentMembers: string[];
  punctualCount: number;
  neckerchiefCount: number;
  uniformCount: number;
  broughtFlag: boolean;
  broughtBible: boolean;
  photoUrl?: string;
  submittedAt: string;
  status: 'pending' | 'validated' | 'rejected';
  score: number;
  adminFeedback?: string;
}

export interface FormSettings {
  id: string;
  formType: string;
  isEnabled: boolean;
  enabledUnits: string[];
  updatedAt: string;
}

// New types for enhanced functionality
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  authorType: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  status: 'draft' | 'published' | 'archived';
}



export interface SystemNotification {
  id: string;
  unitId?: string;
  title: string;
  message: string;
  type: 'task_created' | 'attendance_approved' | 'news_published' | 'poll_created' | 'general';
  icon?: string;
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
}

// Supabase types with snake_case
export interface SupabaseUnit {
  id: string;
  name: string;
  logo?: string;
  password: string;
  score: number;
  created_at: string;
}

export interface SupabaseTask {
  id: string;
  title: string;
  description: string;
  points: number;
  deadline: string;
  status: string;
  created_at: string;
  difficulty?: string;
  category?: string;
  target_units?: string[];
}

export interface SupabaseTaskSubmission {
  id: string;
  task_id: string;
  unit_id: string;
  proof: string;
  submitted_at: string;
  status: string;
  admin_feedback?: string;
}

export interface SupabaseWeeklyAttendance {
  id: string;
  unit_id: string;
  date: string;
  present_members: string[];
  punctual_count: number;
  neckerchief_count: number;
  uniform_count: number;
  brought_flag: boolean;
  brought_bible: boolean;
  photo_url: string | null;
  submitted_at: string;
  status: string;
  score: number;
  admin_feedback?: string;
}

export interface SupabaseNewsItem {
  id: string;
  title: string;
  content: string;
  author_type: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  status: string;
}



export interface SupabaseSystemNotification {
  id: string;
  unit_id?: string;
  title: string;
  message: string;
  type: string;
  icon?: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
}
