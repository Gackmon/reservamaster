import React, { useEffect, useState, useMemo } from 'react'
import { Loader2, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { entities } from '@/api/supabaseClient'
import { brl, formatDateBR } from '@/lib/booking'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  paid: { label: 'Pago', className: 'bg-success/15 text-success border-success/30' },
  pending: { label: 'Pendente', className: 'bg-warning/15 text-warning border-warning/30' },
  overdue: { label: 'Atrasado', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border' },
}

/**
 * NOTA IMPORTANTE: esta página assume acesso administrativo.
 * Por segurança, a RLS atual restringe cada dono a ver apenas sua própria
 * assinatura. Para um verdadeiro painel admin multi-tenant, é necessário:
 * 1. Uma tabela/coluna que marque usuários como admin (ex: app_admin ou
 *    custom claim no JWT).
 * 2. Uma policy adicional em saas_subscription liberando SELECT para admins.
 * Sem isso, esta página só mostrará a assinatura do restaurante do usuário logado.
 */
export default function GestaoAssinaturas() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    entities.SaaSSubscription.list({})
      .then(setSubscriptions)
      .catch(() => toast.error('Erro ao carregar assinaturas.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => (statusFilter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === statusFilter)),
    [subscriptions, statusFilter]
  )

  const totalMRR = useMemo(
    () => subscriptions.filter((s) => s.status === 'paid').reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [subscriptions]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Gestão de Assinaturas</h1>

      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">Receita recorrente (pagas)</p>
          <p className="text-2xl font-bold">{brl(totalMRR)}</p>
        </CardContent>
      </Card>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="paid">Pago</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="overdue">Atrasado</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Nenhuma assinatura encontrada (ou acesso restrito pela RLS — ver nota técnica no código).
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{s.restaurant_name}</p>
                  <p className="text-xs text-muted-foreground">Vence {formatDateBR(s.due_date)} · {brl(s.amount)}</p>
                </div>
              </div>
              <Badge className={STATUS_BADGE[s.status]?.className}>{STATUS_BADGE[s.status]?.label}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
