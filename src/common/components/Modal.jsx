function Modal({ open, title, children, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-black text-slate-950">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md bg-slate-100 px-3 py-1 font-bold text-slate-500 hover:bg-slate-200" aria-label="Cerrar modal">
            x
          </button>
        </div>
        <div className="mt-4 text-slate-600">{children}</div>
        {onConfirm ? (
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
              {cancelText}
            </button>
            <button type="button" onClick={onConfirm} className={`rounded-lg px-5 py-3 font-bold ${danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {confirmText}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Modal
