import { supabase } from './supabase'
import type { User, Profile } from '../types/auth'

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  if (!data.user) throw new Error('No user returned')

  const profile = await getProfile(data.user.id)

  return {
    id: data.user.id,
    email: data.user.email!,
    profile,
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getProfile(user.id)

  return {
    id: user.id,
    email: user.email!,
    profile,
  }
}

async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}
