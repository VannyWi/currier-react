function Modal({ open, title, children, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false, onClose, onConfirm }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
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
