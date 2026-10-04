import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/api/supabaseClient'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await auth.resetPasswordForEmail(email)
      if (error) throw error
      setSent(true)
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
        <h1 className="font-heading text-2xl font-bold">Recuperar senha</h1>
        <p className="text-center text-sm text-muted-foreground">Enviaremos um link de redefinição para seu e-mail</p>
      </div>

      {sent ? (
        <div className="w-full max-w-sm rounded-lg border border-success/30 bg-success/10 p-4 text-center text-sm text-success">
          Link enviado! Verifique sua caixa de entrada.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@restaurante.com" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </div>
  )
}
