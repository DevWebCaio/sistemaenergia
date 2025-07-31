"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PowerPlant {
  id: string
  name: string
  cnpj: string
  installed_power_kwp: number
  operation_date: string
  linked_consumer_unit_id?: string
  status: "active" | "inactive" | "maintenance"
  address?: string
  distributor_company?: string
  created_at: string
}

export default function PowerPlantsPage() {
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadPowerPlants()
  }, [])

  const loadPowerPlants = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('power_plants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPowerPlants(data || [])
    } catch (error) {
      console.error("Erro ao carregar usinas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "maintenance": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPlants = powerPlants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.cnpj.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.status.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Usinas de Energia</h1>
          <p className="text-gray-600">Gestão de plantas de geração solar</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Usina
          </Button>
        </div>
      </div>

      {/* Lista de Usinas */}
      <Card>
        <CardHeader>
          <CardTitle>Usinas de Energia</CardTitle>
          <CardDescription>
            Lista de todas as usinas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">CNPJ</th>
                  <th className="text-left py-3 px-4">Potência</th>
                  <th className="text-left py-3 px-4">Data Operação</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr key={plant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{plant.name}</div>
                      <div className="text-sm text-gray-500">{plant.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{plant.cnpj}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {plant.installed_power_kwp.toLocaleString('pt-BR')} kWp
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(plant.operation_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(plant.status)}>
                        {plant.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 