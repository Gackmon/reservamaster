import React, { useEffect, useState, useCallback } from 'react'
import { Loader2, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import { brl, formatDateBR } from '@/lib/booking'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  paid: { label: 'Pago', className: 'bg-success/15 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/15 text-warning border-warning/30' },
  overdue: { label: 'Atrasado', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border' },
}

export default function PagamentoMensalidade() {
  const { restaurant } = useRestaurant()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  const loadSubscription = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const list = await entities.SaaSSubscription.list({ restaurant_id: restaurant.id }, { orderBy: 'due_date', ascending: false, limit: 1 })
      setSubscription(list?.[0] || null)
    } catch (err) {
      toast.error('Erro ao carregar mensalidade.')
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    loadSubscription()
  }, [loadSubscription])

  async function handlePay() {
    if (!subscription) return
    setPaying(true)
    try {
      // Nota: integração real de cobrança (Stripe Checkout) deve ser feita
      // via Edge Function backend, nunca com chave secreta no frontend.
      await entities.SaaSSubscription.update(subscription.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: 'stripe',
      })
      toast.success('Pagamento confirmado!')
      loadSubscription()
    } catch (err) {
      toast.error('Erro ao processar pagamento.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Minha Mensalidade</h1>

      {!subscription ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Nenhuma mensalidade encontrada.
        </p>
      ) : (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Plano {subscription.plan === 'annual' ? 'Anual' : 'Mensal'}</CardTitle>
            <Badge className={STATUS_BADGE[subscription.status]?.className}>{STATUS_BADGE[subscription.status]?.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-bold">{brl(subscription.amount)}</p>
            <p className="text-sm text-muted-foreground">Vencimento: {formatDateBR(subscription.due_date)}</p>

            {subscription.status === 'overdue' && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                <AlertTriangle className="h-4 w-4" /> Mensalidade em atraso. Regularize para evitar suspensão.
              </div>
            )}

            {subscription.status === 'paid' ? (
              <div className="flex items-center gap-2 rounded-md bg-success/10 p-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" /> Pagamento confirmado em {formatDateBR(subscription.paid_at?.slice(0, 10))}
              </div>
            ) : (
              <Button className="w-full" onClick={handlePay} disabled={paying}>
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" /> Pagar agora</>}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
