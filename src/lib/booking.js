/**
 * Biblioteca de utilidades de reserva — reutilizada por Dashboard, Book,
 * MonitorFila, RelatorioFinanceiro, DetalheReserva, etc.
 */

/** Metadados (label + classes de cor Tailwind) para cada status de reserva. */
export const STATUS_META = {
  pending_payment: {
    label: 'Aguardando Pagamento',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  confirmed: {
    label: 'Confirmada',
    className: 'bg-success/15 text-success border-success/30',
  },
  seated: {
    label: 'Sentado',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  completed: {
    label: 'Concluída',
    className: 'bg-muted text-muted-foreground border-border',
  },
  no_show: {
    label: 'No-Show',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-muted text-muted-foreground border-border line-through',
  },
}

export const WAITLIST_STATUS_META = {
  waiting: { label: 'Aguardando', className: 'bg-warning/15 text-warning border-warning/30' },
  notified: { label: 'Notificado', className: 'bg-primary/15 text-primary border-primary/30' },
  seated: { label: 'Sentado', className: 'bg-success/15 text-success border-success/30' },
  cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border' },
}

/** Formata um valor numérico em Real brasileiro. */
export function brl(v) {
  const n = Number(v) || 0
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Gera um código de reserva no formato RES-XXXX. */
export function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return `RES-${code}`
}

/**
 * Calcula o valor de sinal exigido para uma reserva.
 * @param {object} restaurant - registro Restaurant
 * @param {number} partySize - número de pessoas
 * @returns {number} valor do sinal (0 se não exigido)
 */
export function depositFor(restaurant, partySize) {
  if (!restaurant?.require_deposit) return 0
  if (partySize < (restaurant.min_party_size_for_deposit || 1)) return 0

  if (restaurant.deposit_type === 'fixed') {
    return Number(restaurant.deposit_amount) || 0
  }
  // per_person
  return (Number(restaurant.deposit_amount) || 0) * partySize
}

/**
 * Gera a lista de horários disponíveis entre open e close, respeitando o intervalo.
 * @param {string} open - "HH:mm" ou "HH:mm:ss"
 * @param {string} close - "HH:mm" ou "HH:mm:ss"
 * @param {number} interval - minutos entre slots
 * @returns {string[]} lista de horários "HH:mm"
 */
export function buildSlots(open, close, interval = 30) {
  if (!open || !close || !interval) return []

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const toHHMM = (mins) => {
    const h = Math.floor(mins / 60) % 24
    const m = mins % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const startMin = toMinutes(open)
  const endMin = toMinutes(close)
  const slots = []

  for (let t = startMin; t < endMin; t += interval) {
    slots.push(toHHMM(t))
  }
  return slots
}

/**
 * Verifica quantos assentos já estão reservados em um determinado slot,
 * dado um array de reservas do dia (apenas confirmed/pending_payment/seated contam).
 */
export function occupiedForSlot(reservations, date, time) {
  const activeStatuses = ['pending_payment', 'confirmed', 'seated']
  return reservations
    .filter(
      (r) => r.reservation_date === date && r.reservation_time?.slice(0, 5) === time && activeStatuses.includes(r.status)
    )
    .reduce((sum, r) => sum + (r.party_size || 0), 0)
}

/**
 * Gera uma string Pix "copia e cola" — placeholder para integração real de gateway.
 * @param {string} code - código da reserva
 * @param {number} value - valor do sinal
 */
export function fakePix(code, value) {
  const amount = (Number(value) || 0).toFixed(2)
  const payload = `00020126360014BR.GOV.BCB.PIX0114+000000000005204000053039865406${amount}5802BR5913RESERVAMASTER6009SAOPAULO62070503${code}6304`
  return payload
}

/** Monta um link wa.me para envio de mensagem via WhatsApp. */
export function whatsappLink(phone, text) {
  const digits = (phone || '').replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const encoded = encodeURIComponent(text || '')
  return `https://wa.me/${withCountry}?text=${encoded}`
}

/** Formata "HH:mm:ss" ou "HH:mm" para exibição "HH:mm". */
export function formatTime(t) {
  if (!t) return ''
  return t.slice(0, 5)
}

/** Formata uma data ISO "YYYY-MM-DD" para "DD/MM/YYYY". */
export function formatDateBR(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

/** Retorna a data de hoje no formato "YYYY-MM-DD" (fuso local). */
export function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 10)
}
