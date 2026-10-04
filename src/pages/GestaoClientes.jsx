import React, { useEffect, useState, useMemo } from 'react'
import { Loader2, Search, Phone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { brl, depositFor, formatDateBR } from '@/lib/booking'
import toast from 'react-hot-toast'

export default function GestaoClientes() {
  const { restaurant } = useRestaurant()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!restaurant) return
    setLoading(true)
    entities.Reservation.list({ restaurant_id: restaurant.id })
      .then(setReservations)
      .catch(() => toast.error('Erro ao carregar clientes.'))
      .finally(() => setLoading(false))
  }, [restaurant])

  const customers = useMemo(() => {
    const map = new Map()
    for (const r of reservations) {
      const key = r.customer_phone
      if (!map.has(key)) {
        map.set(key, {
          name: r.customer_name,
          phone: r.customer_phone,
          email: r.customer_email,
          visits: 0,
          noShows: 0,
          totalSpent: 0,
          lastVisit: null,
        })
      }
      const c = map.get(key)
      c.visits += 1
      if (r.status === 'no_show') c.noShows += 1
      if (r.deposit_paid) c.totalSpent += depositFor(restaurant, r.party_size)
      if (!c.lastVisit || r.reservation_date > c.lastVisit) c.lastVisit = r.reservation_date
    }
    return Array.from(map.values())
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
      .sort((a, b) => b.visits - a.visits)
  }, [reservations, search, restaurant])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Gestão de Clientes</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {customers.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado.
        </p>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Card key={c.phone}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </p>
                    {c.email && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" /> {c.email}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{brl(c.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">gasto total</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="border-border bg-secondary text-secondary-foreground">{c.visits} visita(s)</Badge>
                  {c.noShows > 0 && (
                    <Badge className="border-destructive/30 bg-destructive/15 text-destructive">{c.noShows} no-show(s)</Badge>
                  )}
                  {c.lastVisit && (
                    <Badge className="border-border bg-secondary text-secondary-foreground">Última: {formatDateBR(c.lastVisit)}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
