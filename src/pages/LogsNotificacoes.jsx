import React, { useEffect, useState, useMemo } from 'react'
import { Loader2, MessageSquareText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import toast from 'react-hot-toast'

const TYPE_LABELS = {
  reservation_confirmation: 'Confirmação de reserva',
  payment_confirmation: 'Confirmação de pagamento',
  reminder: 'Lembrete',
  waitlist_call: 'Chamada da fila',
  no_show_warning: 'Aviso de no-show',
  cancellation: 'Cancelamento',
}

const STATUS_BADGE = {
  sent: 'bg-success/15 text-success border-success/30',
  pending: 'bg-warning/15 text-warning border-warning/30',
  failed: 'bg-destructive/15 text-destructive border-destructive/30',
}

export default function LogsNotificacoes() {
  const { restaurant } = useRestaurant()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    if (!restaurant) return
    setLoading(true)
    entities.Notification.list({ restaurant_id: restaurant.id })
      .then(setNotifications)
      .catch(() => toast.error('Erro ao carregar notificações.'))
      .finally(() => setLoading(false))
  }, [restaurant])

  const filtered = useMemo(
    () => (typeFilter === 'all' ? notifications : notifications.filter((n) => n.type === typeFilter)),
    [notifications, typeFilter]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Logs de Notificações</h1>

      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Nenhuma notificação encontrada.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{TYPE_LABELS[n.type] || n.type}</p>
                    <p className="text-xs text-muted-foreground">{n.recipient_name} · {n.channel}</p>
                  </div>
                </div>
                <Badge className={STATUS_BADGE[n.status]}>{n.status}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
