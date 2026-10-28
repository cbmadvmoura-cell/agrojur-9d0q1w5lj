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

const AGRO_MEDIA = {
  image: {
    src: 'https://img.usecurling.com/p/1600/900?q=agriculture%20field&color=green',
    poster: undefined,
    background: 'https://img.usecurling.com/p/1920/1080?q=wheat%20field%20sunrise&color=green',
    title: 'Advocacia de Precisão para o Agronegócio',
    subtitle: 'Moura e Medeiros Advogados Associados · Tradição & Inteligência Jurídica',
    scrollToExpand: 'Role para revelar o escritório',
  },
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster: 'https://img.usecurling.com/p/1280/720?q=agriculture%20harvest&color=green',
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
    <div className="bg-[#F8FAF8] text-[#15271E]">
      {/* HERO EXPANSIVO COM SCROLLEXPANDMEDIA NA PALETA AGRO */}
      <section className="relative w-full">
        {/* Alternador de visualização Imagem / Vídeo */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/90 p-1 backdrop-blur-md shadow-sm text-[11px]">
          <button
            type="button"
            onClick={() => setMediaType('image')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-200 ${
              mediaType === 'image'
                ? 'bg-[#1E4331] text-white shadow-sm'
                : 'text-[#425A4E] hover:text-[#15271E]'
            }`}
          >
            Fotografia Agro
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`px-3 py-1 rounded-full font-semibold transition-all duration-200 ${
              mediaType === 'video'
                ? 'bg-[#1E4331] text-white shadow-sm'
                : 'text-[#425A4E] hover:text-[#15271E]'
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
            {/* Bloco Institucional do Escritório Moura e Medeiros: Cartão Branco Limpo com Acentos Floresta/Terra */}
            <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-8 sm:p-12 lg:p-14 shadow-[0_12px_36px_rgba(30,67,49,0.06)]">
              {/* Detalhes de cantoneiras clássicas em marrom terroso */}
              <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-[#784D34]" />
              <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-[#784D34]" />
              <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#784D34]" />
              <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#784D34]" />

              <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E2EBE5] bg-[#F4F7F4] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#1E4331]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#784D34]" />
                    Moura e Medeiros Advogados Associados
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-tight text-[#15271E]">
                    A banca jurídica dedicada à segurança de quem{' '}
                    <span className="italic font-serif font-semibold text-[#1E4331]">
                      alimenta o país e move o mundo.
                    </span>
                  </h3>

                  <p className="mt-6 font-sans text-base sm:text-lg leading-relaxed text-[#425A4E]">
                    Unimos profundo conhecimento prático da cadeia agropecuária — de lavouras e
                    cooperativas a tradings e agroindústrias — com a excelência técnica na Reforma
                    Tributária (LC 214/2025), proteção patrimonial sucessória e contratos agrários
                    de alto valor.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      to="/calculadora"
                      className="group relative inline-flex items-center gap-2.5 rounded-lg border border-[#1E4331] bg-[#1E4331] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-[#15271E] hover:shadow-[0_6px_20px_rgba(30,67,49,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
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
                      className="group inline-flex items-center gap-2 rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#1E4331] transition-all duration-200 hover:border-[#1E4331] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
                    >
                      <Leaf size={16} className="text-[#1E4331]" />
                      <span>Conhecer Nossos Temas</span>
                    </Link>
                  </div>
                </div>

                {/* Card Lateral: Indicadores de Prestígio Agro */}
                <div className="rounded-xl border border-[#E2EBE5] bg-[#F4F7F4] p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                        Posicionamento Estratégico
                      </p>
                      <h4 className="mt-1 font-serif text-xl font-semibold text-[#15271E]">
                        Advocacia do Agronegócio
                      </h4>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2EBE5] bg-white text-[#1E4331]">
                      <Award size={20} />
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3.5 text-xs">
                    <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-2.5">
                      <dt className="text-[#5A7567]">Foco Setorial</dt>
                      <dd className="font-semibold text-right text-[#15271E]">
                        Produtores, Cooperativas &amp; Agroindústrias
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-2.5">
                      <dt className="text-[#5A7567]">Reforma Tributária</dt>
                      <dd className="font-semibold text-right text-[#1E4331]">
                        Modelo CBS/IBS 2025–2033
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-2.5">
                      <dt className="text-[#5A7567]">Abrangência</dt>
                      <dd className="font-semibold text-right text-[#15271E]">
                        Contratos, CPR, Sucessão e Crédito
                      </dd>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <dt className="text-[#5A7567]">Atendimento</dt>
                      <dd className="font-mono text-right text-[11px] font-medium text-[#784D34]">
                        Nacional · Presencial &amp; Digital
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 rounded-lg border border-[#E2EBE5] bg-white p-3 text-[11px] leading-relaxed text-[#2E694D]">
                    Atuação focada na rentabilidade, segurança da propriedade e mitigação de riscos
                    fiscais do campo.
                  </div>
                </div>
              </div>

              {/* 3 Pilares do Agro Moura e Medeiros */}
              <div className="mt-12 pt-10 border-t border-[#E2EBE5] grid gap-6 sm:grid-cols-3">
                {diferenciais.map(({ icon: Icon, titulo, descricao }) => (
                  <div
                    key={titulo}
                    className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-5 transition-all duration-300 hover:border-[#1E4331]/40 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2EBE5] bg-white text-[#1E4331] mb-3.5 shadow-sm">
                      <Icon size={20} />
                    </div>
                    <h5 className="font-serif text-lg font-semibold text-[#15271E]">{titulo}</h5>
                    <p className="mt-2 text-xs leading-relaxed text-[#5A7567]">{descricao}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicador de continuação da leitura */}
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#523422]">
                Nossos Pilares &amp; Estrutura do Portal
              </span>
              <ChevronDown className="mt-1 h-4 w-4 text-[#1E4331] animate-bounce" />
            </div>
          </div>
        </ScrollExpandMedia>
      </section>

      {/* Grid das 4 Seções Funcionais com Numerais Romanos na Paleta Agro */}
      <section
        className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="areas-title"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#784D34]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E4331]" />
            Estrutura &amp; Soluções Agrojur
          </div>
          <h2
            id="areas-title"
            className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#15271E] sm:text-4xl lg:text-5xl"
          >
            Caminhos preparados para a segurança do seu patrimônio
          </h2>
          <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#425A4E]">
            Conheça as quatro frentes centrais da banca. Cada área é uma rota funcional com conteúdo
            especializado, ferramentas de cálculo e orientações para o ecossistema agro.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {areas.map(({ to, label, title, description, details, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              className="group relative rounded-xl border border-[#E2EBE5] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1E4331]/40 hover:shadow-[0_16px_32px_rgba(30,67,49,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
            >
              {/* Numeral romano elegante */}
              <span className="absolute top-6 right-6 font-serif text-base font-bold tracking-widest text-[#CBB29E] group-hover:text-[#784D34] transition-colors">
                {['I', 'II', 'III', 'IV'][index]}
              </span>

              <div className="flex items-start justify-between gap-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] text-[#1E4331] shadow-sm transition-colors group-hover:bg-[#1E4331] group-hover:text-white">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <ArrowRight
                  className="mt-2 text-[#689F82] transition-all duration-200 group-hover:translate-x-1.5 group-hover:text-[#1E4331]"
                  size={18}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                {label}
              </p>
              <h3 className="mt-2 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#15271E] group-hover:text-[#1E4331] transition-colors">
                {title}
              </h3>
              <p className="mt-3 font-sans text-xs sm:text-sm leading-relaxed text-[#5A7567]">
                {description}
              </p>

              {details && (
                <div className="mt-4 rounded-lg bg-[#F8FAF8] border border-[#E2EBE5] p-3 text-[11px] text-[#2F4238]">
                  <span className="font-semibold text-[#1E4331]">Destaque: </span>
                  {details}
                </div>
              )}

              {/* Linha sutil de acabamento no rodapé do card */}
              <div className="mt-6 h-px w-full bg-[#E2EBE5] transition-colors group-hover:bg-[#1E4331]/30" />
            </Link>
          ))}
        </div>
      </section>

      {/* Banner Institucional Final de Atendimento e Consulta */}
      <section
        className="relative border-t border-[#E2EBE5] bg-[#F4F7F4]"
        aria-labelledby="next-title"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-8 sm:p-12 shadow-md">
            <div className="agro-divider mb-8" />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#784D34]">
                  Moura e Medeiros Advogados Associados
                </p>
                <h2
                  id="next-title"
                  className="mt-3 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#15271E]"
                >
                  Inteligência jurídica para a longevidade da sua produção rural.
                </h2>
                <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-[#425A4E]">
                  Seja na estruturação da safra, na defesa de autuações fiscais, na blindagem
                  societária familiar ou na simulação do impacto da LC 214/2025, nossa equipe está
                  pronta para assessorar sua operação.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:min-w-[240px]">
                <Link
                  to="/calculadora"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1E4331] bg-[#1E4331] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#15271E] hover:shadow-md"
                >
                  <TrendingUp size={16} />
                  <span>Acessar Calculadora</span>
                </Link>
                <Link
                  to="/diagnostico"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#1E4331] transition-all hover:border-[#1E4331] hover:bg-white"
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
