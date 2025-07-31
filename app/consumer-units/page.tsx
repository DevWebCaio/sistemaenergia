"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ConsumerUnit {
  id: string
  name: string
  address: string
  installation_number: string
  distributor_id: string
  monthly_consumption: number
  tariff_class: string
  status: "active" | "inactive" | "pending" | "suspended"
  created_at: string
}

export default function ConsumerUnitsPage() {
  const [consumerUnits, setConsumerUnits] = useState<ConsumerUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadConsumerUnits()
  }, [])

  const loadConsumerUnits = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('consumer_units')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setConsumerUnits(data || [])
    } catch (error) {
      console.error("Erro ao carregar UCs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "suspended": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUnits = consumerUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.installation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Unidades Consumidoras</h1>
          <p className="text-gray-600">Gestão de pontos de consumo de energia</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova UC
          </Button>
        </div>
      </div>

      {/* Lista de UCs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Unidades Consumidoras</h3>
          <p className="text-sm text-gray-600 mt-1">
            Lista de todas as unidades consumidoras cadastradas
          </p>
        </div>
        <div className="px-6 py-4">
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar UCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Instalação</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Distribuidora</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Consumo Mensal</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{unit.name}</div>
                      <div className="text-sm text-gray-500">{unit.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{unit.installation_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">{unit.distributor_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {unit.monthly_consumption.toLocaleString('pt-BR')} kWh
                      </div>
                      <div className="text-sm text-gray-500">Classe {unit.tariff_class}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(unit.status)}>
                        {unit.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 