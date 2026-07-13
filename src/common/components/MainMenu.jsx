import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/clientes', label: 'Clientes', roles: ['ADMIN', 'OPERADOR'] },
  { to: '/paquetes', label: 'Envios', roles: ['ADMIN', 'OPERADOR'] },
  { to: '/rastreo', label: 'Rastreo', roles: ['CLIENTE'] },
  { to: '/categorias', label: 'Categorias', roles: ['ADMIN', 'OPERADOR'] },
]

function MainMenu({ role }) {
  const allowedItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Menu principal">
      {allowedItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold transition lg:w-full ${
              isActive ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default MainMenu
