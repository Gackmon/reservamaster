import React, { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShiftsEditor from '@/components/settings/ShiftsEditor'
import { entities } from '@/api/supabaseClient'
import { useRestaurant } from '@/lib/useRestaurant'
import toast from 'react-hot-toast'

export default function ConfiguracaoTurnos() {
  const { restaurant } = useRestaurant()
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadShifts = useCallback(async () => {
    if (!restaurant) return
    setLoading(true)
    try {
      const list = await entities.OperatingHour.list({ restaurant_id: restaurant.id }, { orderBy: 'day_of_week', ascending: true })
      setShifts(list)
    } catch (err) {
      toast.error('Erro ao carregar turnos.')
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    loadShifts()
  }, [loadShifts])

  function handleChange(idx, updated) {
    setShifts((prev) => prev.map((s, i) => (i === idx ? updated : s)))
  }

  function handleAdd() {
    setShifts((prev) => [
      ...prev,
      { day_of_week: 1, shift_name: 'Novo turno', open_time: '18:00', close_time: '23:00', is_active: true, _isNew: true },
    ])
  }

  function handleRemove(idx) {
    setShifts((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const shift of shifts) {
        const payload = {
          restaurant_id: restaurant.id,
          day_of_week: shift.day_of_week,
          shift_name: shift.shift_name,
          open_time: shift.open_time,
          close_time: shift.close_time,
          is_active: shift.is_active,
        }
        if (shift.id && !shift._isNew) {
          await entities.OperatingHour.update(shift.id, payload)
        } else {
          await entities.OperatingHour.create(payload)
        }
      }
      toast.success('Turnos salvos com sucesso!')
      loadShifts()
    } catch (err) {
      toast.error('Erro ao salvar turnos.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
      <h1 className="font-heading text-xl font-bold">Turnos de funcionamento</h1>
      <ShiftsEditor shifts={shifts} onChange={handleChange} onAdd={handleAdd} onRemove={handleRemove} />
      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar turnos'}
      </Button>
    </div>
  )
}
