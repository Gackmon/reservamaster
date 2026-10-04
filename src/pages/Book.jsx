import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, CalendarCheck2, Users, Clock, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import PixModal from '@/components/booking/PixModal'
import { entities } from '@/api/supabaseClient'
import {
  buildSlots,
  occupiedForSlot,
  depositFor,
  genCode,
  fakePix,
  todayISO,
  formatTime,
} from '@/lib/booking'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function Book() {
  const { slug } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [shifts, setShifts] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [date, setDate] = useState(todayISO())
  const [partySize, setPartySize] = useState(2)
  const [selectedTime, setSelectedTime] = useState(null)

  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [createdReservation, setCreatedReservation] = useState(null)
  const [pixModalOpen, setPixModalOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const restaurants = await entities.Restaurant.list({ slug })
      const r = restaurants?.[0]
      if (!r) {
        setNotFound(true)
        return
      }
      setRestaurant(r)
      const [shiftList, resList] = await Promise.all([
        entities.OperatingHour.list({ restaurant_id: r.id }),
        entities.Reservation.list({ restaurant_id: r.id }),
      ])
      setShifts(shiftList.filter((s) => s.is_active))
      setReservations(resList)
    } catch (err) {
      toast.error('Erro ao carregar o restaurante.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const dayOfWeek = useMemo(() => new Date(`${date}T00:00:00`).getDay(), [date])

  const shiftsForDay = useMemo(() => shifts.filter((s) => s.day_of_week === dayOfWeek), [shifts, dayOfWeek])

  const availableSlots = useMemo(() => {
    if (!restaurant) return []
    const slots = []
    for (const shift of shiftsForDay) {
      const times = buildSlots(shift.open_time?.slice(0, 5), shift.close_time?.slice(0, 5), restaurant.slot_interval_minutes)
      for (const time of times) {
        const occupied = occupiedForSlot(reservations, date, time)
        const remaining = (restaurant.max_capacity_per_slot || 0) - occupied
        slots.push({ time, shiftName: shift.shift_name, remaining })
      }
    }
    return slots
  }, [shiftsForDay, reservations, date, restaurant])

  const deposit = restaurant ? depositFor(restaurant, partySize) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedTime) {
      toast.error('Selecione um horário disponível.')
      return
    }
    setSubmitting(true)
    try {
      const code = genCode()
      const requiresDeposit = deposit > 0
      const payload = {
        restaurant_id: restaurant.id,
        reservation_code: code,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        party_size: Number(partySize),
        notes: form.notes || null,
        reservation_date: date,
        reservation_time: selectedTime,
        status: requiresDeposit ? 'pending_payment' : 'confirmed',
        deposit_required: requiresDeposit,
        deposit_paid: false,
        payment_status: 'pending',
        pix_copy_paste: requiresDeposit ? fakePix(code, deposit) : null,
      }
      const created = await entities.Reservation.create(payload)
      setCreatedReservation(created)

      if (requiresDeposit) {
        setPixModalOpen(true)
      } else {
        setDone(true)
        toast.success('Reserva confirmada!')
      }
    } catch (err) {
      toast.error('Não foi possível criar a reserva. Tente outro horário.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmPayment() {
    if (!createdReservation) return
    setConfirming(true)
    try {
      await entities.Reservation.update(createdReservation.id, {
        deposit_paid: true,
        payment_status: 'paid',
        status: 'confirmed',
      })
      setPixModalOpen(false)
      setDone(true)
      toast.success('Pagamento confirmado! Reserva garantida.')
    } catch (err) {
      toast.error('Erro ao confirmar pagamento.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <CalendarCheck2 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Restaurante não encontrado.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <CalendarCheck2 className="h-14 w-14 text-success" />
        <h1 className="font-heading text-xl font-bold">Reserva confirmada!</h1>
        <p className="text-muted-foreground">
          Código: <span className="font-semibold text-foreground">{createdReservation.reservation_code}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {formatTime(selectedTime)} · {partySize} pessoa(s) · {restaurant.name}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-10">
      <div
        className="relative flex h-40 items-end bg-secondary bg-cover bg-center"
        style={{ backgroundImage: restaurant.cover_image_url ? `url(${restaurant.cover_image_url})` : undefined }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 flex items-center gap-3 px-4 pb-4">
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt={restaurant.name} className="h-14 w-14 rounded-full border-2 border-background object-cover" />
          )}
          <div>
            <h1 className="font-heading text-xl font-bold">{restaurant.name}</h1>
            {restaurant.address && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {restaurant.address}
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <Card>
          <CardContent className="space-y-3 p-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" min={todayISO()} value={date} onChange={(e) => { setDate(e.target.value); setSelectedTime(null) }} required />
              </div>
              <div className="space-y-1.5">
                <Label>Pessoas</Label>
                <Input type="number" min={1} value={partySize} onChange={(e) => { setPartySize(e.target.value); setSelectedTime(null) }} required />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{WEEKDAY_NAMES[dayOfWeek]}</p>
          </CardContent>
        </Card>

        <div>
          <Label className="mb-2 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Horários disponíveis</Label>
          {availableSlots.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              Sem horários disponíveis para esta data.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => {
                const full = slot.remaining < Number(partySize)
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={full}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      'min-h-[44px] rounded-md border text-sm font-medium transition-colors',
                      full && 'cursor-not-allowed border-border bg-secondary/30 text-muted-foreground/50 line-through',
                      !full && selectedTime === slot.time && 'border-primary bg-primary text-primary-foreground',
                      !full && selectedTime !== slot.time && 'border-border bg-secondary/40 hover:bg-secondary'
                    )}
                  >
                    {slot.time}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="space-y-3 p-3">
            <div className="space-y-1.5">
              <Label>Nome completo</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Telefone</Label>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail (opcional)</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Observações (opcional)</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Alergias, ocasião especial..." />
            </div>
          </CardContent>
        </Card>

        {deposit > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Sinal exigido</span>
            <span className="font-semibold text-primary">R$ {deposit.toFixed(2)}</span>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={submitting || !selectedTime}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : deposit > 0 ? 'Continuar para pagamento' : 'Confirmar reserva'}
        </Button>
      </form>

      <PixModal
        open={pixModalOpen}
        onOpenChange={setPixModalOpen}
        amount={deposit}
        pixCode={createdReservation?.pix_copy_paste}
        onConfirmPayment={handleConfirmPayment}
        confirming={confirming}
      />
    </div>
  )
}
