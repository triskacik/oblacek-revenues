// Bootstrap of `supabase gen types typescript` for supabase/migrations/20261109120000_initial_schema.sql.
// Do not edit by hand — once the Supabase project is linked, regenerate with `npm run db:types`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
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
          id: string
          date: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          date: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      other_incomes: {
        Row: {
          id: string
          month: string
          kind: string
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          month: string
          kind?: string
          amount: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          month?: string
          kind?: string
          amount?: number
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      fixed_costs: {
        Row: {
          id: string
          name: string
          due_day: number | null
          sort: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          due_day?: number | null
          sort?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          due_day?: number | null
          sort?: number
          created_at?: string
        }
        Relationships: []
      }
      fixed_cost_amounts: {
        Row: {
          id: string
          fixed_cost_id: string
          valid_from: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          fixed_cost_id: string
          valid_from: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          fixed_cost_id?: string
          valid_from?: string
          amount?: number
          created_at?: string
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
          id: string
          fixed_cost_id: string
          month: string
          paid_at: string
          created_at: string
        }
        Insert: {
          id?: string
          fixed_cost_id: string
          month: string
          paid_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          fixed_cost_id?: string
          month?: string
          paid_at?: string
          created_at?: string
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
      week_closings: {
        Row: {
          week_start: string
          seller_payout: number
          to_fixed: number
          owner_take: number
          surplus_at_close: number
          note: string | null
          closed_at: string
        }
        Insert: {
          week_start: string
          seller_payout: number
          to_fixed: number
          owner_take?: number
          surplus_at_close: number
          note?: string | null
          closed_at?: string
        }
        Update: {
          week_start?: string
          seller_payout?: number
          to_fixed?: number
          owner_take?: number
          surplus_at_close?: number
          note?: string | null
          closed_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          opening_date: string | null
          opening_fixed: number
          opening_purchases: number
          updated_at: string
        }
        Insert: {
          id?: number
          opening_date?: string | null
          opening_fixed?: number
          opening_purchases?: number
          updated_at?: string
        }
        Update: {
          id?: number
          opening_date?: string | null
          opening_fixed?: number
          opening_purchases?: number
          updated_at?: string
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

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
