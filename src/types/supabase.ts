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
      entries: {
        Row: {
          id: string;
          created_at: string;
          author: string;
          message: string;
          image_url: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          author: string;
          message: string;
          image_url: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          author?: string;
          message?: string;
          image_url?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          entry_id: string;
          author: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          author: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          entry_id?: string;
          author?: string;
          body?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
