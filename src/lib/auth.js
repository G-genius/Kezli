import { supabase } from './supabase'

export async function signUp(email, password) {
  return supabase.auth.signUp({
    email,
    password,
  })
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}