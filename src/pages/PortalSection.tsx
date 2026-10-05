import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

type SectionKey = 'temas' | 'blog' | 'diagnostico' | 'calculadora'

type SectionContent = {
  eyebrow: string
  title: string
  intro: string
  note: string
  icon: typeof ShieldCheck
  cards: { title: string; description: string; status: string }[]
}

const sections: Record<SectionKey, SectionContent> = {
  temas: {
    eyebrow: 'Temas',
    title: 'Conhecimento organizado para uma navegação clara.',
    intro:
      'Esta área demonstra como os temas poderão ser apresentados ao visitante, sem publicar conteúdo jurídico real nesta fase.',
    note: 'Os cartões abaixo são fixtures sintéticas e servem apenas para validar a estrutura do portal.',
    icon: ShieldCheck,
    cards: [
      {
        title: 'Planejamento demonstrativo',
        description: 'Trilha fictícia para testar agrupamento de conteúdos e próximos passos.',
        status: 'Estrutura em preparação',
      },
      {
        title: 'Gestão demonstrativa',
        description:
          'Exemplo de organização temática com linguagem simples e navegação progressiva.',
        status: 'Fixture sintética',
      },
      {
        title: 'Conformidade demonstrativa',
        description: 'Espaço reservado para conteúdos revisados em uma etapa posterior.',
        status: 'Ainda não publicado',
      },
    ],
  },
  blog: {
    eyebrow: 'Blog',
    title: 'Conteúdo em preparação, com responsabilidade editorial.',
    intro:
      'O blog demonstrativo apresenta o caminho visual de uma pauta antes que qualquer material real seja revisado e publicado.',
    note: 'Nenhuma publicação desta tela constitui orientação jurídica ou representa conteúdo aprovado.',
    icon: CheckCircle2,
    cards: [
      {
        title: 'Como funciona uma pauta',
        description: 'Fixture para representar título, resumo, fonte e etapa de revisão.',
        status: 'Rascunho sintético',
      },
      {
        title: 'Leitura guiada demonstrativa',
        description: 'Exemplo de conteúdo curto para validar legibilidade e navegação.',
        status: 'Aguardando revisão',
      },
      {
        title: 'Perguntas frequentes — exemplo',
        description: 'Estrutura reservada para respostas que passarão por governança editorial.',
        status: 'Não publicado',
      },
    ],
  },
  diagnostico: {
    eyebrow: 'Diagnóstico',
    title: 'Uma jornada preparada para receber o visitante.',
    intro:
      'Esta etapa mostra o espaço destinado ao diagnóstico, mas não coleta, envia ou armazena dados pessoais.',
    note: 'A coleta real depende de política de dados aprovada e de uma task específica. Nenhum dado deve ser inserido aqui.',
    icon: LockKeyhole,
    cards: [
      {
        title: 'Entrada orientativa',
        description: 'Exemplo de uma primeira etapa sem campos de identificação ou envio.',
        status: 'Somente demonstração',
      },
      {
        title: 'Contexto do visitante',
        description: 'Área reservada para uma futura decisão de produto e privacidade.',
        status: 'Coleta desativada',
      },
      {
        title: 'Confirmação segura',
        description: 'Estado visual para futura confirmação, ainda sem integração.',
        status: 'Fora do recorte atual',
      },
    ],
  },
  calculadora: {
    eyebrow: 'Calculadora',
    title: 'Ferramentas úteis começam com limites claros.',
    intro:
      'Esta rota reserva espaço para uma futura calculadora, sem executar fórmulas, estimativas ou recomendações reais.',
    note: 'Não há resultado produtivo nesta tela. Qualquer fórmula dependerá de especificação e validação próprias.',
    icon: ShieldCheck,
    cards: [
      {
        title: 'Entrada de exemplo',
        description:
          'Componente visual reservado para dados que serão definidos em uma próxima especificação.',
        status: 'Sem cálculo',
      },
      {
        title: 'Resultado demonstrativo',
        description: 'Área estrutural sem valores, promessa ou recomendação de natureza jurídica.',
        status: 'Não operacional',
      },
      {
        title: 'Orientação de uso',
        description: 'Espaço para explicar limites, fontes e responsabilidades da ferramenta.',
        status: 'Em planejamento',
      },
    ],
  },
}

export default function PortalSection({ section }: { section: SectionKey }) {
  const content = sections[section]
  const Icon = content.icon

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <Link
        to="/"
        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9A227] transition hover:text-[#FAF3E8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227]"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-1"
          aria-hidden="true"
        />
        <span>Voltar ao início</span>
      </Link>

      <header className="mt-8 max-w-3xl">
        <div className="flex h-12 w-12 items-center justify-center rounded border border-[#C9A227]/40 bg-gradient-to-br from-[#1E1B13] to-[#111111] text-[#DCBF6F] shadow-[inset_0_1px_1px_rgba(201,162,39,0.3)]">
          <Icon size={24} aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
          {content.eyebrow} · preview controlado
        </p>
        <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-5 font-sans text-base leading-relaxed text-[#B8AF9F]">{content.intro}</p>
      </header>

      {/* Nota Jurídica Nobre */}
      <div
        className="mt-8 rounded-lg border border-[#C9A227]/30 bg-[#16140E] p-5 text-xs leading-relaxed text-[#DCBF6F]"
        role="note"
      >
        <span className="font-bold uppercase tracking-wider text-[#FAF3E8]">
          Conteúdo demonstrativo:
        </span>{' '}
        {content.note}
      </div>

      <section
        className="mt-10 grid gap-6 md:grid-cols-3"
        aria-label={`Itens demonstrativos de ${content.eyebrow}`}
      >
        {content.cards.map((card, idx) => (
          <article
            key={card.title}
            className="group relative flex min-h-60 flex-col rounded-lg border border-[#C9A227]/25 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm transition-all duration-300 hover:border-[#C9A227]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_15px_rgba(201,162,39,0.12)]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded border border-[#C9A227]/30 bg-[#1A1812] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#DCBF6F]">
                {card.status}
              </span>
              <span className="font-serif text-xs text-[#C9A227]/40">§ 0{idx + 1}</span>
            </div>

            <h2 className="mt-4 font-serif text-xl font-semibold tracking-tight text-[#FAF3E8] group-hover:text-[#DCBF6F]">
              {card.title}
            </h2>
            <p className="mt-3 flex-1 font-sans text-xs leading-relaxed text-[#A39985]">
              {card.description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#C9A227] transition-all group-hover:text-[#FAF3E8]">
              Ver estrutura{' '}
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </article>
        ))}
      </section>

      {/* Limite desta fase */}
      <div className="mt-12 rounded-lg border border-[#C9A227]/25 bg-gradient-to-r from-[#12110D] via-[#161510] to-[#12110D] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
          Limite desta fase
        </p>
        <p className="mt-3 max-w-3xl font-sans text-xs leading-relaxed text-[#B8AF9F]">
          Esta rota existe para validar a jornada pública e a linguagem do shell. Autenticação,
          modelo editorial, revisão, publicação, coleta de dados e integrações serão tratados
          somente em tarefas autorizadas próprias.
        </p>
      </div>
    </div>
  )
}
