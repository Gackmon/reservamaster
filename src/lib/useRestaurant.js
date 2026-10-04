import { useEffect, useState, useCallback } from 'react'
import { entities } from '@/api/supabaseClient'
import { useAuth } from '@/lib/AuthProvider'

/**
 * Carrega o restaurante (tenant) pertencente ao usuário autenticado.
 * A maioria das páginas protegidas depende deste hook para saber o restaurant_id.
 */
export function useRestaurant() {
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    if (!user) {
      setRestaurant(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await entities.Restaurant.list({ owner_id: user.id }, { limit: 1 })
      setRestaurant(list?.[0] || null)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    reload()
  }, [reload])

  return { restaurant, loading, error, reload }
}
