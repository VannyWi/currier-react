import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth.js'

function HomeRedirect() {
  const { session } = useAuth()
  return <Navigate to={session?.role === 'CLIENTE' ? '/rastreo' : '/clientes'} replace />
}

export default HomeRedirect
