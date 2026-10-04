import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/api/supabaseClient'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      const { error } = await auth.updatePassword(password)
      if (error) throw error
      toast.success('Senha redefinida com sucesso!')
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
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold">Nova senha</h1>
        <p className="text-sm text-muted-foreground">Defina sua nova senha de acesso</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input id="confirm" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redefinir senha'}
        </Button>
      </form>
    </div>
  )
}
