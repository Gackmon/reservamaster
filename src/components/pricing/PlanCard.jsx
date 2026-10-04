import React from 'react'
import { Check, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { brl } from '@/lib/booking'
import { cn } from '@/lib/utils'

export default function PlanCard({ name, price, period, features, highlighted, badge, onSelect }) {
  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-primary shadow-lg shadow-primary/10'
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          <Star className="h-3 w-3 fill-current" /> Mais popular
        </div>
      )}
      <CardHeader className="pb-2 pt-6 text-center">
        <h3 className="font-heading text-lg font-bold">{name}</h3>
        {badge && <p className="mt-1 text-xs font-medium text-primary">{badge}</p>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="text-center">
          <span className="font-heading text-3xl font-extrabold">{brl(price)}</span>
          <span className="text-sm text-muted-foreground">/{period}</span>
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={highlighted ? 'default' : 'outline'} onClick={onSelect}>
          Escolher plano
        </Button>
      </CardContent>
    </Card>
  )
}
