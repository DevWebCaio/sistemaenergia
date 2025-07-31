"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Battery, 
  TrendingUp, 
  TrendingDown,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface EnergyVaultData {
  id: string
  consumer_unit_id: string
  month_year: string
  initial_balance: number
  energy_generated: number
  energy_consumed: number
  energy_injected: number
  final_balance: number
  created_at: string
}

export default function EnergyVaultPage() {
  const [vaultData, setVaultData] = useState<EnergyVaultData[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalGenerated: 0,
    totalConsumed: 0,
    totalInjected: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadEnergyVaultData()
  }, [])

  const loadEnergyVaultData = async () => {
    try {
      setLoading(true)
      
      // Mock data para demonstração
      const mockData: EnergyVaultData[] = [
        {
          id: "1",
          consumer_unit_id: "UC001",
          month_year: "2024-01",
          initial_balance: 150.5,
          energy_generated: 450.2,
          energy_consumed: 320.8,
          energy_injected: 129.4,
          final_balance: 279.1,
          created_at: "2024-01-31T23:59:59Z"
        },
        {
          id: "2",
          consumer_unit_id: "UC002",
          month_year: "2024-01",
          initial_balance: 89.3,
          energy_generated: 380.7,
          energy_consumed: 245.1,
          energy_injected: 135.6,
          final_balance: 224.9,
          created_at: "2024-01-31T23:59:59Z"
        },
        {
          id: "3",
          consumer_unit_id: "UC003",
          month_year: "2024-01",
          initial_balance: 0,
          energy_generated: 520.4,
          energy_consumed: 410.2,
          energy_injected: 110.2,
          final_balance: 110.2,
          created_at: "2024-01-31T23:59:59Z"
        }
      ]

      setVaultData(mockData)

      // Calcular estatísticas
      const totalBalance = mockData.reduce((sum, item) => sum + item.final_balance, 0)
      const totalGenerated = mockData.reduce((sum, item) => sum + item.energy_generated, 0)
      const totalConsumed = mockData.reduce((sum, item) => sum + item.energy_consumed, 0)
      const totalInjected = mockData.reduce((sum, item) => sum + item.energy_injected, 0)

      setStats({
        totalBalance,
        totalGenerated,
        totalConsumed,
        totalInjected
      })

    } catch (error) {
      console.error("Erro ao carregar dados do cofre energético:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (balance: number) => {
    if (balance > 100) return <Badge className="bg-green-100 text-green-800">Saldo Alto</Badge>
    if (balance > 50) return <Badge className="bg-yellow-100 text-yellow-800">Saldo Médio</Badge>
    return <Badge className="bg-red-100 text-red-800">Saldo Baixo</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cofre Energético</h1>
          <p className="text-gray-600 mt-2">
            Gestão e monitoramento dos saldos energéticos das unidades consumidoras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Battery className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalBalance.toFixed(1)} kWh
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Saldo energético disponível
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Gerada</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalGenerated.toFixed(1)} kWh
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total gerado este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Consumida</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.totalConsumed.toFixed(1)} kWh
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total consumido este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energia Injetada</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalInjected.toFixed(1)} kWh
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total injetado na rede
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saldos</CardTitle>
          <CardDescription>
            Acompanhe o histórico de saldos energéticos por unidade consumidora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidade Consumidora</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Saldo Inicial</TableHead>
                <TableHead>Gerado</TableHead>
                <TableHead>Consumido</TableHead>
                <TableHead>Injetado</TableHead>
                <TableHead>Saldo Final</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaultData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.consumer_unit_id}</TableCell>
                  <TableCell>{item.month_year}</TableCell>
                  <TableCell>{item.initial_balance.toFixed(1)} kWh</TableCell>
                  <TableCell>{item.energy_generated.toFixed(1)} kWh</TableCell>
                  <TableCell>{item.energy_consumed.toFixed(1)} kWh</TableCell>
                  <TableCell>{item.energy_injected.toFixed(1)} kWh</TableCell>
                  <TableCell className="font-bold">{item.final_balance.toFixed(1)} kWh</TableCell>
                  <TableCell>{getStatusBadge(item.final_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 