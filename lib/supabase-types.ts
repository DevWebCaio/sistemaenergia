export interface PowerPlant {
  id: string
  name: string
  cnpj: string
  installed_power_kwp: number
  operation_date: string
  linked_consumer_unit_id: string | null
  status: "active" | "inactive" | "maintenance"
  address?: string
  distributor_company?: string
  created_at: string
  updated_at: string
}

export interface ConsumerUnit {
  id: string
  name: string
  installation_number: string
  address: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  cnpj?: string
  stage: "lead" | "contacted" | "proposal_sent" | "contract_signed" | "activated"
  source?: string
  notes?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  consumer_unit_id: string
  invoice_id?: string
  amount: number
  due_date: string
  payment_date?: string
  status: "paid" | "pending" | "overdue" | "scheduled"
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  description?: string
  category: string
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  profile_id: string
  contract_number: string
  contract_type: "generation" | "consumption" | "shared"
  start_date: string
  end_date?: string
  status: "draft" | "pending_signature" | "active" | "cancelled" | "expired"
  digital_signature_url?: string
  pdf_url?: string
  terms?: string
  created_at: string
  updated_at: string
}
