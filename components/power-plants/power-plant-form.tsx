"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase"
import type { PowerPlant, ConsumerUnit } from "@/lib/supabase-types"

interface PowerPlantFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editingPlant?: PowerPlant | null
}

export function PowerPlantForm({ open, onOpenChange, onSuccess, editingPlant }: PowerPlantFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [consumerUnits, setConsumerUnits] = useState<ConsumerUnit[]>([])
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    installed_power_kwp: "",
    operation_date: "",
    linked_consumer_unit_id: "",
    address: "",
    distributor_company: "",
  })

  const supabase = createClient()

  // Load consumer units for selection
  useEffect(() => {
    const loadConsumerUnits = async () => {
      try {
        const { data, error } = await supabase
          .from("consumer_units")
          .select("id, name, installation_number, address")
          .eq("status", "active")
          .order("name")

        if (error) throw error
        setConsumerUnits(data || [])
      } catch (err) {
        console.error("Error loading consumer units:", err)
      }
    }

    if (open) {
      loadConsumerUnits()
    }
  }, [open, supabase])

  // Populate form when editing
  useEffect(() => {
    if (editingPlant) {
      setFormData({
        name: editingPlant.name,
        cnpj: editingPlant.cnpj,
        installed_power_kwp: editingPlant.installed_power_kwp.toString(),
        operation_date: editingPlant.operation_date,
        linked_consumer_unit_id: editingPlant.linked_consumer_unit_id || "",
        address: editingPlant.address || "",
        distributor_company: editingPlant.distributor_company || "",
      })
    } else {
      setFormData({
        name: "",
        cnpj: "",
        installed_power_kwp: "",
        operation_date: "",
        linked_consumer_unit_id: "",
        address: "",
        distributor_company: "",
      })
    }
  }, [editingPlant])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const powerPlantData = {
        name: formData.name,
        cnpj: formData.cnpj,
        installed_power_kwp: Number.parseFloat(formData.installed_power_kwp),
        operation_date: formData.operation_date,
        linked_consumer_unit_id: formData.linked_consumer_unit_id || null,
        address: formData.address,
        distributor_company: formData.distributor_company,
        updated_at: new Date().toISOString(),
      }

      if (editingPlant) {
        // Update existing power plant
        const { error } = await supabase.from("power_plants").update(powerPlantData).eq("id", editingPlant.id)

        if (error) throw error
      } else {
        // Create new power plant
        const { error } = await supabase.from("power_plants").insert([powerPlantData])

        if (error) throw error
      }

      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Erro ao salvar usina")
    } finally {
      setLoading(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setFormData({ ...formData, cnpj: formatted })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingPlant ? "Editar Usina" : "Nova Usina"}</DialogTitle>
          <DialogDescription>
            {editingPlant ? "Edite as informações da usina." : "Cadastre uma nova usina de energia solar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Usina *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Usina Solar ABC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installed_power_kwp">Potência Instalada (kWp) *</Label>
              <Input
                id="installed_power_kwp"
                type="number"
                step="0.01"
                min="0"
                value={formData.installed_power_kwp}
                onChange={(e) => setFormData({ ...formData, installed_power_kwp: e.target.value })}
                placeholder="Ex: 1000.50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation_date">Data de Operação *</Label>
              <Input
                id="operation_date"
                type="date"
                value={formData.operation_date}
                onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linked_consumer_unit_id">UC Vinculada</Label>
            <Select
              value={formData.linked_consumer_unit_id}
              onValueChange={(value) => setFormData({ ...formData, linked_consumer_unit_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma UC (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma UC vinculada</SelectItem>
                {consumerUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name} - {unit.installation_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço completo da usina"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="distributor_company">Distribuidora</Label>
            <Input
              id="distributor_company"
              value={formData.distributor_company}
              onChange={(e) => setFormData({ ...formData, distributor_company: e.target.value })}
              placeholder="Ex: CPFL Energia, Enel São Paulo"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingPlant ? "Atualizar" : "Criar Usina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
