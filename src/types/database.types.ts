// Stub types for development — replace by running:
// npx supabase gen types typescript --linked > src/types/database.types.ts

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_due_soon"
  | "task_overdue"
  | "task_completed";
export type UserRole = "admin" | "member";

export type Database = {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          department_id: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          department_id?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          department_id?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          actividad: string | null;
          origen: string | null;
          description: string | null;
          department_id: string;
          created_by: string;
          status: TaskStatus;
          priority: TaskPriority;
          progress: number;
          start_date: string | null;
          plazo_legal: string | null;
          plazo_interno: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          actividad?: string | null;
          origen?: string | null;
          description?: string | null;
          department_id: string;
          created_by: string;
          status?: TaskStatus;
          priority?: TaskPriority;
          progress?: number;
          start_date?: string | null;
          plazo_legal?: string | null;
          plazo_interno: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          actividad?: string | null;
          origen?: string | null;
          description?: string | null;
          department_id?: string;
          status?: TaskStatus;
          priority?: TaskPriority;
          progress?: number;
          start_date?: string | null;
          plazo_legal?: string | null;
          plazo_interno?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      task_assignees: {
        Row: {
          task_id: string;
          profile_id: string;
          assigned_at: string;
        };
        Insert: {
          task_id: string;
          profile_id: string;
          assigned_at?: string;
        };
        Update: {
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_assignees_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          type: NotificationType;
          title: string;
          body: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          type: NotificationType;
          title: string;
          body?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      email_notification_log: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          trigger_days: number;
          sent_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          trigger_days: number;
          sent_at?: string;
        };
        Update: {
          sent_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_notification_log_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      tasks_with_status: {
        Row: {
          id: string;
          title: string;
          actividad: string | null;
          origen: string | null;
          description: string | null;
          department_id: string;
          created_by: string;
          status: TaskStatus;
          priority: TaskPriority;
          progress: number;
          start_date: string | null;
          plazo_legal: string | null;
          plazo_interno: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          deadline_status: "overdue" | "due_soon_15" | "due_soon_30" | "on_track";
          legal_deadline_warning: boolean;
          assignee_ids: string[] | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
};
