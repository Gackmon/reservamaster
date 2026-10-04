import React, { useEffect, useState, useCallback } from 'react'
import { Loader2, Plus, MessageCircle, Armchair, XCircle } from 'lucide-react'
import PullToRefresh from '@/components/layout/PullToRefresh'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { WAITLIST_STATUS_META, whatsappLink } from '@/lib/booking'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MonitorFila() {
  const { restaurant } = useRestaurant()
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', party_size: 2 })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const list = await entities.Waitlist.list({ restaurant_id: restaurant.id })
      setWaitlist(list)
    } catch (err) {
      toast.error('Erro ao carregar a fila.')
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!restaurant) return
    const unsub = entities.Waitlist.subscribe({ restaurant_id: restaurant.id }, () => loadData())
    return unsub
  }, [restaurant, loadData])

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await entities.Waitlist.create({
        restaurant_id: restaurant.id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        party_size: Number(form.party_size),
        status: 'waiting',
      })
      toast.success('Cliente adicionado à fila!')
      setDialogOpen(false)
      setForm({ customer_name: '', customer_phone: '', party_size: 2 })
      loadData()
    } catch (err) {
      toast.error('Não foi possível adicionar à fila.')
    } finally {
      setSaving(false)
    }
  }

  async function handleNotify(item) {
    setWaitlist((prev) => prev.map((w) => (w.id === item.id ? { ...w, status: 'notified', notified_at: new Date().toISOString() } : w)))
    try {
      await entities.Waitlist.update(item.id, { status: 'notified', notified_at: new Date().toISOString() })
      await entities.Notification.create({
        restaurant_id: restaurant.id,
        type: 'waitlist_call',
        channel: 'whatsapp',
        recipient_name: item.customer_name,
        recipient_contact: item.customer_phone,
        message: `Olá ${item.customer_name}! Sua mesa está pronta em ${restaurant.name}. Por favor dirija-se à recepção.`,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
    } catch (err) {
      toast.error('Erro ao notificar cliente.')
    }
  }

  async function handleSeat(item) {
    setWaitlist((prev) => prev.map((w) => (w.id === item.id ? { ...w, status: 'seated' } : w)))
    try {
      await entities.Waitlist.update(item.id, { status: 'seated' })
    } catch (err) {
      toast.error('Erro ao atualizar.')
    }
  }

  async function handleCancel(item) {
    setWaitlist((prev) => prev.map((w) => (w.id === item.id ? { ...w, status: 'cancelled' } : w)))
    try {
      await entities.Waitlist.update(item.id, { status: 'cancelled' })
    } catch (err) {
      toast.error('Erro ao atualizar.')
    }
  }

  const active = waitlist.filter((w) => w.status === 'waiting' || w.status === 'notified')
  const finished = waitlist.filter((w) => w.status === 'seated' || w.status === 'cancelled')

  if (loading && waitlist.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold">Fila de Espera</h1>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {active.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Ninguém na fila no momento.
            </p>
          ) : (
            active.map((item) => {
              const meta = WAITLIST_STATUS_META[item.status]
              return (
                <div key={item.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{item.party_size} pessoa(s)</p>
                    </div>
                    <Badge className={meta.className}>{meta.label}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === 'waiting' && (
                      <Button size="sm" onClick={() => handleNotify(item)}>
                        <MessageCircle className="h-4 w-4" /> Notificar
                      </Button>
                    )}
                    <Button size="sm" variant="success" onClick={() => handleSeat(item)}>
                      <Armchair className="h-4 w-4" /> Sentar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleCancel(item)}>
                      <XCircle className="h-4 w-4" /> Cancelar
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={whatsappLink(item.customer_phone, `Olá ${item.customer_name}, sua mesa está quase pronta!`)} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {finished.length > 0 && (
          <div>
            <h2 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">HISTÓRICO RECENTE</h2>
            <div className="space-y-2 opacity-70">
              {finished.slice(0, 10).map((item) => {
                const meta = WAITLIST_STATUS_META[item.status]
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <p className="text-sm">{item.customer_name}</p>
                    <Badge className={meta.className}>{meta.label}</Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar à fila</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nome do cliente</Label>
              <Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone (WhatsApp)</Label>
              <Input required value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label>Número de pessoas</Label>
              <Input type="number" min={1} required value={form.party_size} onChange={(e) => setForm({ ...form, party_size: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Adicionar à fila'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PullToRefresh>
  )
}
