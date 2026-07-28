import { useCallback, useEffect, useRef, useState } from 'react'

/** Drift-free countdown: remaining time is always `target - Date.now()`,
 * never decremented by a fixed step per tick. See useStopwatch for why. */
export function useCountdown(durationMs: number) {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const [isRunning, setIsRunning] = useState(false)
  const targetAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      if (targetAtRef.current == null) return
      const remaining = Math.max(0, targetAtRef.current - Date.now())
      setRemainingMs(remaining)
      if (remaining <= 0) setIsRunning(false)
    }, 100)
    return () => clearInterval(interval)
  }, [isRunning])

  const start = useCallback(() => {
    if (remainingMs <= 0) return
    targetAtRef.current = Date.now() + remainingMs
    setIsRunning(true)
  }, [remainingMs])

  const pause = useCallback(() => {
    if (targetAtRef.current != null) {
      setRemainingMs(Math.max(0, targetAtRef.current - Date.now()))
    }
    targetAtRef.current = null
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    targetAtRef.current = null
    setRemainingMs(durationMs)
    setIsRunning(false)
  }, [durationMs])

  return { remainingMs, isRunning, isFinished: remainingMs <= 0, start, pause, reset }
}
