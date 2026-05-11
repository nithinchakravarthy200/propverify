import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Mock data only used when Supabase is completely unreachable (no env vars set)
import { properties as mockProperties } from '../data/properties'

export function useProperties(options = {}) {
  const { featured = false, limit = null } = options
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [featured, limit])

  async function load() {
    setLoading(true)
    setError(null)

    // If Supabase is not configured at all, fall back to mock
    const url = import.meta.env.VITE_SUPABASE_URL || ''
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    if (!url || url.includes('placeholder') || !key || key === 'placeholder') {
      setProperties(normaliseMock(mockProperties))
      setLoading(false)
      return
    }

    try {
      let query = supabase.from('properties').select('*').order('created_at', { ascending: false })
      if (featured) query = query.eq('is_featured', true)
      if (limit)    query = query.limit(limit)

      const { data, error } = await query

      if (error) {
        console.error('Supabase fetch error:', error.message)
        setError(error.message)
        // Do NOT fall back to mock — show empty so uploaded images aren't overridden
        setProperties([])
      } else {
        setProperties(data || [])
      }
    } catch (e) {
      console.error('useProperties error:', e)
      setError(e.message)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  return { properties, loading, error, refetch: load }
}

// Only used for mock fallback — maps camelCase to snake_case
function normaliseMock(arr) {
  return arr.map(p => ({
    ...p,
    price_per_sqft: p.pricePerSqft,
    builder_trust:  p.builderTrust,
    legal_score:    p.legalScore,
    sunlight_hrs:   p.sunlightHrs,
    rera_id:        p.reraId,
    tag_type:       p.tagType,
    is_featured:    true,
  }))
}
