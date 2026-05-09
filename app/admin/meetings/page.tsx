import {
  getMeetingFiles,
  getMeetingHref,
  type MeetingSummary,
} from "@/lib/github-meetings"
import { CalendarDays, FileText, FolderTree } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

function MeetingsError() {
  return (
    <div className="rounded-lg border border-red-400/25 bg-red-950/30 p-6 text-red-100">
      <h2 className="text-lg font-semibold text-white">
        Não foi possível carregar as atas.
      </h2>
      <p className="mt-2 text-sm text-red-100/80">
        Verifique se o token GitHub do servidor está configurado e tem acesso ao
        repositório Grind-ICMC/meetings.
      </p>
    </div>
  )
}

function EmptyMeetings() {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-900/70 p-8 text-center">
      <FileText className="mx-auto size-10 text-cyan-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-white">
        Nenhuma ata encontrada
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Arquivos Markdown adicionados ao repositório aparecerão aqui.
      </p>
    </div>
  )
}

function MeetingCard({ meeting }: { meeting: MeetingSummary }) {
  return (
    <Link
      href={getMeetingHref(meeting.path)}
      className="group rounded-lg border border-cyan-400/15 bg-slate-900/75 p-5 transition hover:border-cyan-300/50 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-300">
            <FileText className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-base font-semibold text-white group-hover:text-cyan-200">
              {meeting.title}
            </h2>
            <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-400">
              <FolderTree className="size-4 shrink-0" aria-hidden="true" />
              {meeting.directory}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 truncate rounded-md bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-400">
        {meeting.path}
      </p>
    </Link>
  )
}

export default async function MeetingsPage() {
  let meetings: MeetingSummary[]

  try {
    meetings = await getMeetingFiles()
  } catch {
    return (
      <section>
        <div className="mb-8">
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
            <CalendarDays className="size-4" aria-hidden="true" />
            Atas da Reunião
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Documentação interna
          </h1>
        </div>
        <MeetingsError />
      </section>
    )
  }

  return (
    <section>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-cyan-300">
            <CalendarDays className="size-4" aria-hidden="true" />
            Atas da Reunião
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Documentação interna
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          {meetings.length} {meetings.length === 1 ? "arquivo" : "arquivos"}
        </p>
      </div>

      {meetings.length === 0 ? (
        <EmptyMeetings />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.path} meeting={meeting} />
          ))}
        </div>
      )}
    </section>
  )
}
