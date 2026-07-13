import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth.js'
import MainMenu from '../components/MainMenu.jsx'
import Modal from '../components/Modal.jsx'

function AppLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen w-full gap-3 px-3 py-3 md:gap-4 md:px-6 md:py-4 lg:grid-cols-[260px_1fr]">
        <aside className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-4 text-white shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div>
            <div className="flex items-center justify-between gap-4 lg:block">
              <div>
                <div className="text-xl font-bold tracking-tight">RapidoCourier</div>
              </div>
              <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-900 lg:mt-4 lg:inline-block">{session?.role}</span>
            </div>

            <MainMenu role={session?.role} />
          </div>

          <div className="mt-4 rounded-lg bg-slate-800 px-4 py-3 text-sm lg:mt-auto">
            <button
              type="button"
              onClick={() => setLogoutModalOpen(true)}
              className="w-full rounded-lg border border-slate-600 px-4 py-2 font-bold text-white hover:bg-slate-700"
            >
              Salir
            </button>
          </div>
        </aside>

        <main className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Modal
        open={logoutModalOpen}
        title="Cerrar sesion"
        confirmText="Cerrar sesion"
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  )
}

export default AppLayout
