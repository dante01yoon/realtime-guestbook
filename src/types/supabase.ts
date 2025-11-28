export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          nickname: string;
          avatar_url: string | null;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          nickname: string;
          avatar_url?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          nickname?: string;
          avatar_url?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          created_at: string;
          message: string;
          image_url: string;
          user_id: string;
          author_profile_id: string | null;
          author: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          message: string;
          image_url: string;
          user_id: string;
          author_profile_id?: string | null;
          author?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          message?: string;
          image_url?: string;
          user_id?: string;
          author_profile_id?: string | null;
          author?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          entry_id: string;
          body: string;
          created_at: string;
          user_id: string;
          author_profile_id: string | null;
          author: string | null;
        };
        Insert: {
          id?: string;
          entry_id: string;
          body: string;
          created_at?: string;
          user_id: string;
          author_profile_id?: string | null;
          author?: string | null;
        };
        Update: {
          id?: string;
          entry_id?: string;
          body?: string;
          created_at?: string;
          user_id?: string;
          author_profile_id?: string | null;
          author?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
