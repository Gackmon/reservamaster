import React, { useState } from 'react'
import { Copy, Loader2, CheckCircle2, QrCode } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { brl } from '@/lib/booking'
import toast from 'react-hot-toast'

export default function PixModal({ open, onOpenChange, amount, pixCode, onConfirmPayment, confirming }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(pixCode || '')
    setCopied(true)
    toast.success('Código Pix copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pagamento do sinal</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código Pix abaixo para confirmar sua reserva.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>

          <p className="text-2xl font-bold text-primary">{brl(amount)}</p>

          <div className="w-full rounded-md border border-border bg-secondary/40 p-2">
            <p className="break-all text-xs text-muted-foreground">{pixCode}</p>
          </div>

          <Button variant="outline" className="w-full" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar código Pix'}
          </Button>

          <Button className="w-full" onClick={onConfirmPayment} disabled={confirming}>
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Já paguei, confirmar reserva'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Esta é uma simulação de pagamento Pix. Em produção, a confirmação deve vir de um webhook do gateway (Stripe/Asaas/Mercado Pago).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
