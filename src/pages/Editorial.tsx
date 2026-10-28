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
  DRAFT: 'border-[#784D34]/30 bg-[#F8F4EE] text-[#784D34]',
  IN_REVIEW: 'border-[#1E4331]/30 bg-[#EBF0EC] text-[#1E4331]',
  APPROVED: 'border-emerald-600/30 bg-emerald-50 text-emerald-800',
  PUBLISHED: 'border-[#1E4331] bg-[#1E4331] text-white',
  ARCHIVED: 'border-stone-300 bg-stone-100 text-stone-600',
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
    <div className="min-h-[calc(100vh-190px)] bg-[#F8FAF8] text-[#15271E]">
      <section className="border-b border-[#E2EBE5] bg-white text-[#15271E] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1E4331] hover:text-[#784D34]"
              >
                ← Voltar ao preview público
              </Link>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E2EBE5] bg-[#F4F7F4] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E4331]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#784D34]" />
                Área editorial protegida
              </div>
              <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#15271E] sm:text-5xl">
                Governança antes da publicação.
              </h1>
              <p className="mt-4 max-w-2xl font-sans text-xs leading-relaxed text-[#5A7567]">
                Fluxo demonstrativo persistente com estados, papéis, validações server-side e
                histórico de versões.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] px-3.5 py-1.5 font-mono text-xs text-[#1E4331] font-semibold">
                {user?.name || user?.email} · {user ? roleLabels[user.role] : ''}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E2EBE5] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#523422] transition hover:border-[#784D34] hover:text-[#784D34] shadow-sm"
              >
                <LogOut size={14} aria-hidden="true" /> Sair
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <section className="space-y-6" aria-labelledby="content-list-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                Conteúdos persistidos
              </p>
              <h2
                id="content-list-title"
                className="mt-1 font-serif text-2xl font-semibold text-[#15271E]"
              >
                Fila editorial
              </h2>
            </div>
            {canCreate && (
              <button
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1E4331] bg-[#1E4331] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#15271E]"
              >
                <FilePlus2 size={15} aria-hidden="true" /> Novo rascunho
              </button>
            )}
          </div>

          {visibleContents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E2EBE5] bg-white p-8 text-center text-xs text-[#5A7567]">
              Nenhum conteúdo acessível para este papel.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleContents.map((content) => (
                <button
                  key={content.id}
                  onClick={() => selectContent(content)}
                  className={`w-full rounded-xl border p-5 text-left transition-all ${
                    selectedId === content.id
                      ? 'border-[#1E4331] bg-white shadow-md ring-1 ring-[#1E4331]'
                      : 'border-[#E2EBE5] bg-white hover:border-[#1E4331]/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#784D34]">
                        v{content.version} · {content.cluster}
                      </p>
                      <h3 className="mt-1.5 font-serif text-base font-semibold text-[#15271E]">
                        {content.title}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${statusStyles[content.status]}`}
                    >
                      {statusLabels[content.status]}
                    </span>
                  </div>
                  <p className="mt-2.5 line-clamp-2 font-sans text-xs leading-relaxed text-[#5A7567]">
                    {content.summary}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-[#E2EBE5] bg-white p-4 text-xs leading-relaxed text-[#2E694D] shadow-sm">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#1E4331]"
                size={18}
                aria-hidden="true"
              />
              <p>
                <strong className="text-[#15271E]">Fail-closed:</strong> conteúdo sem fonte, revisor
                ou aprovação não pode chegar ao status público.
              </p>
            </div>
          </div>

          {canManageRoles && (
            <section
              className="rounded-xl border border-[#E2EBE5] bg-white p-5 shadow-sm"
              aria-labelledby="roles-title"
            >
              <div className="flex items-center gap-2.5">
                <UserCog className="text-[#1E4331]" size={18} aria-hidden="true" />
                <h2 id="roles-title" className="font-serif text-base font-semibold text-[#15271E]">
                  Matriz de papéis
                </h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#5A7567]">
                Atribuição de papéis é exclusiva do admin. O próprio papel não pode ser alterado.
              </p>
              <div className="mt-4 space-y-3">
                {users.map((target) => (
                  <div
                    key={target.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2EBE5] pt-3 text-xs"
                  >
                    <span className="font-mono text-[#15271E]">{target.email}</span>
                    <select
                      value={target.role}
                      disabled={target.id === user?.id}
                      onChange={(event) =>
                        void changeRole(target, event.target.value as EditorialUser['role'])
                      }
                      className="rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-3 py-1.5 text-xs text-[#15271E] outline-none transition focus:border-[#1E4331] focus:bg-white disabled:opacity-40"
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
          className="rounded-2xl border border-[#E2EBE5] bg-white p-6 shadow-sm sm:p-8"
          aria-labelledby="editor-title"
        >
          {!selected && !isCreating ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <ClipboardList className="text-[#1E4331]" size={36} aria-hidden="true" />
              <h2 className="mt-5 font-serif text-2xl font-semibold text-[#15271E]">
                Selecione um conteúdo
              </h2>
              <p className="mt-3 max-w-md font-sans text-xs leading-relaxed text-[#5A7567]">
                Acompanhe os dados, o estado atual, as ações permitidas e o histórico de versões sem
                expor rascunhos ao público.
              </p>
              {canCreate && (
                <button
                  onClick={startCreate}
                  className="mt-7 rounded-lg border border-[#1E4331] bg-[#1E4331] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#15271E]"
                >
                  Criar primeiro rascunho
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                    {isCreating ? 'Novo conteúdo' : 'Editor editorial'}
                  </p>
                  <h2
                    id="editor-title"
                    className="mt-1.5 font-serif text-2xl font-semibold text-[#15271E]"
                  >
                    {isCreating ? 'Criar rascunho' : selected?.title}
                  </h2>
                </div>
                {!isCreating && selected && (
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase ${statusStyles[selected.status]}`}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#425A4E]">
                    Corpo demonstrativo
                    <textarea
                      value={form.body}
                      onChange={(event) => updateField('body', event.target.value)}
                      rows={6}
                      required
                      className="mt-2 w-full rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-4 py-3 font-sans text-xs text-[#15271E] outline-none transition focus:border-[#1E4331] focus:bg-white focus:ring-1 focus:ring-[#1E4331]"
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
                  <div className="rounded-xl border border-[#E2EBE5] bg-[#F4F7F4] p-4 text-xs leading-relaxed text-[#2E694D]">
                    Salvar cria ou mantém <strong className="text-[#15271E]">DRAFT</strong>. Para
                    ficar público, ainda será necessário revisor e publisher.
                  </div>
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="rounded-lg border border-[#1E4331] bg-[#1E4331] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#15271E] disabled:opacity-60"
                  >
                    {isSaving ? 'Salvando…' : isCreating ? 'Criar rascunho' : 'Salvar nova versão'}
                  </button>
                </form>
              ) : (
                <div className="mt-7 rounded-xl border border-[#E2EBE5] bg-[#F4F7F4] p-5">
                  <p className="text-xs leading-relaxed text-[#5A7567]">
                    Este papel não pode editar o conteúdo neste estado. Use somente as ações
                    compatíveis com a sua alçada.
                  </p>
                </div>
              )}

              {!isCreating && selected && (
                <>
                  <div className="mt-7 border-t border-[#E2EBE5] pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                      Ações permitidas
                    </p>
                    <div className="mt-3">
                      {actionButtons || (
                        <p className="text-xs text-[#5A7567]">
                          Nenhuma ação disponível para este papel neste estado.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-[#E2EBE5] pt-6">
                    <button
                      onClick={() => setShowHistory((visible) => !visible)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E4331] hover:text-[#784D34]"
                    >
                      <History size={15} aria-hidden="true" /> Histórico de versões{' '}
                      <ChevronDown
                        className={`transition ${showHistory ? 'rotate-180' : ''}`}
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                    {showHistory && (
                      <div className="mt-4 space-y-3">
                        {history.length === 0 ? (
                          <p className="text-xs text-[#5A7567]">
                            Nenhum evento de histórico acessível.
                          </p>
                        ) : (
                          history.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-4 text-xs"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <strong className="font-mono text-[#15271E]">
                                  v{entry.version} · {entry.transition}
                                </strong>
                                <span className="font-mono text-[#1E4331] font-semibold">
                                  {statusLabels[entry.status]}
                                </span>
                              </div>
                              <p className="mt-2 text-[#5A7567]">
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
              className={`mt-6 rounded-lg border px-4 py-3 text-xs leading-relaxed ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#1E4331]/30 bg-[#EBF0EC] text-[#1E4331]'}`}
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
    <label className="block text-xs font-semibold uppercase tracking-wider text-[#425A4E]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-4 py-2.5 font-sans text-xs text-[#15271E] outline-none transition focus:border-[#1E4331] focus:bg-white focus:ring-1 focus:ring-[#1E4331]"
      />
      {hint && <span className="mt-1 block font-mono text-[10px] text-[#5A7567]">{hint}</span>}
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
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
        secondary
          ? 'border-[#E2EBE5] bg-[#F8FAF8] text-[#15271E] hover:border-[#1E4331] hover:text-[#1E4331]'
          : 'border-[#1E4331] bg-[#1E4331] text-white hover:bg-[#15271E]'
      }`}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  )
}
