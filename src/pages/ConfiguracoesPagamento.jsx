import React, { useEffect, useState, useCallback } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import toast from 'react-hot-toast'

const emptyConfig = {
  gateway: 'stripe',
  api_key: '',
  webhook_secret: '',
  pix_key: '',
  pix_key_type: 'email',
  recipient_name: '',
  is_active: false,
}

export default function ConfiguracoesPagamento() {
  const { restaurant } = useRestaurant()
  const [config, setConfig] = useState(null)
  const [existingId, setExistingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadConfig = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const list = await entities.PaymentConfig.list({ restaurant_id: restaurant.id }, { limit: 1 })
      if (list?.[0]) {
        setConfig(list[0])
        setExistingId(list[0].id)
      } else {
        setConfig(emptyConfig)
      }
    } catch (err) {
      toast.error('Erro ao carregar configurações de pagamento.')
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...config, restaurant_id: restaurant.id }
      if (existingId) {
        await entities.PaymentConfig.update(existingId, payload)
      } else {
        const created = await entities.PaymentConfig.create(payload)
        setExistingId(created.id)
      }
      toast.success('Configurações de pagamento salvas!')
    } catch (err) {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Configurações de Pagamento</h1>

      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Sua região suporta apenas o gateway Stripe. As chaves são armazenadas de forma segura e nunca expostas publicamente.</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gateway de pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Gateway</Label>
            <Select value={config.gateway} onValueChange={(v) => setConfig({ ...config, gateway: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="asaas">Asaas</SelectItem>
                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chave de API (secreta)</Label>
            <Input type="password" value={config.api_key || ''} onChange={(e) => setConfig({ ...config, api_key: e.target.value })} placeholder="sk_live_..." />
          </div>
          <div className="space-y-1.5">
            <Label>Webhook secret</Label>
            <Input type="password" value={config.webhook_secret || ''} onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Gateway ativo</Label>
            <Switch checked={config.is_active} onCheckedChange={(v) => setConfig({ ...config, is_active: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chave Pix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tipo de chave</Label>
            <Select value={config.pix_key_type} onValueChange={(v) => setConfig({ ...config, pix_key_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Chave Pix</Label>
            <Input value={config.pix_key || ''} onChange={(e) => setConfig({ ...config, pix_key: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Nome do recebedor</Label>
            <Input value={config.recipient_name || ''} onChange={(e) => setConfig({ ...config, recipient_name: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar configurações'}
      </Button>
    </div>
  )
}
