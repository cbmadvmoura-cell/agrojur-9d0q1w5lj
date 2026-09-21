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
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <ArrowLeft size={17} aria-hidden="true" /> Voltar ao preview público
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <section className="text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
              Área editorial protegida
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Conteúdo só avança com a alçada certa.
            </h1>
            <p className="mt-5 max-w-xl leading-8 text-slate-300">
              Entre com uma conta sintética para demonstrar criação, revisão, aprovação e publicação
              no ambiente de teste. A autorização é aplicada no servidor, não apenas nesta tela.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-emerald-300"
                  size={20}
                  aria-hidden="true"
                />
                <span>Visitantes só enxergam conteúdos com status PUBLISHED.</span>
              </div>
              <div className="flex items-start gap-3">
                <LockKeyhole
                  className="mt-0.5 shrink-0 text-emerald-300"
                  size={20}
                  aria-hidden="true"
                />
                <span>Operador, revisor e publisher têm permissões separadas.</span>
              </div>
            </div>
          </section>

          <section
            className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            aria-labelledby="login-title"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Preview · noindex
            </p>
            <h2 id="login-title" className="mt-3 text-2xl font-black text-slate-950">
              Entrar na área editorial
            </h2>
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-bold text-slate-800" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              {error && (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                {submitting ? 'Validando…' : 'Entrar com segurança'}
              </button>
            </form>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              As contas desta tela são fixtures sintéticas do preview e não representam pessoas
              reais.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
