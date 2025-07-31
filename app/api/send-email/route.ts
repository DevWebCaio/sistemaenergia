import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, attachments } = await request.json()

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Em produção, usar SendGrid ou similar
    const emailData = {
      to,
      subject,
      html,
      attachments: attachments || []
    }

    // Simulação de envio (em produção, integrar com SendGrid)
    console.log('Email enviado:', {
      to: emailData.to,
      subject: emailData.subject,
      attachments: emailData.attachments.length
    })

    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      messageId: `email_${Date.now()}`,
      message: 'Email enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 