// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug: Check if env vars are loaded
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key loaded:', supabaseAnonKey ? 'YES' : 'NO')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase