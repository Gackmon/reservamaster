// ============================================================
// send-reservation-reminders
// Equivalente à função sendReservationReminders do Base44.
//
// Busca reservas `confirmed` do dia, filtra as que estão a
// ~2 horas de distância (115–125 min), evita duplicatas
// (se já existe Notification tipo `reminder` para a reserva,
// pula), cria um registro de Notification (canal WhatsApp,
// tipo `reminder`) com mensagem personalizada.
//
// Deploy: supabase functions deploy send-reservation-reminders
// Agendamento: configurar um Cron Job (pg_cron ou Supabase
// Scheduled Functions) para rodar a cada 5 minutos, ex:
//   select cron.schedule(
//     'send-reservation-reminders-every-5-min',
//     '*/5 * * * *',
//     $$ select net.http_post(
//          url := '<PROJECT_URL>/functions/v1/send-reservation-reminders',
//          headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
//        ) $$
//   );
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const now = new Date()
    const todayISO = now.toISOString().slice(0, 10)

    // 1. Busca reservas `confirmed` do dia.
    const { data: reservations, error: resError } = await supabase
      .from('reservation')
      .select('*')
      .eq('status', 'confirmed')
      .eq('reservation_date', todayISO)

    if (resError) throw resError

    let checked = 0
    let sent = 0

    for (const reservation of reservations ?? []) {
      checked++

      // 2. Calcula distância em minutos até o horário da reserva.
      const [h, m] = reservation.reservation_time.slice(0, 5).split(':').map(Number)
      const reservationDateTime = new Date(now)
      reservationDateTime.setHours(h, m, 0, 0)

      const diffMinutes = (reservationDateTime.getTime() - now.getTime()) / 60000

      // Filtra as que estão a ~2 horas de distância (115–125 min).
      if (diffMinutes < 115 || diffMinutes > 125) continue

      // 3. Evita duplicatas: já existe Notification tipo `reminder` para a reserva?
      const { data: existing, error: existingError } = await supabase
        .from('notification')
        .select('id')
        .eq('reservation_id', reservation.id)
        .eq('type', 'reminder')
        .limit(1)

      if (existingError) throw existingError
      if (existing && existing.length > 0) continue

      // 4. Cria o registro de Notification (canal WhatsApp, tipo reminder).
      const message = `Olá ${reservation.customer_name}! Passando para lembrar da sua reserva ${reservation.reservation_code} hoje às ${reservation.reservation_time.slice(0, 5)}. Te esperamos!`

      const { error: insertError } = await supabase.from('notification').insert({
        restaurant_id: reservation.restaurant_id,
        type: 'reminder',
        channel: 'whatsapp',
        recipient_name: reservation.customer_name,
        recipient_contact: reservation.customer_phone,
        message,
        status: 'sent',
        reservation_id: reservation.id,
        sent_at: new Date().toISOString(),
      })

      if (insertError) throw insertError
      sent++
    }

    return jsonResponse({ sent, checked, date: todayISO })
  } catch (err) {
    console.error(err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Erro desconhecido' }, 500)
  }
})
