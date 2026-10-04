import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck2, Sparkles } from 'lucide-react'
import PlanCard from '@/components/pricing/PlanCard'
import { cn } from '@/lib/utils'

const MONTHLY_PLANS = [
  {
    name: 'Inicial',
    price: 49,
    features: [
      'Até 60 reservas/mês',
      'Fila de espera básica',
      'Lembretes via WhatsApp',
      '1 usuário',
    ],
  },
  {
    name: 'Profissional',
    price: 99.9,
    highlighted: true,
    badge: 'Recomendado para a maioria',
    features: [
      'Reservas ilimitadas',
      'Sinal anti-no-show (Pix/Cartão)',
      'Fila de espera em tempo real',
      'Relatórios financeiros',
      'Usuários ilimitados',
    ],
  },
]

const ANNUAL_PLAN = {
  name: 'Anual',
  price: 690,
  badge: '2 Meses Grátis',
  features: [
    'Tudo do plano Profissional',
    'Economize 2 meses no ano',
    'Suporte prioritário',
    'Onboarding assistido',
  ],
}

export default function Pricing() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')

  const plans = billing === 'monthly' ? MONTHLY_PLANS : [ANNUAL_PLAN]

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-center text-xs font-medium text-primary">
          <Sparkles className="h-4 w-4" /> Oferta de lançamento: 14 dias grátis em qualquer plano
        </div>

        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <CalendarCheck2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Planos ReservaMaster</h1>
          <p className="text-sm text-muted-foreground">Escolha o plano ideal para o seu restaurante</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-secondary p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'min-h-[40px] rounded-md px-4 text-sm font-medium transition-colors',
                billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'min-h-[40px] rounded-md px-4 text-sm font-medium transition-colors',
                billing === 'annual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              Anual
            </button>
          </div>
        </div>

        <div className={cn('grid gap-4', billing === 'monthly' ? 'sm:grid-cols-2' : 'mx-auto max-w-sm')}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              {...plan}
              period={billing === 'monthly' ? 'mês' : 'ano'}
              onSelect={() => navigate('/register')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
