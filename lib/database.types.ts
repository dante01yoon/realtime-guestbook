export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "comments_entry_id_fkey";
            columns: ["entry_id"];
            referencedRelation: "entries";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
