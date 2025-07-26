import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Structured feedback interfaces
export interface WordChoiceFeedback {
  score: number | null;
  description: string | null;
}

export interface BodyLanguageFeedback {
  score: number | null;
  description: string | null;
}

export interface FillerWordFeedback {
  count: number;
  score: number | null;
  list: string[];
  description: string | null;
}

// Helper functions to parse feedback JSON
export const parseWordChoiceFeedback = (feedback: string | null): WordChoiceFeedback | null => {
  if (!feedback) return null;
  try {
    const parsed = JSON.parse(feedback);
    return typeof parsed === 'object' ? parsed : { score: null, description: feedback };
  } catch {
    return { score: null, description: feedback };
  }
};

export const parseBodyLanguageFeedback = (feedback: string | null): BodyLanguageFeedback | null => {
  if (!feedback) return null;
  try {
    const parsed = JSON.parse(feedback);
    return typeof parsed === 'object' ? parsed : { score: null, description: feedback };
  } catch {
    return { score: null, description: feedback };
  }
};

export const parseFillerWordFeedback = (feedback: string | null): FillerWordFeedback | null => {
  if (!feedback) return null;
  try {
    const parsed = JSON.parse(feedback);
    return typeof parsed === 'object' ? parsed : { count: 0, score: null, list: [], description: feedback };
  } catch {
    return { count: 0, score: null, list: [], description: feedback };
  }
};

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
          word_choice_feedback: string | null;
          body_language_feedback: string | null;
          filler_word_feedback: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          video_url?: string | null;
          score?: number | null;
          feedback_json?: any | null;
          submitted_at?: string;
          word_choice_feedback?: string | null;
          body_language_feedback?: string | null;
          filler_word_feedback?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          video_url?: string | null;
          score?: number | null;
          feedback_json?: any | null;
          submitted_at?: string;
          word_choice_feedback?: string | null;
          body_language_feedback?: string | null;
          filler_word_feedback?: string | null;
        };
      };
    };
  };
};