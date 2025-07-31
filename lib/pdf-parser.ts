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
  dueDate?: string
  consumptionDate?: string
}

export class PDFParser {
  private static readonly DISTRIBUTORS = {
    'CEMIG': {
      patterns: {
        installationNumber: /Instalação:\s*(\d+)/,
        referenceMonth: /Mês de Referência:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Energia Consumida:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Valor Total:\s*R\$\s*([\d,]+\.\d{2})/,
        dueDate: /Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/,
        consumptionDate: /Período de Consumo:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4})/
      }
    },
    'ENEL': {
      patterns: {
        installationNumber: /Número da Instalação:\s*(\d+)/,
        referenceMonth: /Período de Faturamento:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Consumo de Energia:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Total a Pagar:\s*R\$\s*([\d,]+\.\d{2})/,
        dueDate: /Data de Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/,
        consumptionDate: /Período de Leitura:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4})/
      }
    },
    'CPFL': {
      patterns: {
        installationNumber: /Instalação:\s*(\d+)/,
        referenceMonth: /Mês Referência:\s*(\d{2}\/\d{4})/,
        energyConsumed: /Energia Consumida:\s*([\d,]+)\s*kWh/,
        energyCompensated: /Energia Compensada:\s*([\d,]+)\s*kWh/,
        amount: /Valor Total:\s*R\$\s*([\d,]+\.\d{2})/,
        dueDate: /Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/,
        consumptionDate: /Período de Consumo:\s*(\d{2}\/\d{2}\/\d{4})\s*a\s*(\d{2}\/\d{2}\/\d{4})/
      }
    }
  }

  static async extractFromPDF(file: File): Promise<ExtractedData> {
    try {
      // Usar API serverless para extração real
      const text = await this.extractTextFromPDF(file)
      const distributor = this.detectDistributor(text)
      const patterns = this.DISTRIBUTORS[distributor]?.patterns

      if (!patterns) {
        throw new Error('Distribuidora não suportada')
      }

      const extractedData: ExtractedData = {
        consumerUnitId: this.extractValue(text, patterns.installationNumber),
        referenceMonth: this.extractValue(text, patterns.referenceMonth),
        amount: parseFloat(this.extractValue(text, patterns.amount).replace(',', '.')),
        energyConsumed: parseInt(this.extractValue(text, patterns.energyConsumed).replace(',', '')),
        energyCompensated: parseInt(this.extractValue(text, patterns.energyCompensated).replace(',', '')),
        distributor,
        installationNumber: this.extractValue(text, patterns.installationNumber),
        dueDate: this.extractValue(text, patterns.dueDate),
        consumptionDate: this.extractValue(text, patterns.consumptionDate)
      }

      // Validação dos dados extraídos
      if (!this.validateExtractedData(extractedData)) {
        throw new Error('Dados extraídos inválidos ou incompletos')
      }

      return extractedData
    } catch (error) {
      console.error('Erro ao extrair dados do PDF:', error)
      throw error
    }
  }

  private static async extractTextFromPDF(file: File): Promise<string> {
    try {
      // API serverless para extração real de PDF
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/pdf-extract', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Falha na extração do PDF')
      }

      const result = await response.json()
      return result.text
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error)
      
      // Fallback para simulação em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        return this.getMockPDFText(file.name)
      }
      
      throw new Error('Não foi possível extrair dados do PDF')
    }
  }

  private static getMockPDFText(fileName: string): string {
    // Simulação realista baseada no nome do arquivo
    const isCEMIG = fileName.toLowerCase().includes('cemig')
    const isENEL = fileName.toLowerCase().includes('enel')
    const isCPFL = fileName.toLowerCase().includes('cpfl')

    if (isCEMIG) {
      return `
        CEMIG - Companhia Energética de Minas Gerais
        Instalação: 123456789
        Mês de Referência: 01/2024
        Energia Consumida: 1,500 kWh
        Energia Compensada: 1,200 kWh
        Valor Total: R$ 1,250.00
        Vencimento: 15/02/2024
        Período de Consumo: 01/01/2024 a 31/01/2024
        Distribuidora: CEMIG
      `
    } else if (isENEL) {
      return `
        ENEL - Distribuição São Paulo
        Número da Instalação: 987654321
        Período de Faturamento: 01/2024
        Consumo de Energia: 2,100 kWh
        Energia Compensada: 1,800 kWh
        Total a Pagar: R$ 1,850.00
        Data de Vencimento: 20/02/2024
        Período de Leitura: 01/01/2024 a 31/01/2024
        Distribuidora: ENEL
      `
    } else if (isCPFL) {
      return `
        CPFL - Companhia Paulista de Força e Luz
        Instalação: 456789123
        Mês Referência: 01/2024
        Energia Consumida: 1,800 kWh
        Energia Compensada: 1,500 kWh
        Valor Total: R$ 1,600.00
        Vencimento: 18/02/2024
        Período de Consumo: 01/01/2024 a 31/01/2024
        Distribuidora: CPFL
      `
    }

    // Default para CEMIG
    return `
      CEMIG - Companhia Energética de Minas Gerais
      Instalação: 123456789
      Mês de Referência: 01/2024
      Energia Consumida: 1,500 kWh
      Energia Compensada: 1,200 kWh
      Valor Total: R$ 1,250.00
      Vencimento: 15/02/2024
      Período de Consumo: 01/01/2024 a 31/01/2024
      Distribuidora: CEMIG
    `
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
      data.distributor &&
      data.installationNumber
    )
  }

  static async processMultiplePDFs(files: File[]): Promise<ExtractedData[]> {
    const results: ExtractedData[] = []
    
    for (const file of files) {
      try {
        const data = await this.extractFromPDF(file)
        results.push(data)
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error)
        // Continuar com outros arquivos
      }
    }
    
    return results
  }
} 