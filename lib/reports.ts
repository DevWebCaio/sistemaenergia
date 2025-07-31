// Sistema de relatórios avançados com analytics
// Baseado nas especificações do email do Banco do Brasil

import { createClient } from '@/lib/supabase/client'

interface ReportData {
  period: string
  totalRevenue: number
  totalInvoices: number
  paidInvoices: number
  overdueInvoices: number
  averagePaymentTime: number
  conversionRate: number
  topCustomers: Array<{
    name: string
    revenue: number
    invoices: number
  }>
  energyMetrics: {
    totalConsumed: number
    totalCompensated: number
    efficiency: number
  }
}

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

export class ReportService {
  static async generateFinancialReport(period: string = 'current_month'): Promise<FinancialReport> {
    try {
      const supabase = createClient()
      
      let startDate: string
      let endDate: string
      
      if (period === 'current_month') {
        const now = new Date()
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
      } else if (period === 'last_month') {
        const now = new Date()
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      } else {
        // Custom period
        const [start, end] = period.split('_to_')
        startDate = new Date(start).toISOString()
        endDate = new Date(end).toISOString()
      }

      // Buscar faturas do período
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      if (error) throw error

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid') || []
      const pendingInvoices = invoices?.filter(inv => inv.status === 'pending') || []
      const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue') || []

      const expenses = totalRevenue * 0.15 // Estimativa de 15% de despesas
      const profit = totalRevenue - expenses
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

      return {
        month: new Date(startDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        revenue: totalRevenue,
        expenses,
        profit,
        profitMargin,
        invoices: {
          total: invoices?.length || 0,
          paid: paidInvoices.length,
          pending: pendingInvoices.length,
          overdue: overdueInvoices.length
        }
      }
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error)
      throw error
    }
  }

  static async generatePerformanceReport(): Promise<PerformanceReport> {
    try {
      const supabase = createClient()
      
      // Buscar usinas
      const { data: powerPlants, error } = await supabase
        .from('power_plants')
        .select('*')

      if (error) throw error

      const plants = powerPlants?.map(plant => {
        const generated = (plant.installed_power_kwp || 0) * 0.8 * 30 // Estimativa de 80% de eficiência por 30 dias
        const efficiency = 0.8 // Mock de eficiência
        
        return {
          name: plant.name,
          capacity: plant.installed_power_kwp || 0,
          generated,
          efficiency: efficiency * 100,
          status: plant.status
        }
      }) || []

      const totalCapacity = plants.reduce((sum, plant) => sum + plant.capacity, 0)
      const totalGenerated = plants.reduce((sum, plant) => sum + plant.generated, 0)
      const averageEfficiency = plants.length > 0 
        ? plants.reduce((sum, plant) => sum + plant.efficiency, 0) / plants.length 
        : 0

      return {
        powerPlants: plants,
        averageEfficiency,
        totalCapacity,
        totalGenerated
      }
    } catch (error) {
      console.error('Erro ao gerar relatório de performance:', error)
      throw error
    }
  }

  static async generateCustomerReport(): Promise<any> {
    try {
      const supabase = createClient()
      
      // Buscar clientes com faturas
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*, consumer_units(*, profiles(*))')

      if (error) throw error

      // Agrupar por cliente
      const customerData = new Map()
      
      invoices?.forEach(invoice => {
        const customerId = invoice.consumer_units?.profile_id
        const customerName = invoice.consumer_units?.profiles?.full_name || 'Cliente'
        
        if (!customerData.has(customerId)) {
          customerData.set(customerId, {
            name: customerName,
            totalRevenue: 0,
            totalInvoices: 0,
            paidInvoices: 0,
            averageAmount: 0
          })
        }
        
        const customer = customerData.get(customerId)
        customer.totalRevenue += invoice.amount || 0
        customer.totalInvoices += 1
        
        if (invoice.status === 'paid') {
          customer.paidInvoices += 1
        }
      })

      // Calcular médias
      customerData.forEach(customer => {
        customer.averageAmount = customer.totalInvoices > 0 
          ? customer.totalRevenue / customer.totalInvoices 
          : 0
      })

      // Ordenar por receita
      const topCustomers = Array.from(customerData.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)

      return {
        totalCustomers: customerData.size,
        topCustomers,
        averageRevenuePerCustomer: topCustomers.reduce((sum, c) => sum + c.totalRevenue, 0) / topCustomers.length
      }
    } catch (error) {
      console.error('Erro ao gerar relatório de clientes:', error)
      throw error
    }
  }

  static async generateEnergyReport(): Promise<any> {
    try {
      const supabase = createClient()
      
      // Buscar dados de energia
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('energy_consumed, energy_compensated, reference_month')

      if (error) throw error

      const monthlyData = new Map()
      
      invoices?.forEach(invoice => {
        const month = invoice.reference_month
        if (!monthlyData.has(month)) {
          monthlyData.set(month, {
            consumed: 0,
            compensated: 0,
            invoices: 0
          })
        }
        
        const data = monthlyData.get(month)
        data.consumed += invoice.energy_consumed || 0
        data.compensated += invoice.energy_compensated || 0
        data.invoices += 1
      })

      const totalConsumed = invoices?.reduce((sum, inv) => sum + (inv.energy_consumed || 0), 0) || 0
      const totalCompensated = invoices?.reduce((sum, inv) => sum + (inv.energy_compensated || 0), 0) || 0
      const efficiency = totalConsumed > 0 ? (totalCompensated / totalConsumed) * 100 : 0

      return {
        totalConsumed,
        totalCompensated,
        efficiency,
        monthlyBreakdown: Array.from(monthlyData.entries()).map(([month, data]) => ({
          month,
          consumed: data.consumed,
          compensated: data.compensated,
          efficiency: data.consumed > 0 ? (data.compensated / data.consumed) * 100 : 0
        }))
      }
    } catch (error) {
      console.error('Erro ao gerar relatório de energia:', error)
      throw error
    }
  }

  static async exportReportToPDF(reportData: any, type: string): Promise<string> {
    try {
      // Em produção, usar biblioteca como jsPDF
      console.log(`Exportando relatório ${type}:`, reportData)
      
      // Simular geração de PDF
      const pdfContent = `
        Relatório ${type}
        Data: ${new Date().toLocaleDateString('pt-BR')}
        
        ${JSON.stringify(reportData, null, 2)}
      `
      
      // Criar blob para download
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      return url
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      throw error
    }
  }

  static async exportReportToExcel(reportData: any, type: string): Promise<string> {
    try {
      // Em produção, usar biblioteca como xlsx
      console.log(`Exportando relatório ${type} para Excel:`, reportData)
      
      // Simular geração de Excel
      const csvContent = Object.keys(reportData)
        .map(key => `${key},${reportData[key]}`)
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      return url
    } catch (error) {
      console.error('Erro ao exportar relatório para Excel:', error)
      throw error
    }
  }
} 