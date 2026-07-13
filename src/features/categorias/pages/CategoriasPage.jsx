import { useState } from 'react'
import Swal from 'sweetalert2'
import { createCategoria, getCategorias } from '../services/categorias.js'
import { canWrite } from '../../../common/security/roleAccess.js'
import { useAuth } from '../../../common/store/useAuth.js'
import EmptyState from '../../../common/components/EmptyState.jsx'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'
import LoadingState from '../../../common/components/LoadingState.jsx'
import PageHeader from '../../../common/components/PageHeader.jsx'
import { useApiResource } from '../../../common/hooks/useApiResource.js'

function list(value) {
  return Array.isArray(value) ? value : value?.content || []
}

function CategoriasPage() {
  const { session } = useAuth()
  const [nombre, setNombre] = useState('')
  const [formError, setFormError] = useState('')
  const { data, loading, error, reload } = useApiResource(getCategorias, [])
  const categorias = list(data)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!nombre || nombre.length > 60) {
      setFormError('El nombre es requerido y maximo 60 caracteres.')
      return
    }
    try {
      await createCategoria({ nombre })
      await Swal.fire('Categoria creada', nombre, 'success')
      setNombre('')
      setFormError('')
      reload()
    } catch (createError) {
      setFormError(createError.message)
      Swal.fire('Error', createError.message, 'error')
    }
  }

  return (
    <>
      <PageHeader title="Categorias" />
      {canWrite(session.role) ? (
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
          <input value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength="60" placeholder="Nombre" className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900" />
          <button className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">Crear</button>
        </form>
      ) : null}
      <ErrorMessage message={error || formError} />
      {loading ? <LoadingState text="Cargando categorias..." /> : categorias.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <article key={categoria.id || categoria.nombre} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Categoria</p>
              <h2 className="mt-2 text-lg font-bold text-slate-950">{categoria.nombre}</h2>
            </article>
          ))}
        </div>
      ) : <EmptyState title="Sin categorias" text="Crea la primera categoria." />}
    </>
  )
}

export default CategoriasPage
