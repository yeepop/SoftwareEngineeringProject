import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthContextType, RegisterDto } from '../types'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // TODO: Verify token and get user data
      // For now, we'll assume token is valid and decode it
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]))
        setUser({
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          firstName: payload.firstName,
          lastName: payload.lastName,
          phoneNumber: payload.phoneNumber,
          profileImageUrl: payload.profileImageUrl,
          role: payload.role,
          createdAt: '',
          updatedAt: '',
        })
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      const { access_token } = response
      
      setToken(access_token)
      localStorage.setItem('token', access_token)
      
      // Decode token to get user data
      const payload = JSON.parse(atob(access_token.split('.')[1]))
      setUser({
        id: payload.sub,
        email: payload.email,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        profileImageUrl: payload.profileImageUrl,
        role: payload.role,
        createdAt: '',
        updatedAt: '',
      })
      
      toast.success('登入成功！')
    } catch (error: any) {
      toast.error(error.message || '登入失敗')
      throw error
    }
  }

  const register = async (data: RegisterDto) => {
    try {
      await authApi.register(data)
      toast.success('註冊成功！請登入')
    } catch (error: any) {
      toast.error(error.message || '註冊失敗')
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    toast.success('已登出')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}