import { useState, useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Leaf,
  Scale,
  ShieldCheck,
  Wheat,
  TrendingUp,
  Award,
  ChevronDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollExpandMedia } from '@/components/ui/scroll-expansion-hero'

const areas = [
  {
    to: '/temas',
    label: 'Temas',
    title: 'Organize o conhecimento por temas',
    description:
      'Trilhas estratégicas para orientar a estruturação jurídica e contratual no agronegócio.',
    icon: Leaf,
    details: 'Contratos agrários, CPR, regularização fundiária e holding familiar rural.',
  },
  {
    to: '/blog',
    label: 'Blog Editorial',
    title: 'Acompanhe conteúdos e análises',
    description:
      'Uma visão aprofundada dos impactos regulatórios, jurisprudência e teses tributárias.',
    icon: BookOpen,
    details: 'Artigos técnicos, pareceres e atualizações periódicas da banca.',
  },
  {
    to: '/diagnostico',
    label: 'Diagnóstico Rural',
    title: 'Conheça o fluxo de diagnóstico',
    description: 'Mapeamento preventivo de passivos, riscos contratuais e governança patrimonial.',
    icon: ClipboardCheck,
    details: 'Checklist estruturado para produtores rurais e agroindústrias.',
  },
  {
    to: '/calculadora',
    label: 'Calculadora Tributária',
    title: 'Simule a transição 2025–2033 (LC 214/2025)',
    description:
      'Projeção comparativa ano a ano: CBS, IBS, créditos agropecuários e impacto no seu fluxo de caixa.',
    icon: Calculator,
    details: 'Simulação completa com regime tributário, insumos e faturamento real.',
  },
]

const diferenciais = [
  {
    icon: Wheat,
    titulo: 'Especialização Pura no Agronegócio',
    descricao:
      'Linguagem de campo com rigor de tribunal. Compreendemos a safra, o clima e a dinâmica financeira do produtor e da cooperativa.',
  },
  {
    icon: Scale,
    titulo: 'Segurança Jurídica & Planejamento Tributário',
    descricao:
      'Adoção proativa da Reforma Tributária (LC 214/2025), recuperação de créditos e blindagem jurídica de contratos agrários.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Proteção Patrimonial & Sucessão Familiar',
    descricao:
      'Estruturação de holdings rurais e protocolos de governança familiar para que a terra permaneça produtiva por gerações.',
  },
]

// Imagens reais de alta resolução no Unsplash com temática de agronegócio, lavoura dourada e colheita
const AGRO_MEDIA = {
  // Lavoura de grãos/soja em luz dourada ao entardecer
  image: {
    src: 'https://img.usecurling.com/p/1600/900?q=agriculture%20field&color=yellow',
    poster: undefined,
    background: 'https://img.usecurling.com/p/1920/1080?q=wheat%20field%20sunrise&color=orange',
    title: 'Advocacia de Precisão para o Agronegócio',
    subtitle: 'Moura e Medeiros Advogados Associados · Tradição & Inteligência Jurídica',
    scrollToExpand: 'Role para revelar o escritório',
  },
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster: 'https://img.usecurling.com/p/1280/720?q=agriculture%20harvest&color=yellow',
    background: 'https://img.usecurling.com/p/1920/1080?q=soybean%20field&color=green',
    title: 'Advocacia Estratégica do Agronegócio',
    subtitle: 'Segurança Jurídica da Porteira para Dentro e para Fora',
    scrollToExpand: 'Role para revelar o escritório',
  },
}

export const Index = () => {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const currentMedia = AGRO_MEDIA[mediaType]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-[#0A0A0A] text-[#F5F1E8]">
      {/* NOVO HERO EXPANSIVO COM SCROLLEXPANDMEDIA */}
      <section className="relative w-full">
        {/* Alternador discreto de visualização Imagem / Vídeo no canto do hero */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full border border-[#C9A227]/30 bg-[#12110D]/90 p-1 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.7)] text-[11px]">
          <button
            type="button"
            onClick={() => setMediaType('image')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-200 ${
              mediaType === 'image'
                ? 'bg-gradient-to-r from-[#C9A227] to-[#DCBF6F] text-[#0A0A0A] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                : 'text-[#C4BBAE] hover:text-[#FAF3E8]'
            }`}
          >
            Fotografia Agro
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-200 ${
              mediaType === 'video'
                ? 'bg-gradient-to-r from-[#C9A227] to-[#DCBF6F] text-[#0A0A0A] shadow-[0_0_10px_rgba(201,162,39,0.5)]'
                : 'text-[#C4BBAE] hover:text-[#FAF3E8]'
            }`}
          >
            Vídeo
          </button>
        </div>

        <ScrollExpandMedia
          mediaType={mediaType}
          mediaSrc={currentMedia.src}
          posterSrc={mediaType === 'video' ? currentMedia.poster : undefined}
          bgImageSrc={currentMedia.background}
          title={currentMedia.title}
          date={currentMedia.subtitle}
          scrollToExpand={currentMedia.scrollToExpand}
          textBlend={false}
        >
          {/* CONTEÚDO REVELADO APÓS A EXPANSÃO DA MÍDIA */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
            {/* Bloco Institucional do Escritório Moura e Medeiros */}
            <div className="relative rounded-2xl border border-[#C9A227]/35 bg-gradient-to-b from-[#14130F]/95 via-[#0E0E0C]/95 to-[#0A0A0A]/95 p-8 sm:p-12 lg:p-14 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(201,162,39,0.25)] backdrop-blur-md">
              {/* Detalhes de cantoneiras clássicas douradas */}
              <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-[#C9A227]/60" />
              <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-[#C9A227]/60" />
              <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#C9A227]/60" />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#C9A227]/60" />

              <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#1A1710] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#DCBF6F]">
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                    Moura e Medeiros Advogados Associados
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight text-[#FAF3E8]">
                    A banca jurídica dedicada à segurança de quem{' '}
                    <span className="italic font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FAF3E8] via-[#DCBF6F] to-[#C9A227]">
                      alimenta o país e move o mundo.
                    </span>
                  </h3>

                  <p className="mt-6 font-sans text-base sm:text-lg leading-relaxed text-[#C4BBAE]">
                    Unimos profundo conhecimento prático da cadeia agropecuária — de lavouras e
                    cooperativas a tradings e agroindústrias — com a excelência técnica na Reforma
                    Tributária (LC 214/2025), proteção patrimonial sucessória e contratos agrários
                    de alto valor.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/calculadora"
                      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] shadow-[0_4px_20px_rgba(201,162,39,0.3)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(201,162,39,0.5)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                    >
                      <Calculator size={16} />
                      <span>Simulador Tributário LC 214/2025</span>
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      to="/temas"
                      className="group inline-flex items-center gap-2 rounded border border-[#C9A227]/40 bg-[#161512] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#E8DFD0] transition-all duration-200 hover:border-[#C9A227] hover:bg-[#201D16] hover:text-[#DCBF6F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                    >
                      <Leaf size={16} className="text-[#DCBF6F]" />
                      <span>Conhecer Nossos Temas</span>
                    </Link>
                  </div>
                </div>

                {/* Card Lateral: Indicadores de Prestígio Agro */}
                <div className="rounded-xl border border-[#C9A227]/25 bg-gradient-to-b from-[#181611] to-[#0D0D0C] p-6 sm:p-7 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                        Posicionamento Estratégico
                      </p>
                      <h4 className="mt-1 font-serif text-xl font-semibold text-[#FAF3E8]">
                        Advocacia do Agronegócio
                      </h4>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#211E16] text-[#DCBF6F]">
                      <Award size={20} />
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-[#22211C] pb-2.5">
                      <dt className="text-[#9E9585]">Foco Setorial</dt>
                      <dd className="font-semibold text-right text-[#FAF3E8]">
                        Produtores, Cooperativas &amp; Agroindústrias
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#22211C] pb-2.5">
                      <dt className="text-[#9E9585]">Reforma Tributária</dt>
                      <dd className="font-semibold text-right text-[#DCBF6F]">
                        Modelo CBS/IBS 2025–2033
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#22211C] pb-2.5">
                      <dt className="text-[#9E9585]">Abrangência</dt>
                      <dd className="font-semibold text-right text-[#FAF3E8]">
                        Contratos, CPR, Sucessão e Crédito
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <dt className="text-[#9E9585]">Atendimento</dt>
                      <dd className="font-mono text-right text-[11px] font-medium text-[#DCBF6F]">
                        Nacional · Presencial &amp; Digital
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-[11px] leading-relaxed text-[#DCBF6F]/90">
                    Atuação focada na rentabilidade, segurança da propriedade e mitigação de riscos
                    fiscais do campo.
                  </div>
                </div>
              </div>

              {/* 3 Pilares do Agro Moura e Medeiros */}
              <div className="mt-12 pt-10 border-t border-[#C9A227]/20 grid gap-6 sm:grid-cols-3">
                {diferenciais.map(({ icon: Icon, titulo, descricao }) => (
                  <div
                    key={titulo}
                    className="rounded-lg border border-[#C9A227]/20 bg-[#100F0D]/70 p-5 transition-all duration-300 hover:border-[#C9A227]/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-[#C9A227]/30 bg-[#1B1913] text-[#DCBF6F] mb-3.5">
                      <Icon size={20} />
                    </div>
                    <h5 className="font-serif text-lg font-semibold text-[#FAF3E8]">{titulo}</h5>
                    <p className="mt-2 text-xs leading-relaxed text-[#A39985]">{descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicador de continuação da leitura */}
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
                Nossos Pilares &amp; Estrutura do Portal
              </span>
              <ChevronDown className="mt-1 h-4 w-4 text-[#C9A227] animate-bounce" />
            </div>
          </div>
        </ScrollExpandMedia>
      </section>

      {/* Grid das 4 Seções Funcionais com Acabamento Jurídico Nobre e Numerais Romanos */}
      <section
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="areas-title"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
            <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
            Estrutura &amp; Soluções Agrojur
          </div>
          <h2
            id="areas-title"
            className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-4xl lg:text-5xl"
          >
            Caminhos preparados para a segurança do seu patrimônio
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#B8AF9F]">
            Conheça as quatro frentes centrais da banca. Cada área é uma rota funcional com conteúdo
            especializado, ferramentas de cálculo e orientações para o ecossistema agro.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {areas.map(({ to, label, title, description, details, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-xl border border-[#C9A227]/25 bg-gradient-to-b from-[#141414] to-[#0D0D0D] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.7),0_0_24px_rgba(201,162,39,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              {/* Numeral romano com destaque no canto superior */}
              <span className="absolute top-6 right-6 font-serif text-base font-bold tracking-widest text-[#C9A227]/50 group-hover:text-[#DCBF6F] transition-colors">
                {['I', 'II', 'III', 'IV'][index]}
              </span>

              <div className="flex items-start justify-between gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded border border-[#C9A227]/35 bg-gradient-to-br from-[#1E1B13] to-[#111111] text-[#DCBF6F] shadow-[inset_0_1px_1px_rgba(201,162,39,0.25)] transition-colors group-hover:border-[#C9A227] group-hover:text-[#FAF3E8]">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <ArrowRight
                  className="mt-2 text-[#7A7366] transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-[#DCBF6F]"
                  size={18}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                {label}
              </p>
              <h3 className="mt-2 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#FAF3E8] group-hover:text-[#DCBF6F] transition-colors">
                {title}
              </h3>
              <p className="mt-3 font-sans text-xs sm:text-sm leading-relaxed text-[#A39985]">
                {description}
              </p>

              {details && (
                <div className="mt-4 rounded bg-[#100F0D] border border-[#C9A227]/15 p-2.5 text-[11px] text-[#C4BBAE]">
                  <span className="font-semibold text-[#DCBF6F]">Destaque: </span>
                  {details}
                </div>
              )}

              {/* Linha de acabamento dourada no rodapé do card que se expande no hover */}
              <div className="mt-6 h-px w-full bg-[#C9A227]/15 transition-colors group-hover:bg-[#C9A227]/50" />
            </Link>
          ))}
        </div>
      </section>

      {/* Banner Institucional Final de Atendimento e Consulta */}
      <section
        className="relative border-t border-[#C9A227]/20 bg-[#070707]"
        aria-labelledby="next-title"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative rounded-2xl border border-[#C9A227]/30 bg-gradient-to-r from-[#12110D] via-[#171510] to-[#12110D] p-8 sm:p-12 shadow-2xl">
            <div className="gold-divider mb-8" />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
                  Moura e Medeiros Advogados Associados
                </p>
                <h2
                  id="next-title"
                  className="mt-3 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#FAF3E8]"
                >
                  Inteligência jurídica para a longevidade da sua produção rural.
                </h2>
                <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#B8AF9F]">
                  Seja na estruturação da safra, na defesa de autuações fiscais, na blindagem
                  societária familiar ou na simulação do impacto da LC 214/2025, nossa equipe está
                  pronta para assessorar sua operação.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:min-w-[240px]">
                <Link
                  to="/calculadora"
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] to-[#DCBF6F] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#0A0A0A] shadow-[0_4px_20px_rgba(201,162,39,0.3)] transition-all hover:brightness-110"
                >
                  <TrendingUp size={16} />
                  <span>Acessar Calculadora</span>
                </Link>
                <Link
                  to="/diagnostico"
                  className="inline-flex items-center justify-center gap-2 rounded border border-[#C9A227]/40 bg-[#161512] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#FAF3E8] transition-all hover:border-[#C9A227] hover:text-[#DCBF6F]"
                >
                  <ClipboardCheck size={16} />
                  <span>Iniciar Diagnóstico</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
