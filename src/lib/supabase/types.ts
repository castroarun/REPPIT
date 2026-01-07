// Database types for Supabase
// These match the schema in PLAY-STORE-MIGRATION-PLAN.md

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          local_id: string | null
          name: string
          age: number
          height: number
          weight: number
          sex: 'male' | 'female' | null
          daily_steps: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal: 'lose' | 'maintain' | 'gain' | null
          exercise_ratings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          local_id?: string | null
          name: string
          age: number
          height: number
          weight: number
          sex?: 'male' | 'female' | null
          daily_steps?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal?: 'lose' | 'maintain' | 'gain' | null
          exercise_ratings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          local_id?: string | null
          name?: string
          age?: number
          height?: number
          weight?: number
          sex?: 'male' | 'female' | null
          daily_steps?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal?: 'lose' | 'maintain' | 'gain' | null
          exercise_ratings?: Json
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          profile_id: string
          exercise_id: string
          date: string
          sets: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          exercise_id: string
          date: string
          sets?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          exercise_id?: string
          date?: string
          sets?: Json
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string
          weight_unit: string
          last_visited_profile_id: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          weight_unit?: string
          last_visited_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          theme?: string
          weight_unit?: string
          last_visited_profile_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type DbProfile = Database['public']['Tables']['profiles']['Row']
export type DbProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type DbProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type DbWorkoutSession = Database['public']['Tables']['workout_sessions']['Row']
export type DbWorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert']

export type DbUser = Database['public']['Tables']['users']['Row']
export type DbUserPreferences = Database['public']['Tables']['user_preferences']['Row']
