import React from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function ShiftsEditor({ shifts, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-3">
      {shifts.map((shift, idx) => (
        <Card key={shift.id || idx}>
          <CardContent className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <Label>Dia da semana</Label>
                <Select value={String(shift.day_of_week)} onValueChange={(v) => onChange(idx, { ...shift, day_of_week: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onRemove(idx)} className="mt-6 shrink-0 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Nome do turno</Label>
              <Input value={shift.shift_name} onChange={(e) => onChange(idx, { ...shift, shift_name: e.target.value })} placeholder="Almoço, Jantar..." />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Abertura</Label>
                <Input type="time" value={shift.open_time?.slice(0, 5)} onChange={(e) => onChange(idx, { ...shift, open_time: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fechamento</Label>
                <Input type="time" value={shift.close_time?.slice(0, 5)} onChange={(e) => onChange(idx, { ...shift, close_time: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Turno ativo</Label>
              <Switch checked={shift.is_active} onCheckedChange={(v) => onChange(idx, { ...shift, is_active: v })} />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={onAdd}>
        <Plus className="h-4 w-4" /> Adicionar turno
      </Button>
    </div>
  )
}
