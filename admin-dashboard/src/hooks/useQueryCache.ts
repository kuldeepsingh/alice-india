/**
 * Custom Hooks for Frontend Caching Optimization
 * React Query integration and local caching strategies
 */

import { useCallback, useState, useEffect } from 'react'

/**
 * Hook for API calls with caching
 */
export function useApiCache<T>(
  url: string,
  options?: {
    ttl?: number // seconds
    enabled?: boolean
    onError?: (error: Error) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [cached, setCached] = useState(false)

  // Cache key
  const cacheKey = `api-cache:${url}`
  const ttl = options?.ttl || 5 * 60 * 1000 // 5 minutes default

  const fetchData = useCallback(async () => {
    // Check local cache first
    const cached = localStorage.getItem(cacheKey)
    const timestamp = localStorage.getItem(`${cacheKey}:ts`)

    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp)
      if (age < ttl) {
        setData(JSON.parse(cached))
        setCached(true)
        setLoading(false)
        return
      }
    }

    // Fetch from API
    try {
      setLoading(true)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const result = await response.json()
      setData(result.data || result)
      setCached(false)

      // Store in local cache
      localStorage.setItem(cacheKey, JSON.stringify(result.data || result))
      localStorage.setItem(`${cacheKey}:ts`, Date.now().toString())

      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options?.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [url, cacheKey, ttl, options])

  useEffect(() => {
    if (options?.enabled !== false) {
      fetchData()
    }
  }, [fetchData, options?.enabled])

  const refresh = useCallback(() => {
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(`${cacheKey}:ts`)
    fetchData()
  }, [cacheKey, fetchData])

  const invalidate = useCallback(() => {
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(`${cacheKey}:ts`)
    setCached(false)
  }, [cacheKey])

  return { data, loading, error, cached, refresh, invalidate }
}

/**
 * Hook for debounced search queries
 */
export function useDebounce<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for paginated data with caching
 */
export function usePaginatedApi<T>(
  baseUrl: string,
  itemsPerPage: number = 10
) {
  const [page, setPage] = useState(1)
  const [allData, setAllData] = useState<T[]>([])
  const [total, setTotal] = useState(0)

  const {
    data,
    loading,
    error,
    refresh,
  } = useApiCache<any>(
    `${baseUrl}?limit=${itemsPerPage}&offset=${(page - 1) * itemsPerPage}`,
    { ttl: 5 * 60 * 1000 }
  )

  useEffect(() => {
    if (data?.data) {
      setAllData(data.data)
      if (data.pagination?.total) {
        setTotal(data.pagination.total)
      }
    }
  }, [data])

  const totalPages = Math.ceil(total / itemsPerPage)

  return {
    data: allData,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage,
    refresh,
  }
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const update = useCallback(
    async (newData: Partial<T>) => {
      const optimisticData = { ...data, ...newData } as T
      setData(optimisticData)
      setLoading(true)

      try {
        const result = await updateFn(optimisticData)
        setData(result)
        setError(null)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setData(data) // Revert to original
        throw error
      } finally {
        setLoading(false)
      }
    },
    [data, updateFn]
  )

  return { data, loading, error, update }
}

/**
 * Hook for batch requests
 */
export function useBatchApi<T>(
  urls: string[],
  options?: {
    enabled?: boolean
    ttl?: number
  }
) {
  const [results, setResults] = useState<(T | null)[]>(
    urls.map(() => null)
  )
  const [loading, setLoading] = useState(urls.length > 0)
  const [errors, setErrors] = useState<(Error | null)[]>(
    urls.map(() => null)
  )

  useEffect(() => {
    if (options?.enabled === false || urls.length === 0) return

    const fetchAll = async () => {
      setLoading(true)
      const newResults: (T | null)[] = []
      const newErrors: (Error | null)[] = []

      // Fetch all in parallel
      const promises = urls.map((url) =>
        fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
          .then((r) => r.json())
          .catch((err) => err)
      )

      const responses = await Promise.all(promises)

      responses.forEach((response) => {
        if (response instanceof Error) {
          newResults.push(null)
          newErrors.push(response)
        } else {
          newResults.push(response.data || response)
          newErrors.push(null)
        }
      })

      setResults(newResults)
      setErrors(newErrors)
      setLoading(false)
    }

    fetchAll()
  }, [urls.join(','), options?.enabled, options?.ttl])

  return { results, loading, errors }
}

/**
 * Hook for session storage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      sessionStorage.setItem(key, JSON.stringify(valueToStore))
    } catch {
      console.error('SessionStorage error:', key)
    }
  }

  return [storedValue, setValue]
}
