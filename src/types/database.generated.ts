export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      instruments: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          transposition_key: string | null
          tuning: string[]
          user_id: string | null
          written_offset: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          transposition_key?: string | null
          tuning?: string[]
          user_id?: string | null
          written_offset?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          transposition_key?: string | null
          tuning?: string[]
          user_id?: string | null
          written_offset?: number
        }
        Relationships: []
      }
      member_instruments: {
        Row: {
          id: string
          instrument_id: string
          is_primary: boolean
          organization_member_id: string
          transposition_key: string | null
        }
        Insert: {
          id?: string
          instrument_id: string
          is_primary?: boolean
          organization_member_id: string
          transposition_key?: string | null
        }
        Update: {
          id?: string
          instrument_id?: string
          is_primary?: boolean
          organization_member_id?: string
          transposition_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_instruments_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_instruments_organization_member_id_fkey"
            columns: ["organization_member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_song_notes: {
        Row: {
          created_at: string
          id: string
          instrument_id: string | null
          notes: string
          song_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instrument_id?: string | null
          notes?: string
          song_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instrument_id?: string | null
          notes?: string
          song_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_song_notes_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_song_notes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_transpositions: {
        Row: {
          created_at: string
          id: string
          input_notes: string
          instrument_id: string | null
          is_favorite: boolean
          original_key: string
          output_notes: string
          tags: string[]
          target_key: string
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["content_visibility"]
        }
        Insert: {
          created_at?: string
          id?: string
          input_notes: string
          instrument_id?: string | null
          is_favorite?: boolean
          original_key: string
          output_notes: string
          tags?: string[]
          target_key: string
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Update: {
          created_at?: string
          id?: string
          input_notes?: string
          instrument_id?: string | null
          is_favorite?: boolean
          original_key?: string
          output_notes?: string
          tags?: string[]
          target_key?: string
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "saved_transpositions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_item_assignments: {
        Row: {
          assigned_key: string | null
          id: string
          instrument_id: string
          material_id: string | null
          notes: string
          setlist_item_id: string
        }
        Insert: {
          assigned_key?: string | null
          id?: string
          instrument_id: string
          material_id?: string | null
          notes?: string
          setlist_item_id: string
        }
        Update: {
          assigned_key?: string | null
          id?: string
          instrument_id?: string
          material_id?: string | null
          notes?: string
          setlist_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_item_assignments_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_item_assignments_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "song_instrument_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_item_assignments_setlist_item_id_fkey"
            columns: ["setlist_item_id"]
            isOneToOne: false
            referencedRelation: "setlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_items: {
        Row: {
          created_at: string
          id: string
          notes: string
          position: number
          selected_key: string | null
          setlist_id: string
          song_id: string | null
          source_title: string
          title_snapshot: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string
          position: number
          selected_key?: string | null
          setlist_id: string
          song_id?: string | null
          source_title: string
          title_snapshot: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          position?: number
          selected_key?: string | null
          setlist_id?: string
          song_id?: string | null
          source_title?: string
          title_snapshot?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_items_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_items_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_private_notes: {
        Row: {
          id: string
          instrument_id: string | null
          notes: string
          setlist_item_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          instrument_id?: string | null
          notes?: string
          setlist_item_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          instrument_id?: string | null
          notes?: string
          setlist_item_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_private_notes_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlist_private_notes_setlist_item_id_fkey"
            columns: ["setlist_item_id"]
            isOneToOne: false
            referencedRelation: "setlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          created_at: string
          created_by: string
          id: string
          leader_notes: string
          organization_id: string
          service_date: string
          source_text: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          leader_notes?: string
          organization_id: string
          service_date: string
          source_text?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          leader_notes?: string
          organization_id?: string
          service_date?: string
          source_text?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      song_instrument_parts: {
        Row: {
          content_raw: string
          content_structured: Json
          created_at: string
          id: string
          instrument_id: string
          key: string | null
          notes: string
          song_id: string
          updated_at: string
        }
        Insert: {
          content_raw?: string
          content_structured?: Json
          created_at?: string
          id?: string
          instrument_id: string
          key?: string | null
          notes?: string
          song_id: string
          updated_at?: string
        }
        Update: {
          content_raw?: string
          content_structured?: Json
          created_at?: string
          id?: string
          instrument_id?: string
          key?: string | null
          notes?: string
          song_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_instrument_parts_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_instrument_parts_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_versions: {
        Row: {
          change_note: string
          content_raw: string
          content_structured: Json
          created_at: string
          created_by: string
          id: string
          key: string
          song_id: string
          source_instrument_name: string
          version: number
        }
        Insert: {
          change_note?: string
          content_raw: string
          content_structured: Json
          created_at?: string
          created_by: string
          id?: string
          key: string
          song_id: string
          source_instrument_name?: string
          version: number
        }
        Update: {
          change_note?: string
          content_raw?: string
          content_structured?: Json
          created_at?: string
          created_by?: string
          id?: string
          key?: string
          song_id?: string
          source_instrument_name?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "song_versions_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          accidental_preference: string
          artist: string | null
          content_raw: string
          content_structured: Json
          created_at: string
          current_key: string
          deleted_at: string | null
          forked_from_id: string | null
          id: string
          is_favorite: boolean
          organization_id: string | null
          original_key: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["content_visibility"]
        }
        Insert: {
          accidental_preference?: string
          artist?: string | null
          content_raw?: string
          content_structured?: Json
          created_at?: string
          current_key: string
          deleted_at?: string | null
          forked_from_id?: string | null
          id?: string
          is_favorite?: boolean
          organization_id?: string | null
          original_key: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Update: {
          accidental_preference?: string
          artist?: string | null
          content_raw?: string
          content_structured?: Json
          created_at?: string
          current_key?: string
          deleted_at?: string | null
          forked_from_id?: string | null
          id?: string
          is_favorite?: boolean
          organization_id?: string | null
          original_key?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["content_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "songs_forked_from_id_fkey"
            columns: ["forked_from_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_instruments: {
        Row: {
          created_at: string
          id: string
          instrument_name: string
          is_primary: boolean
          transpose_offset: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instrument_name: string
          is_primary?: boolean
          transpose_offset?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instrument_name?: string
          is_primary?: boolean
          transpose_offset?: number
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_organization_member_by_email: {
        Args: { target_email: string; target_org: string }
        Returns: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "organization_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      can_manage_setlist: { Args: { target_setlist: string }; Returns: boolean }
      can_manage_song: { Args: { target_song: string }; Returns: boolean }
      can_view_setlist: { Args: { target_setlist: string }; Returns: boolean }
      can_view_song: { Args: { target_song: string }; Returns: boolean }
      get_organization_members: {
        Args: { target_org: string }
        Returns: {
          display_name: string
          email: string
          member_id: string
          role: string
          user_id: string
        }[]
      }
      has_org_role: {
        Args: {
          allowed: Database["public"]["Enums"]["organization_role"][]
          target_org: string
        }
        Returns: boolean
      }
      is_org_member: { Args: { target_org: string }; Returns: boolean }
      set_organization_member_role: {
        Args: { target_member: string; target_role: string }
        Returns: undefined
      }
      soft_delete_song: { Args: { target_song: string }; Returns: undefined }
    }
    Enums: {
      content_visibility: "private" | "organization" | "community" | "public"
      organization_role: "owner" | "admin" | "director" | "musician"
      organization_type:
        | "church"
        | "band"
        | "school"
        | "community"
        | "choir"
        | "group"
        | "personal"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_visibility: ["private", "organization", "community", "public"],
      organization_role: ["owner", "admin", "director", "musician"],
      organization_type: [
        "church",
        "band",
        "school",
        "community",
        "choir",
        "group",
        "personal",
      ],
    },
  },
} as const
