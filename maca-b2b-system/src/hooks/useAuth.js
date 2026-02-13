import { useState, useEffect, createContext, useContext } from 'react'
import { auth } from '../lib/supabase.js'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 初期認証状態を確認
    const getInitialSession = async () => {
      try {
        const { user, error } = await auth.getCurrentUser()
        if (error) throw error
        setUser(user)
      } catch (err) {
        console.error('Initial auth check failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          setError(null)
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await auth.signUp(email, password, metadata)
      
      if (error) throw error
      
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
      }
      
      return { data, error: null }
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message)
      toast.error(err.message || 'アカウント作成に失敗しました')
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await auth.signIn(email, password)
      
      if (error) throw error
      
      toast.success('ログインしました')
      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err.message)
      toast.error(err.message || 'ログインに失敗しました')
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      setError(null)
      toast.success('ログアウトしました')
      return { error: null }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
      toast.error(err.message || 'ログアウトに失敗しました')
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      toast.success('パスワードリセットメールを送信しました')
      return { error: null }
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.message)
      toast.error(err.message || 'パスワードリセットに失敗しました')
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      toast.success('パスワードを更新しました')
      return { error: null }
    } catch (err) {
      console.error('Password update error:', err)
      setError(err.message)
      toast.error(err.message || 'パスワード更新に失敗しました')
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin',
    isPresident: user?.user_metadata?.role === 'president',
    isAccounting: user?.user_metadata?.role === 'accounting',
    isCustomer: user?.user_metadata?.role === 'customer'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

