import { useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { createPaquete, deletePaquete, getPaquetes, updatePaquete } from '../services/paquetes.js'
import { canDelete, canWrite } from '../../../common/security/roleAccess.js'
import { useAuth } from '../../../common/store/useAuth.js'
import EmptyState from '../../../common/components/EmptyState.jsx'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'
import LoadingState from '../../../common/components/LoadingState.jsx'
import PageHeader from '../../../common/components/PageHeader.jsx'
import StatusBadge from '../../../common/components/StatusBadge.jsx'
import Modal from '../../../common/components/Modal.jsx'
import { useApiResource } from '../../../common/hooks/useApiResource.js'
import { useDebouncedValue } from '../../../common/hooks/useDebouncedValue.js'

const estados = ['', 'REGISTRADO', 'EN_TRANSITO', 'EN_REPARTO', 'ENTREGADO', 'CANCELADO']
const sucursales = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Iquitos', 'Huancayo', 'Tacna', 'Puno']

const initialCreateForm = {
  descripcion: '',
  pesoKg: '',
  valorDeclarado: '',
  sucursalOrigen: '',
  sucursalDestino: '',
  dniRemitente: '',
  dniDestinatario: '',
}

function list(value) {
  return Array.isArray(value) ? value : value?.content || []
}

function PaquetesPage() {
  const { session } = useAuth()
  const [filters, setFilters] = useState({ busqueda: '', sucursal: '', estado: '', categoria: '' })
  const [paqueteToDelete, setPaqueteToDelete] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [paqueteToEdit, setPaqueteToEdit] = useState(null)
  const [editForm, setEditForm] = useState({ descripcion: '', pesoKg: '', valorDeclarado: '' })
  const [editError, setEditError] = useState('')
  const [updating, setUpdating] = useState(false)
  const debouncedBusqueda = useDebouncedValue(filters.busqueda)
  const queryFilters = { ...filters, busqueda: debouncedBusqueda }
  const { data, loading, error, reload } = useApiResource(() => getPaquetes(queryFilters), [debouncedBusqueda, filters.sucursal, filters.estado, filters.categoria])
  const paquetes = list(data)

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateCreateField(event) {
    setCreateForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updateEditField(event) {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function openEditModal(paquete) {
    setPaqueteToEdit(paquete)
    setEditForm({
      descripcion: paquete.descripcion || '',
      pesoKg: String(paquete.pesoKg || ''),
      valorDeclarado: String(paquete.valorDeclarado || ''),
    })
    setEditError('')
  }

  function closeEditModal() {
    setPaqueteToEdit(null)
    setEditForm({ descripcion: '', pesoKg: '', valorDeclarado: '' })
    setEditError('')
  }

  function closeCreateModal() {
    setCreateModalOpen(false)
    setCreateForm(initialCreateForm)
    setCreateError('')
  }

  function validateCreateForm() {
    return createForm.descripcion && createForm.descripcion.length <= 180 && Number(createForm.pesoKg) >= 0.1 && Number(createForm.valorDeclarado) >= 1 && createForm.sucursalOrigen && createForm.sucursalDestino && /^\d{8}$/.test(createForm.dniRemitente) && /^\d{8}$/.test(createForm.dniDestinatario)
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!validateCreateForm()) {
      setCreateError('Valida descripcion, peso, valor, origen, destino y DNI de 8 digitos.')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      const created = await createPaquete({
        ...createForm,
        pesoKg: Number(createForm.pesoKg),
        valorDeclarado: Number(createForm.valorDeclarado),
      })
      await Swal.fire('Envio creado', created?.codigoRastreo || 'Envio registrado.', 'success')
      closeCreateModal()
      reload()
    } catch (saveError) {
      setCreateError(saveError.message)
      Swal.fire('Error', saveError.message, 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!paqueteToDelete) return
    try {
      await deletePaquete(paqueteToDelete.id)
      await Swal.fire('Eliminado', 'Paquete eliminado correctamente.', 'success')
      setPaqueteToDelete(null)
      reload()
    } catch (deleteError) {
      Swal.fire('Error', deleteError.message, 'error')
    }
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!paqueteToEdit) return
    if (!editForm.descripcion || Number(editForm.pesoKg) < 0.1 || Number(editForm.valorDeclarado) < 1) {
      setEditError('Valida descripcion, peso minimo 0.10 y valor minimo 1.00.')
      return
    }

    setUpdating(true)
    setEditError('')
    try {
      await updatePaquete(paqueteToEdit.id, {
        descripcion: editForm.descripcion,
        pesoKg: Number(editForm.pesoKg),
        valorDeclarado: Number(editForm.valorDeclarado),
      })
      await Swal.fire('Actualizado', 'Envio actualizado correctamente.', 'success')
      closeEditModal()
      reload()
    } catch (saveError) {
      setEditError(saveError.message)
      Swal.fire('Error', saveError.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Envios"
        action={canWrite(session.role) ? <button type="button" onClick={() => setCreateModalOpen(true)} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800">Nuevo envio</button> : null}
      />
      <section className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <input name="busqueda" value={filters.busqueda} onChange={updateFilter} placeholder="Buscar" className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900" />
        <input name="sucursal" value={filters.sucursal} onChange={updateFilter} placeholder="Sucursal" className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900" />
        <select name="estado" value={filters.estado} onChange={updateFilter} className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900">{estados.map((estado) => <option key={estado} value={estado}>{estado || 'Estado'}</option>)}</select>
        <input name="categoria" value={filters.categoria} onChange={updateFilter} placeholder="Categoria" className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-slate-900" />
      </section>
      <ErrorMessage message={error} />
      {loading ? <LoadingState text="Cargando paquetes..." /> : paquetes.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700"><tr><th className="px-4 py-3">Codigo</th><th className="px-4 py-3">Descripcion</th><th className="px-4 py-3">Ruta</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Tarifa</th><th className="px-4 py-3">Acciones</th></tr></thead>
            <tbody>
              {paquetes.map((paquete) => (
                <tr key={paquete.id || paquete.codigoRastreo} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold"><Link to={`/paquetes/${paquete.id}`} className="text-slate-900 underline-offset-4 hover:underline">{paquete.codigoRastreo || paquete.id}</Link></td>
                  <td className="px-4 py-3">{paquete.descripcion}</td>
                  <td className="px-4 py-3">{paquete.sucursalOrigen} - {paquete.sucursalDestino}</td>
                  <td className="px-4 py-3"><StatusBadge status={paquete.estado} /></td>
                  <td className="px-4 py-3">S/ {paquete.tarifa ?? '-'}</td>
                  <td className="px-4 py-3"><div className="flex gap-2"><Link to={`/paquetes/${paquete.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 font-bold text-slate-700">Ver</Link>{canWrite(session.role) ? <button type="button" onClick={() => openEditModal(paquete)} className="rounded-md border border-slate-300 px-3 py-1.5 font-bold text-slate-700">Editar</button> : null}{canDelete(session.role) ? <button type="button" onClick={() => setPaqueteToDelete(paquete)} className="rounded-md border border-red-200 px-3 py-1.5 font-bold text-red-700">Eliminar</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="Sin envios" text="No hay registros con los filtros actuales." />}
      <Modal
        open={createModalOpen}
        title="Nuevo envio"
        onClose={closeCreateModal}
      >
        <form onSubmit={handleCreate} className="grid gap-4 text-slate-900 md:grid-cols-2">
          <label className="text-sm font-bold md:col-span-2">
            Descripcion
            <textarea name="descripcion" value={createForm.descripcion} onChange={updateCreateField} maxLength="180" rows="3" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Peso KG
            <input name="pesoKg" type="number" step="0.1" value={createForm.pesoKg} onChange={updateCreateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Valor declarado
            <input name="valorDeclarado" type="number" step="0.01" value={createForm.valorDeclarado} onChange={updateCreateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Origen
            <select name="sucursalOrigen" value={createForm.sucursalOrigen} onChange={updateCreateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900">
              <option value="">Selecciona origen</option>
              {sucursales.map((sucursal) => <option key={sucursal} value={sucursal}>{sucursal}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            Destino
            <select name="sucursalDestino" value={createForm.sucursalDestino} onChange={updateCreateField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900">
              <option value="">Selecciona destino</option>
              {sucursales.map((sucursal) => <option key={sucursal} value={sucursal}>{sucursal}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            DNI remitente
            <input name="dniRemitente" value={createForm.dniRemitente} onChange={updateCreateField} maxLength="8" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            DNI destinatario
            <input name="dniDestinatario" value={createForm.dniDestinatario} onChange={updateCreateField} maxLength="8" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <div className="md:col-span-2"><ErrorMessage message={createError} /></div>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end md:col-span-2">
            <button type="button" onClick={closeCreateModal} className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button disabled={creating} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-60">{creating ? 'Creando...' : 'Crear envio'}</button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(paqueteToEdit)}
        title="Editar envio"
        onClose={closeEditModal}
      >
        <form onSubmit={handleUpdate} className="grid gap-4 text-slate-900">
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
            <p className="font-bold text-slate-900">{paqueteToEdit?.codigoRastreo || 'Envio'}</p>
            <p className="text-slate-500">{paqueteToEdit?.sucursalOrigen} - {paqueteToEdit?.sucursalDestino}</p>
          </div>
          <label className="text-sm font-bold">
            Descripcion
            <textarea name="descripcion" value={editForm.descripcion} onChange={updateEditField} rows="3" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Peso KG
            <input name="pesoKg" type="number" step="0.1" value={editForm.pesoKg} onChange={updateEditField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <label className="text-sm font-bold">
            Valor declarado
            <input name="valorDeclarado" type="number" step="0.01" value={editForm.valorDeclarado} onChange={updateEditField} className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-900" />
          </label>
          <ErrorMessage message={editError} />
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeEditModal} className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
            <button disabled={updating} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 disabled:opacity-60">{updating ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      <Modal
        open={Boolean(paqueteToDelete)}
        title="Eliminar paquete"
        confirmText="Eliminar"
        danger
        onClose={() => setPaqueteToDelete(null)}
        onConfirm={handleDelete}
      >
        <p>Confirma la eliminacion del envio.</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-black text-slate-950">{paqueteToDelete?.codigoRastreo || paqueteToDelete?.id}</p>
          <p className="mt-1 text-slate-500">{paqueteToDelete?.descripcion}</p>
        </div>
      </Modal>
    </>
  )
}

export default PaquetesPage
