// Sistema de automação para geração de faturas e workflows
// Baseado nas especificações do email do Banco do Brasil

import { createClient } from '@/lib/supabase/client'
import { NotificationService } from './notifications'
import { DistributorAPI } from './distributor-apis'

interface AutomationConfig {
  autoGenerateInvoices: boolean
  autoSendNotifications: boolean
  autoSyncDistributorData: boolean
  invoiceDueDays: number
  notificationSchedule: {
    beforeDue: number // dias antes do vencimento
    afterDue: number // dias após vencimento
  }
}

interface InvoiceData {
  consumer_unit_id: string
  reference_month: string
  amount: number
  energy_consumed: number
  energy_compensated: number
  due_date: string
  distributor: string
}

export class AutomationService {
  private static config: AutomationConfig = {
    autoGenerateInvoices: true,
    autoSendNotifications: true,
    autoSyncDistributorData: true,
    invoiceDueDays: 10,
    notificationSchedule: {
      beforeDue: 5,
      afterDue: 3
    }
  }

  static async generateMonthlyInvoices(): Promise<boolean> {
    try {
      const supabase = createClient()
      
      // Buscar todas as UCs ativas
      const { data: consumerUnits, error: ucError } = await supabase
        .from('consumer_units')
        .select('*')
        .eq('status', 'active')

      if (ucError) throw ucError

      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      const generatedInvoices: InvoiceData[] = []

      for (const unit of consumerUnits || []) {
        // Verificar se já existe fatura para este mês
        const { data: existingInvoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('consumer_unit_id', unit.id)
          .eq('reference_month', currentMonth)
          .single()

        if (existingInvoice) continue

        // Buscar dados da distribuidora
        const distributor = unit.distributor_id?.toLowerCase() || 'cemig'
        const consumptionData = await DistributorAPI.getConsumption(
          unit.installation_number, 
          distributor as 'cemig' | 'enel' | 'cpfl'
        )

        if (consumptionData.length > 0) {
          const latestData = consumptionData[0]
          
          const invoiceData: InvoiceData = {
            consumer_unit_id: unit.id,
            reference_month: latestData.referenceMonth,
            amount: latestData.amount,
            energy_consumed: latestData.energyConsumed,
            energy_compensated: latestData.energyCompensated,
            due_date: latestData.dueDate,
            distributor: distributor.toUpperCase()
          }

          // Inserir fatura no banco
          const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
              ...invoiceData,
              invoice_number: `INV-${Date.now()}-${unit.installation_number}`,
              status: 'pending',
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (invoiceError) {
            console.error(`Erro ao criar fatura para UC ${unit.id}:`, invoiceError)
            continue
          }

          generatedInvoices.push(invoiceData)

          // Enviar notificação automática
          if (this.config.autoSendNotifications) {
            await this.sendInvoiceNotification(invoice)
          }
        }
      }

      console.log(`Faturas geradas: ${generatedInvoices.length}`)
      return true
    } catch (error) {
      console.error('Erro ao gerar faturas automáticas:', error)
      return false
    }
  }

  static async sendInvoiceNotification(invoice: any): Promise<boolean> {
    try {
      // Buscar dados do cliente
      const supabase = createClient()
      const { data: consumerUnit } = await supabase
        .from('consumer_units')
        .select('*, profiles(*)')
        .eq('id', invoice.consumer_unit_id)
        .single()

      if (!consumerUnit) return false

      const customerEmail = consumerUnit.profiles?.email
      if (!customerEmail) return false

      // Enviar notificação
      await NotificationService.sendNotification({
        type: 'invoice',
        recipient: customerEmail,
        data: {
          invoice_number: invoice.invoice_number,
          amount: invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          due_date: new Date(invoice.due_date).toLocaleDateString('pt-BR'),
          link: `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${invoice.id}`
        },
        channel: 'email'
      })

      return true
    } catch (error) {
      console.error('Erro ao enviar notificação de fatura:', error)
      return false
    }
  }

  static async checkOverdueInvoices(): Promise<boolean> {
    try {
      const supabase = createClient()
      const today = new Date()
      const dueDate = new Date(today.getTime() - (this.config.notificationSchedule.afterDue * 24 * 60 * 60 * 1000))

      // Buscar faturas vencidas
      const { data: overdueInvoices, error } = await supabase
        .from('invoices')
        .select('*, consumer_units(*, profiles(*))')
        .eq('status', 'pending')
        .lt('due_date', dueDate.toISOString())

      if (error) throw error

      for (const invoice of overdueInvoices || []) {
        // Atualizar status para vencido
        await supabase
          .from('invoices')
          .update({ status: 'overdue' })
          .eq('id', invoice.id)

        // Enviar notificação de vencimento
        if (this.config.autoSendNotifications && invoice.consumer_units?.profiles?.email) {
          await NotificationService.sendInvoiceDue(
            invoice.consumer_units.profiles.email,
            {
              invoice_number: invoice.invoice_number,
              amount: invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
              days: Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (24 * 60 * 60 * 1000)),
              link: `${process.env.NEXT_PUBLIC_BASE_URL}/invoices/${invoice.id}`
            }
          )
        }
      }

      console.log(`Faturas vencidas processadas: ${overdueInvoices?.length || 0}`)
      return true
    } catch (error) {
      console.error('Erro ao verificar faturas vencidas:', error)
      return false
    }
  }

  static async syncDistributorData(): Promise<boolean> {
    try {
      const supabase = createClient()
      
      // Buscar UCs com distribuidoras configuradas
      const { data: consumerUnits, error } = await supabase
        .from('consumer_units')
        .select('*')
        .not('distributor_id', 'is', null)

      if (error) throw error

      let syncedCount = 0
      for (const unit of consumerUnits || []) {
        const distributor = unit.distributor_id?.toLowerCase() as 'cemig' | 'enel' | 'cpfl'
        
        if (distributor && this.config.autoSyncDistributorData) {
          const success = await DistributorAPI.syncData(unit.installation_number, distributor)
          if (success) syncedCount++
        }
      }

      console.log(`UCs sincronizadas: ${syncedCount}`)
      return true
    } catch (error) {
      console.error('Erro ao sincronizar dados das distribuidoras:', error)
      return false
    }
  }

  static async runDailyAutomation(): Promise<void> {
    console.log('Iniciando automação diária...')

    // 1. Sincronizar dados das distribuidoras
    await this.syncDistributorData()

    // 2. Verificar faturas vencidas
    await this.checkOverdueInvoices()

    // 3. Gerar faturas mensais (apenas no primeiro dia do mês)
    const today = new Date()
    if (today.getDate() === 1) {
      await this.generateMonthlyInvoices()
    }

    console.log('Automação diária concluída')
  }

  static async runWeeklyAutomation(): Promise<void> {
    console.log('Iniciando automação semanal...')

    // Backup de dados
    // Relatórios semanais
    // Limpeza de logs antigos

    console.log('Automação semanal concluída')
  }

  // Método para agendar automações
  static scheduleAutomation(): void {
    // Em produção, usar cron jobs ou similar
    setInterval(() => {
      this.runDailyAutomation()
    }, 24 * 60 * 60 * 1000) // 24 horas

    setInterval(() => {
      this.runWeeklyAutomation()
    }, 7 * 24 * 60 * 60 * 1000) // 7 dias
  }
} 