import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!user) {
    toast.error('請先登入')
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    toast.error('沒有權限訪問此頁面')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute