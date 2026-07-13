import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAuth } from '../../../common/store/useAuth.js'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', role: 'CLIENTE' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.nombre || form.nombre.length > 120 || !/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 8) {
      setError('Revisa nombre, email y password minimo de 8 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const session = await register(form)
      await Swal.fire({ title: 'Usuario registrado', icon: 'success' })
      navigate(session?.role === 'CLIENTE' ? '/rastreo' : '/clientes', { replace: true })
    } catch (registerError) {
      setError(registerError.message)
      Swal.fire('No se pudo registrar', registerError.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">RapidoCourier</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Registro de usuario</h1>
        <div className="mt-8 grid gap-4">
          <label className="text-sm font-bold text-slate-700">Nombre<input name="nombre" value={form.nombre} onChange={updateField} maxLength="120" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-bold text-slate-700">Email<input name="email" type="email" value={form.email} onChange={updateField} maxLength="120" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900" /></label>
          <label className="text-sm font-bold text-slate-700">
            Contraseña
            <span className="relative mt-2 block">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={updateField} maxLength="80" className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 outline-none focus:border-slate-900" />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 grid place-items-center text-slate-600 hover:text-slate-900"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="m10.79 12.912-1.614-1.615A3.5 3.5 0 0 1 4.7 6.823L2.73 4.852C1.64 5.742.806 6.835.25 8c1.187 2.5 3.476 4.25 6.25 4.25a6.3 6.3 0 0 0 4.29-1.338" />
                    <path d="M8.84 10.96 7.53 9.65a2 2 0 0 1-2.38-2.38L3.9 6.02a3.5 3.5 0 0 0 4.94 4.94" />
                    <path d="M5.35 4.47 6.67 5.79A2 2 0 0 1 9.2 8.32l1.33 1.33a3.5 3.5 0 0 0-5.18-5.18" />
                    <path d="M11.35 10.47 13.27 12.4l.71-.71-11.67-11.67-.71.71 1.76 1.76C2.03 3.37.93 4.57.25 6c1.187 2.5 3.476 4.25 6.25 4.25.6 0 1.18-.08 1.72-.23l1.18 1.18c-.9.39-1.88.6-2.9.6-2.77 0-5.06-1.75-6.25-4.25.64-1.35 1.72-2.55 3.1-3.42l.74.74A6.3 6.3 0 0 1 6.5 3.75c2.77 0 5.06 1.75 6.25 4.25a7.6 7.6 0 0 1-1.4 2.47" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.17 8a13 13 0 0 1 1.66-2.04C4.12 4.67 5.88 3.5 8 3.5s3.88 1.17 5.17 2.46A13 13 0 0 1 14.83 8a13 13 0 0 1-1.66 2.04C11.88 11.33 10.12 12.5 8 12.5s-3.88-1.17-5.17-2.46A13 13 0 0 1 1.17 8" />
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                  </svg>
                )}
              </button>
            </span>
          </label>
          <label className="text-sm font-bold text-slate-700">Rol<select name="role" value={form.role} onChange={updateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"><option>CLIENTE</option><option>OPERADOR</option><option>ADMIN</option></select></label>
          <ErrorMessage message={error} />
          <button disabled={loading} className="rounded-lg bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60">{loading ? 'Registrando...' : 'Crear cuenta'}</button>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500"><Link className="font-bold text-slate-900" to="/login">Volver al login</Link></p>
      </form>
    </main>
  )
}

export default Register
