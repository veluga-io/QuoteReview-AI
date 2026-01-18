export type UserRole = 'admin' | 'staff'

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  full_name: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  profile: Profile | null
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
