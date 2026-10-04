import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarCheck2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth, entities } from '@/api/supabaseClient'
import toast from 'react-hot-toast'

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function Register() {
  const navigate = useNavigate()
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error

      const userId = data.user?.id
      if (userId) {
        const baseSlug = slugify(restaurantName) || `restaurante-${Date.now()}`
        await entities.Restaurant.create({
          owner_id: userId,
          name: restaurantName,
          slug: `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`,
        })
      }

      toast.success('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
          <CalendarCheck2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Comece a gerenciar suas reservas</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="restaurantName">Nome do restaurante</Label>
          <Input id="restaurantName" required value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="Meu Restaurante" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@restaurante.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
