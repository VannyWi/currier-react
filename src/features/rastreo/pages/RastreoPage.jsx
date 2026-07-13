import { useState } from 'react'
import { getHistorialPaquete, getPaquetes } from '../../paquetes/services/paquetes.js'
import EmptyState from '../../../common/components/EmptyState.jsx'
import ErrorMessage from '../../../common/components/ErrorMessage.jsx'
import LoadingState from '../../../common/components/LoadingState.jsx'
import PageHeader from '../../../common/components/PageHeader.jsx'
import StatusBadge from '../../../common/components/StatusBadge.jsx'

function list(value) {
  return Array.isArray(value) ? value : value?.content || []
}

function findByCode(paquetes, codigo) {
  return paquetes.find((paquete) => paquete.codigoRastreo === codigo) || paquetes[0] || null
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function RastreoPage() {
  const [codigo, setCodigo] = useState('')
  const [paquete, setPaquete] = useState(null)
  const [historial, setHistorial] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()
    const busqueda = codigo.trim()
    if (!busqueda) {
      setError('Ingresa el codigo de rastreo.')
      setPaquete(null)
      setHistorial([])
      setSearched(false)
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const result = await getPaquetes({ busqueda })
      const found = findByCode(list(result), busqueda)
      setPaquete(found)
      setHistorial(found?.id ? list(await getHistorialPaquete(found.id)) : [])
    } catch (searchError) {
      setPaquete(null)
      setHistorial([])
      setError(searchError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader title="Rastreo" />
      <form onSubmit={handleSearch} className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto]">
        <input
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
          placeholder="Codigo de rastreo"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-900"
        />
        <button disabled={loading} className="rounded-lg bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60">
          {loading ? 'Buscando...' : 'Rastrear'}
        </button>
      </form>
      <ErrorMessage message={error} />
      {loading ? <LoadingState text="Buscando envio..." /> : null}
      {!loading && searched && !paquete && !error ? <EmptyState title="Sin resultados" text="No existe un envio con ese codigo." /> : null}
      {!loading && paquete ? (
        <div className="grid gap-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500">Codigo</p>
                <h2 className="text-2xl font-bold text-slate-950">{paquete.codigoRastreo || paquete.id}</h2>
              </div>
              <StatusBadge status={paquete.estado} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Descripcion</p>
                <p className="mt-1 font-semibold text-slate-900">{paquete.descripcion || '-'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Ruta</p>
                <p className="mt-1 font-semibold text-slate-900">{paquete.sucursalOrigen || '-'} - {paquete.sucursalDestino || '-'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Tarifa</p>
                <p className="mt-1 font-semibold text-slate-900">S/ {paquete.tarifa ?? '-'}</p>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Cambios de estado</h2>
            {historial.length ? (
              <ol className="mt-4 grid gap-3">
                {historial.map((item) => (
                  <li key={item.id || `${item.estado}-${item.fechaCambio}`} className="rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <StatusBadge status={item.estado || item.nuevoEstado} />
                      <span className="text-sm font-semibold text-slate-600">{formatDateTime(item.fechaCambio || item.fecha || item.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Usuario: {item.usuario || '-'}</p>
                  </li>
                ))}
              </ol>
            ) : <EmptyState title="Sin cambios" text="Aun no hay cambios registrados." />}
          </section>
        </div>
      ) : null}
    </>
  )
}

export default RastreoPage
