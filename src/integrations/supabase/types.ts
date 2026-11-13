export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          itinerary_id: string | null
          role: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          itinerary_id?: string | null
          role?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          itinerary_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      geocode_cache: {
        Row: {
          lat: number | null
          lng: number | null
          query: string
          updated_at: string | null
        }
        Insert: {
          lat?: number | null
          lng?: number | null
          query: string
          updated_at?: string | null
        }
        Update: {
          lat?: number | null
          lng?: number | null
          query?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      itineraries: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          plan_date: string | null
          preference_id: string | null
          share_slug: string | null
          status: string | null
          title: string
          total_cost: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          plan_date?: string | null
          preference_id?: string | null
          share_slug?: string | null
          status?: string | null
          title: string
          total_cost?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          plan_date?: string | null
          preference_id?: string | null
          share_slug?: string | null
          status?: string | null
          title?: string
          total_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_preference_id_fkey"
            columns: ["preference_id"]
            isOneToOne: false
            referencedRelation: "preferences"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          end_time: string | null
          est_cost: number | null
          id: string
          itinerary_id: string
          place_id: string
          position: number | null
          reason: string | null
          start_time: string | null
          travel_min_from_prev: number | null
          verify_note: string | null
        }
        Insert: {
          end_time?: string | null
          est_cost?: number | null
          id?: string
          itinerary_id: string
          place_id: string
          position?: number | null
          reason?: string | null
          start_time?: string | null
          travel_min_from_prev?: number | null
          verify_note?: string | null
        }
        Update: {
          end_time?: string | null
          est_cost?: number | null
          id?: string
          itinerary_id?: string
          place_id?: string
          position?: number | null
          reason?: string | null
          start_time?: string | null
          travel_min_from_prev?: number | null
          verify_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          avg_cost_eur: number
          avg_duration_min: number | null
          category: string
          description: string | null
          external_url: string | null
          id: string
          indoor: boolean | null
          is_verified: boolean | null
          lat: number
          lng: number
          name: string
          neighborhood: string
          opening_hours: Json | null
          price_level: number | null
          tags: string[] | null
        }
        Insert: {
          address?: string | null
          avg_cost_eur?: number
          avg_duration_min?: number | null
          category: string
          description?: string | null
          external_url?: string | null
          id?: string
          indoor?: boolean | null
          is_verified?: boolean | null
          lat: number
          lng: number
          name: string
          neighborhood: string
          opening_hours?: Json | null
          price_level?: number | null
          tags?: string[] | null
        }
        Update: {
          address?: string | null
          avg_cost_eur?: number
          avg_duration_min?: number | null
          category?: string
          description?: string | null
          external_url?: string | null
          id?: string
          indoor?: boolean | null
          is_verified?: boolean | null
          lat?: number
          lng?: number
          name?: string
          neighborhood?: string
          opening_hours?: Json | null
          price_level?: number | null
          tags?: string[] | null
        }
        Relationships: []
      }
      preferences: {
        Row: {
          budget_pp: number | null
          companions: string | null
          constraints: Json | null
          created_at: string | null
          date_range: unknown
          id: string
          interests: string[] | null
          mood_text: string | null
          pace: string | null
          user_id: string
        }
        Insert: {
          budget_pp?: number | null
          companions?: string | null
          constraints?: Json | null
          created_at?: string | null
          date_range?: unknown
          id?: string
          interests?: string[] | null
          mood_text?: string | null
          pace?: string | null
          user_id: string
        }
        Update: {
          budget_pp?: number | null
          companions?: string | null
          constraints?: Json | null
          created_at?: string | null
          date_range?: unknown
          id?: string
          interests?: string[] | null
          mood_text?: string | null
          pace?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          home_city: string | null
          id: string
          plan_tier: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          home_city?: string | null
          id: string
          plan_tier?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          home_city?: string | null
          id?: string
          plan_tier?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      read_shared_plan: { Args: { slug: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
