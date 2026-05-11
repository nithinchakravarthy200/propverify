import { supabase } from './supabase'

/**
 * Increments view count via security-definer RPC.
 * Falls back to direct update if RPC fails.
 */
export async function incrementView(propertyId) {
  if (!propertyId || isNaN(propertyId)) return

  try {
    // Try the security definer RPC first (bypasses RLS)
    const { error } = await supabase.rpc('increment_property_views', { prop_id: propertyId })

    if (error) {
      // Fallback: direct update (works if anon update is allowed)
      await supabase
        .from('properties')
        .update({ views: supabase.raw('coalesce(views, 0) + 1') })
        .eq('id', propertyId)
    }
  } catch (e) {
    console.warn('View increment failed:', e?.message)
  }
}

/**
 * Track property ID in localStorage for Recently Viewed
 */
export function trackLocalView(propertyId) {
  if (!propertyId) return
  try {
    const key = 'pv_viewed'
    const prev = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = [propertyId, ...prev.filter(x => x !== propertyId)].slice(0, 20)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {}
}
