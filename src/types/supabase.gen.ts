export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      allowed_users: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      fixed_cost_amounts: {
        Row: {
          amount: number
          created_at: string
          fixed_cost_id: string
          id: string
          valid_from: string
        }
        Insert: {
          amount: number
          created_at?: string
          fixed_cost_id: string
          id?: string
          valid_from: string
        }
        Update: {
          amount?: number
          created_at?: string
          fixed_cost_id?: string
          id?: string
          valid_from?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fixed_cost_amounts_fixed_cost_id_fkey'
            columns: ['fixed_cost_id']
            isOneToOne: false
            referencedRelation: 'fixed_costs'
            referencedColumns: ['id']
          },
        ]
      }
      fixed_cost_payments: {
        Row: {
          created_at: string
          fixed_cost_id: string
          id: string
          month: string
          paid_at: string
        }
        Insert: {
          created_at?: string
          fixed_cost_id: string
          id?: string
          month: string
          paid_at?: string
        }
        Update: {
          created_at?: string
          fixed_cost_id?: string
          id?: string
          month?: string
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fixed_cost_payments_fixed_cost_id_fkey'
            columns: ['fixed_cost_id']
            isOneToOne: false
            referencedRelation: 'fixed_costs'
            referencedColumns: ['id']
          },
        ]
      }
      fixed_costs: {
        Row: {
          created_at: string
          due_day: number | null
          id: string
          name: string
          sort: number
        }
        Insert: {
          created_at?: string
          due_day?: number | null
          id?: string
          name: string
          sort?: number
        }
        Update: {
          created_at?: string
          due_day?: number | null
          id?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
      other_incomes: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: string
          month: string
          note: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kind?: string
          month: string
          note?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          month?: string
          note?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          closing_time: string
          id: number
          open_days: number[]
          opening_date: string | null
          opening_fixed: number
          opening_purchases: number
          updated_at: string
        }
        Insert: {
          closing_time?: string
          id?: number
          open_days?: number[]
          opening_date?: string | null
          opening_fixed?: number
          opening_purchases?: number
          updated_at?: string
        }
        Update: {
          closing_time?: string
          id?: number
          open_days?: number[]
          opening_date?: string | null
          opening_fixed?: number
          opening_purchases?: number
          updated_at?: string
        }
        Relationships: []
      }
      week_closings: {
        Row: {
          closed_at: string
          note: string | null
          owner_take: number
          seller_payout: number
          surplus_at_close: number
          to_fixed: number
          week_start: string
        }
        Insert: {
          closed_at?: string
          note?: string | null
          owner_take?: number
          seller_payout: number
          surplus_at_close: number
          to_fixed: number
          week_start: string
        }
        Update: {
          closed_at?: string
          note?: string | null
          owner_take?: number
          seller_payout?: number
          surplus_at_close?: number
          to_fixed?: number
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_allowed_user: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
