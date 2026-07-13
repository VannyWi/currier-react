import { useState } from 'react'
import Swal from 'sweetalert2'
import { createCliente, deleteCliente, getClienteByDni, getClientes, updateCliente } from '../services/clientes.js'
import { canDelete, canWrite } from '../../../common/security/roleAccess.js'
import { useAuth } from '../../../common/store/useAuth.js'
import EmptyState from '../../../common/components/EmptyState.jsx'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'
import LoadingState from '../../../common/components/LoadingState.jsx'
import PageHeader from '../../../common/components/PageHeader.jsx'
import Modal from '../../../common/components/Modal.jsx'
import { useApiResource } from '../../../common/hooks/useApiResource.js'

function list(value) {
  return Array.isArray(value) ? value : value?.content || []
}

function ClientesPage() {
  const { session } = useAuth()
  const [dni, setDni] = useState('')
  const [searchError, setSearchError] = useState('')
  const [filtered, setFiltered] = useState(null)
  const [clienteToDelete, setClienteToDelete] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ dni: '', email: '', telefono: '' })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [clienteToEdit, setClienteToEdit] = useState(null)
  const [editForm, setEditForm] = useState({ email: '', telefono: '' })
  const [editError, setEditError] = useState('')
  const [updating, setUpdating] = useState(false)
  const { data, loading, error, reload } = useApiResource(getClientes, [])
  const clientes = filtered || list(data)

  function updateCreateField(event) {
    setCreateForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function closeCreateModal() {
    setCreateModalOpen(false)
    setCreateForm({ dni: '', email: '', telefono: '' })
    setCreateError('')
  }

  function openEditModal(cliente) {
    setClienteToEdit(cliente)
    setEditForm({ email: cliente.email || '', telefono: cliente.telefono || '' })
    setEditError('')
  }

  function closeEditModal() {
    setClienteToEdit(null)
    setEditForm({ email: '', telefono: '' })
    setEditError('')
  }

  function updateEditField(event) {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function searchByDni(event) {
    event.preventDefault()
    if (!/^\d{8}$/.test(dni)) {
      setSearchError('El DNI debe tener 8 digitos.')
      return
    }
    try {
      const result = await getClienteByDni(dni)
      setFiltered(result ? [result] : [])
      setSearchError('')
    } catch (searchErrorValue) {
      setSearchError(searchErrorValue.message)
    }
  }

  async function handleDelete() {
    if (!clienteToDelete) return
    try {
      await deleteCliente(clienteToDelete.id)
      await Swal.fire('Eliminado', 'Cliente eliminado correctamente.', 'success')
      setClienteToDelete(null)
      setFiltered(null)
      reload()
    } catch (deleteError) {
      Swal.fire('Error', deleteError.message, 'error')
    }
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!/^\d{8}$/.test(createForm.dni) || !/^\S+@\S+\.\S+$/.test(createForm.email) || !/^\d{9}$/.test(createForm.telefono)) {
      setCreateError('Valida DNI de 8 digitos, email y telefono de 9 digitos.')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      await createCliente(createForm)
      await Swal.fire('Guardado', 'Cliente guardado correctamente.', 'success')
      closeCreateModal()
      setFiltered(null)
      reload()
    } catch (saveError) {
      setCreateError(saveError.message)
      Swal.fire('Error', saveError.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!clienteToEdit) return
    if (!/^\S+@\S+\.\S+$/.test(editForm.email) || !/^\d{9}$/.test(editForm.telefono)) {
      setEditError('Valida email y telefono de 9 digitos.')
      return
    }

    setUpdating(true)
    setEditError('')
    try {
      await updateCliente(clienteToEdit.id, editForm)
      await Swal.fire('Actualizado', 'Cliente actualizado correctamente.', 'success')
      closeEditModal()
      setFiltered(null)
      reload()
    } catch (saveError) {
      setEditError(saveError.message)
      Swal.fire('Error', saveError.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <LoadingState text="Cargando clientes..." />

  return (
    <>
      <PageHeader
        title="Clientes"
        action={canWrite(session.role) ? <button type="button" onClick={() => setCreateModalOpen(true)} className="w-full rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 md:w-auto">Nuevo cliente</button> : null}
      />
      <form onSubmit={searchByDni} className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <input value={dni} onChange={(event) => setDni(event.target.value)} placeholder="DNI" maxLength="8" className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900" />
        <button className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">Buscar</button>
        <button type="button" onClick={() => { setFiltered(null); setDni(''); setSearchError('') }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700">Limpiar</button>
      </form>
      <ErrorMessage message={error || searchError} />
      {clientes.length ? (
        <>
        <div className="mt-4 grid gap-3 md:hidden">
          {clientes.map((cliente) => (
            <article key={cliente.id || cliente.dni} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-500">DNI</p>
                  <h2 className="break-words text-lg font-bold text-slate-950">{cliente.dni}</h2>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">Cliente</span>
              </div>
              <div className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
                <p><span className="font-bold text-slate-500">Nombre: </span><span className="font-semibold text-slate-900">{cliente.nombreCompleto || 'Pendiente RENIEC'}</span></p>
                <p className="break-all"><span className="font-bold text-slate-500">Email: </span><span className="font-semibold text-slate-900">{cliente.email}</span></p>
                <p><span className="font-bold text-slate-500">Telefono: </span><span className="font-semibold text-slate-900">{cliente.telefono}</span></p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {canWrite(session.role) ? <button type="button" onClick={() => openEditModal(cliente)} className="rounded-md border border-slate-300 px-3 py-2 font-bold text-slate-700">Editar</button> : null}
                {canDelete(session.role) ? <button type="button" onClick={() => setClienteToDelete(cliente)} className="rounded-md border border-red-200 px-3 py-2 font-bold text-red-700">Eliminar</button> : null}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">DNI</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Contacto</th><th className="px-4 py-3">Acciones</th></tr></thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id || cliente.dni} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold">{cliente.dni}</td>
                  <td className="px-4 py-3">{cliente.nombreCompleto || 'Pendiente RENIEC'}</td>
                  <td className="px-4 py-3"><span className="block font-semibold">{cliente.email}</span><span className="text-slate-500">{cliente.telefono}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canWrite(session.role) ? <button type="button" onClick={() => openEditModal(cliente)} className="rounded-md border border-slate-300 px-3 py-1.5 font-bold text-slate-700">Editar</button> : null}
                      {canDelete(session.role) ? <button type="button" onClick={() => setClienteToDelete(cliente)} className="rounded-md border border-red-200 px-3 py-1.5 font-bold text-red-700">Eliminar</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      ) : <EmptyState title="Sin clientes" text="Crea clientes para registrar paquetes." />}
      <Modal
        open={createModalOpen}
        title="Nuevo cliente"
        onClose={closeCreateModal}
      >
        <form onSubmit={handleCreate} className="grid gap-4 text-slate-900">
          <label className="text-sm font-bold">
            DNI
            <input name="dni" value={createForm.dni} onChange={updateCreateField} maxLength="8" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Email
            <input name="email" type="email" value={createForm.email} onChange={updateCreateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Telefono
            <input name="telefono" value={createForm.telefono} onChange={updateCreateField} maxLength="9" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <ErrorMessage message={createError} />
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeCreateModal} className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button disabled={creating} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-60">{creating ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(clienteToEdit)}
        title="Editar cliente"
        onClose={closeEditModal}
      >
        <form onSubmit={handleUpdate} className="grid gap-4 text-slate-900">
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <p className="font-bold text-slate-900">{clienteToEdit?.nombreCompleto || 'Cliente'}</p>
            <p className="text-slate-500">DNI: {clienteToEdit?.dni}</p>
          </div>
          <label className="text-sm font-bold">
            Email
            <input name="email" type="email" value={editForm.email} onChange={updateEditField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Telefono
            <input name="telefono" value={editForm.telefono} onChange={updateEditField} maxLength="9" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <ErrorMessage message={editError} />
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeEditModal} className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button disabled={updating} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-60">{updating ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(clienteToDelete)}
        title="Eliminar cliente"
        confirmText="Eliminar"
        danger
        onClose={() => setClienteToDelete(null)}
        onConfirm={handleDelete}
      >
        <p>Confirma la eliminacion del cliente.</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-black text-slate-950">{clienteToDelete?.nombreCompleto || clienteToDelete?.email}</p>
          <p className="mt-1 text-slate-500">DNI: {clienteToDelete?.dni}</p>
        </div>
      </Modal>
    </>
  )
}

export default ClientesPage
