import React from 'react'
import { Link } from 'react-router-dom'
import { Users2, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WAITLIST_STATUS_META } from '@/lib/booking'
import { cn } from '@/lib/utils'

export default function WaitlistPanel({ waitlist }) {
  const waiting = waitlist.filter((w) => w.status === 'waiting' || w.status === 'notified')

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary" /> Fila de espera
        </CardTitle>
        <Link to="/monitor-fila" className="flex items-center text-xs text-primary">
          Ver tudo <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {waiting.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum cliente na fila.</p>
        ) : (
          waiting.slice(0, 4).map((w) => {
            const meta = WAITLIST_STATUS_META[w.status]
            return (
              <div key={w.id} className="flex items-center justify-between rounded-md bg-secondary/40 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{w.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{w.party_size} pessoa(s)</p>
                </div>
                <Badge className={cn('shrink-0', meta.className)}>{meta.label}</Badge>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
