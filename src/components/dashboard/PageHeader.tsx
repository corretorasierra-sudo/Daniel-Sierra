export function PageHeader({
  titulo,
  subtitulo,
  action,
}: {
  titulo: string;
  subtitulo?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
