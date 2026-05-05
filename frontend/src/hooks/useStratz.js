import { useState, useCallback } from 'react'

const API_BASE = 'http://localhost:3001'

export function useStratz() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchPlayer = useCallback(async (steamId) => {
    if (!steamId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/fetch?steamId=${steamId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setData(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, data, fetchPlayer }
}
