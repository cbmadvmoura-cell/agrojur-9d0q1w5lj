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
    label: 'Calculadora Tributária',
    title: 'Simule a transição 2025–2033 (LC 214/2025)',
    description:
      'Projeção comparativa ano a ano: CBS, IBS, créditos agropecuários e impacto no seu fluxo tributário.',
    icon: Calculator,
  },
]

const Index = () => {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8]">
      {/* Hero Section Imponente com Visual Jurídico de Alto Luxo */}
      <section className="relative overflow-hidden border-b border-[#C9A227]/20 bg-gradient-to-b from-[#111111] via-[#0D0D0D] to-[#0A0A0A]">
        {/* Glow dourado sutil e textura de fundo */}
        <div className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#C9A227]/10 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -left-20 h-[350px] w-[350px] rounded-full bg-[#8E6F16]/10 blur-[120px]" />

        {/* Grade de linhas clássicas finas */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#C9A227 1px, transparent 1px), linear-gradient(to right, #C9A227 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#16140E]/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#DCBF6F] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
              Ambiente de teste · conteúdo sintético
            </div>

            <h1 className="font-serif text-4xl font-normal leading-[1.12] tracking-tight text-[#FAF3E8] sm:text-6xl lg:text-[4rem]">
              Um ponto de partida seguro para o{' '}
              <span className="italic font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FAF3E8] via-[#DCBF6F] to-[#C9A227]">
                Portal Agrojur.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl font-sans text-base leading-relaxed text-[#C4BBAE] sm:text-lg">
              Este preview apresenta a estrutura pública mínima do portal. Ele serve para validar
              caminhos e linguagem antes de qualquer conteúdo real ou publicação definitiva.
            </p>

            {/* Ações com botões em dourado nobre e moldura jurídica */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/temas"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] shadow-[0_4px_20px_rgba(201,162,39,0.25)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(201,162,39,0.45)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                <span>Explorar temas</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/blog"
                className="group inline-flex items-center gap-2 rounded border border-[#C9A227]/40 bg-[#141414] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#E8DFD0] transition-all duration-200 hover:border-[#C9A227] hover:bg-[#1C1A14] hover:text-[#DCBF6F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                <span>Ver blog demonstrativo</span>
              </Link>
            </div>

            {/* Selo institucional Moura e Medeiros */}
            <div className="mt-12 flex items-center gap-3 text-xs tracking-widest text-[#9E9585] uppercase">
              <span className="h-px w-8 bg-[#C9A227]/40" />
              <span>Advocacia do Agronegócio</span>
              <span className="h-px w-8 bg-[#C9A227]/40" />
            </div>
          </div>

          {/* Aside: Card de Status estilo Certificado Jurídico / Placa de Prestígio */}
          <aside
            className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#161512] to-[#0E0E0E] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(201,162,39,0.2)] sm:p-8"
            aria-label="Resumo do ambiente"
          >
            {/* Detalhes de cantoneiras douradas clássicas */}
            <div className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#C9A227]/60" />
            <div className="absolute top-2 right-2 h-3 w-3 border-t border-r border-[#C9A227]/60" />
            <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#C9A227]/60" />
            <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#C9A227]/60" />

            <div className="flex items-center justify-between gap-4 border-b border-[#C9A227]/20 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  Status do ambiente
                </p>
                <h2 className="mt-1.5 font-serif text-2xl font-semibold tracking-tight text-[#FAF3E8]">
                  Preview controlado
                </h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#1F1C14] shadow-[0_0_12px_rgba(201,162,39,0.2)]">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-[#C9A227] animate-pulse shadow-[0_0_8px_#C9A227]"
                  aria-label="Ambiente disponível"
                />
              </div>
            </div>

            <dl className="mt-6 space-y-4 text-xs">
              <div className="flex items-center justify-between gap-4 border-b border-[#252525] pb-3">
                <dt className="text-[#9E9585]">Visibilidade</dt>
                <dd className="font-mono text-right font-medium text-[#FAF3E8]">
                  Pública, sem indexação
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#252525] pb-3">
                <dt className="text-[#9E9585]">Conteúdo</dt>
                <dd className="font-mono text-right font-medium text-[#FAF3E8]">
                  Sintético e sinalizado
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1">
                <dt className="text-[#9E9585]">Coleta de dados</dt>
                <dd className="font-mono text-right font-medium text-[#FAF3E8]">
                  Desativada nesta fase
                </dd>
              </div>
            </dl>

            <div className="mt-6 rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-[11px] leading-relaxed text-[#DCBF6F]/90">
              Ambiente de conformidade técnica e validação prévia.
            </div>
          </aside>
        </div>
      </section>

      {/* Grid de Seções com Acabamento Jurídico Nobre */}
      <section
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="areas-title"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
            <span className="h-1 w-1 bg-[#C9A227]" />
            Estrutura mínima
          </div>
          <h2
            id="areas-title"
            className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-4xl"
          >
            Caminhos preparados para a próxima etapa
          </h2>
          <p className="mt-4 font-sans text-sm leading-relaxed text-[#B8AF9F]">
            Cada área abaixo é uma rota funcional do shell. As informações são ilustrativas e não
            substituem análise, revisão ou orientação profissional.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {areas.map(({ to, label, title, description, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-lg border border-[#C9A227]/25 bg-gradient-to-b from-[#141414] to-[#0D0D0D] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/60 hover:shadow-[0_12px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(201,162,39,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              {/* Numeral romano sutil no canto superior */}
              <span className="absolute top-6 right-6 font-serif text-xs font-semibold tracking-widest text-[#C9A227]/40 group-hover:text-[#C9A227]/80">
                {['I', 'II', 'III', 'IV'][index]}
              </span>

              <div className="flex items-start justify-between gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded border border-[#C9A227]/30 bg-gradient-to-br from-[#1E1B13] to-[#111111] text-[#DCBF6F] shadow-[inset_0_1px_1px_rgba(201,162,39,0.25)] transition-colors group-hover:border-[#C9A227] group-hover:text-[#FAF3E8]">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <ArrowRight
                  className="mt-2 text-[#7A7366] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#DCBF6F]"
                  size={18}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                {label}
              </p>
              <h3 className="mt-2 font-serif text-xl font-semibold tracking-tight text-[#FAF3E8] group-hover:text-[#DCBF6F]">
                {title}
              </h3>
              <p className="mt-3 font-sans text-xs leading-relaxed text-[#A39985]">{description}</p>

              {/* Linha de acabamento dourada no rodapé do card que se expande no hover */}
              <div className="mt-6 h-px w-full bg-[#C9A227]/15 transition-colors group-hover:bg-[#C9A227]/40" />
            </Link>
          ))}
        </div>
      </section>

      {/* Banner de Próximo Passo sóbrio e imponente */}
      <section
        className="relative border-t border-[#C9A227]/20 bg-[#070707]"
        aria-labelledby="next-title"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative rounded-lg border border-[#C9A227]/25 bg-gradient-to-r from-[#12110D] via-[#161510] to-[#12110D] p-8 sm:p-12">
            <div className="gold-divider mb-8" />

            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
              Próximo passo
            </p>
            <h2
              id="next-title"
              className="mt-3 max-w-2xl font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-4xl"
            >
              Validar a experiência antes de ampliar o produto.
            </h2>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-[#B8AF9F]">
              O shell não publica conteúdo real, não recebe dados pessoais e não representa um
              sistema editorial concluído. Ele é a base visual para o próximo ciclo de validação.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
