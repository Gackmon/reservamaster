import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/AuthProvider'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import ScrollToTop from '@/components/layout/ScrollToTop'

// Auth (públicas)
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'

// Públicas
import Book from '@/pages/Book'
import Pricing from '@/pages/Pricing'

// Protegidas
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import ConfiguracaoTurnos from '@/pages/ConfiguracaoTurnos'
import ConfiguracoesPagamento from '@/pages/ConfiguracoesPagamento'
import MonitorFila from '@/pages/MonitorFila'
import GestaoClientes from '@/pages/GestaoClientes'
import RelatorioFinanceiro from '@/pages/RelatorioFinanceiro'
import DetalheReserva from '@/pages/DetalheReserva'
import PerfilRestaurante from '@/pages/PerfilRestaurante'
import LogsNotificacoes from '@/pages/LogsNotificacoes'
import GestaoAssinaturas from '@/pages/GestaoAssinaturas'
import PagamentoMensalidade from '@/pages/PagamentoMensalidade'

import PageNotFound from '@/pages/PageNotFound'

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(240 8% 12%)',
              color: 'hsl(0 0% 96%)',
              border: '1px solid hsl(240 6% 20%)',
            },
          }}
        />
        <Routes>
          {/* Auth — sempre registradas juntas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Públicas */}
          <Route path="/r/:slug" element={<Book />} />
          <Route path="/planos" element={<Pricing />} />

          {/* Protegidas */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/configuracao-turnos" element={<Protected><ConfiguracaoTurnos /></Protected>} />
          <Route path="/configuracoes-pagamento" element={<Protected><ConfiguracoesPagamento /></Protected>} />
          <Route path="/monitor-fila" element={<Protected><MonitorFila /></Protected>} />
          <Route path="/gestao-clientes" element={<Protected><GestaoClientes /></Protected>} />
          <Route path="/relatorio-financeiro" element={<Protected><RelatorioFinanceiro /></Protected>} />
          <Route path="/detalhe-reserva/:id" element={<Protected><DetalheReserva /></Protected>} />
          <Route path="/perfil-restaurante" element={<Protected><PerfilRestaurante /></Protected>} />
          <Route path="/logs-notificacoes" element={<Protected><LogsNotificacoes /></Protected>} />
          <Route path="/gestao-assinaturas" element={<Protected><GestaoAssinaturas /></Protected>} />
          <Route path="/pagamento-mensalidade" element={<Protected><PagamentoMensalidade /></Protected>} />

          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
