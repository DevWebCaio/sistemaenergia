import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseClient: any = null

export const createClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not found. Using mock client for development.")
    // Return a stable mock client for development
    supabaseClient = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (callback: any) => {
          // Return a stable subscription object
          return {
            data: {
              subscription: {
                unsubscribe: () => {},
              },
            },
          }
        },
        signInWithPassword: async () => ({ error: { message: "Supabase not configured" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
      }),
    }
    return supabaseClient
  }

  supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "distributor" | "client" | "beneficiary"
          company_name: string | null
          cnpj: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "distributor" | "client" | "beneficiary"
          company_name?: string | null
          cnpj?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "admin" | "distributor" | "client" | "beneficiary"
          company_name?: string | null
          cnpj?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consumer_units: {
        Row: {
          id: string
          profile_id: string
          name: string
          address: string
          installation_number: string
          distributor_id: string
          monthly_consumption: number
          tariff_class: string
          status: "active" | "inactive" | "pending"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          address: string
          installation_number: string
          distributor_id: string
          monthly_consumption: number
          tariff_class: string
          status?: "active" | "inactive" | "pending"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          address?: string
          installation_number?: string
          distributor_id?: string
          monthly_consumption?: number
          tariff_class?: string
          status?: "active" | "inactive" | "pending"
          created_at?: string
          updated_at?: string
        }
      }
      generating_units: {
        Row: {
          id: string
          name: string
          address: string
          capacity_kw: number
          distributor_id: string
          status: "active" | "inactive" | "maintenance"
          installation_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          capacity_kw: number
          distributor_id: string
          status?: "active" | "inactive" | "maintenance"
          installation_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          capacity_kw?: number
          distributor_id?: string
          status?: "active" | "inactive" | "maintenance"
          installation_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      energy_readings: {
        Row: {
          id: string
          generating_unit_id: string
          reading_date: string
          generated_kwh: number
          injected_kwh: number
          consumed_kwh: number
          created_at: string
        }
        Insert: {
          id?: string
          generating_unit_id: string
          reading_date: string
          generated_kwh: number
          injected_kwh: number
          consumed_kwh: number
          created_at?: string
        }
        Update: {
          id?: string
          generating_unit_id?: string
          reading_date?: string
          generated_kwh?: number
          injected_kwh?: number
          consumed_kwh?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          consumer_unit_id: string
          invoice_number: string
          reference_month: string
          due_date: string
          amount: number
          energy_consumed: number
          energy_compensated: number
          status: "pending" | "paid" | "overdue" | "cancelled"
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          consumer_unit_id: string
          invoice_number: string
          reference_month: string
          due_date: string
          amount: number
          energy_consumed: number
          energy_compensated: number
          status?: "pending" | "paid" | "overdue" | "cancelled"
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          consumer_unit_id?: string
          invoice_number?: string
          reference_month?: string
          due_date?: string
          amount?: number
          energy_consumed?: number
          energy_compensated?: number
          status?: "pending" | "paid" | "overdue" | "cancelled"
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
