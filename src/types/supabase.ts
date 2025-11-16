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
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          created_at: string;
          message: string;
          image_url: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          message: string;
          image_url: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          message?: string;
          image_url?: string;
          user_id?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          entry_id: string;
          body: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          body: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          body?: string;
          created_at?: string;
          user_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
