import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, Phone, Mail, Users, Calendar, Clock, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { STATUS_META, formatTime, formatDateBR, whatsappLink, brl, depositFor } from '@/lib/booking'
import toast from 'react-hot-toast'

export default function DetalheReserva() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { restaurant } = useRestaurant()
  const [reservation, setReservation] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([entities.Reservation.get(id), entities.Notification.list({ reservation_id: id })])
      .then(([res, notifs]) => {
        setReservation(res)
        setNotifications(notifs)
      })
      .catch(() => toast.error('Reserva não encontrada.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !reservation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const meta = STATUS_META[reservation.status]
  const deposit = depositFor(restaurant, reservation.party_size)

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">{reservation.reservation_code}</h1>
        <Badge className={meta.className}>{meta.label}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-base font-medium">{reservation.customer_name}</p>
          <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {reservation.customer_phone}</p>
          {reservation.customer_email && (
            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {reservation.customer_email}</p>
          )}
          <p className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {reservation.party_size} pessoa(s)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Reserva</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> {formatDateBR(reservation.reservation_date)}</p>
          <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {formatTime(reservation.reservation_time)}</p>
          {reservation.notes && <p className="rounded-md bg-secondary/40 p-2 text-sm">{reservation.notes}</p>}
        </CardContent>
      </Card>

      {reservation.deposit_required && (
        <Card>
          <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Sinal: <span className="font-semibold">{brl(deposit)}</span></p>
            <p>Status: <span className={reservation.deposit_paid ? 'text-success' : 'text-warning'}>{reservation.deposit_paid ? 'Pago' : 'Pendente'}</span></p>
            {reservation.payment_gateway_tx_id && <p className="text-xs text-muted-foreground">TX: {reservation.payment_gateway_tx_id}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Notificações enviadas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma notificação enviada ainda.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="rounded-md bg-secondary/40 p-2 text-xs">
                <p className="font-medium">{n.type}</p>
                <p className="text-muted-foreground">{n.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button className="w-full" variant="outline" asChild>
        <a href={whatsappLink(reservation.customer_phone, `Olá ${reservation.customer_name}!`)} target="_blank" rel="noreferrer">
          <MessageCircle className="h-4 w-4" /> Enviar mensagem no WhatsApp
        </a>
      </Button>
    </div>
  )
}
