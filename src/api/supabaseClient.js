import { createClient } from '@supabase/supabase-js'

// Fallback com as credenciais públicas do projeto ReservaMaster.
// A chave "anon" do Supabase é segura para expor no cliente por design —
// o acesso real é controlado pelas políticas de RLS no banco de dados.
// Prefira sempre configurar as variáveis de ambiente (.env / Vercel);
// este fallback existe apenas para garantir que o app funcione mesmo
// sem configuração adicional em novos ambientes de deploy.
const FALLBACK_SUPABASE_URL = 'https://sgkmjjlgqytcrtzjwple.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNna21qamxncXl0Y3J0emp3cGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MjAyOTksImV4cCI6MjEwNDM5NjI5OX0.Wg4WeUNCT7eYtjojs_X2jlQOQvRgHYsjKnbUztt3hWU'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})

/**
 * Camada fina de acesso a entidades, equivalente a base44.entities.<Name>
 * Uso: entities.Reservation.list({ restaurant_id }), entities.Reservation.create({...}), etc.
 */
function makeEntity(table) {
  return {
    table,

    async list(filters = {}, { orderBy = 'created_date', ascending = false, limit } = {}) {
      let query = supabase.from(table).select('*')
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) query = query.eq(key, value)
      }
      query = query.order(orderBy, { ascending })
      if (limit) query = query.limit(limit)
      const { data, error } = await query
      if (error) throw error
      return data
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
      if (error) throw error
      return data
    },

    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single()
      if (error) throw error
      return data
    },

    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    },

    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      return true
    },

    /** Subscrição realtime — equivalente a .subscribe() do Base44 */
    subscribe(filters, callback) {
      const channelName = `${table}_${JSON.stringify(filters)}_${Math.random().toString(36).slice(2)}`
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table, ...(filters?.restaurant_id ? { filter: `restaurant_id=eq.${filters.restaurant_id}` } : {}) },
          (payload) => callback(payload)
        )
        .subscribe()
      return () => supabase.removeChannel(channel)
    },
  }
}

export const entities = {
  Restaurant: makeEntity('restaurant'),
  OperatingHour: makeEntity('operating_hour'),
  Reservation: makeEntity('reservation'),
  Waitlist: makeEntity('waitlist'),
  Notification: makeEntity('notification'),
  PaymentConfig: makeEntity('payment_config'),
  SaaSSubscription: makeEntity('saas_subscription'),
}

export const auth = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    }),
  signOut: () => supabase.auth.signOut(),
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (cb) => supabase.auth.onAuthStateChange(cb),
  resetPasswordForEmail: (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),
  updatePassword: (password) => supabase.auth.updateUser({ password }),
}
