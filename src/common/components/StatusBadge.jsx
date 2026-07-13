const styles = {
  REGISTRADO: 'bg-slate-100 text-slate-700',
  EN_TRANSITO: 'bg-slate-100 text-slate-700',
  EN_REPARTO: 'bg-slate-100 text-slate-700',
  ENTREGADO: 'bg-emerald-100 text-emerald-700',
  CANCELADO: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }) {
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-bold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status || 'SIN_ESTADO'}
    </span>
  )
}

export default StatusBadge
