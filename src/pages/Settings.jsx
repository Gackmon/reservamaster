import React, { useState, useEffect } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { useAuth } from '@/lib/AuthProvider'
import toast from 'react-hot-toast'

export default function Settings() {
  const { restaurant, loading, reload } = useRestaurant()
  const { signOut } = useAuth()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (restaurant) setForm(restaurant)
  }, [restaurant])

  async function handleSave() {
    setSaving(true)
    try {
      await entities.Restaurant.update(restaurant.id, {
        name: form.name,
        phone: form.phone,
        whatsapp_number: form.whatsapp_number,
        address: form.address,
        cnpj: form.cnpj,
        require_deposit: form.require_deposit,
        deposit_type: form.deposit_type,
        deposit_amount: Number(form.deposit_amount) || 0,
        min_party_size_for_deposit: Number(form.min_party_size_for_deposit) || 1,
        cancelation_limit_hours: Number(form.cancelation_limit_hours) || 12,
        max_capacity_per_slot: Number(form.max_capacity_per_slot) || 20,
        slot_interval_minutes: Number(form.slot_interval_minutes) || 30,
        avg_dining_minutes: Number(form.avg_dining_minutes) || 105,
      })
      toast.success('Configurações salvas!')
      reload()
    } catch (err) {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    try {
      await entities.Restaurant.remove(restaurant.id)
      toast.success('Conta e dados removidos.')
      await signOut()
    } catch (err) {
      toast.error('Erro ao excluir conta.')
    }
  }

  if (loading || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados do restaurante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>CNPJ</Label>
            <Input value={form.cnpj || ''} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp</Label>
            <Input value={form.whatsapp_number || ''} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de sinal (anti-no-show)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Exigir sinal para reservas</Label>
            <Switch checked={form.require_deposit} onCheckedChange={(v) => setForm({ ...form, require_deposit: v })} />
          </div>
          {form.require_deposit && (
            <>
              <div className="space-y-1.5">
                <Label>Tipo de cobrança</Label>
                <Select value={form.deposit_type} onValueChange={(v) => setForm({ ...form, deposit_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_person">Por pessoa</SelectItem>
                    <SelectItem value="fixed">Valor fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor do sinal (R$)</Label>
                <Input type="number" step="0.01" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Mínimo de pessoas para exigir sinal</Label>
                <Input type="number" min={1} value={form.min_party_size_for_deposit} onChange={(e) => setForm({ ...form, min_party_size_for_deposit: e.target.value })} />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label>Limite de cancelamento (horas antes)</Label>
            <Input type="number" min={0} value={form.cancelation_limit_hours} onChange={(e) => setForm({ ...form, cancelation_limit_hours: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Capacidade máxima por horário (pessoas)</Label>
            <Input type="number" min={1} value={form.max_capacity_per_slot} onChange={(e) => setForm({ ...form, max_capacity_per_slot: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Intervalo entre horários (minutos)</Label>
            <Input type="number" min={5} step={5} value={form.slot_interval_minutes} onChange={(e) => setForm({ ...form, slot_interval_minutes: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Duração média de uma mesa (minutos)</Label>
            <Input type="number" min={15} value={form.avg_dining_minutes} onChange={(e) => setForm({ ...form, avg_dining_minutes: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar alterações'}
      </Button>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de risco</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Excluir conta e todos os dados
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta?</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os dados do restaurante, reservas, fila e notificações serão apagados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount}>Excluir definitivamente</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
