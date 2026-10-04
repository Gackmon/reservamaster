import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarX2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <CalendarX2 className="h-16 w-16 text-muted-foreground" />
      <h1 className="font-heading text-2xl font-bold">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">A página que você procura não existe ou foi movida.</p>
      <Button asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
