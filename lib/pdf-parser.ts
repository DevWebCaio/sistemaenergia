// Utilitário para extração de dados de PDFs das distribuidoras
// Baseado nas especificações do email do Banco do Brasil

interface ExtractedData {
  consumerUnitId: string
  referenceMonth: string
  amount: number
  energyConsumed: number
  energyCompensated: number
  distributor: string
  installationNumber: string
}

export class PDFParser {
  private static readonly DISTRIBUTORS = {
    'CEMIG': {
      patterns: {
        installationNumber: /Instalação:\s*(\d+)/,
        referenceMonth: /Mês de Referência:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Energia Consumida:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Valor Total:\s*R\$\s*([\d,]+\.\d{2})/
      }
    },
    'ENEL': {
      patterns: {
        installationNumber: /Número da Instalação:\s*(\d+)/,
        referenceMonth: /Período de Faturamento:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Consumo de Energia:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Total a Pagar:\s*R\$\s*([\d,]+\.\d{2})/
      }
    },
    'CPFL': {
      patterns: {
        installationNumber: /Instalação:\s*(\d+)/,
        referenceMonth: /Mês Referência:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Energia Consumida:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Valor Total:\s*R\$\s*([\d,]+\.\d{2})/
      }
    }
  }

  static async extractFromPDF(file: File): Promise<ExtractedData> {
    try {
      // Em produção, usar biblioteca como pdf-parse ou similar
      const text = await this.extractTextFromPDF(file)
      const distributor = this.detectDistributor(text)
      const patterns = this.DISTRIBUTORS[distributor]?.patterns

      if (!patterns) {
        throw new Error('Distribuidora não suportada')
      }

      return {
        consumerUnitId: this.extractValue(text, patterns.installationNumber),
        referenceMonth: this.extractValue(text, patterns.referenceMonth),
        amount: parseFloat(this.extractValue(text, patterns.amount).replace(',', '.')),
        energyConsumed: parseInt(this.extractValue(text, patterns.energyConsumed).replace(',', '')),
        energyCompensated: parseInt(this.extractValue(text, patterns.energyCompensated).replace(',', '')),
        distributor,
        installationNumber: this.extractValue(text, patterns.installationNumber)
      }
    } catch (error) {
      console.error('Erro ao extrair dados do PDF:', error)
      throw error
    }
  }

  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      // Simulação para demonstração - em produção usar API serverless
      console.log('Simulando extração de PDF:', file.name)
      
      // Fallback para simulação
      return `
        Instalação: 123456789
        Mês de Referência: 01/2024
        Energia Consumida: 1,500 kWh
        Energia Compensada: 1,200 kWh
        Valor Total: R$ 1,250.00
        Distribuidora: CEMIG
      `
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error)
      // Fallback para simulação
      return `
        Instalação: 123456789
        Mês de Referência: 01/2024
        Energia Consumida: 1,500 kWh
        Energia Compensada: 1,200 kWh
        Valor Total: R$ 1,250.00
        Distribuidora: CEMIG
      `
    }
  }

  private static detectDistributor(text: string): string {
    if (text.includes('CEMIG')) return 'CEMIG'
    if (text.includes('ENEL')) return 'ENEL'
    if (text.includes('CPFL')) return 'CPFL'
    return 'CEMIG' // Default
  }

  private static extractValue(text: string, pattern: RegExp): string {
    const match = text.match(pattern)
    return match ? match[1] : ''
  }

  static validateExtractedData(data: ExtractedData): boolean {
    return !!(
      data.consumerUnitId &&
      data.referenceMonth &&
      data.amount > 0 &&
      data.energyConsumed > 0 &&
      data.distributor
    )
  }
} 