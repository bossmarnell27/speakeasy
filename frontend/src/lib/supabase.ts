import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'teacher' | 'student';
          name: string;
        };
        Insert: {
          id: string;
          role: 'teacher' | 'student';
          name: string;
        };
        Update: {
          id?: string;
          role?: 'teacher' | 'student';
          name?: string;
        };
      };
      class: {
        Row: {
          id: string;
          name: string;
          join_code: string;
          teacher_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          join_code: string;
          teacher_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          join_code?: string;
          teacher_id?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string;
          due_date: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          due_date: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          due_date?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          video_url: string | null;
          score: number | null;
          feedback_json: any | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          video_url?: string | null;
          score?: number | null;
          feedback_json?: any | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          video_url?: string | null;
          score?: number | null;
          feedback_json?: any | null;
          submitted_at?: string;
        };
      };
    };
  };
};