import { useState, useEffect, useCallback } from 'react'

/**
 * useState backed by sessionStorage — persists across page refresh within same tab.
 * All data is cleared when the tab closes (session ends).
 */
export function useSessionState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setSessionState = useCallback(
    (value) => {
      setState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        try {
          if (next === null || next === undefined) {
            sessionStorage.removeItem(key)
          } else {
            sessionStorage.setItem(key, JSON.stringify(next))
          }
        } catch {
          // sessionStorage quota exceeded — still update in-memory
        }
        return next
      })
    },
    [key],
  )

  return [state, setSessionState]
}
