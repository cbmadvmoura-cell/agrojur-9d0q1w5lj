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
  DRAFT: 'border-[#4A3912]/40 bg-[#1A1812] text-[#DCBF6F]',
  IN_REVIEW: 'border-[#C9A227]/50 bg-[#241F10] text-[#F2E6BF]',
  APPROVED: 'border-sky-500/30 bg-sky-950/30 text-sky-200',
  PUBLISHED: 'border-[#C9A227] bg-[#1F1B0B] text-[#FAF3E8]',
  ARCHIVED: 'border-stone-700 bg-stone-900 text-stone-400',
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
    <div className="min-h-[calc(100vh-190px)] bg-[#0A0A0A] text-[#F5F1E8]">
      <section className="border-b border-[#C9A227]/20 bg-gradient-to-b from-[#111111] to-[#0A0A0A] text-[#FAF3E8]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C9A227] hover:text-[#FAF3E8]"
              >
                ← Voltar ao preview público
              </Link>
              <div className="mt-6 inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#16140E] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#DCBF6F]">
                <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                Área editorial protegida
              </div>
              <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-5xl">
                Governança antes da publicação.
              </h1>
              <p className="mt-4 max-w-2xl font-sans text-xs leading-relaxed text-[#B8AF9F]">
                Fluxo demonstrativo persistente com estados, papéis, validações server-side e
                histórico de versões.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-[#C9A227]/40 bg-[#16140E] px-3 py-1.5 font-mono text-xs text-[#DCBF6F]">
                {user?.name || user?.email} · {user ? roleLabels[user.role] : ''}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#141414] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FAF3E8] transition hover:border-[#C9A227] hover:text-[#DCBF6F]"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                Conteúdos persistidos
              </p>
              <h2
                id="content-list-title"
                className="mt-1 font-serif text-2xl font-semibold text-[#FAF3E8]"
              >
                Fila editorial
              </h2>
            </div>
            {canCreate && (
              <button
                onClick={startCreate}
                className="inline-flex items-center gap-2 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition hover:brightness-110"
              >
                <FilePlus2 size={15} aria-hidden="true" /> Novo rascunho
              </button>
            )}
          </div>

          {visibleContents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#C9A227]/30 bg-[#111111] p-8 text-center text-xs text-[#9E9585]">
              Nenhum conteúdo acessível para este papel.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleContents.map((content) => (
                <button
                  key={content.id}
                  onClick={() => selectContent(content)}
                  className={`w-full rounded-lg border p-5 text-left transition-all ${
                    selectedId === content.id
                      ? 'border-[#C9A227] bg-[#1A1812] shadow-[0_0_15px_rgba(201,162,39,0.2)]'
                      : 'border-[#C9A227]/20 bg-[#121212] hover:border-[#C9A227]/50 hover:bg-[#161512]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#9E9585]">
                        v{content.version} · {content.cluster}
                      </p>
                      <h3 className="mt-1.5 font-serif text-base font-semibold text-[#FAF3E8]">
                        {content.title}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase ${statusStyles[content.status]}`}
                    >
                      {statusLabels[content.status]}
                    </span>
                  </div>
                  <p className="mt-2.5 line-clamp-2 font-sans text-xs leading-relaxed text-[#A39985]">
                    {content.summary}
                  </p>
                </button>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-[#C9A227]/25 bg-[#14120B] p-4 text-xs leading-relaxed text-[#DCBF6F]">
            <div className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-[#C9A227]"
                size={18}
                aria-hidden="true"
              />
              <p>
                <strong className="text-[#FAF3E8]">Fail-closed:</strong> conteúdo sem fonte, revisor
                ou aprovação não pode chegar ao status público.
              </p>
            </div>
          </div>

          {canManageRoles && (
            <section
              className="rounded-lg border border-[#C9A227]/25 bg-[#121212] p-5 shadow-sm"
              aria-labelledby="roles-title"
            >
              <div className="flex items-center gap-2.5">
                <UserCog className="text-[#C9A227]" size={18} aria-hidden="true" />
                <h2 id="roles-title" className="font-serif text-base font-semibold text-[#FAF3E8]">
                  Matriz de papéis
                </h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#9E9585]">
                Atribuição de papéis é exclusiva do admin. O próprio papel não pode ser alterado.
              </p>
              <div className="mt-4 space-y-3">
                {users.map((target) => (
                  <div
                    key={target.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252525] pt-3 text-xs"
                  >
                    <span className="font-mono text-[#E8DFD0]">{target.email}</span>
                    <select
                      value={target.role}
                      disabled={target.id === user?.id}
                      onChange={(event) =>
                        void changeRole(target, event.target.value as EditorialUser['role'])
                      }
                      className="rounded border border-[#C9A227]/30 bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#FAF3E8] disabled:opacity-40"
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
          className="rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm sm:p-8"
          aria-labelledby="editor-title"
        >
          {!selected && !isCreating ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <ClipboardList className="text-[#C9A227]" size={36} aria-hidden="true" />
              <h2 className="mt-5 font-serif text-2xl font-semibold text-[#FAF3E8]">
                Selecione um conteúdo
              </h2>
              <p className="mt-3 max-w-md font-sans text-xs leading-relaxed text-[#9E9585]">
                Acompanhe os dados, o estado atual, as ações permitidas e o histórico de versões sem
                expor rascunhos ao público.
              </p>
              {canCreate && (
                <button
                  onClick={startCreate}
                  className="mt-7 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition hover:brightness-110"
                >
                  Criar primeiro rascunho
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                    {isCreating ? 'Novo conteúdo' : 'Editor editorial'}
                  </p>
                  <h2
                    id="editor-title"
                    className="mt-1.5 font-serif text-2xl font-semibold text-[#FAF3E8]"
                  >
                    {isCreating ? 'Criar rascunho' : selected?.title}
                  </h2>
                </div>
                {!isCreating && selected && (
                  <span
                    className={`rounded border px-3 py-1 font-mono text-[10px] font-semibold uppercase ${statusStyles[selected.status]}`}
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4BBAE]">
                    Corpo demonstrativo
                    <textarea
                      value={form.body}
                      onChange={(event) => updateField('body', event.target.value)}
                      rows={6}
                      required
                      className="mt-2 w-full rounded border border-[#C9A227]/30 bg-[#0A0A0A] px-4 py-3 font-sans text-xs text-[#FAF3E8] outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
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
                  <div className="rounded border border-[#C9A227]/25 bg-[#16140E] p-4 text-xs leading-relaxed text-[#DCBF6F]">
                    Salvar cria ou mantém <strong className="text-[#FAF3E8]">DRAFT</strong>. Para
                    ficar público, ainda será necessário revisor e publisher.
                  </div>
                  <button
                    disabled={isSaving}
                    type="submit"
                    className="rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition hover:brightness-110 disabled:opacity-60"
                  >
                    {isSaving ? 'Salvando…' : isCreating ? 'Criar rascunho' : 'Salvar nova versão'}
                  </button>
                </form>
              ) : (
                <div className="mt-7 rounded-lg border border-[#C9A227]/20 bg-[#121212] p-5">
                  <p className="text-xs leading-relaxed text-[#A39985]">
                    Este papel não pode editar o conteúdo neste estado. Use somente as ações
                    compatíveis com a sua alçada.
                  </p>
                </div>
              )}

              {!isCreating && selected && (
                <>
                  <div className="mt-7 border-t border-[#C9A227]/20 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                      Ações permitidas
                    </p>
                    <div className="mt-3">
                      {actionButtons || (
                        <p className="text-xs text-[#9E9585]">
                          Nenhuma ação disponível para este papel neste estado.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-7 border-t border-[#C9A227]/20 pt-6">
                    <button
                      onClick={() => setShowHistory((visible) => !visible)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FAF3E8] hover:text-[#DCBF6F]"
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
                          <p className="text-xs text-[#9E9585]">
                            Nenhum evento de histórico acessível.
                          </p>
                        ) : (
                          history.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded border border-[#C9A227]/20 bg-[#0F0F0F] p-4 text-xs"
                            >
                              <div className="flex flex-wrap justify-between gap-2">
                                <strong className="font-mono text-[#FAF3E8]">
                                  v{entry.version} · {entry.transition}
                                </strong>
                                <span className="font-mono text-[#DCBF6F]">
                                  {statusLabels[entry.status]}
                                </span>
                              </div>
                              <p className="mt-2 text-[#9E9585]">
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
              className={`mt-6 rounded border px-4 py-3 text-xs leading-relaxed ${error ? 'border-red-500/40 bg-red-950/40 text-red-300' : 'border-[#C9A227]/40 bg-[#16140E] text-[#DCBF6F]'}`}
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
    <label className="block text-xs font-semibold uppercase tracking-wider text-[#C4BBAE]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-2 w-full rounded border border-[#C9A227]/30 bg-[#0A0A0A] px-4 py-2.5 font-sans text-xs text-[#FAF3E8] outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
      />
      {hint && <span className="mt-1 block font-mono text-[10px] text-[#7A7366]">{hint}</span>}
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
      className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
        secondary
          ? 'border-[#C9A227]/30 bg-[#141414] text-[#FAF3E8] hover:border-[#C9A227] hover:text-[#DCBF6F]'
          : 'border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] text-[#0C0C0C] hover:brightness-110'
      }`}
    >
      <Icon size={14} aria-hidden="true" />
      {label}
    </button>
  )
}
