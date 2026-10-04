import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users2,
  Settings as SettingsIcon,
  Menu,
  X,
  Clock,
  CreditCard,
  BarChart3,
  UserCircle2,
  Bell,
  Building2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthProvider'

const primaryItems = [
  { to: '/', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/monitor-fila', label: 'Fila', icon: Users2 },
  { to: '/settings', label: 'Config', icon: SettingsIcon },
]

const moreItems = [
  { to: '/configuracao-turnos', label: 'Turnos', icon: Clock },
  { to: '/configuracoes-pagamento', label: 'Pagamento', icon: CreditCard },
  { to: '/gestao-clientes', label: 'Clientes', icon: UserCircle2 },
  { to: '/relatorio-financeiro', label: 'Relatório Financeiro', icon: BarChart3 },
  { to: '/perfil-restaurante', label: 'Perfil do Restaurante', icon: Building2 },
  { to: '/logs-notificacoes', label: 'Notificações', icon: Bell },
  { to: '/pagamento-mensalidade', label: 'Minha Mensalidade', icon: CreditCard },
  { to: '/gestao-assinaturas', label: 'Assinaturas (Admin)', icon: Building2 },
]

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { signOut } = useAuth()

  return (
    <>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur">
        {primaryItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span>Mais</span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold">Mais opções</h3>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moreItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary/40 p-4 text-center text-sm hover:bg-secondary"
                  >
                    <item.icon className="h-6 w-6 text-primary" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <button
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
