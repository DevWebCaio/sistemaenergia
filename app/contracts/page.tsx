"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  FileText, 
  Plus,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Contract {
  id: string
  contract_number: string
  profile_id: string
  contract_type: "generation" | "consumption" | "shared"
  start_date: string
  end_date?: string
  status: "draft" | "pending_signature" | "active" | "cancelled" | "expired"
  digital_signature_url?: string
  pdf_url?: string
  terms?: string
  created_at: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    pendingSignature: 0,
    expiredContracts: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      setLoading(true)
      
      // Mock data para demonstração
      const mockContracts: Contract[] = [
        {
          id: "1",
          contract_number: "CON-2024-001",
          profile_id: "profile-1",
          contract_type: "generation",
          start_date: "2024-01-15",
          end_date: "2029-01-15",
          status: "active",
          pdf_url: "/contracts/contract-001.pdf",
          terms: "Contrato de geração de energia solar",
          created_at: "2024-01-10T10:00:00Z"
        },
        {
          id: "2",
          contract_number: "CON-2024-002",
          profile_id: "profile-2",
          contract_type: "consumption",
          start_date: "2024-02-01",
          status: "pending_signature",
          terms: "Contrato de consumo de energia",
          created_at: "2024-01-25T14:30:00Z"
        },
        {
          id: "3",
          contract_number: "CON-2024-003",
          profile_id: "profile-3",
          contract_type: "shared",
          start_date: "2024-01-20",
          end_date: "2024-12-31",
          status: "draft",
          terms: "Contrato compartilhado de energia",
          created_at: "2024-01-18T09:15:00Z"
        },
        {
          id: "4",
          contract_number: "CON-2023-015",
          profile_id: "profile-4",
          contract_type: "generation",
          start_date: "2023-06-01",
          end_date: "2023-12-31",
          status: "expired",
          pdf_url: "/contracts/contract-015.pdf",
          terms: "Contrato expirado de geração",
          created_at: "2023-05-20T16:45:00Z"
        }
      ]

      setContracts(mockContracts)

      // Calcular estatísticas
      const totalContracts = mockContracts.length
      const activeContracts = mockContracts.filter(c => c.status === 'active').length
      const pendingSignature = mockContracts.filter(c => c.status === 'pending_signature').length
      const expiredContracts = mockContracts.filter(c => c.status === 'expired').length

      setStats({
        totalContracts,
        activeContracts,
        pendingSignature,
        expiredContracts
      })

    } catch (error) {
      console.error("Erro ao carregar contratos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'pending_signature':
        return <Badge className="bg-yellow-100 text-yellow-800">Aguardando Assinatura</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Rascunho</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expirado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'generation':
        return <Badge className="bg-blue-100 text-blue-800">Geração</Badge>
      case 'consumption':
        return <Badge className="bg-orange-100 text-orange-800">Consumo</Badge>
      case 'shared':
        return <Badge className="bg-purple-100 text-purple-800">Compartilhado</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending_signature':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600 mt-2">
            Gestão completa de contratos de energia solar
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalContracts}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Contratos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.activeContracts}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Contratos em vigor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingSignature}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Pendentes de assinatura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Expirados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expiredContracts}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Contratos vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
          <CardDescription>
            Gerencie todos os contratos de energia solar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contract_number}</TableCell>
                  <TableCell>{getTypeBadge(contract.contract_type)}</TableCell>
                  <TableCell>{new Date(contract.start_date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {contract.end_date 
                      ? new Date(contract.end_date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {contract.pdf_url && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 