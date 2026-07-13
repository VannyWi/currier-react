function LoadingState({ text = 'Cargando informacion...' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
      <p>{text}</p>
    </div>
  )
}

export default LoadingState
