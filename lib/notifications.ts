// Sistema de Notificações - Solar DG Platform
// Integração com WhatsApp Business API, Email e SMS

interface NotificationData {
  type: 'invoice' | 'payment' | 'contract' | 'alert' | 'reminder'
  recipient: string
  subject: string
  message: string
  data?: any
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface WhatsAppMessage {
  phone: string
  message: string
  template?: string
  variables?: Record<string, string>
}

interface EmailMessage {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

export class NotificationService {
  private static readonly WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL
  private static readonly WHATSAPP_API_KEY = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY
  private static readonly EMAIL_API_KEY = process.env.NEXT_PUBLIC_EMAIL_API_KEY
  private static readonly SMS_API_KEY = process.env.NEXT_PUBLIC_SMS_API_KEY

  // Templates de mensagens
  private static readonly TEMPLATES = {
    invoice: {
      whatsapp: `🔔 *Nova Fatura Disponível*

📄 Fatura: {invoiceNumber}
💰 Valor: R$ {amount}
📅 Vencimento: {dueDate}
🏢 Distribuidora: {distributor}

Acesse o sistema para mais detalhes:
{systemUrl}`,
      
      email: `
        <h2>🔔 Nova Fatura Disponível</h2>
        <p><strong>Fatura:</strong> {invoiceNumber}</p>
        <p><strong>Valor:</strong> R$ {amount}</p>
        <p><strong>Vencimento:</strong> {dueDate}</p>
        <p><strong>Distribuidora:</strong> {distributor}</p>
        <br>
        <a href="{systemUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Acessar Sistema
        </a>
      `
    },

    payment: {
      whatsapp: `✅ *Pagamento Confirmado*

💰 Valor: R$ {amount}
📅 Data: {paymentDate}
🏦 Banco: {bank}
📄 Fatura: {invoiceNumber}

Obrigado pelo pagamento!`,
      
      email: `
        <h2>✅ Pagamento Confirmado</h2>
        <p><strong>Valor:</strong> R$ {amount}</p>
        <p><strong>Data:</strong> {paymentDate}</p>
        <p><strong>Banco:</strong> {bank}</p>
        <p><strong>Fatura:</strong> {invoiceNumber}</p>
        <br>
        <p>Obrigado pelo pagamento!</p>
      `
    },

    contract: {
      whatsapp: `📋 *Novo Contrato Disponível*

📄 Contrato: {contractNumber}
👤 Cliente: {clientName}
📅 Início: {startDate}
💰 Valor: R$ {monthlyValue}

Acesse para assinar:
{systemUrl}`,
      
      email: `
        <h2>📋 Novo Contrato Disponível</h2>
        <p><strong>Contrato:</strong> {contractNumber}</p>
        <p><strong>Cliente:</strong> {clientName}</p>
        <p><strong>Início:</strong> {startDate}</p>
        <p><strong>Valor Mensal:</strong> R$ {monthlyValue}</p>
        <br>
        <a href="{systemUrl}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Assinar Contrato
        </a>
      `
    },

    alert: {
      whatsapp: `⚠️ *Alerta do Sistema*

{message}

Acesse para resolver:
{systemUrl}`,
      
      email: `
        <h2>⚠️ Alerta do Sistema</h2>
        <p>{message}</p>
        <br>
        <a href="{systemUrl}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Resolver
        </a>
      `
    },

    reminder: {
      whatsapp: `⏰ *Lembrete*

{message}

Prazo: {deadline}
{systemUrl}`,
      
      email: `
        <h2>⏰ Lembrete</h2>
        <p>{message}</p>
        <p><strong>Prazo:</strong> {deadline}</p>
        <br>
        <a href="{systemUrl}" style="background: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Ver Detalhes
        </a>
      `
    }
  }

  // Enviar notificação completa
  static async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const promises = []

      // WhatsApp (se configurado)
      if (this.WHATSAPP_API_KEY && data.recipient.includes('@')) {
        promises.push(this.sendWhatsApp(data))
      }

      // Email (sempre)
      promises.push(this.sendEmail(data))

      // SMS (se configurado e alta prioridade)
      if (this.SMS_API_KEY && data.priority === 'urgent') {
        promises.push(this.sendSMS(data))
      }

      await Promise.allSettled(promises)
      return true
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      return false
    }
  }

  // Enviar WhatsApp
  private static async sendWhatsApp(data: NotificationData): Promise<boolean> {
    try {
      if (!this.WHATSAPP_API_KEY) return false

      const template = this.TEMPLATES[data.type]
      if (!template?.whatsapp) return false

      const message = this.replaceVariables(template.whatsapp, data.data || {})
      
      const whatsappData: WhatsAppMessage = {
        phone: data.recipient,
        message,
        template: data.type,
        variables: data.data
      }

      const response = await fetch(`${this.WHATSAPP_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappData)
      })

      return response.ok
    } catch (error) {
      console.error('Erro WhatsApp:', error)
      return false
    }
  }

  // Enviar Email
  private static async sendEmail(data: NotificationData): Promise<boolean> {
    try {
      const template = this.TEMPLATES[data.type]
      if (!template?.email) return false

      const html = this.replaceVariables(template.email, data.data || {})
      
      const emailData: EmailMessage = {
        to: data.recipient,
        subject: data.subject,
        html
      }

      // Usar SendGrid ou similar
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })

      return response.ok
    } catch (error) {
      console.error('Erro Email:', error)
      return false
    }
  }

  // Enviar SMS
  private static async sendSMS(data: NotificationData): Promise<boolean> {
    try {
      if (!this.SMS_API_KEY) return false

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: data.recipient,
          message: data.message
        })
      })

      return response.ok
    } catch (error) {
      console.error('Erro SMS:', error)
      return false
    }
  }

  // Substituir variáveis nos templates
  private static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value)
    }
    
    return result
  }

  // Notificações específicas
  static async sendInvoiceNotification(invoiceData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'invoice',
      recipient: invoiceData.customerEmail,
      subject: 'Nova Fatura Disponível',
      message: `Fatura ${invoiceData.number} disponível`,
      data: {
        invoiceNumber: invoiceData.number,
        amount: invoiceData.amount.toFixed(2),
        dueDate: invoiceData.dueDate,
        distributor: invoiceData.distributor,
        systemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoiceData.id}`
      },
      priority: 'medium'
    })
  }

  static async sendPaymentConfirmation(paymentData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'payment',
      recipient: paymentData.customerEmail,
      subject: 'Pagamento Confirmado',
      message: `Pagamento de R$ ${paymentData.amount} confirmado`,
      data: {
        amount: paymentData.amount.toFixed(2),
        paymentDate: paymentData.date,
        bank: paymentData.bank,
        invoiceNumber: paymentData.invoiceNumber
      },
      priority: 'low'
    })
  }

  static async sendContractNotification(contractData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'contract',
      recipient: contractData.customerEmail,
      subject: 'Novo Contrato Disponível',
      message: `Contrato ${contractData.number} disponível para assinatura`,
      data: {
        contractNumber: contractData.number,
        clientName: contractData.clientName,
        startDate: contractData.startDate,
        monthlyValue: contractData.monthlyValue.toFixed(2),
        systemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contracts/${contractData.id}`
      },
      priority: 'high'
    })
  }

  static async sendSystemAlert(alertData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'alert',
      recipient: alertData.adminEmail,
      subject: 'Alerta do Sistema',
      message: alertData.message,
      data: {
        message: alertData.message,
        systemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      },
      priority: 'urgent'
    })
  }

  static async sendReminder(reminderData: any): Promise<boolean> {
    return this.sendNotification({
      type: 'reminder',
      recipient: reminderData.recipientEmail,
      subject: 'Lembrete',
      message: reminderData.message,
      data: {
        message: reminderData.message,
        deadline: reminderData.deadline,
        systemUrl: reminderData.systemUrl
      },
      priority: 'medium'
    })
  }
} 