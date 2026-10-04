# ReservaMaster

SaaS multi-tenant de gestão de reservas e filas de espera para restaurantes, com sistema anti-no-show (sinal via Pix/Cartão) e lembretes automáticos via WhatsApp.

Reconstrução completa a partir da especificação original (Base44 → React + Vite + Tailwind + shadcn/ui + Supabase).

## Stack

- React 18 + Vite + React Router 6
- Tailwind CSS + shadcn/ui (Radix primitives) + Framer Motion
- Supabase (Postgres + Auth + Realtime + Storage + Edge Functions)
- Recharts (gráficos), react-hot-toast (notificações)

## Rodando localmente

```bash
npm install
cp .env.example .env   # já preenchido com as credenciais do projeto Supabase
npm run dev
```

O app sobe em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (publishable) do Supabase |

## Estrutura

```
src/
  api/supabaseClient.js     — cliente Supabase + camada de entidades (equivalente ao base44Client)
  lib/booking.js            — utilidades: STATUS_META, brl, genCode, depositFor, buildSlots, fakePix, whatsappLink
  lib/AuthProvider.jsx      — contexto de autenticação
  lib/useRestaurant.js      — hook para carregar o tenant do usuário logado
  components/layout/        — AppLayout, MobileNav, PullToRefresh, ScrollToTop, ProtectedRoute
  components/ui/            — componentes shadcn/ui
  components/dashboard/     — MetricsBar, ReservationRow, WaitlistPanel
  components/booking/       — PixModal
  components/settings/      — ShiftsEditor
  components/pricing/       — PlanCard
  pages/                    — todas as rotas da aplicação
supabase/functions/
  send-reservation-reminders/ — Edge Function de lembretes (equivalente ao sendReservationReminders do Base44)
```

## Banco de dados

O schema já está aplicado no projeto Supabase (7 tabelas, enums, RLS multi-tenant, triggers de `updated_date`). Não é necessário rodar migrations manualmente — mas caso queira reconstruir em outro projeto, veja `supabase/migrations/` (não incluídas neste export; use o painel do Supabase SQL Editor com a estrutura documentada nas instruções originais).

### Storage

A página `PerfilRestaurante` faz upload de logo/capa para um bucket chamado `restaurant-media`. Crie esse bucket manualmente no painel do Supabase (Storage → New bucket → público) antes de usar essa funcionalidade.

## Deploy da Edge Function (lembretes automáticos)

```bash
supabase functions deploy send-reservation-reminders --project-ref <SEU_PROJECT_REF>
```

Depois, agende para rodar a cada 5 minutos usando `pg_cron` + `pg_net` (extensões do Supabase):

```sql
select cron.schedule(
  'send-reservation-reminders-every-5-min',
  '*/5 * * * *',
  $$ select net.http_post(
       url := 'https://<SEU_PROJECT_REF>.supabase.co/functions/v1/send-reservation-reminders',
       headers := '{"Authorization": "Bearer <SUPABASE_SERVICE_ROLE_KEY>"}'::jsonb
     ) $$
);
```

## Deploy do frontend (Vercel)

```bash
npm run build
vercel --prod
```

Configure as mesmas variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) no painel do Vercel.

## Notas importantes / TODOs de segurança

- **Pagamentos**: `PixModal` e `fakePix()` geram um código Pix simulado — é um placeholder. Integração real deve ser feita via Stripe (único gateway suportado na região), processada por uma Edge Function backend (nunca com chave secreta no frontend).
- **GestaoAssinaturas (admin)**: a RLS atual restringe cada dono a ver apenas sua própria assinatura SaaS. Para um painel administrativo real que veja todos os tenants, é necessário implementar um mecanismo de "admin" (ex: tabela `app_admin` ou custom claim no JWT) com uma policy adicional.
- **Reserva pública**: por simplicidade, a policy de `reservation` libera leitura pública para cálculo de disponibilidade de horários. Em produção, considere mover esse cálculo para uma função RPC que exponha apenas contagens agregadas, não os dados completos das reservas.
