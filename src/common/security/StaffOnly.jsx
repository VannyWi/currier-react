import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth.js'

function StaffOnly({ children }) {
  const { session } = useAuth()
  if (session?.role === 'CLIENTE') return <Navigate to="/rastreo" replace />
  return children
}

export default StaffOnly
