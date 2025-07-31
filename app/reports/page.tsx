"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Download, 
  FileText,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Calendar
} from "lucide-react"
import { ReportService } from "@/lib/reports"
import { AutomationService } from "@/lib/automation"

interface FinancialReport {
  month: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
  }
}

interface PerformanceReport {
  powerPlants: Array<{
    name: string
    capacity: number
    generated: number
    efficiency: number
    status: string
  }>
  averageEfficiency: number
  totalCapacity: number
  totalGenerated: number
}

export default function ReportsPage() {
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null)
  const [customerReport, setCustomerReport] = useState<any>(null)
  const [energyReport, setEnergyReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current_month')

  useEffect(() => {
    loadReports()
  }, [selectedPeriod])

  const loadReports = async () => {
    try {
      setLoading(true)
      
      const [financial, performance, customer, energy] = await Promise.all([
        ReportService.generateFinancialReport(selectedPeriod),
        ReportService.generatePerformanceReport(),
        ReportService.generateCustomerReport(),
        ReportService.generateEnergyReport()
      ])

      setFinancialReport(financial)
      setPerformanceReport(performance)
      setCustomerReport(customer)
      setEnergyReport(energy)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (type: string, format: 'pdf' | 'excel') => {
    try {
      let reportData: any
      let fileName: string

      switch (type) {
        case 'financial':
          reportData = financialReport
          fileName = `relatorio_financeiro_${selectedPeriod}`
          break
        case 'performance':
          reportData = performanceReport
          fileName = 'relatorio_performance'
          break
        case 'customer':
          reportData = customerReport
          fileName = 'relatorio_clientes'
          break
        case 'energy':
          reportData = energyReport
          fileName = 'relatorio_energia'
          break
        default:
          throw new Error('Tipo de relatório não suportado')
      }

      let url: string
      if (format === 'pdf') {
        url = await ReportService.exportReportToPDF(reportData, type)
      } else {
        url = await ReportService.exportReportToExcel(reportData, type)
      }

      // Download do arquivo
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.${format === 'pdf' ? 'pdf' : 'csv'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar relatório')
    }
  }

  const runAutomation = async () => {
    try {
      await AutomationService.runDailyAutomation()
      alert('Automação executada com sucesso!')
      await loadReports() // Recarregar relatórios
    } catch (error) {
      console.error('Erro ao executar automação:', error)
      alert('Erro ao executar automação')
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Analytics e relatórios avançados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAutomation}>
            <Calendar className="h-4 w-4 mr-2" />
            Executar Automação
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="current_month">Mês Atual</option>
              <option value="last_month">Mês Anterior</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Financeiro */}
      {financialReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório Financeiro</CardTitle>
                <CardDescription>{financialReport.month}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportReport('financial', 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('financial', 'excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {financialReport.revenue.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">Receita Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  R$ {financialReport.expenses.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">Despesas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {financialReport.profit.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">Lucro</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {financialReport.profitMargin.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Margem</div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Status das Faturas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{financialReport.invoices.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{financialReport.invoices.paid}</div>
                  <div className="text-sm text-gray-500">Pagas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{financialReport.invoices.pending}</div>
                  <div className="text-sm text-gray-500">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{financialReport.invoices.overdue}</div>
                  <div className="text-sm text-gray-500">Vencidas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Performance */}
      {performanceReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório de Performance</CardTitle>
                <CardDescription>Eficiência das usinas</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportReport('performance', 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('performance', 'excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceReport.totalCapacity.toFixed(1)} kWp
                </div>
                <div className="text-sm text-gray-500">Capacidade Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceReport.totalGenerated.toFixed(1)} kWh
                </div>
                <div className="text-sm text-gray-500">Energia Gerada</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceReport.averageEfficiency.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Eficiência Média</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Usinas</h4>
              {performanceReport.powerPlants.map((plant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{plant.name}</div>
                    <div className="text-sm text-gray-500">
                      {plant.capacity} kWp - {plant.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{plant.generated.toFixed(1)} kWh</div>
                    <div className="text-sm text-gray-500">{plant.efficiency.toFixed(1)}% eficiência</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Clientes */}
      {customerReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório de Clientes</CardTitle>
                <CardDescription>Top clientes por receita</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportReport('customer', 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('customer', 'excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customerReport.totalCustomers}
                </div>
                <div className="text-sm text-gray-500">Total de Clientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {customerReport.averageRevenuePerCustomer.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-gray-500">Receita Média</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Top 10 Clientes</h4>
              {customerReport.topCustomers.map((customer: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {customer.totalInvoices} faturas - {customer.paidInvoices} pagas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      R$ {customer.totalRevenue.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Média: R$ {customer.averageAmount.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Energia */}
      {energyReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Relatório de Energia</CardTitle>
                <CardDescription>Consumo e compensação</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => exportReport('energy', 'pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport('energy', 'excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {energyReport.totalConsumed.toLocaleString('pt-BR')} kWh
                </div>
                <div className="text-sm text-gray-500">Energia Consumida</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {energyReport.totalCompensated.toLocaleString('pt-BR')} kWh
                </div>
                <div className="text-sm text-gray-500">Energia Compensada</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {energyReport.efficiency.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Eficiência</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Breakdown Mensal</h4>
              {energyReport.monthlyBreakdown.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{month.month}</div>
                    <div className="text-sm text-gray-500">
                      {month.consumed.toLocaleString('pt-BR')} kWh consumidos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {month.compensated.toLocaleString('pt-BR')} kWh compensados
                    </div>
                    <div className="text-sm text-gray-500">
                      {month.efficiency.toFixed(1)}% eficiência
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 