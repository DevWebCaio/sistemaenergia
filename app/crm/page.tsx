"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Phone,
  Mail,
  Building
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company_name?: string
  cnpj?: string
  stage: "lead" | "contacted" | "qualified" | "proposal_sent" | "negotiation" | "contract_signed" | "activated" | "lost"
  source?: string
  notes?: string
  assigned_to?: string
  monthly_consumption: number
  interest_level: "low" | "medium" | "high"
  last_contact?: string
  next_followup?: string
  created_at: string
}

const stages = [
  { key: "lead", label: "Lead", color: "bg-gray-100 text-gray-800" },
  { key: "contacted", label: "Contactado", color: "bg-blue-100 text-blue-800" },
  { key: "qualified", label: "Qualificado", color: "bg-yellow-100 text-yellow-800" },
  { key: "proposal_sent", label: "Proposta Enviada", color: "bg-purple-100 text-purple-800" },
  { key: "negotiation", label: "Negociação", color: "bg-orange-100 text-orange-800" },
  { key: "contract_signed", label: "Contrato Assinado", color: "bg-green-100 text-green-800" },
  { key: "activated", label: "Ativado", color: "bg-emerald-100 text-emerald-800" },
  { key: "lost", label: "Perdido", color: "bg-red-100 text-red-800" }
]

export default function CRMPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getClientsByStage = (stage: string) => {
    return clients.filter(client => client.stage === stage)
  }

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-600">Pipeline de vendas e gestão de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {stages.map((stage) => (
          <div key={stage.key} className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[500px]">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{stage.label}</h3>
                <Badge className={stage.color}>
                  {getClientsByStage(stage.key).length}
                </Badge>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {getClientsByStage(stage.key).map((client) => (
                <div key={client.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="font-medium text-sm text-gray-900">{client.name}</div>
                  {client.company_name && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Building className="h-3 w-3" />
                      {client.company_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                  )}
                  <div className="mt-2">
                    <Badge className={getInterestLevelColor(client.interest_level)}>
                      {client.interest_level}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {client.monthly_consumption.toLocaleString('pt-BR')} kWh/mês
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 