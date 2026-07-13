import { useCallback, useEffect, useRef, useState } from 'react'

export function useApiResource(loader, dependencies = []) {
  const mountedRef = useRef(true)
  const loaderRef = useRef(loader)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dependencyKey = JSON.stringify(dependencies)

  loaderRef.current = loader

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await loaderRef.current()
      if (mountedRef.current) setData(result)
    } catch (loadError) {
      if (mountedRef.current) setError(loadError.message)
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    load()
    return () => {
      mountedRef.current = false
    }
  }, [dependencyKey, load, reloadKey])

  return { data, loading, error, reload, setData }
}
