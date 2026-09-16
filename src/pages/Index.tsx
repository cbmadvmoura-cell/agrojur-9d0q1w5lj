import { ArrowRight, BookOpen, Calculator, ClipboardCheck, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

const areas = [
  {
    to: '/temas',
    label: 'Temas',
    title: 'Organize o conhecimento por temas',
    description: 'Trilhas demonstrativas para orientar a futura organização editorial do portal.',
    icon: Leaf,
  },
  {
    to: '/blog',
    label: 'Blog',
    title: 'Acompanhe conteúdos em preparação',
    description: 'Uma visão controlada do caminho entre pauta, revisão e publicação.',
    icon: BookOpen,
  },
  {
    to: '/diagnostico',
    label: 'Diagnóstico',
    title: 'Conheça o fluxo de diagnóstico',
    description: 'Estrutura visual sem coleta ou armazenamento de dados reais nesta fase.',
    icon: ClipboardCheck,
  },
  {
    to: '/calculadora',
    label: 'Calculadora',
    title: 'Veja o espaço para ferramentas',
    description:
      'Área reservada para uma futura experiência calculável, ainda sem resultado produtivo.',
    icon: Calculator,
  },
]

const Index = () => {
  return (
    <div>
      <section className="border-b border-emerald-950/10 bg-[radial-gradient(circle_at_top_right,_rgba(167,243,208,0.7),_transparent_38%),linear-gradient(135deg,#ecfdf5_0%,#ffffff_62%)]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              Ambiente de teste · conteúdo sintético
            </p>
            <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              Um ponto de partida seguro para o Portal Agrojur.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 sm:text-xl">
              Este preview apresenta a estrutura pública mínima do portal. Ele serve para validar
              caminhos e linguagem antes de qualquer conteúdo real ou publicação definitiva.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/temas"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Explorar temas <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                Ver blog demonstrativo
              </Link>
            </div>
          </div>

          <aside
            className="rounded-3xl border border-emerald-200 bg-white/85 p-6 shadow-[0_20px_60px_-30px_rgba(6,78,59,0.45)] sm:p-8"
            aria-label="Resumo do ambiente"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Status do ambiente
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Preview controlado</h2>
              </div>
              <span
                className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]"
                aria-label="Ambiente disponível"
              />
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Visibilidade</dt>
                <dd className="text-right font-bold text-slate-900">Pública, sem indexação</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Conteúdo</dt>
                <dd className="text-right font-bold text-slate-900">Sintético e sinalizado</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-slate-500">Coleta de dados</dt>
                <dd className="text-right font-bold text-slate-900">Desativada nesta fase</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="areas-title"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
            Estrutura mínima
          </p>
          <h2
            id="areas-title"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
          >
            Caminhos preparados para a próxima etapa
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Cada área abaixo é uma rota funcional do shell. As informações são ilustrativas e não
            substituem análise, revisão ou orientação profissional.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {areas.map(({ to, label, title, description, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <ArrowRight
                  className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                  size={20}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                {label}
              </p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white" aria-labelledby="next-title">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">
            Próximo passo
          </p>
          <h2
            id="next-title"
            className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl"
          >
            Validar a experiência antes de ampliar o produto.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            O shell não publica conteúdo real, não recebe dados pessoais e não representa um sistema
            editorial concluído. Ele é a base visual para o próximo ciclo de validação.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Index
