// Sistema de Automação - Solar DG Platform
// Workflows, alertas inteligentes e geração automática

interface WorkflowStep {
  id: string
  name: string
  type: 'condition' | 'action' | 'notification' | 'approval'
  config: any
  nextSteps: string[]
  conditions?: any[]
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: 'invoice_due' | 'payment_received' | 'contract_signed' | 'system_alert' | 'manual'
  steps: WorkflowStep[]
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

interface AlertRule {
  id: string
  name: string
  condition: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  actions: string[]
  enabled: boolean
  cooldown: number // minutos
  lastTriggered?: Date
}

interface AutomationConfig {
  workflows: Workflow[]
  alerts: AlertRule[]
  schedules: any[]
}

export class AutomationService {
  private static config: AutomationConfig = {
    workflows: [],
    alerts: [],
    schedules: []
  }

  // Inicializar automações padrão
  static initializeDefaultAutomations(): void {
    this.setupDefaultWorkflows()
    this.setupDefaultAlerts()
    this.setupSchedules()
  }

  // Configurar workflows padrão
  private static setupDefaultWorkflows(): void {
    const defaultWorkflows: Workflow[] = [
      {
        id: 'invoice_processing',
        name: 'Processamento de Faturas',
        description: 'Workflow automático para processamento de faturas',
        trigger: 'invoice_due',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'extract_data',
            name: 'Extrair Dados',
            type: 'action',
            config: { action: 'extract_pdf_data' },
            nextSteps: ['validate_data']
          },
          {
            id: 'validate_data',
            name: 'Validar Dados',
            type: 'condition',
            config: { condition: 'data_valid' },
            nextSteps: ['create_invoice', 'manual_review'],
            conditions: [
              { field: 'amount', operator: '>', value: 0 },
              { field: 'dueDate', operator: 'not_empty' }
            ]
          },
          {
            id: 'create_invoice',
            name: 'Criar Fatura',
            type: 'action',
            config: { action: 'create_invoice_record' },
            nextSteps: ['send_notification']
          },
          {
            id: 'send_notification',
            name: 'Enviar Notificação',
            type: 'notification',
            config: { 
              type: 'invoice',
              channels: ['email', 'whatsapp']
            },
            nextSteps: []
          },
          {
            id: 'manual_review',
            name: 'Revisão Manual',
            type: 'approval',
            config: { 
              approvers: ['admin@moara.com'],
              timeout: 24 // horas
            },
            nextSteps: []
          }
        ]
      },
      {
        id: 'payment_confirmation',
        name: 'Confirmação de Pagamento',
        description: 'Workflow para confirmação automática de pagamentos',
        trigger: 'payment_received',
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        steps: [
          {
            id: 'validate_payment',
            name: 'Validar Pagamento',
            type: 'condition',
            config: { condition: 'payment_valid' },
            nextSteps: ['update_invoice', 'reject_payment'],
            conditions: [
              { field: 'amount', operator: '>=', value: 'invoice_amount' },
              { field: 'status', operator: '=', value: 'approved' }
            ]
          },
          {
            id: 'update_invoice',
            name: 'Atualizar Fatura',
            type: 'action',
            config: { action: 'update_invoice_status' },
            nextSteps: ['send_confirmation']
          },
          {
            id: 'send_confirmation',
            name: 'Enviar Confirmação',
            type: 'notification',
            config: { 
              type: 'payment',
              channels: ['email', 'whatsapp']
            },
            nextSteps: []
          },
          {
            id: 'reject_payment',
            name: 'Rejeitar Pagamento',
            type: 'action',
            config: { action: 'reject_payment' },
            nextSteps: ['send_rejection']
          },
          {
            id: 'send_rejection',
            name: 'Enviar Rejeição',
            type: 'notification',
            config: { 
              type: 'payment_rejection',
              channels: ['email']
            },
            nextSteps: []
          }
        ]
      }
    ]

    this.config.workflows = defaultWorkflows
  }

  // Configurar alertas padrão
  private static setupDefaultAlerts(): void {
    const defaultAlerts: AlertRule[] = [
      {
        id: 'invoice_overdue',
        name: 'Fatura Vencida',
        condition: 'invoice.due_date < now() AND invoice.status = "pending"',
        severity: 'high',
        actions: ['send_reminder', 'escalate_to_admin'],
        enabled: true,
        cooldown: 60 // 1 hora
      },
      {
        id: 'payment_failed',
        name: 'Pagamento Falhou',
        condition: 'payment.status = "failed"',
        severity: 'critical',
        actions: ['send_alert', 'create_ticket'],
        enabled: true,
        cooldown: 30 // 30 minutos
      },
      {
        id: 'system_error',
        name: 'Erro do Sistema',
        condition: 'error.count > 5 in last 10 minutes',
        severity: 'critical',
        actions: ['send_alert', 'restart_service'],
        enabled: true,
        cooldown: 15 // 15 minutos
      },
      {
        id: 'low_balance',
        name: 'Saldo Baixo',
        condition: 'energy_vault.balance < 100 kWh',
        severity: 'medium',
        actions: ['send_notification'],
        enabled: true,
        cooldown: 120 // 2 horas
      }
    ]

    this.config.alerts = defaultAlerts
  }

  // Configurar agendamentos
  private static setupSchedules(): void {
    this.config.schedules = [
      {
        id: 'daily_report',
        name: 'Relatório Diário',
        cron: '0 8 * * *', // 8h da manhã
        action: 'generate_daily_report',
        enabled: true
      },
      {
        id: 'invoice_reminder',
        name: 'Lembrete de Faturas',
        cron: '0 9 * * 1-5', // 9h da manhã, dias úteis
        action: 'send_invoice_reminders',
        enabled: true
      },
      {
        id: 'system_backup',
        name: 'Backup do Sistema',
        cron: '0 2 * * *', // 2h da manhã
        action: 'create_system_backup',
        enabled: true
      }
    ]
  }

  // Executar workflow
  static async executeWorkflow(workflowId: string, data: any): Promise<boolean> {
    try {
      const workflow = this.config.workflows.find(w => w.id === workflowId)
      if (!workflow || !workflow.enabled) {
        throw new Error('Workflow não encontrado ou desabilitado')
      }

      console.log(`Executando workflow: ${workflow.name}`)
      
      // Executar steps sequencialmente
      const executedSteps = new Set<string>()
      let currentStep: WorkflowStep | null = workflow.steps[0]

      while (currentStep) {
        if (executedSteps.has(currentStep.id)) {
          console.warn(`Loop detectado no workflow ${workflowId}`)
          break
        }

        executedSteps.add(currentStep.id)
        const result = await this.executeStep(currentStep, data)

        if (result.success) {
          // Determinar próximo step baseado no resultado
          currentStep = this.getNextStep(currentStep, result, workflow)
        } else {
          console.error(`Erro no step ${currentStep.name}:`, result.error)
          break
        }
      }

      return true
    } catch (error) {
      console.error('Erro ao executar workflow:', error)
      return false
    }
  }

  // Executar step individual
  private static async executeStep(step: WorkflowStep, data: any): Promise<any> {
    try {
      switch (step.type) {
        case 'condition':
          return await this.executeCondition(step, data)
        case 'action':
          return await this.executeAction(step, data)
        case 'notification':
          return await this.executeNotification(step, data)
        case 'approval':
          return await this.executeApproval(step, data)
        default:
          throw new Error(`Tipo de step não suportado: ${step.type}`)
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  }

  // Executar condição
  private static async executeCondition(step: WorkflowStep, data: any): Promise<any> {
    const conditions = step.conditions || []
    let allConditionsMet = true

    for (const condition of conditions) {
      const value = this.getFieldValue(data, condition.field)
      const met = this.evaluateCondition(value, condition.operator, condition.value)
      
      if (!met) {
        allConditionsMet = false
        break
      }
    }

    return { success: true, result: allConditionsMet }
  }

  // Executar ação
  private static async executeAction(step: WorkflowStep, data: any): Promise<any> {
    const action = step.config.action

    switch (action) {
      case 'extract_pdf_data':
        return await this.extractPDFData(data)
      case 'create_invoice_record':
        return await this.createInvoiceRecord(data)
      case 'update_invoice_status':
        return await this.updateInvoiceStatus(data)
      case 'reject_payment':
        return await this.rejectPayment(data)
      default:
        throw new Error(`Ação não suportada: ${action}`)
    }
  }

  // Executar notificação
  private static async executeNotification(step: WorkflowStep, data: any): Promise<any> {
    const { NotificationService } = await import('./notifications')
    
    try {
      const notificationType = step.config.type
      const channels = step.config.channels || ['email']

      for (const channel of channels) {
        await NotificationService.sendNotification({
          type: notificationType as any,
          recipient: data.customerEmail,
          subject: `Solar DG Platform - ${notificationType}`,
          message: `Notificação automática: ${notificationType}`,
          data: data,
          priority: 'medium'
        })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro na notificação' }
    }
  }

  // Executar aprovação
  private static async executeApproval(step: WorkflowStep, data: any): Promise<any> {
    const approvers = step.config.approvers || []
    const timeout = step.config.timeout || 24

    // Criar solicitação de aprovação
    const approvalRequest = {
      id: `approval_${Date.now()}`,
      workflowStep: step.id,
      data: data,
      approvers: approvers,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + timeout * 60 * 60 * 1000)
    }

    // Salvar no banco de dados
    const { createClient } = await import('./supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('approval_requests')
      .insert(approvalRequest)

    if (error) {
      throw new Error('Erro ao criar solicitação de aprovação')
    }

    return { success: true, approvalRequest }
  }

  // Verificar alertas
  static async checkAlerts(): Promise<void> {
    for (const alert of this.config.alerts) {
      if (!alert.enabled) continue

      // Verificar cooldown
      if (alert.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - alert.lastTriggered.getTime()
        if (timeSinceLastTrigger < alert.cooldown * 60 * 1000) {
          continue
        }
      }

      // Avaliar condição
      const shouldTrigger = await this.evaluateAlertCondition(alert.condition)
      
      if (shouldTrigger) {
        await this.triggerAlert(alert)
        alert.lastTriggered = new Date()
      }
    }
  }

  // Avaliar condição de alerta
  private static async evaluateAlertCondition(condition: string): Promise<boolean> {
    // Implementar parser de condições
    // Por enquanto, simulação
    return Math.random() > 0.7 // 30% chance de trigger
  }

  // Disparar alerta
  private static async triggerAlert(alert: AlertRule): Promise<void> {
    console.log(`Alerta disparado: ${alert.name} (${alert.severity})`)

    for (const action of alert.actions) {
      try {
        await this.executeAlertAction(action, alert)
      } catch (error) {
        console.error(`Erro ao executar ação de alerta ${action}:`, error)
      }
    }
  }

  // Executar ação de alerta
  private static async executeAlertAction(action: string, alert: AlertRule): Promise<void> {
    const { NotificationService } = await import('./notifications')

    switch (action) {
      case 'send_reminder':
        await NotificationService.sendReminder({
          recipientEmail: 'admin@moara.com',
          message: `Lembrete: ${alert.name}`,
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          systemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        })
        break

      case 'send_alert':
        await NotificationService.sendSystemAlert({
          adminEmail: 'admin@moara.com',
          message: `Alerta ${alert.severity}: ${alert.name}`
        })
        break

      case 'escalate_to_admin':
        // Escalar para administrador
        console.log('Escalando para administrador')
        break

      case 'create_ticket':
        // Criar ticket de suporte
        console.log('Criando ticket de suporte')
        break

      case 'restart_service':
        // Reiniciar serviço (em produção)
        console.log('Reiniciando serviço')
        break

      default:
        console.warn(`Ação de alerta não suportada: ${action}`)
    }
  }

  // Métodos auxiliares
  private static getFieldValue(data: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], data)
  }

  private static evaluateCondition(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case '>':
        return value > expectedValue
      case '>=':
        return value >= expectedValue
      case '<':
        return value < expectedValue
      case '<=':
        return value <= expectedValue
      case '=':
        return value === expectedValue
      case '!=':
        return value !== expectedValue
      case 'not_empty':
        return value && value.toString().trim() !== ''
      default:
        return false
    }
  }

  private static getNextStep(currentStep: WorkflowStep, result: any, workflow: Workflow): WorkflowStep | null {
    if (result.result === true && currentStep.nextSteps.length > 0) {
      const nextStepId = currentStep.nextSteps[0]
      const nextStep = workflow.steps.find(s => s.id === nextStepId)
      return nextStep || null
    } else if (result.result === false && currentStep.nextSteps.length > 1) {
      const nextStepId = currentStep.nextSteps[1]
      const nextStep = workflow.steps.find(s => s.id === nextStepId)
      return nextStep || null
    }
    return null
  }

  // Ações específicas
  private static async extractPDFData(data: any): Promise<any> {
    const { PDFParser } = await import('./pdf-parser')
    // Implementar extração de dados do PDF
    return { success: true, extractedData: data }
  }

  private static async createInvoiceRecord(data: any): Promise<any> {
    const { createClient } = await import('./supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('invoices')
      .insert(data)

    if (error) {
      throw new Error('Erro ao criar fatura')
    }

    return { success: true }
  }

  private static async updateInvoiceStatus(data: any): Promise<any> {
    const { createClient } = await import('./supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', data.invoiceId)

    if (error) {
      throw new Error('Erro ao atualizar status da fatura')
    }

    return { success: true }
  }

  private static async rejectPayment(data: any): Promise<any> {
    // Implementar rejeição de pagamento
    return { success: true }
  }

  // Obter configurações
  static getConfig(): AutomationConfig {
    return this.config
  }

  // Atualizar configurações
  static updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
} 