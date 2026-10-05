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
    <main className="min-h-screen bg-[#070707] px-4 py-12 text-[#F5F1E8] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9A227] transition hover:text-[#FAF3E8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span>Voltar ao preview público</span>
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <section className="text-[#F5F1E8]">
            <div className="inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#16140E] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#DCBF6F]">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
              Área editorial protegida
            </div>
            <h1 className="mt-5 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-5xl">
              Conteúdo só avança com a alçada certa.
            </h1>
            <p className="mt-5 max-w-xl font-sans text-sm leading-relaxed text-[#B8AF9F]">
              Entre com uma conta sintética para demonstrar criação, revisão, aprovação e publicação
              no ambiente de teste. A autorização é aplicada no servidor, não apenas nesta tela.
            </p>
            <div className="mt-8 space-y-4 font-sans text-xs text-[#C4BBAE]">
              <div className="flex items-start gap-3 rounded border border-[#C9A227]/20 bg-[#12110D] p-3.5">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-[#DCBF6F]"
                  size={18}
                  aria-hidden="true"
                />
                <span>Visitantes só enxergam conteúdos com status PUBLISHED.</span>
              </div>
              <div className="flex items-start gap-3 rounded border border-[#C9A227]/20 bg-[#12110D] p-3.5">
                <LockKeyhole
                  className="mt-0.5 shrink-0 text-[#DCBF6F]"
                  size={18}
                  aria-hidden="true"
                />
                <span>Operador, revisor e publisher têm permissões separadas.</span>
              </div>
            </div>
          </section>

          <section
            className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0D0D0D] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(201,162,39,0.2)] sm:p-9"
            aria-labelledby="login-title"
          >
            {/* Detalhes de cantoneiras douradas clássicas */}
            <div className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#C9A227]/60" />
            <div className="absolute top-2 right-2 h-3 w-3 border-t border-r border-[#C9A227]/60" />
            <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#C9A227]/60" />
            <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#C9A227]/60" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              Preview · noindex
            </p>
            <h2 id="login-title" className="mt-2 font-serif text-2xl font-semibold text-[#FAF3E8]">
              Entrar na área editorial
            </h2>
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-[#C4BBAE]"
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
                  className="mt-2 w-full rounded border border-[#C9A227]/30 bg-[#0A0A0A] px-4 py-3 text-sm text-[#FAF3E8] outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider text-[#C4BBAE]"
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
                  className="mt-2 w-full rounded border border-[#C9A227]/30 bg-[#0A0A0A] px-4 py-3 text-sm text-[#FAF3E8] outline-none transition focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
              {error && (
                <p
                  className="rounded border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs leading-relaxed text-red-300"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(201,162,39,0.35)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                {submitting ? 'Validando credencial…' : 'Entrar com segurança'}
              </button>
            </form>
            <p className="mt-6 text-[11px] leading-relaxed text-[#7A7366]">
              As contas desta tela são fixtures sintéticas do preview e não representam pessoas
              reais.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
