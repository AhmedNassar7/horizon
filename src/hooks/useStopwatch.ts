import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Drift-free stopwatch: elapsed time is always recomputed from real
 * timestamps (`Date.now() - startedAt`), never accumulated by adding a
 * fixed interval delta on every tick — the classic `setInterval(() =>
 * setElapsed(e => e + 1000), 1000)` bug drifts because JS timers aren't
 * perfectly precise. The interval here only triggers a re-render; the
 * displayed value is always derived from absolute time.
 */
export function useStopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startedAtRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      if (startedAtRef.current != null) {
        setElapsedMs(accumulatedRef.current + (Date.now() - startedAtRef.current))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isRunning])

  const start = useCallback(() => {
    startedAtRef.current = Date.now()
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    if (startedAtRef.current != null) {
      accumulatedRef.current += Date.now() - startedAtRef.current
    }
    startedAtRef.current = null
    setElapsedMs(accumulatedRef.current)
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    startedAtRef.current = null
    accumulatedRef.current = 0
    setElapsedMs(0)
    setLaps([])
    setIsRunning(false)
  }, [])

  const lap = useCallback(() => {
    setLaps((prev) => [elapsedMs, ...prev])
  }, [elapsedMs])

  return { elapsedMs, isRunning, laps, start, pause, reset, lap }
}
