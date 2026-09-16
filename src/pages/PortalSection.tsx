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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-emerald-800 transition hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4"
      >
        <ArrowLeft size={17} aria-hidden="true" /> Voltar ao início
      </Link>

      <header className="mt-10 max-w-3xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
          <Icon size={24} aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
          {content.eyebrow} · preview controlado
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{content.intro}</p>
      </header>

      <div
        className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"
        role="note"
      >
        <strong className="font-black">Conteúdo demonstrativo:</strong> {content.note}
      </div>

      <section
        className="mt-10 grid gap-5 md:grid-cols-3"
        aria-label={`Itens demonstrativos de ${content.eyebrow}`}
      >
        {content.cards.map((card) => (
          <article
            key={card.title}
            className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              {card.status}
            </span>
            <h2 className="mt-4 text-xl font-black text-slate-950">{card.title}</h2>
            <p className="mt-3 flex-1 leading-7 text-slate-600">{card.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500">
              Ver estrutura <ArrowRight size={16} aria-hidden="true" />
            </span>
          </article>
        ))}
      </section>

      <div className="mt-12 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-300">
          Limite desta fase
        </p>
        <p className="mt-3 max-w-3xl leading-7 text-slate-300">
          Esta rota existe para validar a jornada pública e a linguagem do shell. Autenticação,
          modelo editorial, revisão, publicação, coleta de dados e integrações serão tratados
          somente em tarefas autorizadas próprias.
        </p>
      </div>
    </div>
  )
}
