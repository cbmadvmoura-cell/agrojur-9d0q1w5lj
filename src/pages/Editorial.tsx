import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  Check,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  History,
  LogOut,
  Pencil,
  Send,
  ShieldCheck,
  UserCog,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  createEditorialDraft,
  getEditorialContents,
  getEditorialHistory,
  getEditorialUsers,
  updateEditorialContent,
  updateEditorialUserRole,
  type ContentRecord,
  type ContentVersionRecord,
  type EditorialSource,
  type EditorialStatus,
  type EditorialUser,
} from '@/services/editorial'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const statusLabels: Record<EditorialStatus, string> = {
  DRAFT: 'Rascunho',
  IN_REVIEW: 'Em revisão',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
}

const statusStyles: Record<EditorialStatus, string> = {
  DRAFT: 'border-slate-200 bg-slate-100 text-slate-700',
  IN_REVIEW: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-blue-200 bg-blue-50 text-blue-800',
  PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  ARCHIVED: 'border-violet-200 bg-violet-50 text-violet-800',
}

const roleLabels = {
  operator: 'Operador',
  reviewer: 'Revisor',
  publisher: 'Publisher',
  admin: 'Admin',
}

const emptyForm = {
  slug: '',
  title: '',
  summary: '',
  body: '',
  cluster: 'demonstracao',
  sourceLabel: 'Fonte demonstrativa',
  sourceUrl: 'https://example.com/fixture',
}

type FormState = typeof emptyForm

export default function Editorial() {
  const { user, signOut } = useAuth()
  const [contents, setContents] = useState<ContentRecord[]>([])
  const [users, setUsers] = useState<EditorialUser[]>([])
  const [history, setHistory] = useState<ContentVersionRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  const selected = contents.find((content) => content.id === selectedId) ?? null
  const canCreate = user?.role === 'operator' || user?.role === 'admin'
  const canManageRoles = user?.role === 'admin'

  async function loadContents() {
    try {
      setContents(await getEditorialContents())
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    }
  }

  async function loadUsers() {
    if (!canManageRoles) return
    try {
      setUsers(await getEditorialUsers())
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    }
  }

  async function loadHistory(contentId: string) {
    try {
      setHistory(await getEditorialHistory(contentId))
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    }
  }

  useEffect(() => {
    void loadContents()
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [canManageRoles])

  useRealtime<ContentRecord>(
    'contents',
    () => {
      void loadContents()
    },
    Boolean(user),
  )

  useEffect(() => {
    if (!selected) {
      setHistory([])
      return
    }
    void loadHistory(selected.id)
  }, [selectedId, selected?.version])

  const visibleContents = useMemo(
    () => [...contents].sort((a, b) => a.status.localeCompare(b.status) || b.version - a.version),
    [contents],
  )

  function selectContent(content: ContentRecord) {
    setSelectedId(content.id)
    setIsCreating(false)
    setMessage('')
    setError('')
    setForm({
      slug: content.slug,
      title: content.title,
      summary: content.summary,
      body: content.body.replace(/<[^>]+>/g, ''),
      cluster: content.cluster,
      sourceLabel: content.sources?.[0]?.label ?? '',
      sourceUrl: content.sources?.[0]?.url ?? '',
    })
  }

  function startCreate() {
    setSelectedId(null)
    setIsCreating(true)
    setMessage('')
    setError('')
    setHistory([])
    setForm(emptyForm)
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSaving(true)
    try {
      const sources: EditorialSource[] =
        form.sourceLabel.trim() && form.sourceUrl.trim()
          ? [{ label: form.sourceLabel.trim(), url: form.sourceUrl.trim() }]
          : []
      if (isCreating) {
        const created = await createEditorialDraft({
          slug: form.slug.trim(),
          title: form.title.trim(),
          summary: form.summary.trim(),
          body: `<p>${form.body.trim()}</p>`,
          cluster: form.cluster.trim(),
          author_id: user!.id,
          sources,
          source_count: sources.length,
        })
        setIsCreating(false)
        setSelectedId(created.id)
        setMessage('Rascunho criado. Ele ainda não está público.')
      } else if (selected) {
        await updateEditorialContent(selected.id, {
          slug: form.slug.trim(),
          title: form.title.trim(),
          summary: form.summary.trim(),
          body: `<p>${form.body.trim()}</p>`,
          cluster: form.cluster.trim(),
          sources,
          source_count: sources.length,
          reviewer_id: selected.reviewer_id,
          status: selected.status,
        })
        setMessage('Alterações salvas com histórico de versão.')
      }
      await loadContents()
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setIsSaving(false)
    }
  }

  async function transition(status: EditorialStatus) {
    if (!selected) return
    setError('')
    setMessage('')
    try {
      const payload: Parameters<typeof updateEditorialContent>[1] = {
        status,
        source_count: selected.source_count,
        sources: selected.sources ?? [],
      }
      if (status === 'IN_REVIEW' || status === 'APPROVED') payload.reviewer_id = user!.id
      await updateEditorialContent(selected.id, payload)
      setMessage(`Transição concluída: ${statusLabels[status]}.`)
      await loadContents()
    } catch (transitionError) {
      setError(getErrorMessage(transitionError))
    }
  }

  async function changeRole(target: EditorialUser, role: EditorialUser['role']) {
    setError('')
    setMessage('')
    try {
      await updateEditorialUserRole(target.id, role)
      setMessage(
        `Papel de ${target.email} atualizado. O próprio papel do admin continua protegido.`,
      )
      await loadUsers()
    } catch (roleError) {
      setError(getErrorMessage(roleError))
    }
  }

  const actionButtons = selected ? (
    <div className="flex flex-wrap gap-2">
      {selected.status === 'DRAFT' && (user?.role === 'reviewer' || user?.role === 'admin') && (
        <ActionButton onClick={() => transition('IN_REVIEW')} icon={Send} label="Assumir revisão" />
      )}
      {selected.status === 'DRAFT' &&
        (user?.role === 'operator' || user?.role === 'admin') &&
        selected.author_id === user.id && (
          <ActionButton
            onClick={() => transition('DRAFT')}
            icon={Pencil}
            label="Salvar rascunho"
            secondary
          />
        )}
      {selected.status === 'IN_REVIEW' && (user?.role === 'reviewer' || user?.role === 'admin') && (
        <>
          <ActionButton onClick={() => transition('APPROVED')} icon={Check} label="Aprovar" />
          <ActionButton onClick={() => transition('DRAFT')} icon={X} label="Devolver" secondary />
        </>
      )}
      {selected.status === 'APPROVED' && (user?.role === 'publisher' || user?.role === 'admin') && (
        <ActionButton onClick={() => transition('PUBLISHED')} icon={Send} label="Publicar" />
      )}
      {selected.status === 'PUBLISHED' &&
        (user?.role === 'publisher' || user?.role === 'admin') && (
          <ActionButton
            onClick={() => transition('ARCHIVED')}
            icon={Archive}
            label="Despublicar"
            secondary
          />
        )}
      {selected.status === 'ARCHIVED' && (user?.role === 'reviewer' || user?.role === 'admin') && (
        <ActionButton
          onClick={() => transition('IN_REVIEW')}
          icon={History}
          label="Recuperar para revisão"
        />
      )}
    </div>
  ) : null

  return (
    <div className="min-h-[calc(100vh-190px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link to="/" className="text-sm font-bold text-emerald-300 hover:text-white">
                ← Preview público
              </Link>
              <p className="mt-7 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
                Área editorial protegida
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Governança antes da publicação.
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-slate-300">
                Fluxo demonstrativo persistente com estados, papéis, validações server-side e
                histórico de versões.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-200">
                {user?.name || user?.email} · {user ? roleLabels[user.role] : ''}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <LogOut size={16} aria-hidden="true" /> Sair
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <section className="space-y-6" aria-labelledby="content-list-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                Conteúdos persistidos
              </p>
              <h2 id="content-list-title" className="mt-2 text-2xl font-black text-slate-950">
                Fila editorial
              </h2>
            </div>
            {canCreate && (
              <button
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <FilePlus2 size={17} aria-hidden="true" /> Novo rascunho
              </button>
            )}
          </div>

          {visibleContents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Nenhum conteúdo acessível para este papel.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleContents.map((content) => (
                <button
                  key={content.id}
                  onClick={() => selectContent(content)}
                  className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${selectedId === content.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        v{content.version} · {content.cluster}
                      </p>
                      <h3 className="mt-2 font-black text-slate-950">{content.title}</h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[content.status]}`}
                    >
                      {statusLabels[content.status]}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {content.summary}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-emerald-700"
                size={19}
                aria-hidden="true"
              />
              <p>
                <strong>Fail-closed:</strong> conteúdo sem fonte, revisor ou aprovação não pode
                chegar ao status público.
              </p>
            </div>
          </div>

          {canManageRoles && (
            <section
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              aria-labelledby="roles-title"
            >
              <div className="flex items-center gap-3">
                <UserCog className="text-emerald-700" size={20} aria-hidden="true" />
                <h2 id="roles-title" className="font-black text-slate-950">
                  Matriz de papéis
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Atribuição de papéis é exclusiva do admin. O próprio papel não pode ser alterado.
              </p>
              <div className="mt-4 space-y-3">
                {users.map((target) => (
                  <div
                    key={target.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm"
                  >
                    <span className="font-semibold text-slate-800">{target.email}</span>
                    <select
                      value={target.role}
                      disabled={target.id === user?.id}
                      onChange={(event) =>
                        void changeRole(target, event.target.value as EditorialUser['role'])
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:bg-slate-100"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>

        <section
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          aria-labelledby="editor-title"
        >
          {!selected && !isCreating ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <ClipboardList className="text-emerald-700" size={38} aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-black text-slate-950">Selecione um conteúdo</h2>
              <p className="mt-3 max-w-md leading-7 text-slate-600">
                Acompanhe os dados, o estado atual, as ações permitidas e o histórico de versões sem
                expor rascunhos ao público.
              </p>
              {canCreate && (
                <button
                  onClick={startCreate}
                  className="mt-7 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800"
                >
                  Criar primeiro rascunho
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {isCreating ? 'Novo conteúdo' : 'Editor editorial'}
                  </p>
                  <h2 id="editor-title" className="mt-2 text-2xl font-black text-slate-950">
                    {isCreating ? 'Criar rascunho' : selected?.title}
                  </h2>
                </div>
                {!isCreating && selected && (
                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[selected.status]}`}
                  >
                    {statusLabels[selected.status]} · v{selected.version}
                  </span>
                )}
              </div>

              {(!selected || selected.status === 'DRAFT') &&
              (isCreating || selected?.author_id === user?.id || user?.role === 'admin') ? (
                <form onSubmit={handleSave} className="mt-7 space-y-5">
                  <Field
                    label="Slug"
                    value={form.slug}
                    onChange={(value) => updateField('slug', value)}
                    required
                    hint="Formato único: letras minúsculas e hífens."
                  />
                  <Field
                    label="Título"
                    value={form.title}
                    onChange={(value) => updateField('title', value)}
                    required
                  />
                  <Field
                    label="Resumo"
                    value={form.summary}
                    onChange={(value) => updateField('summary', value)}
                    required
                  />
                  <Field
                    label="Cluster"
                    value={form.cluster}
                    onChange={(value) => updateField('cluster', value)}
                    required
                  />
                  <label className="block text-sm font-bold text-slate-800">
                    Corpo demonstrativo
                    <textarea
                      value={form.body}
                      onChange={(event) => updateField('body', event.target.value)}
                      rows={6}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Fonte"
                      value={form.sourceLabel}
                      onChange={(value) => updateField('sourceLabel', value)}
                    />
                    <Field
                      label="URL da fonte"
                      value={form.sourceUrl}
                      onChange={(value) => updateField('sourceUrl', value)}
                      type="url"
                    />
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                    Salvar cria ou mantém <strong>DRAFT</strong>. Para ficar público, ainda será
                    necessário revisor e publisher.
                  </div>
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {isSaving ? 'Salvando…' : isCreating ? 'Criar rascunho' : 'Salvar nova versão'}
                  </button>
                </form>
              ) : (
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-7 text-slate-700">
                    Este papel não pode editar o conteúdo neste estado. Use somente as ações
                    compatíveis com a sua alçada.
                  </p>
                </div>
              )}

              {!isCreating && selected && (
                <>
                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Ações permitidas
                    </p>
                    <div className="mt-3">
                      {actionButtons || (
                        <p className="text-sm text-slate-600">
                          Nenhuma ação disponível para este papel neste estado.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-slate-200 pt-6">
                    <button
                      onClick={() => setShowHistory((visible) => !visible)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-emerald-700"
                    >
                      <History size={17} aria-hidden="true" /> Histórico de versões{' '}
                      <ChevronDown
                        className={`transition ${showHistory ? 'rotate-180' : ''}`}
                        size={16}
                        aria-hidden="true"
                      />
                    </button>
                    {showHistory && (
                      <div className="mt-4 space-y-3">
                        {history.length === 0 ? (
                          <p className="text-sm text-slate-600">
                            Nenhum evento de histórico acessível.
                          </p>
                        ) : (
                          history.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <strong className="text-slate-900">
                                  v{entry.version} · {entry.transition}
                                </strong>
                                <span className="text-slate-500">{statusLabels[entry.status]}</span>
                              </div>
                              <p className="mt-2 text-slate-600">
                                Registro persistente da transição editorial.
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {(message || error) && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}
              role={error ? 'alert' : 'status'}
            >
              {error || message}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required = false,
  hint,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  hint?: string
  type?: string
}) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  )
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  secondary = false,
}: {
  onClick: () => void
  icon: typeof Check
  label: string
  secondary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${secondary ? 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  )
}
