import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Validar formato do telefone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(to.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Formato de telefone inválido' },
        { status: 400 }
      )
    }

    // Em produção, usar Twilio ou similar
    const smsData = {
      to: to.replace(/\D/g, ''),
      message,
      timestamp: new Date().toISOString()
    }

    // Simulação de envio (em produção, integrar com Twilio)
    console.log('SMS enviado:', {
      to: smsData.to,
      message: smsData.message.substring(0, 50) + '...',
      timestamp: smsData.timestamp
    })

    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      messageId: `sms_${Date.now()}`,
      message: 'SMS enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar SMS:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 