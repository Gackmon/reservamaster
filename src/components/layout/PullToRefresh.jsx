import React, { useRef, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const THRESHOLD = 70

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const containerRef = useRef(null)

  const onTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop <= 0) {
      startY.current = e.touches[0].clientY
      pulling.current = true
    }
  }, [])

  const onTouchMove = useCallback(
    (e) => {
      if (!pulling.current || refreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta > 0 && containerRef.current?.scrollTop <= 0) {
        setPullDistance(Math.min(delta * 0.5, 100))
      }
    },
    [refreshing]
  )

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false
    if (pullDistance > THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh?.()
      } finally {
        setRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      className="ptr-container relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: pullDistance }}
      >
        <RefreshCw
          className={cn('h-5 w-5 text-primary', refreshing && 'animate-spin')}
          style={{ transform: refreshing ? undefined : `rotate(${pullDistance * 3.6}deg)` }}
        />
      </div>
      {children}
    </div>
  )
}
