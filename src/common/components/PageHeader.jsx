function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex min-w-0 flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="w-full md:w-auto">{action}</div> : null}
    </div>
  )
}

export default PageHeader
