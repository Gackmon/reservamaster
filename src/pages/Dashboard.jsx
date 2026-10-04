import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Loader2, CalendarCheck2 } from 'lucide-react'
import PullToRefresh from '@/components/layout/PullToRefresh'
import MetricsBar from '@/components/dashboard/MetricsBar'
import ReservationRow from '@/components/dashboard/ReservationRow'
import WaitlistPanel from '@/components/dashboard/WaitlistPanel'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { todayISO, depositFor } from '@/lib/booking'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { restaurant, loading: loadingRestaurant } = useRestaurant()
  const [reservations, setReservations] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const today = todayISO()

  const loadData = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const [resList, wlList] = await Promise.all([
        entities.Reservation.list({ restaurant_id: restaurant.id }, { orderBy: 'reservation_time', ascending: true }),
        entities.Waitlist.list({ restaurant_id: restaurant.id }),
      ])
      setReservations(resList.filter((r) => r.reservation_date === today))
      setWaitlist(wlList)
    } catch (err) {
      toast.error('Erro ao carregar dados do painel.')
    } finally {
      setLoading(false)
    }
  }, [restaurant, today])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Subscrição realtime
  useEffect(() => {
    if (!restaurant) return
    const unsubRes = entities.Reservation.subscribe({ restaurant_id: restaurant.id }, () => loadData())
    const unsubWl = entities.Waitlist.subscribe({ restaurant_id: restaurant.id }, () => loadData())
    return () => {
      unsubRes()
      unsubWl()
    }
  }, [restaurant, loadData])

  const metrics = useMemo(() => {
    const totalPax = reservations.reduce((sum, r) => sum + (r.party_size || 0), 0)
    const totalDeposits = reservations
      .filter((r) => r.deposit_paid)
      .reduce((sum, r) => sum + depositFor(restaurant, r.party_size), 0)
    return {
      reservationsCount: reservations.length,
      totalPax,
      totalDeposits,
      waitlistCount: waitlist.filter((w) => w.status === 'waiting' || w.status === 'notified').length,
    }
  }, [reservations, waitlist, restaurant])

  async function handleAction(action, reservation) {
    // Atualização otimista
    const prevReservations = reservations
    const updates = {
      markPaid: { deposit_paid: true, payment_status: 'paid', status: 'confirmed' },
      seat: { status: 'seated' },
      complete: { status: 'completed' },
      noShow: { status: 'no_show' },
      reopen: { status: 'confirmed' },
    }[action]

    setReservations((prev) => prev.map((r) => (r.id === reservation.id ? { ...r, ...updates } : r)))

    try {
      await entities.Reservation.update(reservation.id, updates)
    } catch (err) {
      setReservations(prevReservations)
      toast.error('Não foi possível atualizar a reserva.')
    }
  }

  if (loadingRestaurant || (loading && reservations.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <CalendarCheck2 className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum restaurante encontrado para esta conta.</p>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
        <div>
          <h1 className="font-heading text-xl font-bold">Olá, {restaurant.name}</h1>
          <p className="text-sm text-muted-foreground">Painel de hoje</p>
        </div>

        <MetricsBar {...metrics} />

        <WaitlistPanel waitlist={waitlist} />

        <div>
          <h2 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">RESERVAS DE HOJE</h2>
          {reservations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Nenhuma reserva para hoje.
            </p>
          ) : (
            <div className="space-y-2">
              {reservations.map((r) => (
                <ReservationRow key={r.id} reservation={r} restaurant={restaurant} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}
