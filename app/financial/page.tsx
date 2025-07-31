"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  CreditCard, 
  Building2, 
  Upload,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Payment {
  id: string
  invoice_id: string
  amount: number
  due_date: string
  payment_date?: string
  status: "pending" | "paid" | "overdue" | "scheduled"
  payment_method: string
  transaction_id?: string
  bb_remessa_id?: string
}

interface BBConfig {
  agency: string
  beneficiary: string
  carteira: string
  convenio: string
  contract: string
  last_number: string
}

export default function FinancialPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bbConfig, setBbConfig] = useState<BBConfig>({
    agency: "3205",
    beneficiary: "662178",
    carteira: "17/019",
    convenio: "3736097",
    contract: "20514776",
    last_number: "37360970000000009"
  })
  const [loading, setLoading] = useState(true)
  const [generatingRemessa, setGeneratingRemessa] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateBBRemessa = async () => {
    console.log("🔘 Botão Gerar Remessa BB clicado!")
    try {
      setGeneratingRemessa(true)
      
      // Gerar arquivo de remessa CNAB240 para BB
      const remessaData = generateCNAB240Remessa()
      
      // Criar arquivo .rem
      const blob = new Blob([remessaData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      // Download do arquivo
      if (typeof document !== 'undefined') {
        const a = document.createElement('a')
        a.href = url
        a.download = `remessa_bb_${new Date().toISOString().split('T')[0]}.rem`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      alert("Arquivo de remessa gerado com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar remessa:", error)
      alert("Erro ao gerar arquivo de remessa")
    } finally {
      setGeneratingRemessa(false)
    }
  }

  const generateCNAB240Remessa = () => {
    // Implementação do CNAB240 para BB
    // Baseado nas especificações do email
    const header = generateHeaderRecord()
    const details = generateDetailRecords()
    const trailer = generateTrailerRecord()
    
    return header + details + trailer
  }

  const generateHeaderRecord = () => {
    // Registro Header (posição 1-240)
    const header = [
      "0", // 001-001 - Código do registro
      "1", // 002-003 - Código da remessa
      "1", // 004-009 - Literal da remessa
      "C", // 010-011 - Código do serviço
      "CONSORCIO MOARA".padEnd(15), // 012-026 - Literal do serviço
      "3736097", // 027-046 - Código do convênio
      "662178", // 047-076 - Código do beneficiário
      "".padEnd(8), // 077-084 - Brancos
      "MOARA GESTAO".padEnd(30), // 085-114 - Nome do beneficiário
      "051".padEnd(3), // 115-117 - Código do banco
      "BANCO DO BRASIL".padEnd(15), // 118-132 - Nome do banco
      new Date().toISOString().slice(0, 10).replace(/-/g, ""), // 133-140 - Data de geração
      "".padEnd(8), // 141-148 - Densidade de gravação
      "".padEnd(20), // 149-168 - Unidade de densidade
      "".padEnd(5), // 169-173 - Sequencial da remessa
      "".padEnd(15), // 174-188 - Data de crédito
      "".padEnd(52), // 189-240 - Brancos
    ].join("")
    
    return header + "\n"
  }

  const generateDetailRecords = () => {
    // Registros de detalhes (Segmento P, Q, R)
    let details = ""
    
    payments.filter(p => p.status === "pending").forEach((payment, index) => {
      const segmentoP = generateSegmentoP(payment, index + 1)
      const segmentoQ = generateSegmentoQ(payment, index + 1)
      const segmentoR = generateSegmentoR(payment, index + 1)
      
      details += segmentoP + segmentoQ + segmentoR
    })
    
    return details
  }

  const generateSegmentoP = (payment: Payment, sequence: number) => {
    const nossoNumero = (parseInt(bbConfig.last_number) + sequence).toString().padStart(17, "0")
    
    return [
      "3", // 001-001 - Código do registro
      "3", // 002-003 - Código do segmento
      "0", // 004-004 - Tipo de movimento
      "17", // 005-006 - Código da carteira
      "019", // 007-009 - Código da variação
      "0", // 010-010 - Brancos
      "3736097", // 011-020 - Código do convênio
      nossoNumero, // 021-037 - Nosso número
      "0", // 038-038 - Brancos
      "1", // 039-039 - Código da carteira
      "01", // 040-041 - Código da variação
      "0", // 042-042 - Brancos
      "3736097", // 043-052 - Código do convênio
      nossoNumero, // 053-069 - Nosso número
      "0", // 070-070 - Brancos
      "1", // 071-071 - Código da carteira
      "01", // 072-073 - Código da variação
      "0", // 074-074 - Brancos
      "3736097", // 075-084 - Código do convênio
      nossoNumero, // 085-101 - Nosso número
      "0", // 102-102 - Brancos
      "1", // 103-103 - Código da carteira
      "01", // 104-105 - Código da variação
      "0", // 106-106 - Brancos
      "3736097", // 107-116 - Código do convênio
      nossoNumero, // 117-133 - Nosso número
      "0", // 134-134 - Brancos
      "1", // 135-135 - Código da carteira
      "01", // 136-137 - Código da variação
      "0", // 138-138 - Brancos
      "3736097", // 139-148 - Código do convênio
      nossoNumero, // 149-165 - Nosso número
      "0", // 166-166 - Brancos
      "1", // 167-167 - Código da carteira
      "01", // 168-169 - Código da variação
      "0", // 170-170 - Brancos
      "3736097", // 171-180 - Código do convênio
      nossoNumero, // 181-197 - Nosso número
      "0", // 198-198 - Brancos
      "1", // 199-199 - Código da carteira
      "01", // 200-201 - Código da variação
      "0", // 202-202 - Brancos
      "3736097", // 203-212 - Código do convênio
      nossoNumero, // 213-229 - Nosso número
      "0", // 230-230 - Brancos
      "1", // 231-231 - Código da carteira
      "01", // 232-233 - Código da variação
      "0", // 234-234 - Brancos
      "3736097", // 235-240 - Código do convênio
    ].join("") + "\n"
  }

  const generateSegmentoQ = (payment: Payment, sequence: number) => {
    return [
      "3", // 001-001 - Código do registro
      "3", // 002-003 - Código do segmento
      "0", // 004-004 - Tipo de movimento
      "1", // 005-005 - Código do registro
      "0", // 006-006 - Tipo de inscrição
      "".padEnd(14), // 007-020 - Número de inscrição
      "CLIENTE".padEnd(40), // 021-060 - Nome
      "".padEnd(40), // 061-100 - Endereço
      "".padEnd(15), // 101-115 - Bairro
      "".padEnd(8), // 116-123 - CEP
      "".padEnd(15), // 124-138 - Cidade
      "".padEnd(2), // 139-140 - UF
      "0", // 141-141 - Tipo de inscrição
      "".padEnd(14), // 142-155 - Número de inscrição
      "".padEnd(40), // 156-195 - Nome do sacador
      "".padEnd(3), // 196-198 - Código de protesto
      "0", // 199-199 - Dias para protesto
      "".padEnd(1), // 200-200 - Código de baixa
      "0", // 201-201 - Dias para baixa
      "".padEnd(40), // 202-240 - Brancos
    ].join("") + "\n"
  }

  const generateSegmentoR = (payment: Payment, sequence: number) => {
    return [
      "3", // 001-001 - Código do registro
      "3", // 002-003 - Código do segmento
      "0", // 004-004 - Tipo de movimento
      "0", // 005-005 - Código de desconto
      "0", // 006-006 - Valor do desconto
      "0", // 007-007 - Código de desconto
      "0", // 008-008 - Valor do desconto
      "0", // 009-009 - Código de desconto
      "0", // 010-010 - Valor do desconto
      "0", // 011-011 - Código de desconto
      "0", // 012-012 - Valor do desconto
      "0", // 013-013 - Código de desconto
      "0", // 014-014 - Valor do desconto
      "0", // 015-015 - Código de desconto
      "0", // 016-016 - Valor do desconto
      "0", // 017-017 - Código de desconto
      "0", // 018-018 - Valor do desconto
      "0", // 019-019 - Código de desconto
      "0", // 020-020 - Valor do desconto
      "0", // 021-021 - Código de desconto
      "0", // 022-022 - Valor do desconto
      "0", // 023-023 - Código de desconto
      "0", // 024-024 - Valor do desconto
      "0", // 025-025 - Código de desconto
      "0", // 026-026 - Valor do desconto
      "0", // 027-027 - Código de desconto
      "0", // 028-028 - Valor do desconto
      "0", // 029-029 - Código de desconto
      "0", // 030-030 - Valor do desconto
      "0", // 031-031 - Código de desconto
      "0", // 032-032 - Valor do desconto
      "0", // 033-033 - Código de desconto
      "0", // 034-034 - Valor do desconto
      "0", // 035-035 - Código de desconto
      "0", // 036-036 - Valor do desconto
      "0", // 037-037 - Código de desconto
      "0", // 038-038 - Valor do desconto
      "0", // 039-039 - Código de desconto
      "0", // 040-040 - Valor do desconto
      "0", // 041-041 - Código de desconto
      "0", // 042-042 - Valor do desconto
      "0", // 043-043 - Código de desconto
      "0", // 044-044 - Valor do desconto
      "0", // 045-045 - Código de desconto
      "0", // 046-046 - Valor do desconto
      "0", // 047-047 - Código de desconto
      "0", // 048-048 - Valor do desconto
      "0", // 049-049 - Código de desconto
      "0", // 050-050 - Valor do desconto
      "0", // 051-051 - Código de desconto
      "0", // 052-052 - Valor do desconto
      "0", // 053-053 - Código de desconto
      "0", // 054-054 - Valor do desconto
      "0", // 055-055 - Código de desconto
      "0", // 056-056 - Valor do desconto
      "0", // 057-057 - Código de desconto
      "0", // 058-058 - Valor do desconto
      "0", // 059-059 - Código de desconto
      "0", // 060-060 - Valor do desconto
      "0", // 061-061 - Código de desconto
      "0", // 062-062 - Valor do desconto
      "0", // 063-063 - Código de desconto
      "0", // 064-064 - Valor do desconto
      "0", // 065-065 - Código de desconto
      "0", // 066-066 - Valor do desconto
      "0", // 067-067 - Código de desconto
      "0", // 068-068 - Valor do desconto
      "0", // 069-069 - Código de desconto
      "0", // 070-070 - Valor do desconto
      "0", // 071-071 - Código de desconto
      "0", // 072-072 - Valor do desconto
      "0", // 073-073 - Código de desconto
      "0", // 074-074 - Valor do desconto
      "0", // 075-075 - Código de desconto
      "0", // 076-076 - Valor do desconto
      "0", // 077-077 - Código de desconto
      "0", // 078-078 - Valor do desconto
      "0", // 079-079 - Código de desconto
      "0", // 080-080 - Valor do desconto
      "0", // 081-081 - Código de desconto
      "0", // 082-082 - Valor do desconto
      "0", // 083-083 - Código de desconto
      "0", // 084-084 - Valor do desconto
      "0", // 085-085 - Código de desconto
      "0", // 086-086 - Valor do desconto
      "0", // 087-087 - Código de desconto
      "0", // 088-088 - Valor do desconto
      "0", // 089-089 - Código de desconto
      "0", // 090-090 - Valor do desconto
      "0", // 091-091 - Código de desconto
      "0", // 092-092 - Valor do desconto
      "0", // 093-093 - Código de desconto
      "0", // 094-094 - Valor do desconto
      "0", // 095-095 - Código de desconto
      "0", // 096-096 - Valor do desconto
      "0", // 097-097 - Código de desconto
      "0", // 098-098 - Valor do desconto
      "0", // 099-099 - Código de desconto
      "0", // 100-100 - Valor do desconto
      "0", // 101-101 - Código de desconto
      "0", // 102-102 - Valor do desconto
      "0", // 103-103 - Código de desconto
      "0", // 104-104 - Valor do desconto
      "0", // 105-105 - Código de desconto
      "0", // 106-106 - Valor do desconto
      "0", // 107-107 - Código de desconto
      "0", // 108-108 - Valor do desconto
      "0", // 109-109 - Código de desconto
      "0", // 110-110 - Valor do desconto
      "0", // 111-111 - Código de desconto
      "0", // 112-112 - Valor do desconto
      "0", // 113-113 - Código de desconto
      "0", // 114-114 - Valor do desconto
      "0", // 115-115 - Código de desconto
      "0", // 116-116 - Valor do desconto
      "0", // 117-117 - Código de desconto
      "0", // 118-118 - Valor do desconto
      "0", // 119-119 - Código de desconto
      "0", // 120-120 - Valor do desconto
      "0", // 121-121 - Código de desconto
      "0", // 122-122 - Valor do desconto
      "0", // 123-123 - Código de desconto
      "0", // 124-124 - Valor do desconto
      "0", // 125-125 - Código de desconto
      "0", // 126-126 - Valor do desconto
      "0", // 127-127 - Código de desconto
      "0", // 128-128 - Valor do desconto
      "0", // 129-129 - Código de desconto
      "0", // 130-130 - Valor do desconto
      "0", // 131-131 - Código de desconto
      "0", // 132-132 - Valor do desconto
      "0", // 133-133 - Código de desconto
      "0", // 134-134 - Valor do desconto
      "0", // 135-135 - Código de desconto
      "0", // 136-136 - Valor do desconto
      "0", // 137-137 - Código de desconto
      "0", // 138-138 - Valor do desconto
      "0", // 139-139 - Código de desconto
      "0", // 140-140 - Valor do desconto
      "0", // 141-141 - Código de desconto
      "0", // 142-142 - Valor do desconto
      "0", // 143-143 - Código de desconto
      "0", // 144-144 - Valor do desconto
      "0", // 145-145 - Código de desconto
      "0", // 146-146 - Valor do desconto
      "0", // 147-147 - Código de desconto
      "0", // 148-148 - Valor do desconto
      "0", // 149-149 - Código de desconto
      "0", // 150-150 - Valor do desconto
      "0", // 151-151 - Código de desconto
      "0", // 152-152 - Valor do desconto
      "0", // 153-153 - Código de desconto
      "0", // 154-154 - Valor do desconto
      "0", // 155-155 - Código de desconto
      "0", // 156-156 - Valor do desconto
      "0", // 157-157 - Código de desconto
      "0", // 158-158 - Valor do desconto
      "0", // 159-159 - Código de desconto
      "0", // 160-160 - Valor do desconto
      "0", // 161-161 - Código de desconto
      "0", // 162-162 - Valor do desconto
      "0", // 163-163 - Código de desconto
      "0", // 164-164 - Valor do desconto
      "0", // 165-165 - Código de desconto
      "0", // 166-166 - Valor do desconto
      "0", // 167-167 - Código de desconto
      "0", // 168-168 - Valor do desconto
      "0", // 169-169 - Código de desconto
      "0", // 170-170 - Valor do desconto
      "0", // 171-171 - Código de desconto
      "0", // 172-172 - Valor do desconto
      "0", // 173-173 - Código de desconto
      "0", // 174-174 - Valor do desconto
      "0", // 175-175 - Código de desconto
      "0", // 176-176 - Valor do desconto
      "0", // 177-177 - Código de desconto
      "0", // 178-178 - Valor do desconto
      "0", // 179-179 - Código de desconto
      "0", // 180-180 - Valor do desconto
      "0", // 181-181 - Código de desconto
      "0", // 182-182 - Valor do desconto
      "0", // 183-183 - Código de desconto
      "0", // 184-184 - Valor do desconto
      "0", // 185-185 - Código de desconto
      "0", // 186-186 - Valor do desconto
      "0", // 187-187 - Código de desconto
      "0", // 188-188 - Valor do desconto
      "0", // 189-189 - Código de desconto
      "0", // 190-190 - Valor do desconto
      "0", // 191-191 - Código de desconto
      "0", // 192-192 - Valor do desconto
      "0", // 193-193 - Código de desconto
      "0", // 194-194 - Valor do desconto
      "0", // 195-195 - Código de desconto
      "0", // 196-196 - Valor do desconto
      "0", // 197-197 - Código de desconto
      "0", // 198-198 - Valor do desconto
      "0", // 199-199 - Código de desconto
      "0", // 200-200 - Valor do desconto
      "0", // 201-201 - Código de desconto
      "0", // 202-202 - Valor do desconto
      "0", // 203-203 - Código de desconto
      "0", // 204-204 - Valor do desconto
      "0", // 205-205 - Código de desconto
      "0", // 206-206 - Valor do desconto
      "0", // 207-207 - Código de desconto
      "0", // 208-208 - Valor do desconto
      "0", // 209-209 - Código de desconto
      "0", // 210-210 - Valor do desconto
      "0", // 211-211 - Código de desconto
      "0", // 212-212 - Valor do desconto
      "0", // 213-213 - Código de desconto
      "0", // 214-214 - Valor do desconto
      "0", // 215-215 - Código de desconto
      "0", // 216-216 - Valor do desconto
      "0", // 217-217 - Código de desconto
      "0", // 218-218 - Valor do desconto
      "0", // 219-219 - Código de desconto
      "0", // 220-220 - Valor do desconto
      "0", // 221-221 - Código de desconto
      "0", // 222-222 - Valor do desconto
      "0", // 223-223 - Código de desconto
      "0", // 224-224 - Valor do desconto
      "0", // 225-225 - Código de desconto
      "0", // 226-226 - Valor do desconto
      "0", // 227-227 - Código de desconto
      "0", // 228-228 - Valor do desconto
      "0", // 229-229 - Código de desconto
      "0", // 230-230 - Valor do desconto
      "0", // 231-231 - Código de desconto
      "0", // 232-232 - Valor do desconto
      "0", // 233-233 - Código de desconto
      "0", // 234-234 - Valor do desconto
      "0", // 235-235 - Código de desconto
      "0", // 236-236 - Valor do desconto
      "0", // 237-237 - Código de desconto
      "0", // 238-238 - Valor do desconto
      "0", // 239-239 - Código de desconto
      "0", // 240-240 - Valor do desconto
    ].join("") + "\n"
  }

  const generateTrailerRecord = () => {
    const totalRecords = payments.filter(p => p.status === "pending").length * 3 + 2 // Header + Details + Trailer
    
    return [
      "9", // 001-001 - Código do registro
      "".padEnd(240), // 002-240 - Brancos
    ].join("") + "\n"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "overdue": return "bg-red-100 text-red-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4" />
      case "pending": return <Clock className="h-4 w-4" />
      case "overdue": return <AlertCircle className="h-4 w-4" />
      case "scheduled": return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600">Gestão de pagamentos e cobrança bancária</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={generateBBRemessa} 
            disabled={generatingRemessa}
            className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer relative z-10"
            type="button"
          >
            {generatingRemessa ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Gerar Remessa BB
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuração BB */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Configuração Banco do Brasil</h3>
          <p className="text-sm text-gray-600">Dados do convênio de cobrança bancária</p>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Agência</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.agency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Beneficiário</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.beneficiary}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Carteira/Variação</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.carteira}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Convênio</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.convenio}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contrato</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.contract}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Último Nosso Número</label>
              <p className="text-lg font-semibold text-gray-900">{bbConfig.last_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagamentos */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Pagamentos</h3>
          <p className="text-sm text-gray-600">Lista de pagamentos e cobranças</p>
        </div>
        <div className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fatura</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vencimento</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Método</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">#{payment.invoice_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        R$ {payment.amount.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        {payment.payment_method === 'bank' ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                        <span className="text-sm">{payment.payment_method}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer relative z-10"
                          onClick={() => console.log("🔘 Botão Visualizar clicado!")}
                          type="button"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-white border-gray-200 hover:bg-gray-50 text-gray-700 cursor-pointer relative z-10"
                          onClick={() => console.log("🔘 Botão Download clicado!")}
                          type="button"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 