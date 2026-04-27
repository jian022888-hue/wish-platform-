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
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          summary: string;
          origin_label: string | null;
          description: string;
          why_important: string;
          current_blocker: string;
          desired_response_types: string[];
          category: string;
          status: string;
          response_count: number;
          featured: boolean;
          allow_anonymous: boolean;
          allow_platform_support: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          summary?: string;
          origin_label?: string | null;
          description: string;
          why_important: string;
          current_blocker: string;
          desired_response_types: string[];
          category?: string;
          status?: string;
          response_count?: number;
          featured?: boolean;
          allow_anonymous?: boolean;
          allow_platform_support?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          summary?: string;
          origin_label?: string | null;
          description?: string;
          why_important?: string;
          current_blocker?: string;
          desired_response_types?: string[];
          category?: string;
          status?: string;
          response_count?: number;
          featured?: boolean;
          allow_anonymous?: boolean;
          allow_platform_support?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          wish_id: string;
          user_id: string;
          author_name: string;
          is_anonymous: boolean;
          type: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wish_id: string;
          user_id: string;
          author_name: string;
          is_anonymous?: boolean;
          type: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wish_id?: string;
          user_id?: string;
          author_name?: string;
          is_anonymous?: boolean;
          type?: string;
          content?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          wish_context_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          wish_context_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          wish_context_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      message_requests: {
        Row: {
          id: string;
          conversation_id: string;
          receiver_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          receiver_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          receiver_id?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
