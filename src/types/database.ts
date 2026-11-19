export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountType = 'checking' | 'savings' | 'cash' | 'investment'
export type MoneyFlow = 'income' | 'expense'
export type TransactionStatus = 'cleared' | 'pending'
export type CardBrand = 'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Hipercard' | 'Other'
export type InvoiceStatus = 'open' | 'closed' | 'paid'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          week_starts_on: number
          notify_budgets: boolean
          notify_invoices: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          week_starts_on?: number
          notify_budgets?: boolean
          notify_invoices?: boolean
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          week_starts_on?: number
          notify_budgets?: boolean
          notify_invoices?: boolean
        }
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: AccountType
          balance: number
          color: string
          institution: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: AccountType
          balance?: number
          color?: string
          institution?: string | null
          is_archived?: boolean
        }
        Update: {
          name?: string
          type?: AccountType
          balance?: number
          color?: string
          institution?: string | null
          is_archived?: boolean
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: MoneyFlow
          icon: string
          color: string
          monthly_budget: number | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: MoneyFlow
          icon?: string
          color?: string
          monthly_budget?: number | null
          is_archived?: boolean
        }
        Update: {
          name?: string
          type?: MoneyFlow
          icon?: string
          color?: string
          monthly_budget?: number | null
          is_archived?: boolean
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: CardBrand
          credit_limit: number
          closing_day: number
          due_day: number
          color: string
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand: CardBrand
          credit_limit: number
          closing_day: number
          due_day: number
          color?: string
          is_archived?: boolean
        }
        Update: {
          name?: string
          brand?: CardBrand
          credit_limit?: number
          closing_day?: number
          due_day?: number
          color?: string
          is_archived?: boolean
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string
          description: string
          amount: number
          type: MoneyFlow
          status: TransactionStatus
          occurred_on: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id: string
          description: string
          amount: number
          type: MoneyFlow
          status?: TransactionStatus
          occurred_on?: string
          notes?: string | null
        }
        Update: {
          account_id?: string
          category_id?: string
          description?: string
          amount?: number
          type?: MoneyFlow
          status?: TransactionStatus
          occurred_on?: string
          notes?: string | null
        }
        Relationships: []
      }
      credit_card_invoices: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string
          reference_month: string
          closing_date: string
          due_date: string
          total_amount: number
          status: InvoiceStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id: string
          reference_month: string
          closing_date: string
          due_date: string
          total_amount?: number
          status?: InvoiceStatus
        }
        Update: {
          reference_month?: string
          closing_date?: string
          due_date?: string
          total_amount?: number
          status?: InvoiceStatus
        }
        Relationships: []
      }
      credit_card_purchases: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string
          invoice_id: string | null
          category_id: string
          description: string
          amount: number
          purchased_on: string
          installments: number
          installment_number: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id: string
          invoice_id?: string | null
          category_id: string
          description: string
          amount: number
          purchased_on: string
          installments?: number
          installment_number?: number
        }
        Update: {
          invoice_id?: string | null
          category_id?: string
          description?: string
          amount?: number
          purchased_on?: string
          installments?: number
          installment_number?: number
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          month: string
          amount_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          month: string
          amount_limit: number
        }
        Update: {
          category_id?: string
          month?: string
          amount_limit?: number
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string | null
          color: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline?: string | null
          color?: string
          is_completed?: boolean
        }
        Update: {
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string | null
          color?: string
          is_completed?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      v_account_balances: {
        Row: {
          id: string
          user_id: string
          name: string
          type: AccountType
          color: string
          computed_balance: number
        }
        Relationships: []
      }
      v_credit_card_usage: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: CardBrand
          credit_limit: number
          color: string
          used_amount: number
          available_amount: number
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
