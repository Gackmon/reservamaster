import React from 'react'
import { CalendarDays, Users, Wallet, Clock3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { brl } from '@/lib/booking'

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold leading-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MetricsBar({ reservationsCount, totalPax, totalDeposits, waitlistCount }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <MetricCard icon={CalendarDays} label="Reservas hoje" value={reservationsCount} />
      <MetricCard icon={Users} label="Total de pessoas" value={totalPax} />
      <MetricCard icon={Wallet} label="Sinais recebidos" value={brl(totalDeposits)} />
      <MetricCard icon={Clock3} label="Na fila" value={waitlistCount} />
    </div>
  )
}
