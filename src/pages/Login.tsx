import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Login() {
  const { isAuthenticated, loading, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('operator@agrojur.local')
  const [password, setPassword] = useState('Agrojur@Preview1')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from || '/editorial'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (result.error) setError(getErrorMessage(result.error))
  }

  return (
    <main className="min-h-screen bg-[#F8FAF8] px-4 py-12 text-[#15271E] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1E4331] transition hover:text-[#784D34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span>Voltar ao preview público</span>
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="text-[#15271E]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E2EBE5] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E4331] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#784D34]" />
              Área editorial protegida
            </div>
            <h1 className="mt-5 font-serif text-3xl font-normal tracking-tight text-[#15271E] sm:text-5xl">
              Conteúdo só avança com a alçada certa.
            </h1>
            <p className="mt-5 max-w-xl font-sans text-sm leading-relaxed text-[#425A4E]">
              Entre com uma conta sintética para demonstrar criação, revisão, aprovação e publicação
              no ambiente de teste. A autorização é aplicada no servidor, não apenas nesta tela.
            </p>
            <div className="mt-8 space-y-4 font-sans text-xs text-[#2F4238]">
              <div className="flex items-start gap-3 rounded-xl border border-[#E2EBE5] bg-white p-3.5 shadow-sm">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-[#1E4331]"
                  size={18}
                  aria-hidden="true"
                />
                <span>Visitantes só enxergam conteúdos com status PUBLISHED.</span>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#E2EBE5] bg-white p-3.5 shadow-sm">
                <LockKeyhole
                  className="mt-0.5 shrink-0 text-[#784D34]"
                  size={18}
                  aria-hidden="true"
                />
                <span>Operador, revisor e publisher têm permissões separadas.</span>
              </div>
            </div>
          </section>

          <section
            className="relative rounded-2xl border border-[#E2EBE5] bg-white p-7 shadow-[0_12px_36px_rgba(30,67,49,0.08)] sm:p-9"
            aria-labelledby="login-title"
          >
            {/* Detalhes de cantoneiras clássicas em tom terroso */}
            <div className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#784D34]" />
            <div className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#784D34]" />
            <div className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#784D34]" />
            <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#784D34]" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
              Preview · noindex
            </p>
            <h2 id="login-title" className="mt-2 font-serif text-2xl font-semibold text-[#15271E]">
              Entrar na área editorial
            </h2>
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-[#425A4E]"
                  htmlFor="email"
                >
                  E-mail institucional
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-4 py-3 text-sm text-[#15271E] outline-none transition focus:border-[#1E4331] focus:bg-white focus:ring-1 focus:ring-[#1E4331]"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-[#425A4E]"
                  htmlFor="password"
                >
                  Chave de acesso
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-4 py-3 text-sm text-[#15271E] outline-none transition focus:border-[#1E4331] focus:bg-white focus:ring-1 focus:ring-[#1E4331]"
                />
              </div>
              {error && (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg border border-[#1E4331] bg-[#1E4331] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#15271E] hover:shadow-md disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
              >
                {submitting ? 'Validando credencial…' : 'Entrar com segurança'}
              </button>
            </form>
            <p className="mt-6 text-[11px] leading-relaxed text-[#5A7567]">
              As contas desta tela são fixtures sintéticas do preview e não representam pessoas
              reais.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
