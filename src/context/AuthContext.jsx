import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      if (error || !data) {
        const { data: np } = await supabase.from('profiles')
          .insert([{ id: authUser.id, email: authUser.email, role: 'buyer' }])
          .select().single()
        setProfile(np || { id: authUser.id, email: authUser.email, role: 'buyer' })
      } else {
        // backfill email if missing
        if (!data.email && authUser.email) {
          await supabase.from('profiles').update({ email: authUser.email }).eq('id', authUser.id)
          setProfile({ ...data, email: authUser.email })
        } else {
          setProfile(data)
        }
      }
    } catch { setProfile({ id: authUser.id, email: authUser.email, role: 'buyer' }) }
    finally { setLoading(false) }
  }

  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null) }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin', signOut, fetchProfile: (u) => fetchProfile(u || user) }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
