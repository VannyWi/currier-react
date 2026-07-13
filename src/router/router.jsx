import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../common/layouts/AppLayout.jsx'
import ProtectedRoute from '../common/security/ProtectedRoute.jsx'
import HomeRedirect from '../common/security/HomeRedirect.jsx'
import StaffOnly from '../common/security/StaffOnly.jsx'
import AuthLogin from '../app/auth/login.jsx'
import AuthRegister from '../app/auth/register.jsx'
import Categorias from '../app/categorias/categorias.jsx'
import Clientes from '../app/clientes/clientes.jsx'
import PaqueteDetail from '../app/paquetes/paquete-detail.jsx'
import Paquetes from '../app/paquetes/paquetes.jsx'
import Rastreo from '../app/rastreo/rastreo.jsx'

export const router = createBrowserRouter([
  { path: '/login', element: <AuthLogin /> },
  { path: '/register', element: <AuthRegister /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: '/clientes', element: <StaffOnly><Clientes /></StaffOnly> },
          { path: '/paquetes', element: <StaffOnly><Paquetes /></StaffOnly> },
          { path: '/paquetes/:id', element: <StaffOnly><PaqueteDetail /></StaffOnly> },
          { path: '/rastreo', element: <Rastreo /> },
          { path: '/categorias', element: <StaffOnly><Categorias /></StaffOnly> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
