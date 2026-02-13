import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Customers
  getCustomers: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createCustomer: async (customer) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
    return { data, error }
  },

  updateCustomer: async (id, updates) => {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteCustomer: async (id) => {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Orders
  getOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createOrder: async (order) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
    return { data, error }
  },

  updateOrder: async (id, updates) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  // Applications
  getApplications: async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createApplication: async (application) => {
    const { data, error } = await supabase
      .from('applications')
      .insert([application])
      .select()
    return { data, error }
  },

  updateApplication: async (id, updates) => {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  }
}

