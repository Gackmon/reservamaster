import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, CheckCircle2, XCircle, Armchair, RotateCcw, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { STATUS_META, formatTime, whatsappLink, brl, depositFor } from '@/lib/booking'
import { cn } from '@/lib/utils'

export default function ReservationRow({ reservation, restaurant, onAction }) {
  const meta = STATUS_META[reservation.status] || STATUS_META.confirmed
  const deposit = depositFor(restaurant, reservation.party_size)

  const waMessage = `Olá ${reservation.customer_name}! Sua reserva ${reservation.reservation_code} em ${restaurant?.name || ''} está confirmada para ${formatTime(reservation.reservation_time)}.`

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/detalhe-reserva/${reservation.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-semibold">{formatTime(reservation.reservation_time)}</span>
            <span className="truncate font-medium">{reservation.customer_name}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {reservation.party_size} pessoa(s) · {reservation.reservation_code}
          </p>
        </Link>
        <Badge className={cn('shrink-0', meta.className)}>{meta.label}</Badge>
      </div>

      {reservation.deposit_required && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className={reservation.deposit_paid ? 'text-success' : 'text-warning'}>
            Sinal {reservation.deposit_paid ? 'pago' : 'pendente'}: {brl(deposit)}
          </span>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {!reservation.deposit_paid && reservation.deposit_required && (
          <Button size="sm" variant="success" onClick={() => onAction('markPaid', reservation)}>
            <CheckCircle2 className="h-4 w-4" /> Marcar pago
          </Button>
        )}
        {reservation.status === 'confirmed' && (
          <Button size="sm" onClick={() => onAction('seat', reservation)}>
            <Armchair className="h-4 w-4" /> Sentar
          </Button>
        )}
        {reservation.status === 'seated' && (
          <Button size="sm" variant="success" onClick={() => onAction('complete', reservation)}>
            <CheckCircle2 className="h-4 w-4" /> Concluir
          </Button>
        )}
        {['confirmed', 'pending_payment'].includes(reservation.status) && (
          <Button size="sm" variant="destructive" onClick={() => onAction('noShow', reservation)}>
            <XCircle className="h-4 w-4" /> No-Show
          </Button>
        )}
        {['no_show', 'cancelled'].includes(reservation.status) && (
          <Button size="sm" variant="outline" onClick={() => onAction('reopen', reservation)}>
            <RotateCcw className="h-4 w-4" /> Reabrir
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <a href={whatsappLink(reservation.customer_phone, waMessage)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
