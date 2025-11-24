import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AuthService from '../services/authService'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = AuthService.isAuthenticated()

  useEffect(() => {
    if (isAuthenticated) {
      AuthService.verifyToken().then((valid) => {
        if (!valid) {
          AuthService.logout()
          window.location.href = '/login'
        }
      })
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
