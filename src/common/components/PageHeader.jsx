function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export default PageHeader
