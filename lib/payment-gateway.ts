// Sistema de Gateway de Pagamento - Solar DG Platform
// Integração com Stripe, PagSeguro e MercadoPago

interface PaymentData {
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName: string
  invoiceId: string
  dueDate: string
  metadata?: Record<string, string>
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  gateway: 'stripe' | 'pagseguro' | 'mercadopago'
  message?: string
  redirectUrl?: string
}

interface PaymentConfig {
  stripe: {
    enabled: boolean
    apiKey: string
    webhookSecret: string
  }
  pagseguro: {
    enabled: boolean
    apiKey: string
    email: string
    sandbox: boolean
  }
  mercadopago: {
    enabled: boolean
    accessToken: string
    publicKey: string
  }
}

export class PaymentGateway {
  private static config: PaymentConfig = {
    stripe: {
      enabled: process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
      apiKey: process.env.NEXT_PUBLIC_STRIPE_API_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    },
    pagseguro: {
      enabled: process.env.NEXT_PUBLIC_PAGSEGURO_ENABLED === 'true',
      apiKey: process.env.NEXT_PUBLIC_PAGSEGURO_API_KEY || '',
      email: process.env.NEXT_PUBLIC_PAGSEGURO_EMAIL || '',
      sandbox: process.env.NODE_ENV === 'development'
    },
    mercadopago: {
      enabled: process.env.NEXT_PUBLIC_MERCADOPAGO_ENABLED === 'true',
      accessToken: process.env.NEXT_PUBLIC_MERCADOPAGO_API_KEY || '',
      publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''
    }
  }

  // Criar pagamento com gateway preferencial
  static async createPayment(data: PaymentData, preferredGateway?: 'stripe' | 'pagseguro' | 'mercadopago'): Promise<PaymentResult> {
    try {
      // Determinar gateway a ser usado
      const gateway = this.selectGateway(preferredGateway)
      
      switch (gateway) {
        case 'stripe':
          return await this.createStripePayment(data)
        case 'pagseguro':
          return await this.createPagSeguroPayment(data)
        case 'mercadopago':
          return await this.createMercadoPagoPayment(data)
        default:
          throw new Error('Nenhum gateway de pagamento disponível')
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      return {
        success: false,
        status: 'rejected',
        gateway: 'stripe',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Selecionar gateway baseado na preferência e disponibilidade
  private static selectGateway(preferred?: string): string {
    if (preferred && this.config[preferred as keyof PaymentConfig]?.enabled) {
      return preferred
    }

    // Ordem de preferência
    if (this.config.stripe.enabled) return 'stripe'
    if (this.config.pagseguro.enabled) return 'pagseguro'
    if (this.config.mercadopago.enabled) return 'mercadopago'

    throw new Error('Nenhum gateway de pagamento configurado')
  }

  // Stripe Payment
  private static async createStripePayment(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!this.config.stripe.enabled) {
        throw new Error('Stripe não está habilitado')
      }

      const response = await fetch('/api/payments/stripe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Stripe usa centavos
          currency: data.currency,
          description: data.description,
          customer_email: data.customerEmail,
          metadata: {
            invoice_id: data.invoiceId,
            customer_name: data.customerName,
            due_date: data.dueDate,
            ...data.metadata
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento Stripe')
      }

      return {
        success: true,
        paymentId: result.paymentIntent.id,
        status: 'pending',
        gateway: 'stripe',
        redirectUrl: result.paymentIntent.next_action?.redirect_to_url?.url
      }
    } catch (error) {
      console.error('Erro Stripe:', error)
      return {
        success: false,
        status: 'rejected',
        gateway: 'stripe',
        message: error instanceof Error ? error.message : 'Erro Stripe'
      }
    }
  }

  // PagSeguro Payment
  private static async createPagSeguroPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!this.config.pagseguro.enabled) {
        throw new Error('PagSeguro não está habilitado')
      }

      const response = await fetch('/api/payments/pagseguro/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          customer_email: data.customerEmail,
          customer_name: data.customerName,
          invoice_id: data.invoiceId,
          due_date: data.dueDate,
          metadata: data.metadata
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento PagSeguro')
      }

      return {
        success: true,
        paymentId: result.payment.id,
        status: 'pending',
        gateway: 'pagseguro',
        redirectUrl: result.payment.payment_url
      }
    } catch (error) {
      console.error('Erro PagSeguro:', error)
      return {
        success: false,
        status: 'rejected',
        gateway: 'pagseguro',
        message: error instanceof Error ? error.message : 'Erro PagSeguro'
      }
    }
  }

  // MercadoPago Payment
  private static async createMercadoPagoPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!this.config.mercadopago.enabled) {
        throw new Error('MercadoPago não está habilitado')
      }

      const response = await fetch('/api/payments/mercadopago/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          customer_email: data.customerEmail,
          customer_name: data.customerName,
          invoice_id: data.invoiceId,
          due_date: data.dueDate,
          metadata: data.metadata
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento MercadoPago')
      }

      return {
        success: true,
        paymentId: result.payment.id,
        status: 'pending',
        gateway: 'mercadopago',
        redirectUrl: result.payment.init_point
      }
    } catch (error) {
      console.error('Erro MercadoPago:', error)
      return {
        success: false,
        status: 'rejected',
        gateway: 'mercadopago',
        message: error instanceof Error ? error.message : 'Erro MercadoPago'
      }
    }
  }

  // Verificar status do pagamento
  static async checkPaymentStatus(paymentId: string, gateway: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/payments/${gateway}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentId })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao verificar status')
      }

      return {
        success: true,
        paymentId,
        status: result.status,
        gateway: gateway as any,
        message: result.message
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      return {
        success: false,
        status: 'rejected',
        gateway: gateway as any,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Processar webhook
  static async processWebhook(payload: any, signature: string, gateway: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/${gateway}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature
        },
        body: JSON.stringify(payload)
      })

      return response.ok
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return false
    }
  }

  // Obter configurações dos gateways
  static getGatewayConfig(): PaymentConfig {
    return this.config
  }

  // Atualizar configurações
  static updateConfig(newConfig: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
} 