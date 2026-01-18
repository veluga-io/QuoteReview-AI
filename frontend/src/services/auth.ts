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
  console.log('🔍 getCurrentUser called')

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: getUser took too long')), 5000)
    })

    const getUserPromise = supabase.auth.getUser()

    const { data: { user } } = await Promise.race([getUserPromise, timeoutPromise])

    console.log('🔍 getUser result:', user ? 'user found' : 'no user')

    if (!user) return null

    console.log('🔍 fetching profile for user:', user.id)
    const profile = await getProfile(user.id)
    console.log('🔍 profile result:', profile ? 'profile found' : 'no profile')

    return {
      id: user.id,
      email: user.email!,
      profile,
    }
  } catch (error) {
    console.error('🔍 getCurrentUser error:', error)
    throw error
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
