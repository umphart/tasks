import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Create profile if user signs up AND is confirmed
      if (event === 'SIGNED_IN' && session?.user) {
        await createProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const createProfile = async (user) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0],
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          updated_at: new Date().toISOString(),
        })
        console.log('Profile created for:', user.email)
      }
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { error }
    }
  }

  const signup = async (email, password, fullName) => {
    console.log('Signup attempt for:', email)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      
      console.log('Signup response:', { data, error })
      
      // Handle email confirmation
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('Email confirmation required for:', email)
        // Don't create profile yet - wait for confirmation
      } else if (data?.user && data.user.email_confirmed_at) {
        console.log('User auto-confirmed:', data.user.email)
        // Create profile immediately if auto-confirmed
        await createProfile(data.user)
      }
      
      return { data, error }
    } catch (error) {
      console.error('Signup error:', error)
      return { error }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}