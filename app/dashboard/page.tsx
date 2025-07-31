"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Building2, 
  Zap, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus,
  FileText,
  Upload,
  Settings
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardStats {
  totalConsumerUnits: number
  totalPowerPlants: number
  totalCapacity: number
  monthlyRevenue: number
  activeContracts: number
  pendingInvoices: number
}

interface RecentActivity {
  id: string
  type: "contract" | "invoice" | "uc" | "plant"
  title: string
  description: string
  status: "success" | "pending" | "warning"
  timestamp: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalConsumerUnits: 0,
    totalPowerPlants: 0,
    totalCapacity: 0,
    monthlyRevenue: 0,
    activeContracts: 0,
    pendingInvoices: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas
      const { data: consumerUnits } = await supabase
        .from('consumer_units')
        .select('id')
      
      const { data: powerPlants } = await supabase
        .from('power_plants')
        .select('id, installed_power_kwp')
      
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, amount, status')
      
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, status')
      
      // Calcular métricas
      const totalUCs = consumerUnits?.length || 0
      const totalPlants = powerPlants?.length || 0
      const totalCapacity = powerPlants?.reduce((sum, plant) => sum + (plant.installed_power_kwp || 0), 0) || 0
      const monthlyRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
      const activeContracts = contracts?.filter(c => c.status === 'active').length || 0
      const pendingInvoices = invoices?.filter(i => i.status === 'pending').length || 0

      setStats({
        totalConsumerUnits: totalUCs,
        totalPowerPlants: totalPlants,
        totalCapacity: totalCapacity,
        monthlyRevenue: monthlyRevenue,
        activeContracts: activeContracts,
        pendingInvoices: pendingInvoices
      })

      // Mock de atividades recentes
      setRecentActivity([
        {
          id: "1",
          type: "contract",
          title: "Novo contrato assinado",
          description: "Contrato #CTR-2024-001 para UC 123456",
          status: "success",
          timestamp: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          type: "invoice",
          title: "Fatura gerada",
          description: "Fatura #INV-2024-001 - R$ 1.250,00",
          status: "pending",
          timestamp: "2024-01-15T09:15:00Z"
        },
        {
          id: "3",
          type: "uc",
          title: "Nova UC cadastrada",
          description: "Unidade Consumidora 789012",
          status: "success",
          timestamp: "2024-01-14T16:45:00Z"
        }
      ])

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "warning": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contract": return <FileText className="h-4 w-4" />
      case "invoice": return <DollarSign className="h-4 w-4" />
      case "uc": return <Building2 className="h-4 w-4" />
      case "plant": return <Zap className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de gestão solar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Faturas
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova UC
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Consumidoras</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConsumerUnits}</div>
            <p className="text-xs text-muted-foreground">
              +2 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usinas de Energia</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPowerPlants}</div>
            <p className="text-xs text-muted-foreground">
              Capacidade total: {stats.totalCapacity.toFixed(1)} kWp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Eficiência média das usinas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 novos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Building2 className="h-6 w-6 mb-2" />
              <span className="text-sm">Nova UC</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Zap className="h-6 w-6 mb-2" />
              <span className="text-sm">Nova Usina</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Novo Contrato</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Nova Fatura</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 