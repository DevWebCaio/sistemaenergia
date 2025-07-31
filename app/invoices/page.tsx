"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Calendar,
  Search,
  Plus,
  Download,
  Eye
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Invoice {
  id: string
  invoice_number: string
  consumer_unit_id: string
  reference_month: string
  amount: number
  energy_consumed: number
  energy_compensated: number
  status: "pending" | "paid" | "overdue" | "cancelled"
  pdf_url?: string
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error("Erro ao carregar faturas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Upload do arquivo para Supabase Storage
      const fileName = `invoices/${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (error) throw error

      // Extrair dados do PDF (simulado)
      const extractedData = await extractPDFData(file)
      
      // Criar fatura no banco
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${Date.now()}`,
          consumer_unit_id: extractedData.consumerUnitId,
          reference_month: extractedData.referenceMonth,
          amount: extractedData.amount,
          energy_consumed: extractedData.energyConsumed,
          energy_compensated: extractedData.energyCompensated,
          status: 'pending',
          pdf_url: data.path
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      await loadInvoices()
      alert("Fatura processada com sucesso!")
    } catch (error) {
      console.error("Erro ao processar fatura:", error)
      alert("Erro ao processar fatura")
    } finally {
      setUploading(false)
    }
  }

  const extractPDFData = async (file: File) => {
    try {
      const { PDFParser } = await import('@/lib/pdf-parser')
      const extractedData = await PDFParser.extractFromPDF(file)
      
      if (!PDFParser.validateExtractedData(extractedData)) {
        throw new Error('Dados extraídos inválidos')
      }
      
      return {
        consumerUnitId: extractedData.consumerUnitId,
        referenceMonth: extractedData.referenceMonth,
        amount: extractedData.amount,
        energyConsumed: extractedData.energyConsumed,
        energyCompensated: extractedData.energyCompensated,
        distributor: extractedData.distributor
      }
    } catch (error) {
      console.error('Erro ao extrair dados do PDF:', error)
      throw error
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "overdue": return "bg-red-100 text-red-800"
      case "cancelled": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Faturas</h1>
          <p className="text-gray-600">Gestão de faturas e cobranças</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Upload de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Faturas</CardTitle>
          <CardDescription>
            Faça upload de faturas em PDF para processamento automático
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Arraste e solte arquivos PDF aqui ou clique para selecionar
            </p>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button disabled={uploading} className="cursor-pointer">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Faturas */}
      <Card>
        <CardHeader>
          <CardTitle>Faturas</CardTitle>
          <CardDescription>
            Lista de todas as faturas processadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar faturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Número</th>
                  <th className="text-left py-3 px-4">Mês Ref.</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Energia</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{invoice.invoice_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(invoice.reference_month).toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        R$ {invoice.amount.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>Consumida: {invoice.energy_consumed} kWh</div>
                        <div>Compensada: {invoice.energy_compensated} kWh</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 