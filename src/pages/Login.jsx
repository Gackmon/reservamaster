import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { CalendarCheck2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/api/supabaseClient'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await auth.signIn(email, password)
      if (error) throw error
      toast.success('Login realizado com sucesso!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      const { error } = await auth.signInWithGoogle()
      if (error) throw error
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
          <CalendarCheck2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">ReservaMaster</h1>
        <p className="text-sm text-muted-foreground">Entre na sua conta</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@restaurante.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
        </Button>
      </form>

      <div className="my-5 flex w-full max-w-sm items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full max-w-sm" onClick={handleGoogle}>
        Continuar com Google
      </Button>

      <p className="mt-6 text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
