import React, { useState } from 'react'
import {
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Info,
  Wheat,
  Beef,
  Coffee,
  Trees,
  Factory,
  Tractor,
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

interface EtapaConfig {
  id: number
  romano: string
  titulo: string
  descricao: string
}

const ETAPAS: EtapaConfig[] = [
  {
    id: 1,
    romano: 'I',
    titulo: 'Atividade Agro',
    descricao: 'Identifique o segmento produtivo principal',
  },
  {
    id: 2,
    romano: 'II',
    titulo: 'Faturamento',
    descricao: 'Volume anual de receita bruta da operação',
  },
  {
    id: 3,
    romano: 'III',
    titulo: 'Insumos & Compras',
    descricao: 'Despesas produtivas que geram créditos tributários',
  },
  {
    id: 4,
    romano: 'IV',
    titulo: 'Regime Atual',
    descricao: 'Como a operação é tributada no sistema vigente',
  },
  {
    id: 5,
    romano: 'V',
    titulo: 'Benefícios LC 214',
    descricao: 'Redutores e créditos presumidos agropecuários',
  },
  {
    id: 6,
    romano: 'VI',
    titulo: 'Certificado & Resultado',
    descricao: 'Validação e consolidação dos parâmetros',
  },
]

const SETORES_OPCOES = [
  {
    key: 'soja_graos' as SetorPresetKey,
    titulo: 'Soja, Milho & Cereais',
    subtitulo: 'Grandes culturas em escala e tradings',
    icone: Wheat,
    badge: 'Redutor 60% LC 214',
    descricaoAmigavel:
      'Produção e comercialização de grãos in natura com incentivo tributário pleno na nova legislação.',
  },
  {
    key: 'pecuaria_bovina' as SetorPresetKey,
    titulo: 'Pecuária Bovina & Corte',
    subtitulo: 'Cria, recria, engorda e frigoríficos',
    icone: Beef,
    badge: 'Crédito Presumido',
    descricaoAmigavel:
      'Gado em pé e corte, fortemente beneficiado pelo crédito presumido na aquisição de produtores pessoas físicas.',
  },
  {
    key: 'cafe_culturas' as SetorPresetKey,
    titulo: 'Café & Fruticultura Especial',
    subtitulo: 'Culturas nobres, especiais e exportação',
    icone: Coffee,
    badge: 'Exportação Desonerada',
    descricaoAmigavel:
      'Mercado voltado à qualidade e exportação, com aproveitamento integral de créditos de insumos.',
  },
  {
    key: 'agroindustria' as SetorPresetKey,
    titulo: 'Agroindústria & Alimentos',
    subtitulo: 'Processamento, moagem e industrialização',
    icone: Factory,
    badge: 'Créditos Amplos de IVA',
    descricaoAmigavel:
      'Cadeia industrial que se beneficia da não-cumulatividade plena sobre equipamentos e energia.',
  },
  {
    key: 'silvicultura' as SetorPresetKey,
    titulo: 'Silvicultura & Florestas',
    subtitulo: 'Madeira, eucalipto e celulose',
    icone: Trees,
    badge: 'Ciclo Longo',
    descricaoAmigavel:
      'Operações de maturação plurianual com necessidade de preservação e ressarcimento ágil de saldo credor.',
  },
  {
    key: 'revenda_insumos' as SetorPresetKey,
    titulo: 'Revenda & Distribuição Agro',
    subtitulo: 'Defensivos, sementes, fertilizantes e peças',
    icone: Tractor,
    badge: 'Split Payment Neutro',
    descricaoAmigavel:
      'Comércio atacadista de insumos para produtores rurais, com impacto direto na nova dinâmica de split payment.',
  },
]

const REGIMES_OPCOES = [
  {
    key: 'lucro_real' as RegimeTributario,
    titulo: 'Lucro Real (Não-Cumulativo)',
    rotuloCurto: 'Lucro Real',
    descricaoAmigavel:
      'Obrigatório para faturamento acima de R$ 78 milhões/ano ou com benefícios fiscais expressivos.',
    dica: 'PIS 1,65% e COFINS 7,6% hoje. Com a reforma, terá créditos integrais de IVA sobre todas as despesas.',
  },
  {
    key: 'lucro_presumido' as RegimeTributario,
    titulo: 'Lucro Presumido (Cumulativo)',
    rotuloCurto: 'Presumido',
    descricaoAmigavel:
      'Tributação calculada sobre uma margem pré-fixada da receita. Não aproveita créditos de compras no PIS/COFINS atual.',
    dica: 'PIS 0,65% e COFINS 3% hoje. Poderá sentir migração relevante com a entrada da não-cumulatividade plena.',
  },
  {
    key: 'simples_nacional' as RegimeTributario,
    titulo: 'Simples Nacional (Guia Única DAS)',
    rotuloCurto: 'Simples',
    descricaoAmigavel:
      'Para micro e pequenas empresas (faturamento até R$ 4,8 milhões/ano). Todos os impostos recolhidos em uma só guia mensal.',
    dica: 'O Simples tem regime facultativo mantido pela EC 132/2023, com regras de transição próprias.',
  },
]

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

  const [receitaStr, setReceitaStr] = useState<string>(
    formatarMoedaAoDigitar(valoresIniciais.receitaBruta),
  )
  const [insumosStr, setInsumosStr] = useState<string>(
    formatarMoedaAoDigitar(valoresIniciais.comprasInsumos),
  )

  const [erroValidacao, setErroValidacao] = useState<string | null>(null)

  const handleSelectSetor = (chave: SetorPresetKey) => {
    setSetorKey(chave)
    const preset = SETORES_PRESETS[chave]
    setRedutorCbsIbs(preset.redutorCbsIbs)
    setTemCreditoPresumidoAgro(preset.creditoPresumidoAgro)
    setAliquotaCreditoPresumido(preset.percentualCreditoPresumido)
    setAproveitamentoCreditoNovo(preset.aproveitamentoCreditoPadrao)

    if (receitaBruta > 0 && comprasInsumos === 0) {
      const estimativa = Math.round((receitaBruta * preset.baseInsumosPercentual) / 100)
      setComprasInsumos(estimativa)
      setInsumosStr(formatarMoedaAoDigitar(estimativa))
    }
  }

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

  const atalhosFaturamento = [
    { label: 'R$ 5 Mi (Pequeno Porte)', valor: 5000000 },
    { label: 'R$ 15 Mi (Médio Produtor)', valor: 15000000 },
    { label: 'R$ 30 Mi (Grande Porte)', valor: 30000000 },
    { label: 'R$ 80 Mi (Corporativo / Agroindústria)', valor: 80000000 },
  ]

  return (
    <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-6 sm:p-8 shadow-[0_12px_36px_rgba(30,67,49,0.06)] text-[#15271E]">
      {/* Cantoneiras clássicas nobre em tom terroso */}
      <div className="pointer-events-none absolute top-3 left-3 h-3.5 w-3.5 border-t border-l border-[#784D34]" />
      <div className="pointer-events-none absolute top-3 right-3 h-3.5 w-3.5 border-t border-r border-[#784D34]" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3.5 w-3.5 border-b border-l border-[#784D34]" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 border-b border-r border-[#784D34]" />

      {/* BARRA SUPERIOR: Identificação de Entrevista e Progresso */}
      <div className="flex flex-col gap-4 border-b border-[#E2EBE5] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#784D34]">
            <Sparkles size={14} className="text-[#1E4331]" />
            <span>Atendimento ao Produtor · Entrevista Guiada</span>
          </div>
          <h2 className="mt-1 font-serif text-xl font-medium tracking-tight text-[#15271E] sm:text-2xl">
            Levantamento Inicial de Dados Tributários
          </h2>
          <p className="mt-1 text-xs text-[#5A7567]">
            Responda às questões com o cliente. O sistema converterá as respostas nos parâmetros da
            LC 214/2025.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={reiniciar}
            title="Reiniciar entrevista do início"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-2.5 py-1.5 text-xs text-[#425A4E] hover:border-[#1E4331] hover:text-[#1E4331] transition-colors"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
          <button
            type="button"
            onClick={onAlternarModoTecnico}
            title="Ir diretamente para o formulário técnico com sliders e alíquotas"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E4331] bg-[#F4F7F4] px-3 py-1.5 text-xs font-semibold text-[#1E4331] hover:bg-[#EBF0EC] transition-colors"
          >
            <SlidersHorizontal size={13} />
            <span>Modo Técnico</span>
          </button>
        </div>
      </div>

      {/* REGUA DE PROGRESSO COM NUMERAIS ROMANOS (I, II, III, IV, V, VI) */}
      <div className="mt-6 border-b border-[#E2EBE5] pb-6">
        <div className="flex items-center justify-between">
          {ETAPAS.map((etapa, idx) => {
            const isAtivo = passo === etapa.id
            const isPassado = passo > etapa.id
            return (
              <React.Fragment key={etapa.id}>
                <button
                  type="button"
                  onClick={() => {
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
                        ? 'border-2 border-[#1E4331] bg-[#1E4331] text-white shadow-md scale-110'
                        : isPassado
                          ? 'border border-[#689F82] bg-[#EBF0EC] text-[#1E4331]'
                          : 'border border-[#E2EBE5] bg-[#F8FAF8] text-[#5A7567]'
                    }`}
                  >
                    {isPassado ? (
                      <CheckCircle2 size={15} className="text-[#1E4331]" />
                    ) : (
                      etapa.romano
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-sans hidden sm:block ${
                      isAtivo
                        ? 'font-bold text-[#1E4331]'
                        : isPassado
                          ? 'text-[#2F4238]'
                          : 'text-[#8C5A32]'
                    }`}
                  >
                    {etapa.titulo}
                  </span>
                </button>

                {idx < ETAPAS.length - 1 && (
                  <div
                    className={`h-[1px] flex-1 mx-2 transition-colors ${
                      passo > etapa.id ? 'bg-[#1E4331]' : 'bg-[#E2EBE5]'
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
        {erroValidacao && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-fade-in">
            <Info size={16} className="shrink-0 text-red-600" />
            <span>{erroValidacao}</span>
          </div>
        )}

        {/* PASSO I — ATIVIDADE PRINCIPAL */}
        {passo === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo I · Identificação Operacional</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                Qual é a atividade principal do seu cliente no Agronegócio?
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
                Selecione o segmento mais alinhado à operação do produtor ou empresa. Isso define
                automaticamente os benefícios da Lei Complementar nº 214/2025.
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
                    className={`group relative rounded-xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#1E4331] bg-[#F4F7F4] shadow-md ring-1 ring-[#1E4331]'
                        : 'border-[#E2EBE5] bg-white hover:border-[#1E4331]/40 hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected
                              ? 'border-[#1E4331] bg-[#1E4331] text-white'
                              : 'border-[#E2EBE5] bg-[#F8FAF8] text-[#1E4331] group-hover:bg-[#EBF0EC]'
                          }`}
                        >
                          <Icone size={20} />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-[#15271E] group-hover:text-[#1E4331]">
                            {opt.titulo}
                          </h4>
                          <span className="block text-[11px] text-[#5A7567]">{opt.subtitulo}</span>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#EBF0EC] px-2.5 py-0.5 text-[10px] font-mono text-[#1E4331] font-semibold border border-[#E2EBE5]">
                        {opt.badge}
                      </span>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-[#425A4E] border-t border-[#E2EBE5] pt-2.5">
                      {opt.descricaoAmigavel}
                    </p>
                  </button>
                )
              })}
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs text-[#2E694D] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#1E4331] shrink-0" />
              <span>
                <strong>Dica Moura e Medeiros:</strong> Se o cliente tiver operação mista (ex: grãos
                + pecuária), escolha a atividade que representa mais de 50% do faturamento da
                operação.
              </span>
            </div>
          </div>
        )}

        {/* PASSO II — FATURAMENTO ANUAL */}
        {passo === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo II · Volume de Receita Bruta</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                Quanto o cliente faturou no último exercício (ou estima faturar)?
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
                Informe o valor total bruto das vendas da fazenda ou empresa nos últimos 12 meses,
                sem deduzir custos.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-6 shadow-inner">
              <label
                htmlFor="input-receita"
                className="block text-xs font-semibold uppercase tracking-wider text-[#784D34]"
              >
                Faturamento Bruto Anual (R$)
              </label>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl text-[#1E4331] sm:text-3xl">R$</span>
                <input
                  id="input-receita"
                  type="text"
                  inputMode="numeric"
                  value={receitaStr}
                  onChange={(e) => {
                    const parsed = parseMoedaString(e.target.value)
                    setReceitaBruta(parsed)
                    setReceitaStr(formatarMoedaAoDigitar(parsed))
                    if (comprasInsumos > parsed) {
                      const novoInsumo = Math.round(parsed * 0.6)
                      setComprasInsumos(novoInsumo)
                      setInsumosStr(formatarMoedaAoDigitar(novoInsumo))
                    }
                  }}
                  placeholder="0,00"
                  className="w-full bg-transparent font-mono text-2xl sm:text-4xl font-bold tracking-tight text-[#15271E] focus:outline-none border-b border-[#1E4331]/30 pb-2 focus:border-[#1E4331]"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#5A7567]">
                <span>Valor reconhecido:</span>
                <span className="font-mono text-[#1E4331] font-semibold text-sm">
                  {formatarBRL(receitaBruta)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#5A7567]">
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
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                      receitaBruta === at.valor
                        ? 'border-[#1E4331] bg-[#EBF0EC] text-[#1E4331] font-semibold shadow-sm'
                        : 'border-[#E2EBE5] bg-white text-[#425A4E] hover:border-[#1E4331]/40'
                    }`}
                  >
                    <span className="block font-mono font-bold text-[#15271E]">
                      {formatarBRL(at.valor)}
                    </span>
                    <span className="block text-[10px] text-[#5A7567]">{at.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs text-[#2E694D] flex items-center gap-2">
              <Info size={16} className="text-[#1E4331] shrink-0" />
              <span>
                Essa quantia servirá de base para a tributação da CBS (Federal) e do IBS
                (Estadual/Municipal), substituindo PIS, COFINS e ICMS nas saídas.
              </span>
            </div>
          </div>
        )}

        {/* PASSO III — INSUMOS & DESPESAS */}
        {passo === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo III · Compras, Insumos e Créditos</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                Quanto o cliente gastou com insumos, compras e suprimentos?
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
                Exemplos no agronegócio: fertilizantes, defensivos agrícolas, sementes, rações, óleo
                diesel e energia elétrica rural.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-6 shadow-inner">
              <label
                htmlFor="input-insumos"
                className="block text-xs font-semibold uppercase tracking-wider text-[#784D34]"
              >
                Despesas Anuais com Insumos de Produção (R$)
              </label>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-2xl text-[#1E4331] sm:text-3xl">R$</span>
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
                  className="w-full bg-transparent font-mono text-2xl sm:text-4xl font-bold tracking-tight text-[#15271E] focus:outline-none border-b border-[#1E4331]/30 pb-2 focus:border-[#1E4331]"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[#5A7567]">
                <span>
                  Proporção sobre o faturamento:{' '}
                  <strong className="text-[#1E4331] font-mono">
                    {receitaBruta > 0 ? ((comprasInsumos / receitaBruta) * 100).toFixed(1) : 0}%
                  </strong>
                </span>
                <span className="font-mono text-[#15271E] font-semibold text-sm">
                  {formatarBRL(comprasInsumos)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-[#5A7567]">
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
                      className="rounded-lg border border-[#E2EBE5] bg-white p-2.5 text-left text-xs hover:border-[#1E4331]/40 hover:bg-[#F8FAF8] transition-all"
                    >
                      <span className="block font-mono font-bold text-[#1E4331]">{item.label}</span>
                      <span className="block text-[11px] text-[#15271E] font-mono mt-0.5">
                        {formatarBRL(valor)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs text-[#2E694D] flex items-center gap-2">
              <TrendingDown size={16} className="text-emerald-700 shrink-0" />
              <span>
                <strong>Por que isso importa ao cliente?</strong> No novo modelo de IVA Dual, todas
                essas despesas geram créditos tributários que abatem diretamente o imposto a pagar
                na venda.
              </span>
            </div>
          </div>
        )}

        {/* PASSO IV — REGIME TRIBUTÁRIO ATUAL */}
        {passo === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo IV · Enquadramento Fiscal Atual</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                Qual é o regime tributário atual da empresa ou produtor?
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
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
                    className={`rounded-xl border p-4 text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#1E4331] bg-[#F4F7F4] shadow-md ring-1 ring-[#1E4331]'
                        : 'border-[#E2EBE5] bg-white hover:border-[#1E4331]/40 hover:bg-[#F8FAF8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-bold text-[#15271E]">
                          {reg.titulo}
                        </span>
                        {isSelected && <span className="flex h-2 w-2 rounded-full bg-[#1E4331]" />}
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-[#5A7567]">
                        {reg.descricaoAmigavel}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-[#E2EBE5] pt-2.5 text-[11px] text-[#784D34] italic">
                      {reg.dica}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs text-[#2E694D] flex items-center gap-2">
              <Info size={16} className="text-[#1E4331] shrink-0" />
              <span>
                <strong>Importante:</strong> Esta informação serve para calcular o &quot;Baseline
                2025&quot; — quanto o cliente paga hoje no sistema antigo, para podermos comparar
                com o modelo dual.
              </span>
            </div>
          </div>
        )}

        {/* PASSO V — BENEFÍCIOS & PARÂMETROS AVANÇADOS */}
        {passo === 5 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo V · Benefícios Especiais da Lei</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                O cliente tem compras de produtores rurais pessoas físicas ou regimes especiais?
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
                A Reforma Tributária trouxe mecanismos protetivos específicos para o agronegócio.
                Mantivemos os valores recomendados pela lei pré-selecionados.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#E2EBE5] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#15271E]">
                      Redutor de Alíquota Setorial (CBS &amp; IBS)
                    </h4>
                    <p className="mt-1 text-xs text-[#5A7567]">
                      Produtos agropecuários in natura têm redução de 60% por lei (pagam apenas 40%
                      da alíquota padrão).
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#1E4331]">
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
                      className={`rounded-lg border p-2.5 text-center text-xs transition-all ${
                        redutorCbsIbs === item.valor
                          ? 'border-[#1E4331] bg-[#EBF0EC] text-[#1E4331] font-bold shadow-sm'
                          : 'border-[#E2EBE5] bg-[#F8FAF8] text-[#5A7567] hover:border-[#1E4331]/30'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E2EBE5] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#15271E]">
                      Compre de Produtor Rural Pessoa Física (Crédito Presumido)
                    </h4>
                    <p className="mt-1 text-xs text-[#5A7567]">
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
                    <div className="h-6 w-11 rounded-full bg-stone-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 rounded-full after:bg-white after:transition-all peer-checked:bg-[#1E4331] peer-checked:after:translate-x-full" />
                  </label>
                </div>

                {temCreditoPresumidoAgro && (
                  <div className="mt-4 flex items-center justify-between border-t border-[#E2EBE5] pt-3 text-xs">
                    <span className="text-[#425A4E]">
                      Percentual de Crédito Presumido Estimado:
                    </span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-sm font-bold text-[#1E4331]">
                        {aliquotaCreditoPresumido}%
                      </span>
                      <span className="text-[10px] text-[#5A7567]">
                        (Definido pelo preset do setor)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs">
              <span className="text-[#5A7567]">
                Deseja usar as alíquotas oficiais recomendadas sem ajustes manuais?
              </span>
              <button
                type="button"
                onClick={restaurarPadroesDaLei}
                className="font-semibold text-[#1E4331] hover:underline"
              >
                § Restaurar Padrões Oficiais da Lei
              </button>
            </div>
          </div>
        )}

        {/* PASSO VI — CERTIFICADO FINAL */}
        {passo === 6 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#784D34] uppercase tracking-widest font-mono">
                <span>Passo VI · Certificado de Parâmetros da Consulta</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl font-normal text-[#15271E]">
                Revise o resumo antes de processar a projeção
              </h3>
              <p className="mt-1 text-xs text-[#5A7567]">
                Os dados coletados estão prontos para alimentar o motor de projeção 2025–2033. Você
                poderá alternar para o formulário técnico a qualquer momento.
              </p>
            </div>

            <div className="relative rounded-2xl border-2 border-[#1E4331]/30 bg-white p-6 shadow-md">
              <div className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-[#784D34]" />
              <div className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-[#784D34]" />
              <div className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[#784D34]" />
              <div className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[#784D34]" />

              <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                <div>
                  <span className="font-serif text-[11px] font-semibold uppercase tracking-[0.22em] text-[#784D34]">
                    Moura e Medeiros Advogados Associados
                  </span>
                  <h4 className="font-serif text-base font-semibold text-[#15271E]">
                    Ficha de Consulta Tributária Rural
                  </h4>
                </div>
                <ShieldCheck size={26} className="text-[#1E4331]" />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Segmento:</span>
                    <span className="font-semibold text-[#15271E] text-right">
                      {SETORES_PRESETS[setorKey].nome}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Faturamento Anual:</span>
                    <span className="font-mono font-bold text-[#1E4331]">
                      {formatarBRL(receitaBruta)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Compras &amp; Insumos:</span>
                    <span className="font-mono font-semibold text-[#15271E]">
                      {formatarBRL(comprasInsumos)}
                      <span className="ml-1 text-[10px] text-[#5A7567]">
                        ({receitaBruta > 0 ? ((comprasInsumos / receitaBruta) * 100).toFixed(0) : 0}
                        %)
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Regime Atual:</span>
                    <span className="font-semibold text-[#15271E]">
                      {regime === 'lucro_real'
                        ? 'Lucro Real'
                        : regime === 'lucro_presumido'
                          ? 'Lucro Presumido'
                          : 'Simples Nacional'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Redutor LC 214/2025:</span>
                    <span className="font-mono text-[#1E4331] font-bold">
                      {redutorCbsIbs}% de desconto
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E2EBE5] pb-1.5">
                    <span className="text-[#5A7567]">Crédito Presumido Rural:</span>
                    <span className="font-semibold text-[#15271E]">
                      {temCreditoPresumidoAgro ? `Ativo (${aliquotaCreditoPresumido}%)` : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] p-3 text-[11px] leading-relaxed text-[#2E694D]">
                <strong className="text-[#1E4331]">Próximo passo:</strong> Ao clicar em
                &quot;Concluir Consulta e Revelar Projeção&quot;, o motor calculará a evolução ano a
                ano (2025 a 2033), o impacto financeiro em R$ e a comparação da carga tributária
                efetiva.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA INFERIOR DE NAVEGAÇÃO: BOTÕES VOLTAR, AVANÇAR E CONCLUIR */}
      <div className="mt-4 flex flex-col-reverse gap-3 border-t border-[#E2EBE5] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {passo > 1 && (
            <button
              type="button"
              onClick={voltar}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#425A4E] hover:border-[#1E4331] hover:text-[#1E4331] transition-colors"
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
              className="text-xs text-[#784D34] hover:underline px-2 py-1"
            >
              Pular e usar valores padrão da lei
            </button>
          )}

          {passo < 6 ? (
            <button
              type="button"
              onClick={avancar}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1E4331] bg-[#1E4331] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#15271E] transition-all"
            >
              <span>Avançar para Passo {ETAPAS[passo]?.romano}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={concluirConsulta}
              className="inline-flex items-center gap-2 rounded-lg border border-[#784D34] bg-[#784D34] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#523422] transition-all"
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
