"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Database,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Save,
  RefreshCw
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SystemSetting {
  id: string
  key: string
  value: string
  description?: string
  category: string
  created_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Mock data para demonstração
      const mockSettings: SystemSetting[] = [
        {
          id: "1",
          key: "system_name",
          value: "Solar DG Platform",
          description: "Nome do sistema",
          category: "general",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "2",
          key: "company_name",
          value: "Moara Gestão",
          description: "Nome da empresa",
          category: "general",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "3",
          key: "support_email",
          value: "suporte@moara.com.br",
          description: "Email de suporte",
          category: "support",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "4",
          key: "notification_email",
          value: "true",
          description: "Habilitar notificações por email",
          category: "notifications",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "5",
          key: "notification_whatsapp",
          value: "false",
          description: "Habilitar notificações WhatsApp",
          category: "notifications",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "6",
          key: "payment_gateway",
          value: "stripe",
          description: "Gateway de pagamento padrão",
          category: "payments",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "7",
          key: "backup_frequency",
          value: "daily",
          description: "Frequência de backup",
          category: "system",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: "8",
          key: "session_timeout",
          value: "3600",
          description: "Timeout da sessão em segundos",
          category: "security",
          created_at: "2024-01-01T00:00:00Z"
        }
      ]

      setSettings(mockSettings)

    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category)
  }

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as configurações do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="support">Suporte</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configurações básicas do sistema
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {getSettingsByCategory("general").map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="text-gray-700">{setting.description}</Label>
                  <Input
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={setting.description}
                    className="border-gray-200 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie como você recebe notificações
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {getSettingsByCategory("notifications").map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-700">{setting.description}</Label>
                    <p className="text-sm text-gray-500">
                      {setting.key === "notification_email" 
                        ? "Receber notificações por email"
                        : "Receber notificações por WhatsApp"
                      }
                    </p>
                  </div>
                  <Switch
                    checked={setting.value === "true"}
                    onCheckedChange={(checked) => 
                      handleSettingChange(setting.key, checked.toString())
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CreditCard className="h-5 w-5" />
                Configurações de Pagamento
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure gateways de pagamento
              </p>
            </div>
            <div className="px-6 py-4 space-y-4">
              {getSettingsByCategory("payments").map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="text-gray-700">{setting.description}</Label>
                  <select
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="pagseguro">PagSeguro</option>
                    <option value="mercadopago">Mercado Pago</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Configure as opções de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory("security").map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.description}</Label>
                  <Input
                    id={setting.key}
                    type="number"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={setting.description}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory("system").map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.description}</Label>
                  <select
                    id={setting.key}
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Settings */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Suporte
              </CardTitle>
              <CardDescription>
                Configurações relacionadas ao suporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getSettingsByCategory("support").map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key}>{setting.description}</Label>
                  <Input
                    id={setting.key}
                    type="email"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                    placeholder={setting.description}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 