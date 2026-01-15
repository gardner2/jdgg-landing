import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if environment variables are properly set
export const supabase = supabaseUrl !== 'https://placeholder.supabase.co' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types
export interface ProjectSubmission {
  id?: string
  created_at?: string
  project_type: string
  scope: {
    pages: number
    features: string[]
    complexity: string
  }
  timeline: {
    deadline: string
    urgency: string
  }
  budget: {
    range: string
    flexibility: string
  }
  client: {
    name: string
    email: string
    company?: string
    phone?: string
  }
  requirements: string
  status?: 'new' | 'reviewed' | 'quoted' | 'accepted' | 'rejected'
}
