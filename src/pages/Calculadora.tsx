import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Calendar,
  Sparkles,
  PhoneCall,
  Scale,
  Award,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import {
  SETORES_PRESETS,
  SetorPresetKey,
  RegimeTributario,
  ParametrosCalculadora,
  calcularTransicaoTributaria,
  formatarBRL,
} from '@/lib/tributario-engine'
import { ConsultaGuiadaWizard, ConsultaGuiadaValores } from '@/components/ConsultaGuiadaWizard'

const CRONOGRAMA_EVENTOS = [
  {
    ano: '2025',
    fase: 'Vigência do Regime Vigente',
    artigo: 'Sistema Tributário Nacional (CF/88)',
    resumo:
      'PIS (1,65%), COFINS (7,60%), ICMS estadual, ISS municipal e IPI vigentes em sua totalidade. Planejamento tributário pré-reforma.',
    tag: 'Baseline',
    cor: 'border-[#1E4331]/30',
  },
  {
    ano: '2026',
    fase: 'Ano-Teste Operacional Piloto',
    artigo: 'Art. 348, § 1º, LC 214/2025',
    resumo:
      'Cobrança-teste de CBS a 0,90% e IBS a 0,10%. O recolhimento é 100% compensável com o PIS/COFINS devido no período, sem ônus financeiro real aos contribuintes com obrigações regulares.',
    tag: 'CBS 0,9% · IBS 0,1%',
    cor: 'border-[#784D34]/40',
  },
  {
    ano: '2027–2028',
    fase: 'CBS Plena & Extinção PIS/COFINS',
    artigo: 'Art. 349, LC 214/2025',
    resumo:
      'Extinção de PIS e COFINS; IPI zerado (ressalvada ZFM); CBS entra com alíquota cheia (~9,21%). IBS permanece a 0,10%. Imposto Seletivo entra em vigor. ICMS e ISS continuam plenos.',
    tag: 'CBS Plena · PIS/COFINS Extintos',
    cor: 'border-[#1E4331]/50',
  },
  {
    ano: '2029–2032',
    fase: 'Transição Gradual ICMS/ISS → IBS',
    artigo: 'Art. 350, LC 214/2025',
    resumo:
      'Gradual substituição dos tributos estaduais e municipais: 2029 (IBS 10%, ICMS/ISS 90%), 2030 (IBS 20%, ICMS/ISS 80%), 2031 (IBS 30%, ICMS/ISS 70%), 2032 (IBS 40%, ICMS/ISS 60%).',
    tag: 'Escalonamento Subnacional',
    cor: 'border-[#784D34]/50',
  },
  {
    ano: '2033',
    fase: 'Vigência Plena da Reforma',
    artigo: 'Art. 351, LC 214/2025 & Art. 156-A CF',
    resumo:
      'Extinção total do ICMS e do ISS. Modelo dual pleno: CBS da União + IBS dos Estados e Municípios operando em sistema digital de split payment e não-cumulatividade irrestrita.',
    tag: 'IVA Dual Definitivo',
    cor: 'border-[#1E4331]',
  },
]

export default function CalculadoraTributaria() {
  const presetPadrao = SETORES_PRESETS.soja_graos

  const [modoUso, setModoUso] = useState<'guiada' | 'tecnico'>('guiada')

  const [receitaBruta, setReceitaBruta] = useState<number>(30000000)
  const [comprasInsumos, setComprasInsumos] = useState<number>(18000000)
  const [regime, setRegime] = useState<RegimeTributario>('lucro_real')
  const [setorKey, setSetorKey] = useState<SetorPresetKey>('soja_graos')

  const [aliquotaPis, setAliquotaPis] = useState<number>(presetPadrao.pisPadrao)
  const [aliquotaCofins, setAliquotaCofins] = useState<number>(presetPadrao.cofinsPadrao)
  const [aliquotaIcms, setAliquotaIcms] = useState<number>(presetPadrao.icmsPadrao)
  const [aliquotaIss, setAliquotaIss] = useState<number>(presetPadrao.issPadrao)
  const [aliquotaIpi, setAliquotaIpi] = useState<number>(presetPadrao.ipiPadrao)
  const [aliquotaDas, setAliquotaDas] = useState<number>(11.5)
  const [aproveitamentoCreditoAtual] = useState<number>(85)

  const [aliquotaCbsRef, setAliquotaCbsRef] = useState<number>(9.21)
  const [aliquotaIbsRef, setAliquotaIbsRef] = useState<number>(18.7)
  const [redutorCbsIbs, setRedutorCbsIbs] = useState<number>(presetPadrao.redutorCbsIbs)
  const [aproveitamentoCreditoNovo, setAproveitamentoCreditoNovo] = useState<number>(100)
  const [temCreditoPresumidoAgro, setTemCreditoPresumidoAgro] = useState<boolean>(
    presetPadrao.creditoPresumidoAgro,
  )
  const [aliquotaCreditoPresumido, setAliquotaCreditoPresumido] = useState<number>(
    presetPadrao.percentualCreditoPresumido,
  )
  const [impostoSeletivoAliquota] = useState<number>(0)

  const [mostrarParametrosAvancados, setMostrarParametrosAvancados] = useState<boolean>(false)
  const [anoDetalhado, setAnoDetalhado] = useState<number>(2033)

  const aplicarPreset = (chave: SetorPresetKey) => {
    setSetorKey(chave)
    const p = SETORES_PRESETS[chave]
    setRedutorCbsIbs(p.redutorCbsIbs)
    setTemCreditoPresumidoAgro(p.creditoPresumidoAgro)
    setAliquotaCreditoPresumido(p.percentualCreditoPresumido)
    setAliquotaPis(p.pisPadrao)
    setAliquotaCofins(p.cofinsPadrao)
    setAliquotaIcms(p.icmsPadrao)
    setAliquotaIss(p.issPadrao)
    setAliquotaIpi(p.ipiPadrao)
    setAproveitamentoCreditoNovo(p.aproveitamentoCreditoPadrao)
    if (receitaBruta > 0) {
      setComprasInsumos(Math.round((receitaBruta * p.baseInsumosPercentual) / 100))
    }
  }

  const handleAplicarConsultaGuiada = (novos: ConsultaGuiadaValores) => {
    setSetorKey(novos.setorKey)
    setReceitaBruta(novos.receitaBruta)
    setComprasInsumos(novos.comprasInsumos)
    setRegime(novos.regime)
    setRedutorCbsIbs(novos.redutorCbsIbs)
    setTemCreditoPresumidoAgro(novos.temCreditoPresumidoAgro)
    setAliquotaCreditoPresumido(novos.aliquotaCreditoPresumido)
    setAproveitamentoCreditoNovo(novos.aproveitamentoCreditoNovo)

    const preset = SETORES_PRESETS[novos.setorKey]
    setAliquotaPis(preset.pisPadrao)
    setAliquotaCofins(preset.cofinsPadrao)
    setAliquotaIcms(preset.icmsPadrao)
    setAliquotaIss(preset.issPadrao)
    setAliquotaIpi(preset.ipiPadrao)

    const elResultados = document.getElementById('secao-resultados-calculadora')
    if (elResultados) {
      elResultados.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const params: ParametrosCalculadora = useMemo(
    () => ({
      receitaBrutaAnual: receitaBruta,
      comprasInsumosAnual: comprasInsumos,
      regime,
      setor: setorKey,
      aliquotaPis,
      aliquotaCofins,
      aliquotaIcms,
      aliquotaIss,
      aliquotaIpi,
      aliquotaDasEfetiva: aliquotaDas,
      aproveitamentoCreditoAtual,
      aliquotaCbsReferencia: aliquotaCbsRef,
      aliquotaIbsReferencia: aliquotaIbsRef,
      redutorCbsIbs,
      aproveitamentoCreditoNovo,
      temCreditoPresumidoAgro,
      aliquotaCreditoPresumido,
      impostoSeletivoAliquota,
    }),
    [
      receitaBruta,
      comprasInsumos,
      regime,
      setorKey,
      aliquotaPis,
      aliquotaCofins,
      aliquotaIcms,
      aliquotaIss,
      aliquotaIpi,
      aliquotaDas,
      aproveitamentoCreditoAtual,
      aliquotaCbsRef,
      aliquotaIbsRef,
      redutorCbsIbs,
      aproveitamentoCreditoNovo,
      temCreditoPresumidoAgro,
      aliquotaCreditoPresumido,
      impostoSeletivoAliquota,
    ],
  )

  const resultado = useMemo(() => calcularTransicaoTributaria(params), [params])

  const dadosGrafico = useMemo(() => {
    return resultado.projecoes.map((p) => ({
      ano: `${p.ano}`,
      'Sistema Atual': Math.round(p.totalAtual),
      'Novo Sistema': Math.round(p.totalNovoSistema),
      'Total Efetivo': Math.round(p.totalEfetivoAno),
      'Carga Efetiva (%)': Number(p.cargaEfetivaTotalAno.toFixed(2)),
      anoNumero: p.ano,
    }))
  }, [resultado])

  const projecaoSelecionada = useMemo(() => {
    return (
      resultado.projecoes.find((p) => p.ano === anoDetalhado) ||
      resultado.projecoes[resultado.projecoes.length - 1]
    )
  }, [resultado, anoDetalhado])

  return (
    <div className="bg-[#F8FAF8] text-[#15271E]">
      {/* HEADER HERO DA CALCULADORA TRIBUTÁRIA NA PALETA AGRO */}
      <section className="relative overflow-hidden border-b border-[#E2EBE5] bg-white py-12 sm:py-16">
        <div className="pointer-events-none absolute -top-32 right-1/4 h-[350px] w-[350px] rounded-full bg-[#1E4331]/5 blur-[100px]" />
        <div className="pointer-events-none absolute top-1/2 -left-20 h-[280px] w-[280px] rounded-full bg-[#784D34]/5 blur-[90px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#1E4331] uppercase transition hover:text-[#784D34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>Voltar ao Portal Agrojur</span>
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E2EBE5] bg-[#F4F7F4] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E4331]">
                <Scale size={14} className="text-[#1E4331]" />
                <span>Simulador Estratégico · LC 214/2025</span>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-normal leading-[1.15] tracking-tight text-[#15271E] sm:text-5xl lg:text-[3.25rem]">
                Calculadora da Transição Tributária{' '}
                <span className="italic font-serif font-semibold text-[#1E4331]">2025–2033.</span>
              </h1>

              <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-[#425A4E] sm:text-base">
                Projeção jurídica e financeira do impacto da Reforma Tributária (CBS, IBS e Imposto
                Seletivo) em comparação ao modelo tributário atual (PIS, COFINS, ICMS, ISS e IPI),
                com as regras específicas do Agronegócio previstas na Lei Complementar nº 214/2025.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-[#5A7567]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E4331]" />
                  <span>Redução setorial agro de 60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#784D34]" />
                  <span>Crédito presumido de insumos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E4331]" />
                  <span>Escalonamento 2026–2033</span>
                </div>
              </div>
            </div>

            {/* Selo Jurídico de Placa de Prestígio Agro */}
            <div className="relative rounded-2xl border border-[#E2EBE5] bg-[#F4F7F4] p-6 shadow-sm">
              <div className="absolute top-2.5 left-2.5 h-3 w-3 border-t border-l border-[#784D34]" />
              <div className="absolute top-2.5 right-2.5 h-3 w-3 border-t border-r border-[#784D34]" />
              <div className="absolute bottom-2.5 left-2.5 h-3 w-3 border-b border-l border-[#784D34]" />
              <div className="absolute bottom-2.5 right-2.5 h-3 w-3 border-b border-r border-[#784D34]" />

              <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-4">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Moura e Medeiros
                  </span>
                  <h2 className="font-serif text-lg font-semibold text-[#15271E]">
                    Parecer Preliminar Sintético
                  </h2>
                </div>
                <Award size={24} className="text-[#1E4331]" />
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#5A7567]">Ano de Virada Legal:</span>
                  <span className="font-mono font-bold text-[#1E4331]">
                    {resultado.anoVirada
                      ? `Exercício de ${resultado.anoVirada}`
                      : 'Equilíbrio Contínuo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A7567]">Carga Efetiva Atual:</span>
                  <span className="font-mono text-[#15271E]">
                    {resultado.impactoFinal2033.cargaAtual.toFixed(2)}% da receita
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A7567]">Carga no Sistema 2033:</span>
                  <span className="font-mono text-[#15271E]">
                    {resultado.impactoFinal2033.carga2033.toFixed(2)}% da receita
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E2EBE5] pt-3">
                  <span className="text-[#1E4331] font-semibold">Impacto Final (2033):</span>
                  <span
                    className={`font-mono font-bold ${
                      resultado.impactoFinal2033.economiaOuAumento === 'economia'
                        ? 'text-emerald-700'
                        : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                          ? 'text-amber-700'
                          : 'text-[#15271E]'
                    }`}
                  >
                    {resultado.impactoFinal2033.economiaOuAumento === 'economia' ? '↓ ' : '↑ '}
                    {formatarBRL(Math.abs(resultado.impactoFinal2033.diferencaValor))}
                    <span className="text-[10px] ml-1">
                      ({resultado.impactoFinal2033.diferencaPP > 0 ? '+' : ''}
                      {resultado.impactoFinal2033.diferencaPP.toFixed(2)} p.p.)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DE CONTROLE DE MODO & ENTRADA DE DADOS */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* SEGMENTED CONTROL: CONSULTA GUIADA vs FORMULÁRIO TÉCNICO */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#E2EBE5] bg-white p-4 sm:flex-row sm:items-center sm:p-5 shadow-sm">
          <div>
            <span className="font-serif text-[11px] font-semibold tracking-widest text-[#784D34] uppercase">
              Modo de Operação da Calculadora
            </span>
            <p className="mt-0.5 text-xs text-[#5A7567]">
              Escolha entre a entrevista passo-a-passo (ideal em atendimento ao cliente) ou o
              formulário analítico técnico completo.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] p-1.5 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setModoUso('guiada')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                modoUso === 'guiada'
                  ? 'border border-[#1E4331] bg-[#1E4331] text-white shadow-sm font-bold'
                  : 'text-[#5A7567] hover:text-[#15271E]'
              }`}
            >
              <Sparkles
                size={14}
                className={modoUso === 'guiada' ? 'text-white' : 'text-[#1E4331]'}
              />
              <span>Consulta Guiada</span>
            </button>
            <button
              type="button"
              onClick={() => setModoUso('tecnico')}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                modoUso === 'tecnico'
                  ? 'border border-[#1E4331] bg-[#1E4331] text-white shadow-sm font-bold'
                  : 'text-[#5A7567] hover:text-[#15271E]'
              }`}
            >
              <SlidersHorizontal
                size={14}
                className={modoUso === 'tecnico' ? 'text-white' : 'text-[#1E4331]'}
              />
              <span>Formulário Técnico</span>
            </button>
          </div>
        </div>
      </section>

      {/* ÁREA PRINCIPAL: WIZARD GUIADO OU FORMULÁRIO TÉCNICO COM SLIDERS */}
      <section
        id="secao-resultados-calculadora"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        {modoUso === 'guiada' ? (
          <div className="mb-10">
            <ConsultaGuiadaWizard
              valoresIniciais={{
                setorKey,
                receitaBruta,
                comprasInsumos,
                regime,
                redutorCbsIbs,
                temCreditoPresumidoAgro,
                aliquotaCreditoPresumido,
                aproveitamentoCreditoNovo,
              }}
              onAplicarResultados={handleAplicarConsultaGuiada}
              onAlternarModoTecnico={() => setModoUso('tecnico')}
            />
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-12">
          {modoUso === 'tecnico' ? (
            <div className="space-y-6 lg:col-span-5">
              {/* Presets Setoriais */}
              <div className="rounded-xl border border-[#E2EBE5] bg-white p-5 shadow-sm">
                <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                  Segmentos do Agronegócio (LC 214/2025)
                </span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(Object.keys(SETORES_PRESETS) as SetorPresetKey[]).map((key) => {
                    const preset = SETORES_PRESETS[key]
                    const ativo = setorKey === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => aplicarPreset(key)}
                        className={`rounded-lg border p-2.5 text-left text-xs transition-all ${
                          ativo
                            ? 'border-[#1E4331] bg-[#EBF0EC] text-[#1E4331] font-bold shadow-sm'
                            : 'border-[#E2EBE5] bg-[#F8FAF8] text-[#425A4E] hover:border-[#1E4331]/40 hover:bg-white'
                        }`}
                      >
                        <span className="block font-semibold">{preset.nome}</span>
                        <span className="block text-[10px] text-[#5A7567] mt-0.5">
                          Redutor: {preset.redutorCbsIbs}%
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parâmetros Operacionais */}
              <div className="relative rounded-xl border border-[#E2EBE5] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Capítulo I · Base Financeira
                  </span>
                  <span className="font-mono text-xs text-[#1E4331]">§ 1º e § 2º</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="receita-bruta"
                      className="flex items-center justify-between text-xs font-semibold text-[#15271E]"
                    >
                      <span>Receita Bruta Anual (R$)</span>
                      <span className="font-mono text-[#1E4331] text-sm">
                        {formatarBRL(receitaBruta)}
                      </span>
                    </label>
                    <input
                      id="receita-bruta"
                      type="range"
                      min={1000000}
                      max={120000000}
                      step={500000}
                      value={receitaBruta}
                      onChange={(e) => setReceitaBruta(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer accent-[#1E4331] bg-[#E2EBE5] rounded-lg"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="compras-insumos"
                      className="flex items-center justify-between text-xs font-semibold text-[#15271E]"
                    >
                      <span>Compras de Insumos Anual (R$)</span>
                      <span className="font-mono text-[#1E4331] text-sm">
                        {formatarBRL(comprasInsumos)}
                      </span>
                    </label>
                    <input
                      id="compras-insumos"
                      type="range"
                      min={500000}
                      max={receitaBruta}
                      step={500000}
                      value={Math.min(comprasInsumos, receitaBruta)}
                      onChange={(e) => setComprasInsumos(Number(e.target.value))}
                      className="mt-2 h-1.5 w-full cursor-pointer accent-[#1E4331] bg-[#E2EBE5] rounded-lg"
                    />
                    <span className="mt-1 block text-[11px] text-[#5A7567]">
                      Proporção de insumos sobre receita:{' '}
                      <strong className="text-[#1E4331]">
                        {((comprasInsumos / receitaBruta) * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </div>

                  <div>
                    <label
                      htmlFor="regime-tributario"
                      className="block text-xs font-semibold text-[#15271E]"
                    >
                      Regime Tributário Vigente
                    </label>
                    <select
                      id="regime-tributario"
                      value={regime}
                      onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                      className="mt-1.5 w-full rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-3 py-2 text-xs font-semibold text-[#15271E] focus:border-[#1E4331] focus:bg-white outline-none"
                    >
                      <option value="lucro_real">Lucro Real (Não-Cumulativo)</option>
                      <option value="lucro_presumido">Lucro Presumido (Cumulativo)</option>
                      <option value="simples_nacional">Simples Nacional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parâmetros LC 214/2025 */}
              <div className="relative rounded-xl border border-[#E2EBE5] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Capítulo II · Parâmetros da LC 214/2025
                  </span>
                  <span className="font-mono text-xs text-[#1E4331]">§ 4º e seguintes</span>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-[#15271E]">
                      Redutor de Alíquota Setorial CBS &amp; IBS
                    </span>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {[
                        { valor: 0, label: '0% (Geral)' },
                        { valor: 30, label: '30% (Interm.)' },
                        { valor: 60, label: '60% (Agro/LC 214)' },
                        { valor: 100, label: '100% (Isento)' },
                      ].map((item) => (
                        <button
                          key={item.valor}
                          type="button"
                          onClick={() => setRedutorCbsIbs(item.valor)}
                          className={`rounded-lg border py-2 px-1 text-center text-xs transition-all ${
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

                  <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-semibold text-[#15271E]">
                          Crédito Presumido Agropecuário
                        </span>
                        <span className="block text-[10px] text-[#5A7567]">
                          Aquisição de produtor rural pessoa física não contribuinte
                        </span>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={temCreditoPresumidoAgro}
                          onChange={(e) => setTemCreditoPresumidoAgro(e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-full bg-stone-300 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 rounded-full after:bg-white after:transition-all peer-checked:bg-[#1E4331] peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    {temCreditoPresumidoAgro && (
                      <div className="mt-3 flex items-center justify-between border-t border-[#E2EBE5] pt-2.5">
                        <label
                          htmlFor="aliq-credito-presumido"
                          className="text-[11px] text-[#425A4E]"
                        >
                          Alíquota de Crédito Presumido:
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            id="aliq-credito-presumido"
                            type="number"
                            step={0.5}
                            min={0}
                            max={15}
                            value={aliquotaCreditoPresumido}
                            onChange={(e) => setAliquotaCreditoPresumido(Number(e.target.value))}
                            className="w-16 rounded-md border border-[#E2EBE5] bg-white px-2 py-0.5 text-right font-mono text-xs text-[#15271E]"
                          />
                          <span className="text-xs text-[#1E4331] font-bold">%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setMostrarParametrosAvancados(!mostrarParametrosAvancados)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E2EBE5] bg-[#F8FAF8] px-3.5 py-2.5 text-xs font-semibold text-[#1E4331] hover:bg-[#EBF0EC] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} />
                      <span>Ajustar Alíquotas Individuais de Referência</span>
                    </span>
                    {mostrarParametrosAvancados ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>

                  {mostrarParametrosAvancados && (
                    <div className="space-y-3.5 rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-4 text-xs">
                      <p className="text-[11px] font-semibold text-[#784D34] uppercase tracking-wider">
                        Alíquotas de Referência Governamentais
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="cbs-ref" className="text-[11px] text-[#5A7567]">
                            CBS Federal de Ref. (%)
                          </label>
                          <input
                            id="cbs-ref"
                            type="number"
                            step={0.01}
                            value={aliquotaCbsRef}
                            onChange={(e) => setAliquotaCbsRef(Number(e.target.value))}
                            className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                          />
                        </div>
                        <div>
                          <label htmlFor="ibs-ref" className="text-[11px] text-[#5A7567]">
                            IBS Subnacional de Ref. (%)
                          </label>
                          <input
                            id="ibs-ref"
                            type="number"
                            step={0.01}
                            value={aliquotaIbsRef}
                            onChange={(e) => setAliquotaIbsRef(Number(e.target.value))}
                            className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                          />
                        </div>
                      </div>

                      <div className="border-t border-[#E2EBE5] pt-3">
                        <p className="text-[11px] font-semibold text-[#784D34] uppercase tracking-wider">
                          Alíquotas do Sistema Atual em Edição
                        </p>
                        {regime === 'simples_nacional' ? (
                          <div className="mt-2">
                            <label htmlFor="das-efetivo" className="text-[11px] text-[#5A7567]">
                              Alíquota Efetiva do DAS (%)
                            </label>
                            <input
                              id="das-efetivo"
                              type="number"
                              step={0.1}
                              value={aliquotaDas}
                              onChange={(e) => setAliquotaDas(Number(e.target.value))}
                              className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                            />
                          </div>
                        ) : (
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <label htmlFor="aliq-pis" className="text-[10px] text-[#5A7567]">
                                PIS (%)
                              </label>
                              <input
                                id="aliq-pis"
                                type="number"
                                step={0.05}
                                value={aliquotaPis}
                                onChange={(e) => setAliquotaPis(Number(e.target.value))}
                                className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                              />
                            </div>
                            <div>
                              <label htmlFor="aliq-cofins" className="text-[10px] text-[#5A7567]">
                                COFINS (%)
                              </label>
                              <input
                                id="aliq-cofins"
                                type="number"
                                step={0.1}
                                value={aliquotaCofins}
                                onChange={(e) => setAliquotaCofins(Number(e.target.value))}
                                className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                              />
                            </div>
                            <div>
                              <label htmlFor="aliq-icms" className="text-[10px] text-[#5A7567]">
                                ICMS (%)
                              </label>
                              <input
                                id="aliq-icms"
                                type="number"
                                step={0.5}
                                value={aliquotaIcms}
                                onChange={(e) => setAliquotaIcms(Number(e.target.value))}
                                className="mt-1 w-full rounded-md border border-[#E2EBE5] bg-white px-2 py-1 font-mono text-xs text-[#15271E]"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[#E2EBE5] pt-3">
                        <div className="flex items-center justify-between">
                          <label htmlFor="aprov-cred-novo" className="text-[11px] text-[#5A7567]">
                            Aproveitamento de Créditos na Entrada (%)
                          </label>
                          <span className="font-mono text-xs text-[#1E4331] font-bold">
                            {aproveitamentoCreditoNovo}%
                          </span>
                        </div>
                        <input
                          id="aprov-cred-novo"
                          type="range"
                          min={50}
                          max={100}
                          value={aproveitamentoCreditoNovo}
                          onChange={(e) => setAproveitamentoCreditoNovo(Number(e.target.value))}
                          className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#1E4331] bg-[#E2EBE5] rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#E2EBE5] bg-white p-4 text-xs leading-relaxed text-[#2E694D] shadow-sm">
                <span className="font-semibold text-[#15271E]">§ Nota de Conformidade:</span> Os
                cálculos adotam os marcos legais vigentes da LC 214/2025. Alíquotas oficiais
                estimadas em 9,21% para CBS e 18,70% para IBS.
              </div>
            </div>
          ) : (
            /* Coluna lateral resumida no modo guiada */
            <div className="space-y-6 lg:col-span-4">
              <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Parâmetros em Vigor
                  </span>
                  <span className="text-xs text-[#1E4331] font-mono font-bold">
                    § Consulta Ativa
                  </span>
                </div>

                <div className="mt-4 space-y-3.5 text-xs">
                  <div>
                    <span className="text-[11px] text-[#5A7567]">Atividade Agro:</span>
                    <p className="font-semibold text-[#15271E] mt-0.5">
                      {SETORES_PRESETS[setorKey].nome}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-[#E2EBE5] pt-2.5">
                    <div>
                      <span className="text-[11px] text-[#5A7567]">Receita Anual:</span>
                      <p className="font-mono font-bold text-[#1E4331] mt-0.5">
                        {formatarBRL(receitaBruta)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5A7567]">Compras / Insumos:</span>
                      <p className="font-mono text-[#15271E] mt-0.5">
                        {formatarBRL(comprasInsumos)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-[#E2EBE5] pt-2.5">
                    <div>
                      <span className="text-[11px] text-[#5A7567]">Regime Atual:</span>
                      <p className="font-medium text-[#15271E] mt-0.5">
                        {regime === 'lucro_real'
                          ? 'Lucro Real'
                          : regime === 'lucro_presumido'
                            ? 'Lucro Presumido'
                            : 'Simples Nacional'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#5A7567]">Redutor LC 214:</span>
                      <p className="font-mono text-[#1E4331] font-bold mt-0.5">
                        {redutorCbsIbs}% de desconto
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E2EBE5] pt-2.5">
                    <span className="text-[11px] text-[#5A7567]">Crédito Presumido Rural:</span>
                    <p className="font-medium text-[#15271E] mt-0.5">
                      {temCreditoPresumidoAgro
                        ? `Ativo (${aliquotaCreditoPresumido}% sobre insumos)`
                        : 'Não aplicável'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModoUso('tecnico')}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#1E4331] bg-[#F4F7F4] py-2 text-xs font-semibold text-[#1E4331] hover:bg-[#EBF0EC] transition-colors"
                >
                  <SlidersHorizontal size={13} />
                  <span>Editar no Formulário Técnico</span>
                </button>
              </div>

              <div className="rounded-xl border border-[#E2EBE5] bg-white p-4 text-xs leading-relaxed text-[#5A7567] shadow-sm">
                <strong className="text-[#1E4331] block mb-1">§ Roteiro de Atendimento:</strong>
                Apresente ao cliente os cards comparativos ao lado e o gráfico da trajetória até
                2033. Mostre como a concessão do redutor de 60% e os créditos integrais de insumos
                impactam a carga final da operação.
              </div>
            </div>
          )}

          {/* COLUNA DIREITA: RESULTADOS VISUAIS, GRÁFICOS E COMPARATIVOS */}
          <div className={`space-y-8 ${modoUso === 'tecnico' ? 'lg:col-span-7' : 'lg:col-span-8'}`}>
            {/* CARDS-RESUMO */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#784D34]">
                  Sistema Atual (2025)
                </span>
                <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#15271E]">
                  {formatarBRL(resultado.impactoFinal2033.valorAtual)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#E2EBE5] pt-2 text-xs">
                  <span className="text-[#5A7567]">Carga Efetiva:</span>
                  <span className="font-mono text-[#1E4331] font-bold">
                    {resultado.impactoFinal2033.cargaAtual.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl border border-[#1E4331]/30 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1E4331]">
                  Novo Sistema (2033)
                </span>
                <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#1E4331]">
                  {formatarBRL(resultado.impactoFinal2033.valor2033)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#E2EBE5] pt-2 text-xs">
                  <span className="text-[#5A7567]">Carga Efetiva:</span>
                  <span className="font-mono text-[#1E4331] font-bold">
                    {resultado.impactoFinal2033.carga2033.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div
                className={`relative rounded-2xl border p-5 shadow-sm ${
                  resultado.impactoFinal2033.economiaOuAumento === 'economia'
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-[#E2EBE5] bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#15271E]">
                    Variação Projetada
                  </span>
                  {resultado.impactoFinal2033.economiaOuAumento === 'economia' ? (
                    <TrendingDown size={16} className="text-emerald-700" />
                  ) : (
                    <TrendingUp size={16} className="text-amber-700" />
                  )}
                </div>

                <p
                  className={`mt-2 font-serif text-2xl font-bold tracking-tight ${
                    resultado.impactoFinal2033.economiaOuAumento === 'economia'
                      ? 'text-emerald-800'
                      : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                        ? 'text-amber-800'
                        : 'text-[#15271E]'
                  }`}
                >
                  {resultado.impactoFinal2033.diferencaValor > 0 ? '+' : ''}
                  {formatarBRL(resultado.impactoFinal2033.diferencaValor)}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-[#E2EBE5] pt-2 text-xs">
                  <span className="text-[#5A7567]">Impacto p.p.:</span>
                  <span
                    className={`font-mono font-bold ${
                      resultado.impactoFinal2033.diferencaPP < 0
                        ? 'text-emerald-800'
                        : 'text-amber-800'
                    }`}
                  >
                    {resultado.impactoFinal2033.diferencaPP > 0 ? '+' : ''}
                    {resultado.impactoFinal2033.diferencaPP.toFixed(2)} p.p.
                  </span>
                </div>
              </div>
            </div>

            {/* GRÁFICO RECHARTS: EVOLUÇÃO ANO A ANO 2025–2033 */}
            <div className="rounded-2xl border border-[#E2EBE5] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2EBE5] pb-4">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Projeção Gráfica 2025–2033
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#15271E]">
                    Trajetória da Carga Tributária Anual (R$)
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-stone-400" />
                    <span className="text-[#5A7567]">Sistema Antigo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#1E4331]" />
                    <span className="text-[#1E4331] font-semibold">Novo Sistema</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosGrafico}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="corNovoAgro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E4331" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1E4331" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="corAtualAgro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#784D34" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#784D34" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2EBE5" />
                    <XAxis dataKey="ano" stroke="#5A7567" fontSize={11} />
                    <YAxis
                      stroke="#5A7567"
                      fontSize={11}
                      tickFormatter={(value: number) => `R$ ${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#1E4331',
                        borderRadius: '8px',
                        color: '#15271E',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(30,67,49,0.1)',
                      }}
                      formatter={(val: unknown) => [formatarBRL(Number(val) || 0), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="Sistema Atual"
                      stroke="#784D34"
                      fillOpacity={1}
                      fill="url(#corAtualAgro)"
                      name="Sistema Vigente (Decrescente)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Novo Sistema"
                      stroke="#1E4331"
                      fillOpacity={1}
                      fill="url(#corNovoAgro)"
                      name="Novo Sistema (CBS + IBS)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-3 text-xs text-[#1E4331]">
                <Scale size={18} className="text-[#1E4331] shrink-0" />
                <div>
                  <span className="font-bold text-[#15271E]">Momento de Virada Legal: </span>
                  {resultado.anoVirada ? (
                    <span>
                      A transição ganha tração decisiva a partir do exercício de{' '}
                      <strong className="text-[#1E4331]">{resultado.anoVirada}</strong>, com a
                      extinção gradual de créditos antigos e a substituição pelos débitos da CBS e
                      do IBS.
                    </span>
                  ) : (
                    <span>
                      A carga permanece linear ao longo do período em virtude das compensações de
                      crédito.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TABELA DETALHADA ANO A ANO */}
            <div className="rounded-2xl border border-[#E2EBE5] bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Quadro Comparativo Anual
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#15271E]">
                    Demonstrativo da Transição 2025 a 2033
                  </h3>
                </div>
                <span className="text-[11px] text-[#5A7567] font-mono">LC 214/2025</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2EBE5] text-[#5A7567]">
                      <th className="py-2.5 px-2 font-semibold">Ano</th>
                      <th className="py-2.5 px-2 font-semibold">Fase Legal</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Sistema Vigente</th>
                      <th className="py-2.5 px-2 font-semibold text-right">CBS + IBS</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Total a Recolher</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Carga Efetiva</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Diferença vs 2025</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EBE5]">
                    {resultado.projecoes.map((p) => {
                      const selecionado = p.ano === anoDetalhado
                      return (
                        <tr
                          key={p.ano}
                          onClick={() => setAnoDetalhado(p.ano)}
                          className={`cursor-pointer transition-colors ${
                            selecionado
                              ? 'bg-[#EBF0EC] text-[#15271E] font-medium'
                              : 'hover:bg-[#F8FAF8] text-[#425A4E]'
                          }`}
                        >
                          <td className="py-3 px-2 font-mono font-bold text-[#1E4331] whitespace-nowrap">
                            {p.ano}
                            {p.ano === 2026 && (
                              <span className="ml-1.5 rounded-full bg-[#E2EBE5] px-1.5 py-0.5 text-[9px] text-[#1E4331] font-semibold">
                                Teste
                              </span>
                            )}
                          </td>
                          <td
                            className="py-3 px-2 text-[11px] max-w-[170px] truncate"
                            title={p.descricaoLegal}
                          >
                            {p.fase}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-[#5A7567]">
                            {formatarBRL(p.totalAtual)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-[#1E4331]">
                            {formatarBRL(p.totalNovoSistema)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-semibold text-[#15271E]">
                            {formatarBRL(p.totalEfetivoAno)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono">
                            {p.cargaEfetivaTotalAno.toFixed(2)}%
                          </td>
                          <td
                            className={`py-3 px-2 text-right font-mono font-medium ${
                              p.diferencaValor < -100
                                ? 'text-emerald-700 font-bold'
                                : p.diferencaValor > 100
                                  ? 'text-amber-700 font-bold'
                                  : 'text-[#5A7567]'
                            }`}
                          >
                            {p.diferencaValor > 0 ? '+' : ''}
                            {formatarBRL(p.diferencaValor)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-[#5A7567] border-t border-[#E2EBE5] pt-3">
                <span>
                  * Clique em uma linha da tabela para abrir o desdobramento do exercício.
                </span>
                <span>
                  Exibindo exercício de: <strong className="text-[#1E4331]">{anoDetalhado}</strong>
                </span>
              </div>
            </div>

            {/* BREAKDOWN DETALHADO DO ANO SELECIONADO */}
            <div className="rounded-2xl border border-[#E2EBE5] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2EBE5] pb-3">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#784D34] uppercase">
                    Desdobramento por Tributo · Exercício {projecaoSelecionada.ano}
                  </span>
                  <h4 className="font-serif text-base font-semibold text-[#15271E]">
                    {projecaoSelecionada.fase}
                  </h4>
                </div>
                <span className="text-xs text-[#1E4331] font-mono font-semibold">
                  {projecaoSelecionada.artigoLegal}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#5A7567]">
                {projecaoSelecionada.descricaoLegal}
              </p>

              {projecaoSelecionada.notaEspecial && (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900">
                  ⚠️ <strong>Regra Especial do Ano-Teste (Art. 348, LC 214/2025):</strong>{' '}
                  {projecaoSelecionada.notaEspecial}.
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-4 text-xs">
                  <p className="font-semibold text-[#1E4331] uppercase tracking-wider text-[11px] border-b border-[#E2EBE5] pb-2">
                    Novo Sistema (CBS + IBS)
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">
                        CBS Líquida (Ref. {projecaoSelecionada.cbsAliquotaNominal}% com redutor):
                      </span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.cbsLiquida)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">
                        IBS Líquido (Ref. {projecaoSelecionada.ibsAliquotaNominal.toFixed(2)}% com
                        redutor):
                      </span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.ibsLiquida)}
                      </span>
                    </div>
                    {projecaoSelecionada.creditoPresumidoAgro > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Crédito Presumido Agro (Dedução):</span>
                        <span className="font-mono">
                          - {formatarBRL(projecaoSelecionada.creditoPresumidoAgro)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#E2EBE5] pt-2 font-bold text-[#1E4331]">
                      <span>Total Novo Sistema:</span>
                      <span className="font-mono">
                        {formatarBRL(projecaoSelecionada.totalNovoSistema)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-4 text-xs">
                  <p className="font-semibold text-[#784D34] uppercase tracking-wider text-[11px] border-b border-[#E2EBE5] pb-2">
                    Sistema Atual Remanescente no Ano
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">PIS Efetivo:</span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.pisEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">COFINS Efetivo:</span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.cofinsEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">
                        ICMS ({Math.round(projecaoSelecionada.fatorTransicaoAtualIcmsIss * 100)}% da
                        base):
                      </span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.icmsEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5A7567]">
                        ISS ({Math.round(projecaoSelecionada.fatorTransicaoAtualIcmsIss * 100)}% da
                        base):
                      </span>
                      <span className="font-mono text-[#15271E]">
                        {formatarBRL(projecaoSelecionada.issEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#E2EBE5] pt-2 font-bold text-[#15271E]">
                      <span>Total Atual Remanescente:</span>
                      <span className="font-mono">
                        {formatarBRL(projecaoSelecionada.totalAtual)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRONOGRAMA INSTITUCIONAL DA REFORMA 2025–2033 */}
      <section className="border-t border-[#E2EBE5] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#784D34]">
              <Calendar size={14} />
              <span>Cronograma Institucional · LC 214/2025</span>
            </span>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#15271E] sm:text-4xl">
              Os Marcos Jurídicos da Transição Tributária
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#425A4E]">
              Linha do tempo oficial estabelecida pela Emenda Constitucional nº 132/2023 e
              regulamentada pela Lei Complementar nº 214/2025, com aplicação direta aos produtores,
              cooperativas e agroindústrias brasileiras.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {CRONOGRAMA_EVENTOS.map((evento, idx) => (
              <div
                key={evento.ano}
                className="relative rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-5 shadow-sm transition-all duration-300 hover:border-[#1E4331]/50 hover:-translate-y-1 hover:bg-white"
              >
                <span className="absolute top-4 right-4 font-serif text-[11px] font-semibold text-[#CBB29E]">
                  {['I', 'II', 'III', 'IV', 'V'][idx]}
                </span>

                <div className="font-mono text-xl font-bold text-[#1E4331]">{evento.ano}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#784D34]">
                  {evento.fase}
                </div>
                <div className="mt-2 text-[10px] font-mono text-[#5A7567]">{evento.artigo}</div>
                <p className="mt-3 text-xs leading-relaxed text-[#425A4E]">{evento.resumo}</p>

                <div className="mt-4 inline-block rounded-full border border-[#E2EBE5] bg-white px-2.5 py-0.5 text-[10px] font-mono text-[#1E4331] font-semibold">
                  {evento.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVISO LEGAL OBRIGATÓRIO & CONSULTORIA */}
      <section className="border-t border-[#E2EBE5] bg-[#F4F7F4] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-[#E2EBE5] bg-white p-8 sm:p-12 shadow-sm">
            <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-[#784D34]" />
            <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-[#784D34]" />
            <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#784D34]" />
            <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#784D34]" />

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#784D34]">
                  <Scale size={14} />
                  <span>Moura e Medeiros Advogados Associados</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-[#15271E] sm:text-3xl">
                  Precisa de um Diagnóstico Tributário Individualizado para sua Operação?
                </h3>
                <p className="mt-4 text-xs leading-relaxed text-[#425A4E] sm:text-sm">
                  Esta calculadora é uma ferramenta demonstrativa e educativa para modelagem de
                  cenários. Cada cadeia do agronegócio possui particularidades contratuais, regimes
                  de crédito presumido, diferimento estadual de ICMS e estruturas societárias que
                  exigem avaliação jurídica pormenorizada.
                </p>

                <div className="mt-6 rounded-xl border border-[#E2EBE5] bg-[#F8FAF8] p-4 text-[11px] leading-relaxed text-[#2E694D]">
                  <strong className="text-[#15271E]">§ Aviso Legal Obrigatório:</strong> As
                  projeções apresentadas constituem simulação estimativa para fins de estudos e não
                  configuram parecer jurídico, consultoria formal ou garantia de resultado
                  tributário. O escritório Moura e Medeiros Advogados Associados disponibiliza
                  consultoria técnica estratégica para adequação de contratos, sistemas e
                  planejamento sucessório rural à LC 214/2025.
                </div>
              </div>

              <div className="flex flex-col items-start lg:items-end justify-center gap-4">
                <Link
                  to="/diagnostico"
                  className="group relative inline-flex items-center gap-3 rounded-lg border border-[#1E4331] bg-[#1E4331] px-7 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-[#15271E] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
                >
                  <PhoneCall size={16} />
                  <span>Solicitar Diagnóstico Estratégico</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#5A7567]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1E4331]" />
                  <span>Atendimento a produtores e agroindústrias em todo o Brasil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
