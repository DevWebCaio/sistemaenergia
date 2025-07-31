// APIs das distribuidoras de energia
// Baseado nas especificações do email do Banco do Brasil

interface ConsumptionData {
  installationNumber: string
  referenceMonth: string
  energyConsumed: number
  energyCompensated: number
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
}

interface BillingData {
  installationNumber: string
  billingMonth: string
  totalAmount: number
  energyConsumed: number
  energyCompensated: number
  taxes: number
  dueDate: string
}

interface ValidationResult {
  valid: boolean
  installationNumber: string
  customerName?: string
  address?: string
  tariffClass?: string
  error?: string
}

export class DistributorAPI {
  private static readonly config = {
    cemig: {
      baseUrl: 'https://api.cemig.com.br',
      apiKey: process.env.NEXT_PUBLIC_CEMIG_API_KEY || '',
      enabled: process.env.NEXT_PUBLIC_CEMIG_ENABLED === 'true'
    },
    enel: {
      baseUrl: 'https://api.enel.com.br',
      apiKey: process.env.NEXT_PUBLIC_ENEL_API_KEY || '',
      enabled: process.env.NEXT_PUBLIC_ENEL_ENABLED === 'true'
    },
    cpfl: {
      baseUrl: 'https://api.cpfl.com.br',
      apiKey: process.env.NEXT_PUBLIC_CPFL_API_KEY || '',
      enabled: process.env.NEXT_PUBLIC_CPFL_ENABLED === 'true'
    }
  }

  static async getConsumption(installationNumber: string, distributor: 'cemig' | 'enel' | 'cpfl'): Promise<ConsumptionData[]> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, fazer chamada real para a API
      console.log(`Buscando consumo ${distributor.toUpperCase()}:`, installationNumber)

      // Mock de dados
      return [
        {
          installationNumber,
          referenceMonth: '2024-01',
          energyConsumed: 1500,
          energyCompensated: 1200,
          amount: 1250.00,
          dueDate: '2024-02-10',
          status: 'pending'
        },
        {
          installationNumber,
          referenceMonth: '2023-12',
          energyConsumed: 1400,
          energyCompensated: 1100,
          amount: 1150.00,
          dueDate: '2024-01-10',
          status: 'paid'
        }
      ]
    } catch (error) {
      console.error(`Erro ao buscar consumo ${distributor}:`, error)
      throw error
    }
  }

  static async getBilling(installationNumber: string, distributor: 'cemig' | 'enel' | 'cpfl'): Promise<BillingData[]> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, fazer chamada real para a API
      console.log(`Buscando faturas ${distributor.toUpperCase()}:`, installationNumber)

      // Mock de dados
      return [
        {
          installationNumber,
          billingMonth: '2024-01',
          totalAmount: 1250.00,
          energyConsumed: 1500,
          energyCompensated: 1200,
          taxes: 150.00,
          dueDate: '2024-02-10'
        },
        {
          installationNumber,
          billingMonth: '2023-12',
          totalAmount: 1150.00,
          energyConsumed: 1400,
          energyCompensated: 1100,
          taxes: 140.00,
          dueDate: '2024-01-10'
        }
      ]
    } catch (error) {
      console.error(`Erro ao buscar faturas ${distributor}:`, error)
      throw error
    }
  }

  static async validateInstallation(installationNumber: string, distributor: 'cemig' | 'enel' | 'cpfl'): Promise<ValidationResult> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, fazer chamada real para a API
      console.log(`Validando instalação ${distributor.toUpperCase()}:`, installationNumber)

      // Mock de validação
      return {
        valid: true,
        installationNumber,
        customerName: 'Cliente Exemplo',
        address: 'Rua Exemplo, 123 - Belo Horizonte/MG',
        tariffClass: 'B1'
      }
    } catch (error) {
      console.error(`Erro ao validar instalação ${distributor}:`, error)
      return {
        valid: false,
        installationNumber,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  static async syncData(installationNumber: string, distributor: 'cemig' | 'enel' | 'cpfl'): Promise<boolean> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, sincronizar dados com o banco local
      console.log(`Sincronizando dados ${distributor.toUpperCase()}:`, installationNumber)

      const consumption = await this.getConsumption(installationNumber, distributor)
      const billing = await this.getBilling(installationNumber, distributor)
      const validation = await this.validateInstallation(installationNumber, distributor)

      // Aqui você salvaria os dados no Supabase
      console.log('Dados sincronizados:', { consumption, billing, validation })

      return true
    } catch (error) {
      console.error(`Erro ao sincronizar dados ${distributor}:`, error)
      return false
    }
  }

  static async getOutages(distributor: 'cemig' | 'enel' | 'cpfl', region?: string): Promise<any[]> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, buscar interrupções programadas
      console.log(`Buscando interrupções ${distributor.toUpperCase()}:`, region)

      return [
        {
          region: 'Belo Horizonte',
          startDate: '2024-02-15T08:00:00Z',
          endDate: '2024-02-15T12:00:00Z',
          reason: 'Manutenção programada',
          affectedAreas: ['Centro', 'Savassi']
        }
      ]
    } catch (error) {
      console.error(`Erro ao buscar interrupções ${distributor}:`, error)
      return []
    }
  }

  static async getTariffInfo(distributor: 'cemig' | 'enel' | 'cpfl'): Promise<any> {
    try {
      if (!this.config[distributor].enabled) {
        throw new Error(`${distributor.toUpperCase()} não está habilitado`)
      }

      // Em produção, buscar informações de tarifa
      console.log(`Buscando tarifas ${distributor.toUpperCase()}`)

      return {
        distributor: distributor.toUpperCase(),
        tariffClasses: {
          'A1': { description: 'Alta Tensão', rate: 0.65 },
          'A2': { description: 'Média Tensão', rate: 0.70 },
          'A3': { description: 'Baixa Tensão', rate: 0.75 },
          'A4': { description: 'Residencial', rate: 0.80 },
          'B1': { description: 'Comercial', rate: 0.85 }
        },
        taxes: {
          'PIS': 0.65,
          'COFINS': 3.00,
          'ICMS': 18.00
        }
      }
    } catch (error) {
      console.error(`Erro ao buscar tarifas ${distributor}:`, error)
      throw error
    }
  }
} 