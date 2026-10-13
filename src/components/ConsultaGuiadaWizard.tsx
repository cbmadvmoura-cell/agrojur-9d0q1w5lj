import React, { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Wheat,
  Beef,
  FlaskConical,
  Tractor,
  Building2,
  ShieldCheck,
  TrendingDown,
  Info,
  SlidersHorizontal,
} from 'lucide-react'
import {
  SetorPresetKey,
  RegimeTributario,
  SETORES_PRESETS,
  formatarBRL,
} from '@/lib/tributario-engine'

export interface ConsultaGuiadaValores {
  setorKey: SetorPresetKey
  receitaBruta: number
  comprasInsumos: number
  regime: RegimeTributario
  redutorCbsIbs: number
  temCreditoPresumidoAgro: boolean
  aliquotaCreditoPresumido: number
  aproveitamentoCreditoNovo: number
}

interface ConsultaGuiadaProps {
  valoresIniciais: ConsultaGuiadaValores
  onAplicarResultados: (novosValores: ConsultaGuiadaValores) => void
  onAlternarModoTecnico: () => void
}

const ETAPAS = [
  { id: 1, romano: 'I', titulo: 'Atividade' },
  { id: 2, romano: 'II', titulo: 'Faturamento' },
  { id: 3, romano: 'III', titulo: 'Insumos' },
  { id: 4, romano: 'IV', titulo: 'Regime' },
  { id: 5, romano: 'V', titulo: 'Benefícios' },
  { id: 6, romano: 'VI', titulo: 'Conclusão' },
]

const SETORES_OPCOES: {
  key: SetorPresetKey
  titulo: string
  subtitulo: string
  descricaoAmigavel: string
  icone: React.ComponentType<{ size?: number; className?: string }>
  badge: string
}[] = [
  {
    key: 'soja_graos',
    titulo: 'Produção de Grãos (Soja, Milho, Trigo)',
    subtitulo: 'Produtor agrícola ou cerealista',
    descricaoAmigavel:
      'Para produtores e fazendas de grãos. Aplica o desconto de 60% previsto na Lei da Reforma e o crédito presumido de aquisições rurais.',
    icone: Wheat,
    badge: 'Redução 60% LC 214',
  },
  {
    key: 'pecuaria',
    titulo: 'Pecuária de Corte e Leite',
    subtitulo: 'Cria, recria, engorda e laticínios',
    descricaoAmigavel:
      'Para pecuaristas e produtores de leite. Inclui o crédito rural especial para insumos e a desoneração de itens da cesta básica ampliada.',
    icone: Beef,
    badge: 'Redução 60% + Crédito',
  },
  {
    key: 'insumos_agro',
    titulo: 'Revenda de Insumos & Fertilizantes',
    subtitulo: 'Químicos, sementes, defensivos e adubos',
    descricaoAmigavel:
      'Para distribuidores e agrorevendas. Trata as alíquotas com base no art. 129 da LC 214/2025 e o Convênio 100.',
    icone: FlaskConical,
    badge: 'Art. 129 LC 214',
  },
  {
    key: 'agro_geral',
    titulo: 'Agroindústria & Agronegócio Geral',
    subtitulo: 'Transformação, cooperativas e armazenagem',
    descricaoAmigavel:
      'Para agroindústrias, beneficiamento e operações integradas da cadeia do campo com aproveitamento pleno de créditos de entrada.',
    icone: Tractor,
    badge: 'Cadeia Integrada',
  },
  {
    key: 'outros',
    titulo: 'Outro Ramo ou Comércio Geral',
    subtitulo: 'Empresas sem enquadramento agro específico',
    descricaoAmigavel:
      'Alíquotas padrão de referência (CBS + IBS geral estimadas em ~27,9%), sem redutor específico de 60% do agronegócio.',
    icone: Building2,
    badge: 'Regime de Referência',
  },
]

const REGIMES_OPCOES: {
  key: RegimeTributario
  titulo: string
  rotuloCurto: string
  descricaoAmigavel: string
  dica: string
}[] = [
  {
    key: 'lucro_real',
    titulo: 'Lucro Real (Não-cumulativo)',
    rotuloCurto: 'Lucro Real',
    descricaoAmigavel:
      'Comum em médias e grandes fazendas, agroindústrias ou empresas com faturamento acima de R$ 78 mi/ano. A empresa deduz créditos sobre as compras.',
    dica: 'PIS 1,65% e COFINS 7,6% hoje. Com a reforma, terá créditos integrais de IVA sobre todas as despesas.',
  },
  {
    key: 'lucro_presumido',
    titulo: 'Lucro Presumido (Cumulativo)',
    rotuloCurto: 'Presumido',
    descricaoAmigavel:
      'Tributação calculada sobre uma margem pré-fixada da receita. Não aproveita créditos de compras no PIS/COFINS atual.',
    dica: 'PIS 0,65% e COFINS 3% hoje. Poderá sentir migração relevante com a entrada da não-cumulatividade plena.',
  },
  {
    key: 'simples_nacional',
    titulo: 'Simples Nacional (Guia Única DAS)',
    rotuloCurto: 'Simples',
    descricaoAmigavel:
      'Para micro e pequenas empresas (faturamento até R$ 4,8 milhões/ano). Todos os impostos recolhidos em uma só guia mensal.',
    dica: 'O Simples tem regime facultativo mantido pela EC 132/2023, com regras de transição próprias.',
  },
]

// Utilitário para formatar digitação de moeda em tempo real
function formatarMoedaAoDigitar(valor: number): string {
  if (valor === 0) return '0,00'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

function parseMoedaString(str: string): number {
  const digits = str.replace(/\D/g, '')
  if (!digits) return 0
  return Number(digits) / 100
}

export function ConsultaGuiadaWizard({
  valoresIniciais,
  onAplicarResultados,
  onAlternarModoTecnico,
}: ConsultaGuiadaProps) {
  const [passo, setPasso] = useState<number>(1)

  // Estados locais da entrevista
  const [setorKey, setSetorKey] = useState<SetorPresetKey>(valoresIniciais.setorKey)
  const [receitaBruta, setReceitaBruta] = useState<number>(valoresIniciais.receitaBruta)
  const [comprasInsumos, setComprasInsumos] = useState<number>(valoresIniciais.comprasInsumos)
  const [regime, setRegime] = useState<RegimeTributario>(valoresIniciais.regime)
  const [redutorCbsIbs, setRedutorCbsIbs] = useState<number>(valoresIniciais.redutorCbsIbs)
  const [temCreditoPresumidoAgro, setTemCreditoPresumidoAgro] = useState<boolean>(
    valoresIniciais.temCreditoPresumidoAgro,
  )
  const [aliquotaCreditoPresumido, setAliquotaCreditoPresumido] = useState<number>(
    valoresIniciais.aliquotaCreditoPresumido,
  )
  const [aproveitamentoCreditoNovo, setAproveitamentoCreditoNovo] = useState<number>(
    valoresIniciais.aproveitamentoCreditoNovo,
  )

  // Strings temporárias para digitação amigável
  const [receitaStr, setReceitaStr] = useState<string>(
    formatarMoedaAoDigitar(valoresIniciais.receitaBruta),
  )
  const [insumosStr, setInsumosStr] = useState<string>(
    formatarMoedaAoDigitar(valoresIniciais.comprasInsumos),
  )

  // Feedback de erro / validação
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)

  // Ao mudar setor, atualiza presets recomendados da lei
  const handleSelectSetor = (chave: SetorPresetKey) => {
    setSetorKey(chave)
    const preset = SETORES_PRESETS[chave]
    setRedutorCbsIbs(preset.redutorCbsIbs)
    setTemCreditoPresumidoAgro(preset.creditoPresumidoAgro)
    setAliquotaCreditoPresumido(preset.percentualCreditoPresumido)
    setAproveitamentoCreditoNovo(preset.aproveitamentoCreditoPadrao)

    // Se insumos não foram alterados ou estão zerados, estimar % padrão do setor
    if (receitaBruta > 0 && comprasInsumos === 0) {
      const estimativa = Math.round((receitaBruta * preset.baseInsumosPercentual) / 100)
      setComprasInsumos(estimativa)
      setInsumosStr(formatarMoedaAoDigitar(estimativa))
    }
  }

  // Navegação
  const avancar = () => {
    setErroValidacao(null)
    if (passo === 2) {
      if (receitaBruta <= 0) {
        setErroValidacao(
          'Informe o faturamento anual do cliente para prosseguirmos com a estimativa.',
        )
        return
      }
    }
    if (passo === 3) {
      if (comprasInsumos > receitaBruta) {
        setErroValidacao(
          'O total de compras não deve ultrapassar o faturamento total do exercício.',
        )
        return
      }
    }
    setPasso((p) => Math.min(ETAPAS.length, p + 1))
  }

  const voltar = () => {
    setErroValidacao(null)
    setPasso((p) => Math.max(1, p - 1))
  }

  const reiniciar = () => {
    setErroValidacao(null)
    setPasso(1)
  }

  const restaurarPadroesDaLei = () => {
    const p = SETORES_PRESETS[setorKey]
    setRedutorCbsIbs(p.redutorCbsIbs)
    setTemCreditoPresumidoAgro(p.creditoPresumidoAgro)
    setAliquotaCreditoPresumido(p.percentualCreditoPresumido)
    setAproveitamentoCreditoNovo(p.aproveitamentoCreditoPadrao)
  }

  const concluirConsulta = () => {
    onAplicarResultados({
      setorKey,
      receitaBruta,
      comprasInsumos,
      regime,
      redutorCbsIbs,
      temCreditoPresumidoAgro,
      aliquotaCreditoPresumido,
      aproveitamentoCreditoNovo,
    })
  }

  // Atalhos de faturamento agro rápido
  const atalhosFaturamento = [
    { label: 'R$ 5 Mi (Pequeno Porte)', valor: 5000000 },
    { label: 'R$ 15 Mi (Médio Produtor)', valor: 15000000 },
    { label: 'R$ 30 Mi (Grande Porte)', valor: 30000000 },
    { label: 'R$ 80 Mi (Corporativo / Agroindústria)', valor: 80000000 },
  ]

  return (
    <div className="relative rounded-lg border border-[#C9A227]/40 bg-gradient-to-b from-[#14130F] via-[#0E0E0E] to-[#0A0A0A] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* Cantoneiras douradas clássicas no container do wizard */}
      <div className="pointer-events-none absolute top-2 left-2 h-3.5 w-3.5 border-t border-l border-[#C9A227]" />
      <div className="pointer-events-none absolute top-2 right-2 h-3.5 w-3.5 border-t border-r border-[#C9A227]" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b border-l border-[#C9A227]" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 border-b border-r border-[#C9A227]" />

      {/* BARRA SUPERIOR: Identificação de Entrevista e Progresso Romano */}
      <div className="flex flex-col gap-4 border-b border-[#C9A227]/20 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
            <Sparkles size={14} className="text-[#DCBF6F]" />
            <span>Atendimento ao Cliente · Entrevista Guiada</span>
          </div>
          <h2 className="mt-1 font-serif text-xl font-medium tracking-tight text-[#FAF3E8] sm:text-2xl">
            Levantamento Inicial de Dados Tributários
          </h2>
          <p className="mt-1 text-xs text-[#9E9585]">
            Responda às questões com o cliente. O sistema converterá as respostas nos parâmetros da
            LC 214/2025.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={reiniciar}
            title="Reiniciar entrevista do início"
            className="inline-flex items-center gap-1.5 rounded border border-[#C9A227]/30 bg-[#12110D] px-2.5 py-1.5 text-xs text-[#B8AF9F] hover:border-[#C9A227] hover:text-[#FAF3E8] transition-colors"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={onAlternarModoTecnico}
            title="Ir diretamente para o formulário técnico com sliders e alíquotas"
            className="inline-flex items-center gap-1.5 rounded border border-[#C9A227]/30 bg-[#17150F] px-3 py-1.5 text-xs font-semibold text-[#DCBF6F] hover:bg-[#201D14] hover:text-[#FAF3E8] transition-colors"
          >
            <SlidersHorizontal size={13} />
            <span>Modo Técnico</span>
          </button>
        </div>
      </div>

      {/* REGUA DE PROGRESSO COM NUMERAIS ROMANOS (I, II, III, IV, V, VI) */}
      <div className="mt-6 border-b border-[#252525] pb-6">
        <div className="flex items-center justify-between">
          {ETAPAS.map((etapa, idx) => {
            const isAtivo = passo === etapa.id
            const isPassado = passo > etapa.id
            return (
              <React.Fragment key={etapa.id}>
                <button
                  type="button"
                  onClick={() => {
                    // Permitir retornar a passos anteriores clicando no número
                    if (etapa.id < passo) {
                      setErroValidacao(null)
                      setPasso(etapa.id)
                    }
                  }}
                  disabled={etapa.id > passo}
                  className={`group flex flex-col items-center gap-1.5 focus:outline-none transition-all ${
                    etapa.id <= passo ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-serif text-xs font-bold transition-all duration-200 ${
                      isAtivo
                        ? 'border-2 border-[#DCBF6F] bg-[#221C0E] text-[#DCBF6F] shadow-[0_0_15px_rgba(201,162,39,0.4)] scale-110'
                        : isPassado
                          ? 'border border-[#C9A227]/60 bg-[#181610] text-[#FAF3E8]'
                          : 'border border-[#333] bg-[#0E0E0E] text-[#666]'
                    }`}
                  >
                    {isPassado ? (
                      <CheckCircle2 size={15} className="text-[#DCBF6F]" />
                    ) : (
                      etapa.romano
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-sans hidden sm:block ${
                      isAtivo
                        ? 'font-bold text-[#DCBF6F]'
                        : isPassado
                          ? 'text-[#B8AF9F]'
                          : 'text-[#555]'
                    }`}
                  >
                    {etapa.titulo}
                  </span>
                </button>

                {idx < ETAPAS.length - 1 && (
                  <div
                    className={`h-[1px] flex-1 mx-2 transition-colors ${
                      passo > etapa.id ? 'bg-[#C9A227]/70' : 'bg-[#222]'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* CORPO DO PASSO ATUAL */}
      <div className="py-6 min-h-[360px]">
        {/* MENSAGEM DE ERRO/VALIDAÇÃO SE HOUVER */}
        {erroValidacao && (
          <div className="mb-6 flex items-center gap-2 rounded border border-amber-600/40 bg-amber-950/20 p-3 text-xs text-amber-300 animate-fade-in">
            <Info size={16} className="shrink-0 text-amber-400" />
            <span>{erroValidacao}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO I — ATIVIDADE PRINCIPAL */}
        {/* ========================================================================= */}
        {passo === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo I · Identificação Operacional</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                Qual é a atividade principal do seu cliente no Agronegócio?
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                Selecione o segmento mais alinhado à operação do produtor ou empresa. Isso define
                automaticamente os benefícios da Lei Complementar nº 214/2025 (como a redução de 60%
                e alíquotas estaduais de ICMS).
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SETORES_OPCOES.map((opt) => {
                const Icone = opt.icone
                const isSelected = setorKey === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectSetor(opt.key)}
                    className={`group relative rounded-lg border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#DCBF6F] bg-gradient-to-b from-[#1C180E] to-[#14120B] shadow-[0_0_18px_rgba(201,162,39,0.25)] ring-1 ring-[#DCBF6F]'
                        : 'border-[#C9A227]/20 bg-[#101010] hover:border-[#C9A227]/50 hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected
                              ? 'border-[#DCBF6F] bg-[#292210] text-[#FAF3E8]'
                              : 'border-[#2D2A20] bg-[#151410] text-[#9E9585] group-hover:text-[#DCBF6F]'
                          }`}
                        >
                          <Icone size={20} />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-[#FAF3E8] group-hover:text-[#DCBF6F]">
                            {opt.titulo}
                          </h4>
                          <span className="block text-[11px] text-[#8E8779]">{opt.subtitulo}</span>
                        </div>
                      </div>

                      <span className="shrink-0 rounded bg-[#C9A227]/15 px-2 py-0.5 text-[10px] font-mono text-[#DCBF6F] border border-[#C9A227]/30">
                        {opt.badge}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-[#B8AF9F] border-t border-[#222] pt-2.5">
                      {opt.descricaoAmigavel}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-xs text-[#9E9585] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#C9A227] shrink-0" />
              <span>
                <strong>Dica Moura e Medeiros:</strong> Se o cliente tiver operação mista (ex: grãos
                + pecuária), escolha a atividade que representa mais de 50% do faturamento da
                empresa.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO II — FATURAMENTO ANUAL */}
        {/* ========================================================================= */}
        {passo === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo II · Volume de Receita Bruta</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                Quanto o cliente faturou no último exercício (ou estima faturar)?
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                Informe o valor total bruto das vendas da fazenda ou empresa nos últimos 12 meses,
                sem deduzir custos.
              </p>
            </div>

            {/* CAMPO DE DIGITAÇÃO MONETÁRIA DE DESTAQUE */}
            <div className="rounded-lg border border-[#C9A227]/40 bg-[#12110D] p-6 shadow-inner">
              <label
                htmlFor="input-receita"
                className="block text-xs font-semibold uppercase tracking-wider text-[#DCBF6F]"
              >
                Faturamento Bruto Anual (R$)
              </label>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl text-[#C9A227] sm:text-3xl">R$</span>
                <input
                  id="input-receita"
                  type="text"
                  inputMode="numeric"
                  value={receitaStr}
                  onChange={(e) => {
                    const parsed = parseMoedaString(e.target.value)
                    setReceitaBruta(parsed)
                    setReceitaStr(formatarMoedaAoDigitar(parsed))
                    // Ajustar compras proporcionalmente caso fiquem maiores que receita
                    if (comprasInsumos > parsed) {
                      const novoInsumo = Math.round(parsed * 0.6)
                      setComprasInsumos(novoInsumo)
                      setInsumosStr(formatarMoedaAoDigitar(novoInsumo))
                    }
                  }}
                  placeholder="0,00"
                  className="w-full bg-transparent font-mono text-2xl sm:text-4xl font-bold tracking-tight text-[#FAF3E8] focus:outline-none border-b border-[#C9A227]/40 pb-2 focus:border-[#C9A227]"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#8E8779]">
                <span>Valor reconhecido:</span>
                <span className="font-mono text-[#FAF3E8] font-semibold text-sm">
                  {formatarBRL(receitaBruta)}
                </span>
              </div>
            </div>

            {/* ATALHOS RÁPIDOS DE PORTE */}
            <div>
              <span className="text-xs text-[#A89E8D]">
                Ou clique em um patamar de porte comum do agro:
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {atalhosFaturamento.map((at) => (
                  <button
                    key={at.valor}
                    type="button"
                    onClick={() => {
                      setReceitaBruta(at.valor)
                      setReceitaStr(formatarMoedaAoDigitar(at.valor))
                      if (comprasInsumos === 0 || comprasInsumos > at.valor) {
                        const estimativa = Math.round(at.valor * 0.6)
                        setComprasInsumos(estimativa)
                        setInsumosStr(formatarMoedaAoDigitar(estimativa))
                      }
                    }}
                    className={`rounded border px-3 py-2 text-left text-xs transition-all ${
                      receitaBruta === at.valor
                        ? 'border-[#DCBF6F] bg-[#221C0E] text-[#DCBF6F] font-semibold'
                        : 'border-[#C9A227]/20 bg-[#101010] text-[#9E9585] hover:border-[#C9A227]/40 hover:text-[#FAF3E8]'
                    }`}
                  >
                    <span className="block font-mono font-bold text-[#FAF3E8]">
                      {formatarBRL(at.valor)}
                    </span>
                    <span className="block text-[10px] text-[#7A7366]">{at.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-xs text-[#9E9585] flex items-center gap-2">
              <Info size={16} className="text-[#C9A227] shrink-0" />
              <span>
                Essa quantia servirá de base para a tributação da CBS (Federal) e do IBS
                (Estadual/Municipal), substituindo PIS, COFINS e ICMS nas notas de saída.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO III — INSUMOS & DESPESAS */}
        {/* ========================================================================= */}
        {passo === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo III · Compras, Insumos e Créditos</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                Quanto o cliente gastou com insumos, compras e suprimentos?
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                Exemplos no agronegócio: fertilizantes, defensivos agrícolas, sementes, rações,
                combustível (óleo diesel), embalagens e energia elétrica rural.
              </p>
            </div>

            {/* CAMPO DE DIGITAÇÃO MONETÁRIA DE DESTAQUE */}
            <div className="rounded-lg border border-[#C9A227]/40 bg-[#12110D] p-6 shadow-inner">
              <label
                htmlFor="input-insumos"
                className="block text-xs font-semibold uppercase tracking-wider text-[#DCBF6F]"
              >
                Despesas Anuais com Insumos de Produção (R$)
              </label>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl text-[#C9A227] sm:text-3xl">R$</span>
                <input
                  id="input-insumos"
                  type="text"
                  inputMode="numeric"
                  value={insumosStr}
                  onChange={(e) => {
                    const parsed = parseMoedaString(e.target.value)
                    setComprasInsumos(parsed)
                    setInsumosStr(formatarMoedaAoDigitar(parsed))
                  }}
                  placeholder="0,00"
                  className="w-full bg-transparent font-mono text-2xl sm:text-4xl font-bold tracking-tight text-[#FAF3E8] focus:outline-none border-b border-[#C9A227]/40 pb-2 focus:border-[#C9A227]"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#8E8779]">
                <span>
                  Proporção sobre o faturamento:{' '}
                  <strong className="text-[#DCBF6F] font-mono">
                    {receitaBruta > 0 ? ((comprasInsumos / receitaBruta) * 100).toFixed(1) : 0}%
                  </strong>
                </span>
                <span className="font-mono text-[#FAF3E8] font-semibold text-sm">
                  {formatarBRL(comprasInsumos)}
                </span>
              </div>
            </div>

            {/* ATALHOS DE PERCENTUAL DO FATURAMENTO */}
            <div>
              <span className="text-xs text-[#A89E8D]">
                Ou estime com base em proporções típicas do campo:
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: '50% da Receita', pct: 0.5 },
                  { label: '60% (Padrão Grãos)', pct: 0.6 },
                  { label: '70% (Alta Tecnologia)', pct: 0.7 },
                  { label: '80% (Revenda/Insumos)', pct: 0.8 },
                ].map((item) => {
                  const valor = Math.round(receitaBruta * item.pct)
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setComprasInsumos(valor)
                        setInsumosStr(formatarMoedaAoDigitar(valor))
                      }}
                      className="rounded border border-[#C9A227]/20 bg-[#101010] p-2.5 text-left text-xs hover:border-[#C9A227]/50 hover:bg-[#141414] transition-all"
                    >
                      <span className="block font-mono font-bold text-[#DCBF6F]">{item.label}</span>
                      <span className="block text-[11px] text-[#FAF3E8] font-mono mt-0.5">
                        {formatarBRL(valor)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-xs text-[#9E9585] flex items-center gap-2">
              <TrendingDown size={16} className="text-emerald-400 shrink-0" />
              <span>
                <strong>Por que isso importa ao cliente?</strong> No novo modelo de IVA Dual, todas
                essas despesas geram créditos tributários que abatem diretamente o imposto a pagar
                na venda. Quanto mais insumos com nota, menor o desembolso final.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO IV — REGIME TRIBUTÁRIO ATUAL */}
        {/* ========================================================================= */}
        {passo === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo IV · Enquadramento Fiscal Atual</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                Qual é o regime tributário atual da empresa ou produtor?
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                Se o cliente não tiver certeza, o contador geralmente indica na Declaração Anual ou
                no recibo da DIRPJ/DEFIS.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {REGIMES_OPCOES.map((reg) => {
                const isSelected = regime === reg.key
                return (
                  <button
                    key={reg.key}
                    type="button"
                    onClick={() => setRegime(reg.key)}
                    className={`rounded-lg border p-4 text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#DCBF6F] bg-gradient-to-b from-[#1C180E] to-[#14120B] shadow-[0_0_15px_rgba(201,162,39,0.25)] ring-1 ring-[#DCBF6F]'
                        : 'border-[#C9A227]/20 bg-[#101010] hover:border-[#C9A227]/50 hover:bg-[#141414]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-bold text-[#FAF3E8]">
                          {reg.titulo}
                        </span>
                        {isSelected && (
                          <span className="flex h-2 w-2 rounded-full bg-[#DCBF6F] shadow-[0_0_8px_#DCBF6F]" />
                        )}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-[#B8AF9F]">
                        {reg.descricaoAmigavel}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-[#252525] pt-2.5 text-[11px] text-[#DCBF6F]/90 italic">
                      {reg.dica}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-xs text-[#9E9585] flex items-center gap-2">
              <Info size={16} className="text-[#C9A227] shrink-0" />
              <span>
                <strong>Importante:</strong> Esta informação serve para calcular o &quot;Baseline
                2025&quot; — quanto o cliente paga hoje no sistema antigo, para podermos comparar
                lado a lado com a Reforma Tributária.
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO V — BENEFÍCIOS & PARÂMETROS AVANÇADOS */}
        {/* ========================================================================= */}
        {passo === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo V · Benefícios Especiais da Lei</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                O cliente tem compras de produtores rurais pessoas físicas ou regimes especiais?
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                A Reforma Tributária trouxe mecanismos protetivos específicos para o agronegócio.
                Mantivemos os valores recomendados pela lei pré-selecionados para você.
              </p>
            </div>

            <div className="space-y-4">
              {/* Card de Redutor da LC 214 */}
              <div className="rounded-lg border border-[#C9A227]/30 bg-[#12110D] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#FAF3E8]">
                      Redutor de Alíquota Setorial (CBS &amp; IBS)
                    </h4>
                    <p className="mt-1 text-xs text-[#9E9585]">
                      Produtos agropecuários in natura têm redução de 60% por lei (pagam apenas 40%
                      da alíquota padrão).
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#DCBF6F]">
                    {redutorCbsIbs}% de desconto
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { valor: 60, label: '60% (Recomendado Agro LC 214)' },
                    { valor: 30, label: '30% (Intermediário)' },
                    { valor: 0, label: '0% (Sem redutor / Alíquota Cheia)' },
                  ].map((item) => (
                    <button
                      key={item.valor}
                      type="button"
                      onClick={() => setRedutorCbsIbs(item.valor)}
                      className={`rounded border p-2.5 text-center text-xs transition-all ${
                        redutorCbsIbs === item.valor
                          ? 'border-[#DCBF6F] bg-[#1E1B12] text-[#DCBF6F] font-bold shadow-[0_0_8px_rgba(201,162,39,0.2)]'
                          : 'border-[#C9A227]/20 bg-[#101010] text-[#8E8779] hover:text-[#FAF3E8]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card de Crédito Presumido Rural */}
              <div className="rounded-lg border border-[#C9A227]/30 bg-[#12110D] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#FAF3E8]">
                      Compre de Produtor Rural Pessoa Física (Crédito Presumido)
                    </h4>
                    <p className="mt-1 text-xs text-[#9E9585]">
                      Permite que a empresa tome crédito sobre compras de produtor rural que não é
                      obrigado a recolher CBS/IBS.
                    </p>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={temCreditoPresumidoAgro}
                      onChange={(e) => setTemCreditoPresumidoAgro(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-[#252525] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 rounded-full after:bg-[#8E8779] after:transition-all peer-checked:bg-[#C9A227] peer-checked:after:translate-x-full peer-checked:after:bg-[#0A0A0A]" />
                  </label>
                </div>

                {temCreditoPresumidoAgro && (
                  <div className="mt-4 flex items-center justify-between border-t border-[#222] pt-3 text-xs">
                    <span className="text-[#C4BBAE]">
                      Percentual de Crédito Presumido Estimado:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-sm font-bold text-[#DCBF6F]">
                        {aliquotaCreditoPresumido}%
                      </span>
                      <span className="text-[10px] text-[#7A7366]">
                        (Definido pelo preset do setor)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTÃO ATALHO "RESTAURAR PADRÕES DA LEI" */}
            <div className="flex items-center justify-between rounded border border-[#C9A227]/20 bg-[#100F0A] p-3 text-xs">
              <span className="text-[#9E9585]">
                Deseja usar as alíquotas oficiais recomendadas sem ajustes manuais?
              </span>
              <button
                type="button"
                onClick={restaurarPadroesDaLei}
                className="font-semibold text-[#DCBF6F] hover:underline"
              >
                § Restaurar Padrões Oficiais da Lei
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASSO VI / TELA FINAL — RESUMO JURÍDICO EM CERTIFICADO */}
        {/* ========================================================================= */}
        {passo === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#DCBF6F] uppercase tracking-widest font-mono">
                <span>Passo VI · Certificado de Parâmetros da Consulta</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#FAF3E8]">
                Revise o resumo antes de processar a projeção
              </h3>
              <p className="mt-1 text-xs text-[#A89E8D]">
                Os dados coletados estão prontos para alimentar o motor de projeção 2025–2033. Você
                poderá alternar para o formulário técnico a qualquer momento.
              </p>
            </div>

            {/* PLACA CERTIFICADO ESTILO MOURA E MEDEIROS */}
            <div className="relative rounded-lg border-2 border-[#C9A227]/40 bg-gradient-to-b from-[#17150E] via-[#10100C] to-[#0A0A0A] p-6 shadow-xl">
              {/* Cantoneiras nobres */}
              <div className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-[#C9A227]" />
              <div className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-[#C9A227]" />
              <div className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[#C9A227]" />
              <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[#C9A227]" />

              <div className="flex items-center justify-between border-b border-[#C9A227]/30 pb-3">
                <div>
                  <span className="font-serif text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
                    Moura e Medeiros Advogados Associados
                  </span>
                  <h4 className="font-serif text-base font-semibold text-[#FAF3E8]">
                    Ficha de Consulta Tributária Rural
                  </h4>
                </div>
                <ShieldCheck size={26} className="text-[#DCBF6F]" />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Segmento:</span>
                    <span className="font-semibold text-[#FAF3E8] text-right">
                      {SETORES_PRESETS[setorKey].nome}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Faturamento Anual:</span>
                    <span className="font-mono font-bold text-[#DCBF6F]">
                      {formatarBRL(receitaBruta)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Compras &amp; Insumos:</span>
                    <span className="font-mono font-semibold text-[#FAF3E8]">
                      {formatarBRL(comprasInsumos)}
                      <span className="ml-1 text-[10px] text-[#7A7366]">
                        ({receitaBruta > 0 ? ((comprasInsumos / receitaBruta) * 100).toFixed(0) : 0}
                        %)
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Regime Atual:</span>
                    <span className="font-semibold text-[#FAF3E8]">
                      {regime === 'lucro_real'
                        ? 'Lucro Real'
                        : regime === 'lucro_presumido'
                          ? 'Lucro Presumido'
                          : 'Simples Nacional'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Redutor LC 214/2025:</span>
                    <span className="font-mono text-[#DCBF6F]">{redutorCbsIbs}% de desconto</span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-1.5">
                    <span className="text-[#8E8779]">Crédito Presumido Rural:</span>
                    <span className="font-semibold text-[#FAF3E8]">
                      {temCreditoPresumidoAgro ? `Ativo (${aliquotaCreditoPresumido}%)` : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded border border-[#C9A227]/20 bg-[#12110D] p-3 text-[11px] leading-relaxed text-[#A39985]">
                <strong className="text-[#DCBF6F]">Próximo passo:</strong> Ao clicar em
                &quot;Concluir Consulta e Gerar Projeção&quot;, o motor calculará a evolução ano a
                ano (2025 a 2033), o impacto financeiro em R$ e a comparação da carga tributária
                efetiva.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA INFERIOR DE NAVEGAÇÃO: BOTÕES VOLTAR, AVANÇAR E CONCLUIR */}
      <div className="mt-4 flex flex-col-reverse gap-3 border-t border-[#C9A227]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {passo > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="inline-flex items-center gap-2 rounded border border-[#C9A227]/30 bg-[#12110D] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#C4BBAE] hover:border-[#C9A227] hover:text-[#FAF3E8] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Voltar</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {passo === 5 && (
            <button
              type="button"
              onClick={() => {
                restaurarPadroesDaLei()
                setPasso(6)
              }}
              className="text-xs text-[#DCBF6F] hover:underline px-2 py-1"
            >
              Pular e usar valores padrão da lei
            </button>
          )}

          {passo < 6 ? (
            <button
              type="button"
              onClick={avancar}
              className="inline-flex items-center gap-2 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] shadow-[0_4px_18px_rgba(201,162,39,0.3)] hover:brightness-110 hover:shadow-[0_0_25px_rgba(201,162,39,0.5)] transition-all"
            >
              <span>Avançar para Passo {ETAPAS[passo]?.romano}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={concluirConsulta}
              className="inline-flex items-center gap-2 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] shadow-[0_4px_25px_rgba(201,162,39,0.4)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(201,162,39,0.6)] transition-all"
            >
              <CheckCircle2 size={16} />
              <span>Concluir Consulta e Revelar Projeção</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
