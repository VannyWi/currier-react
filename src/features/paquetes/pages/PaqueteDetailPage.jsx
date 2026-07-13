import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getCategorias } from '../../categorias/services/categorias.js'
import { assignCategoria, getHistorialPaquete, getPaquete, updateEstadoPaquete, updatePaquete } from '../services/paquetes.js'
import { canWrite } from '../../../common/security/roleAccess.js'
import { useAuth } from '../../../common/store/useAuth.js'
import EmptyState from '../../../common/components/EmptyState.jsx'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'
import LoadingState from '../../../common/components/LoadingState.jsx'
import Modal from '../../../common/components/Modal.jsx'
import PageHeader from '../../../common/components/PageHeader.jsx'
import StatusBadge from '../../../common/components/StatusBadge.jsx'
import { useApiResource } from '../../../common/hooks/useApiResource.js'

const transitions = {
  REGISTRADO: ['EN_TRANSITO', 'CANCELADO'],
  EN_TRANSITO: ['EN_REPARTO', 'CANCELADO'],
  EN_REPARTO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

function list(value) {
  return Array.isArray(value) ? value : value?.content || []
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function DetailCard({ title, rows }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <dl className="mt-4 grid gap-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
            <dt className="font-bold text-slate-500">{row.label}</dt>
            <dd className="text-right font-semibold text-slate-900">{row.value || '-'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function PaqueteDetailPage() {
  const { id } = useParams()
  const { session } = useAuth()
  const [nextStatus, setNextStatus] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ descripcion: '', pesoKg: '', valorDeclarado: '' })
  const [editError, setEditError] = useState('')
  const [updating, setUpdating] = useState(false)
  const { data, loading, error, reload } = useApiResource(async () => {
    const [paquete, historial, categorias] = await Promise.all([getPaquete(id), getHistorialPaquete(id), getCategorias()])
    return { paquete, historial: list(historial), categorias: list(categorias) }
  }, [id])

  function updateEditField(event) {
    setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function openEditModal(paquete) {
    setEditForm({
      descripcion: paquete.descripcion || '',
      pesoKg: String(paquete.pesoKg || ''),
      valorDeclarado: String(paquete.valorDeclarado || ''),
    })
    setEditError('')
    setEditModalOpen(true)
  }

  function closeEditModal() {
    setEditModalOpen(false)
    setEditForm({ descripcion: '', pesoKg: '', valorDeclarado: '' })
    setEditError('')
  }

  async function changeStatus(event) {
    event.preventDefault()
    if (!nextStatus) return
    try {
      await updateEstadoPaquete(id, { nuevoEstado: nextStatus, usuario: session.email })
      await Swal.fire('Estado actualizado', nextStatus, 'success')
      setNextStatus('')
      reload()
    } catch (statusError) {
      Swal.fire('Transicion invalida', statusError.message, 'error')
    }
  }

  async function assignSelectedCategoria(event) {
    event.preventDefault()
    if (!categoriaId) return
    try {
      await assignCategoria(id, categoriaId)
      await Swal.fire('Categoria asignada', 'El paquete fue actualizado.', 'success')
      setCategoriaId('')
      reload()
    } catch (assignError) {
      Swal.fire('Error', assignError.message, 'error')
    }
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!editForm.descripcion || Number(editForm.pesoKg) < 0.1 || Number(editForm.valorDeclarado) < 1) {
      setEditError('Valida descripcion, peso minimo 0.10 y valor minimo 1.00.')
      return
    }

    setUpdating(true)
    setEditError('')
    try {
      await updatePaquete(id, {
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

  if (loading) return <LoadingState text="Cargando detalle..." />

  const paquete = data?.paquete
  const validNextStatuses = transitions[paquete?.estado] || []

  return (
    <>
      <PageHeader
        title={paquete?.codigoRastreo || 'Detalle de envio'}
        description={paquete?.descripcion}
        action={canWrite(session.role) && paquete ? <button type="button" onClick={() => openEditModal(paquete)} className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800">Editar</button> : null}
      />
      <ErrorMessage message={error} />
      {paquete ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-5">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-bold text-slate-500">Estado</p><StatusBadge status={paquete.estado} /></div>
                <p className="text-2xl font-bold text-slate-950">S/ {paquete.tarifa ?? '-'}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">Peso</p><strong>{paquete.pesoKg} kg</strong></div>
                <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">Valor</p><strong>S/ {paquete.valorDeclarado}</strong></div>
                <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">Ruta</p><strong>{paquete.sucursalOrigen} - {paquete.sucursalDestino}</strong></div>
              </div>
            </section>
            <div className="grid gap-5 md:grid-cols-2">
              <DetailCard title="Remitente" rows={[{ label: 'DNI', value: paquete.remitente?.dni }, { label: 'Nombre', value: paquete.remitente?.nombreCompleto }, { label: 'Email', value: paquete.remitente?.email }]} />
              <DetailCard title="Destinatario" rows={[{ label: 'DNI', value: paquete.destinatario?.dni }, { label: 'Nombre', value: paquete.destinatario?.nombreCompleto }, { label: 'Email', value: paquete.destinatario?.email }]} />
            </div>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Historial</h2>
              {data.historial.length ? (
                <ol className="mt-4 grid gap-3">
                  {data.historial.map((item) => (
                    <li key={item.id || `${item.estado}-${item.fechaCambio}`} className="rounded-lg bg-slate-50 px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <StatusBadge status={item.estado || item.nuevoEstado} />
                        <span className="text-sm font-semibold text-slate-600">{formatDateTime(item.fechaCambio || item.fecha || item.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500">Usuario: {item.usuario || '-'}</p>
                    </li>
                  ))}
                </ol>
              ) : <EmptyState title="Sin historial" text="Aun no hay cambios registrados." />}
            </section>
          </div>
          <aside className="grid content-start gap-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Cambio de estado</h2>
              {canWrite(session.role) && validNextStatuses.length ? (
                <form onSubmit={changeStatus} className="mt-4 grid gap-3">
                  <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-950"><option value="">Selecciona estado</option>{validNextStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">Actualizar</button>
                </form>
              ) : <p className="mt-3 text-sm text-slate-500">Sin cambios disponibles.</p>}
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">Categorias</h2>
              <div className="mt-3 flex flex-wrap gap-2">{paquete.categorias?.length ? paquete.categorias.map((categoria) => <span key={categoria.id || categoria.nombre} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{categoria.nombre}</span>) : <span className="text-sm text-slate-500">Sin categorias</span>}</div>
              {canWrite(session.role) ? (
                <form onSubmit={assignSelectedCategoria} className="mt-4 grid gap-3">
                  <select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2"><option value="">Asignar categoria</option>{data.categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}</select>
                  <button className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">Asignar</button>
                </form>
              ) : null}
            </section>
          </aside>
        </div>
      ) : <EmptyState title="Paquete no encontrado" />}
      <Modal
        open={editModalOpen}
        title="Editar envio"
        onClose={closeEditModal}
      >
        <form onSubmit={handleUpdate} className="grid gap-4 text-slate-900">
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
    </>
  )
}

export default PaqueteDetailPage
