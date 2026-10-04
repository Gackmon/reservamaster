import React, { useEffect, useState, useMemo } from 'react'
import { Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { brl, depositFor } from '@/lib/booking'
import toast from 'react-hot-toast'

export default function RelatorioFinanceiro() {
  const { restaurant } = useRestaurant()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurant) return
    setLoading(true)
    entities.Reservation.list({ restaurant_id: restaurant.id })
      .then(setReservations)
      .catch(() => toast.error('Erro ao carregar relatório.'))
      .finally(() => setLoading(false))
  }, [restaurant])

  const stats = useMemo(() => {
    const paid = reservations.filter((r) => r.deposit_paid)
    const noShows = reservations.filter((r) => r.status === 'no_show')
    const totalRevenue = paid.reduce((sum, r) => sum + depositFor(restaurant, r.party_size), 0)
    const lostToNoShow = noShows.reduce((sum, r) => sum + depositFor(restaurant, r.party_size), 0)

    const byDay = {}
    for (const r of paid) {
      const day = r.reservation_date
      byDay[day] = (byDay[day] || 0) + depositFor(restaurant, r.party_size)
    }
    const chartData = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, value]) => ({ date: date.slice(5), value }))

    return {
      totalRevenue,
      lostToNoShow,
      noShowCount: noShows.length,
      totalReservations: reservations.length,
      chartData,
    }
  }, [reservations, restaurant])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Relatório Financeiro</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Receita de sinais</span>
            </div>
            <p className="mt-1 text-lg font-bold">{brl(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-destructive">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">Perdido em no-shows</span>
            </div>
            <p className="mt-1 text-lg font-bold">{brl(stats.lostToNoShow)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="text-xs">Total de reservas</span>
            </div>
            <p className="mt-1 text-lg font-bold">{stats.totalReservations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs">No-shows</span>
            </div>
            <p className="mt-1 text-lg font-bold">{stats.noShowCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita de sinais (últimos dias)</CardTitle>
        </CardHeader>
        <CardContent className="h-56 pl-0">
          {stats.chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={40} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v) => brl(v)}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
