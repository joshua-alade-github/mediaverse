import { MediaType } from ".";

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
      genres: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      
      media_genres: {
        Row: {
          id: string;
          media_id: string;
          genre_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          genre_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          genre_id?: string;
          created_at?: string;
        };
      };

      creators: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };

      media_creators: {
        Row: {
          id: string;
          media_id: string;
          creator_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_id: string;
          creator_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_id?: string;
          creator_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          media_type: MediaType;
          release_date: string | null;
          cover_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          media_type: MediaType;
          release_date?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          media_type?: MediaType;
          release_date?: string | null;
          cover_image?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          is_private: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          is_private?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          is_private?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
      };
      backups: {
        Row: {
          id: string;
          user_id: string;
          size: number;
          file_url: string | null;
          status: string;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          size: number;
          file_url?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          size?: number;
          file_url?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      backup_items: {
        Row: {
          id: string;
          backup_id: string;
          item_type: string;
          item_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          backup_id: string;
          item_type: string;
          item_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          backup_id?: string;
          item_type?: string;
          item_count?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      media_type: MediaType;
    };
  };
}