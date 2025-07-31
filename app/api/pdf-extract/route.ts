import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Apenas arquivos PDF são aceitos' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    // Converter arquivo para texto (simulação)
    const text = await extractTextFromPDF(file)

    // Salvar arquivo no Supabase Storage
    const supabase = createClient()
    const fileName = `invoices/${Date.now()}_${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
    }

    return NextResponse.json({
      text,
      fileName: uploadData?.path,
      success: true
    })

  } catch (error) {
    console.error('Erro na API de extração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Em produção, usar biblioteca como pdf-parse
    // Por enquanto, simulação baseada no nome do arquivo
    
    const fileName = file.name.toLowerCase()
    
    if (fileName.includes('cemig')) {
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
    } else if (fileName.includes('enel')) {
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
    } else if (fileName.includes('cpfl')) {
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

    // Default
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
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error('Falha na extração do PDF')
  }
} 