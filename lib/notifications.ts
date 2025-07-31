// Sistema de notificações integrado
// Baseado nas especificações do email do Banco do Brasil

interface NotificationConfig {
  whatsapp: {
    apiKey: string
    enabled: boolean
    templates: {
      invoice_due: string
      payment_received: string
      system_alert: string
    }
  }
  email: {
    provider: 'sendgrid' | 'mailgun'
    apiKey: string
    enabled: boolean
    templates: {
      welcome: string
      invoice: string
      reminder: string
    }
  }
}

interface NotificationData {
  type: 'invoice_due' | 'payment_received' | 'system_alert' | 'welcome' | 'invoice' | 'reminder'
  recipient: string
  data: Record<string, any>
  channel: 'whatsapp' | 'email' | 'both'
}

export class NotificationService {
  private static config: NotificationConfig = {
    whatsapp: {
      apiKey: process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || '',
      enabled: process.env.NEXT_PUBLIC_WHATSAPP_ENABLED === 'true',
      templates: {
        invoice_due: 'Olá! Sua fatura de energia vence em {days} dias. Valor: R$ {amount}. Acesse: {link}',
        payment_received: 'Pagamento confirmado! Fatura {invoice_number} - R$ {amount}. Obrigado!',
        system_alert: 'Alerta do sistema: {message}. Acesse o painel para mais detalhes.'
      }
    },
    email: {
      provider: 'sendgrid',
      apiKey: process.env.NEXT_PUBLIC_EMAIL_API_KEY || '',
      enabled: process.env.NEXT_PUBLIC_EMAIL_ENABLED === 'true',
      templates: {
        welcome: 'Bem-vindo ao Solar DG Platform! Seus dados de acesso: {credentials}',
        invoice: 'Nova fatura disponível: {invoice_number} - R$ {amount}. Vencimento: {due_date}',
        reminder: 'Lembrete: Fatura {invoice_number} vence em {days} dias. Valor: R$ {amount}'
      }
    }
  }

  static async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const promises: Promise<boolean>[] = []

      if (data.channel === 'whatsapp' || data.channel === 'both') {
        if (this.config.whatsapp.enabled) {
          promises.push(this.sendWhatsApp(data))
        }
      }

      if (data.channel === 'email' || data.channel === 'both') {
        if (this.config.email.enabled) {
          promises.push(this.sendEmail(data))
        }
      }

      const results = await Promise.all(promises)
      return results.some(result => result === true)
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      return false
    }
  }

  private static async sendWhatsApp(data: NotificationData): Promise<boolean> {
    try {
      const template = this.config.whatsapp.templates[data.type]
      if (!template) {
        throw new Error(`Template WhatsApp não encontrado: ${data.type}`)
      }

      const message = this.replaceTemplateVariables(template, data.data)
      
      // Em produção, integrar com WhatsApp Business API
      console.log('WhatsApp enviado:', {
        to: data.recipient,
        message,
        template: data.type
      })

      return true
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      return false
    }
  }

  private static async sendEmail(data: NotificationData): Promise<boolean> {
    try {
      const template = this.config.email.templates[data.type]
      if (!template) {
        throw new Error(`Template Email não encontrado: ${data.type}`)
      }

      const message = this.replaceTemplateVariables(template, data.data)
      
      // Em produção, integrar com SendGrid/Mailgun
      console.log('Email enviado:', {
        to: data.recipient,
        subject: `Solar DG Platform - ${data.type}`,
        message,
        template: data.type
      })

      return true
    } catch (error) {
      console.error('Erro ao enviar Email:', error)
      return false
    }
  }

  private static replaceTemplateVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // Métodos específicos para tipos de notificação
  static async sendInvoiceDue(recipient: string, invoiceData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'invoice_due',
      recipient,
      data: invoiceData,
      channel: 'both'
    })
  }

  static async sendPaymentReceived(recipient: string, paymentData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'payment_received',
      recipient,
      data: paymentData,
      channel: 'both'
    })
  }

  static async sendSystemAlert(recipient: string, alertData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'system_alert',
      recipient,
      data: alertData,
      channel: 'email'
    })
  }

  static async sendWelcome(recipient: string, credentials: any): Promise<boolean> {
    return this.sendNotification({
      type: 'welcome',
      recipient,
      data: credentials,
      channel: 'email'
    })
  }
} 