import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Scale,
  Award,
  ChevronDown,
  ChevronUp,
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
  formatarBRLCentavos,
  formatarPercentual,
} from '@/lib/tributario-engine'

const CRONOGRAMA_EVENTOS = [
  {
    ano: '2025',
    fase: 'Vigência do Regime Vigente',
    artigo: 'Sistema Tributário Nacional (CF/88)',
    resumo:
      'PIS (1,65%), COFINS (7,60%), ICMS estadual, ISS municipal e IPI vigentes em sua totalidade. Planejamento tributário pré-reforma.',
    tag: 'Baseline',
    cor: 'border-[#C9A227]/40',
  },
  {
    ano: '2026',
    fase: 'Ano-Teste Operacional Piloto',
    artigo: 'Art. 348, § 1º, LC 214/2025',
    resumo:
      'Cobrança-teste de CBS a 0,90% e IBS a 0,10%. O recolhimento é 100% compensável com o PIS/COFINS devido no período, sem ônus financeiro real aos contribuintes com obrigações regulares.',
    tag: 'CBS 0,9% · IBS 0,1%',
    cor: 'border-[#DCBF6F]',
  },
  {
    ano: '2027–2028',
    fase: 'CBS Plena & Extinção PIS/COFINS',
    artigo: 'Art. 349, LC 214/2025',
    resumo:
      'Extinção de PIS e COFINS; IPI zerado (ressalvada ZFM); CBS entra com alíquota cheia (~9,21%). IBS permanece a 0,10%. Imposto Seletivo entra em vigor. ICMS e ISS continuam plenos.',
    tag: 'CBS Plena · PIS/COFINS Extintos',
    cor: 'border-[#C9A227]',
  },
  {
    ano: '2029–2032',
    fase: 'Transição Gradual ICMS/ISS → IBS',
    artigo: 'Art. 350, LC 214/2025',
    resumo:
      'Gradual substituição dos tributos estaduais e municipais: 2029 (IBS 10%, ICMS/ISS 90%), 2030 (IBS 20%, ICMS/ISS 80%), 2031 (IBS 30%, ICMS/ISS 70%), 2032 (IBS 40%, ICMS/ISS 60%).',
    tag: 'Escalonamento Subnacional',
    cor: 'border-[#DCBF6F]/70',
  },
  {
    ano: '2033',
    fase: 'Vigência Plena da Reforma',
    artigo: 'Art. 351, LC 214/2025 & Art. 156-A CF',
    resumo:
      'Extinção total do ICMS e do ISS. Modelo dual pleno: CBS da União + IBS dos Estados e Municípios operando em sistema digital de split payment e não-cumulatividade irrestrita.',
    tag: 'IVA Dual Definitivo',
    cor: 'border-[#E7D397]',
  },
]

export default function CalculadoraTributaria() {
  // Preset inicial
  const presetPadrao = SETORES_PRESETS.soja_graos

  // Estado dos Parâmetros
  const [receitaBruta, setReceitaBruta] = useState<number>(30000000) // R$ 30 milhões (porte agro típico)
  const [comprasInsumos, setComprasInsumos] = useState<number>(18000000) // R$ 18 milhões (60%)
  const [regime, setRegime] = useState<RegimeTributario>('lucro_real')
  const [setorKey, setSetorKey] = useState<SetorPresetKey>('soja_graos')

  // Alíquotas atuais
  const [aliquotaPis, setAliquotaPis] = useState<number>(presetPadrao.pisPadrao)
  const [aliquotaCofins, setAliquotaCofins] = useState<number>(presetPadrao.cofinsPadrao)
  const [aliquotaIcms, setAliquotaIcms] = useState<number>(presetPadrao.icmsPadrao)
  const [aliquotaIss, setAliquotaIss] = useState<number>(presetPadrao.issPadrao)
  const [aliquotaIpi, setAliquotaIpi] = useState<number>(presetPadrao.ipiPadrao)
  const [aliquotaDas, setAliquotaDas] = useState<number>(11.5)
  const [aproveitamentoCreditoAtual, setAproveitamentoCreditoAtual] = useState<number>(85)

  // Reforma Tributária (LC 214/2025)
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
  const [impostoSeletivoAliquota, setImpostoSeletivoAliquota] = useState<number>(0)

  // Toggle do modo avançado de edição de alíquotas
  const [mostrarParametrosAvancados, setMostrarParametrosAvancados] = useState<boolean>(false)
  const [anoDetalhado, setAnoDetalhado] = useState<number>(2033)

  // Aplicação do preset de setor
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
    // Ajustar insumos proporcionalmente à receita se o usuário ainda não editou radicalmente
    if (receitaBruta > 0) {
      setComprasInsumos(Math.round((receitaBruta * p.baseInsumosPercentual) / 100))
    }
  }

  // Objeto de parâmetros completo
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

  // Execução do cálculo
  const resultado = useMemo(() => calcularTransicaoTributaria(params), [params])

  // Dados para o gráfico Recharts
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
    <div className="bg-[#0A0A0A] text-[#F5F1E8]">
      {/* HEADER HERO DA CALCULADORA TRIBUTÁRIA */}
      <section className="relative overflow-hidden border-b border-[#C9A227]/20 bg-gradient-to-b from-[#12110D] via-[#0D0D0D] to-[#0A0A0A] py-14 sm:py-20">
        {/* Glow dourado de fundo */}
        <div className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-[#C9A227]/10 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -left-20 h-[300px] w-[300px] rounded-full bg-[#8E6F16]/10 blur-[110px]" />

        {/* Linhas finas de grade de segurança jurídica */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#C9A227 1px, transparent 1px), linear-gradient(to right, #C9A227 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#C9A227] uppercase transition hover:text-[#FAF3E8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227]"
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
              <div className="inline-flex items-center gap-2.5 rounded border border-[#C9A227]/35 bg-[#17150E] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#DCBF6F]">
                <Scale size={14} className="text-[#C9A227]" />
                <span>Simulador Estratégico · LC 214/2025</span>
              </div>

              <h1 className="mt-4 font-serif text-3xl font-normal leading-[1.15] tracking-tight text-[#FAF3E8] sm:text-5xl lg:text-[3.25rem]">
                Calculadora da Transição Tributária{' '}
                <span className="italic font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FAF3E8] via-[#DCBF6F] to-[#C9A227]">
                  2025–2033.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-[#C4BBAE] sm:text-base">
                Projeção jurídica e financeira do impacto da Reforma Tributária (CBS, IBS e Imposto
                Seletivo) em comparação ao modelo tributário atual (PIS, COFINS, ICMS, ISS e IPI),
                com as regras específicas do Agronegócio previstas na Lei Complementar nº 214/2025.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-[#9E9585]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                  <span>Redução setorial agro de 60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                  <span>Crédito presumido de insumos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
                  <span>Escalonamento 2026–2033</span>
                </div>
              </div>
            </div>

            {/* Selo Jurídico de Placa de Prestígio */}
            <div className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#161510] to-[#0E0E0E] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(201,162,39,0.2)]">
              {/* Cantoneiras douradas clássicas */}
              <div className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#C9A227]/70" />
              <div className="absolute top-2 right-2 h-3 w-3 border-t border-r border-[#C9A227]/70" />
              <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#C9A227]/70" />
              <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#C9A227]/70" />

              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-4">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                    Moura e Medeiros
                  </span>
                  <h2 className="font-serif text-lg font-semibold text-[#FAF3E8]">
                    Parecer Preliminar Sintético
                  </h2>
                </div>
                <Award size={24} className="text-[#DCBF6F]" />
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#9E9585]">Ano de Virada Legal:</span>
                  <span className="font-mono font-bold text-[#DCBF6F]">
                    {resultado.anoVirada
                      ? `Exercício de ${resultado.anoVirada}`
                      : 'Equilíbrio Contínuo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9E9585]">Carga Efetiva Atual:</span>
                  <span className="font-mono text-[#FAF3E8]">
                    {resultado.impactoFinal2033.cargaAtual.toFixed(2)}% da receita
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9E9585]">Carga no Sistema 2033:</span>
                  <span className="font-mono text-[#FAF3E8]">
                    {resultado.impactoFinal2033.carga2033.toFixed(2)}% da receita
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#252525] pt-3">
                  <span className="text-[#C9A227] font-semibold">Impacto Final (2033):</span>
                  <span
                    className={`font-mono font-bold ${
                      resultado.impactoFinal2033.economiaOuAumento === 'economia'
                        ? 'text-emerald-400'
                        : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                          ? 'text-amber-400'
                          : 'text-[#FAF3E8]'
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

      {/* ÁREA PRINCIPAL: FORMULÁRIO JURÍDICO + RESULTADOS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* COLUNA ESQUERDA: PARÂMETROS E FORMULÁRIO (ESTÉTICA DE ARTIGO JURÍDICO I, II, III) */}
          <div className="space-y-8 lg:col-span-5">
            {/* Presets de Setor com Ênfase Agro */}
            <div className="rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                  Art. 1º · Segmento de Atividade
                </span>
                <span className="text-xs text-[#7A7366]">§ Presets Agro</span>
              </div>
              <p className="mt-3 text-xs text-[#B8AF9F]">
                Selecione um segmento para carregar automaticamente o redutor legal de 60% da LC
                214/2025 e as alíquotas típicas da cadeia produtiva:
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.keys(SETORES_PRESETS) as SetorPresetKey[]).map((chave) => {
                  const s = SETORES_PRESETS[chave]
                  const ativo = setorKey === chave
                  return (
                    <button
                      key={chave}
                      type="button"
                      onClick={() => aplicarPreset(chave)}
                      className={`text-left rounded border px-3 py-2.5 text-xs transition-all duration-200 ${
                        ativo
                          ? 'border-[#DCBF6F] bg-[#1E1B12] text-[#FAF3E8] shadow-[0_0_12px_rgba(201,162,39,0.25)] font-semibold'
                          : 'border-[#C9A227]/20 bg-[#121212] text-[#9E9585] hover:border-[#C9A227]/50 hover:text-[#DCBF6F]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{s.nome}</span>
                        {s.redutorCbsIbs > 0 && (
                          <span className="ml-1 text-[10px] text-[#DCBF6F] font-mono">
                            -{s.redutorCbsIbs}%
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-[11px] italic text-[#7A7366]">
                {SETORES_PRESETS[setorKey].descricao}
              </p>
            </div>

            {/* SEÇÃO I: FATURAMENTO & DESPESAS COM INSUMOS */}
            <div className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm">
              {/* Cantoneira discreta */}
              <div className="absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-[#C9A227]/40" />

              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                  Capítulo I · Base Operacional
                </span>
                <span className="font-mono text-xs text-[#DCBF6F]">§ 1º a § 3º</span>
              </div>

              <div className="mt-5 space-y-5">
                {/* Receita Bruta Anual */}
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="receita-bruta" className="font-semibold text-[#FAF3E8]">
                      Receita Bruta Anual de Saídas (R$)
                    </label>
                    <span className="font-mono text-[#DCBF6F] font-medium">
                      {formatarBRL(receitaBruta)}
                    </span>
                  </div>
                  <input
                    id="receita-bruta"
                    type="range"
                    min={1000000}
                    max={200000000}
                    step={500000}
                    value={receitaBruta}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setReceitaBruta(val)
                      // manter proporção do setor caso compras não excedam receita
                      if (comprasInsumos > val) {
                        setComprasInsumos(Math.round(val * 0.6))
                      }
                    }}
                    className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#C9A227] bg-[#222]"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#7A7366]">R$ 1 milhão</span>
                    <input
                      type="number"
                      aria-label="Digitar receita bruta anual"
                      value={receitaBruta}
                      onChange={(e) => setReceitaBruta(Math.max(0, Number(e.target.value)))}
                      className="w-36 rounded border border-[#C9A227]/30 bg-[#0C0C0C] px-2 py-1 text-right font-mono text-xs text-[#FAF3E8] focus:border-[#C9A227] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#7A7366]">R$ 200 milhões</span>
                  </div>
                </div>

                {/* Compras de Insumos / Base de Créditos */}
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="compras-insumos" className="font-semibold text-[#FAF3E8]">
                      Compras &amp; Insumos Anuais (Base de Crédito R$)
                    </label>
                    <span className="font-mono text-[#DCBF6F] font-medium">
                      {formatarBRL(comprasInsumos)}
                      <span className="text-[10px] text-[#9E9585] ml-1">
                        ({receitaBruta > 0 ? ((comprasInsumos / receitaBruta) * 100).toFixed(0) : 0}
                        %)
                      </span>
                    </span>
                  </div>
                  <input
                    id="compras-insumos"
                    type="range"
                    min={0}
                    max={receitaBruta}
                    step={250000}
                    value={comprasInsumos}
                    onChange={(e) => setComprasInsumos(Number(e.target.value))}
                    className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#C9A227] bg-[#222]"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#7A7366]">R$ 0</span>
                    <input
                      type="number"
                      aria-label="Digitar compras e insumos anuais"
                      value={comprasInsumos}
                      onChange={(e) => setComprasInsumos(Math.max(0, Number(e.target.value)))}
                      className="w-36 rounded border border-[#C9A227]/30 bg-[#0C0C0C] px-2 py-1 text-right font-mono text-xs text-[#FAF3E8] focus:border-[#C9A227] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#7A7366]">100% da receita</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7A7366]">
                    * Insumos com incidência de IVA geram créditos integrais no novo sistema
                    (não-cumulatividade plena).
                  </p>
                </div>

                {/* Regime Tributário Atual */}
                <div>
                  <span className="block text-xs font-semibold text-[#FAF3E8]">
                    Regime Tributário Atual Vigente
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: 'lucro_real', label: 'Lucro Real', sub: 'Não-cumulativo' },
                      { id: 'lucro_presumido', label: 'Presumido', sub: 'Cumulativo' },
                      { id: 'simples_nacional', label: 'Simples', sub: 'DAS Unificado' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRegime(item.id as RegimeTributario)}
                        className={`rounded border p-2 text-center text-xs transition-all ${
                          regime === item.id
                            ? 'border-[#DCBF6F] bg-[#1E1B12] text-[#DCBF6F] font-bold shadow-[0_0_10px_rgba(201,162,39,0.2)]'
                            : 'border-[#C9A227]/20 bg-[#101010] text-[#8E8779] hover:text-[#FAF3E8]'
                        }`}
                      >
                        <span className="block">{item.label}</span>
                        <span className="block text-[9px] text-[#7A7366] font-normal">
                          {item.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO II: PARÂMETROS DA REFORMA TRIBUTÁRIA (LC 214/2025) */}
            <div className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                  Capítulo II · Parâmetros da LC 214/2025
                </span>
                <span className="font-mono text-xs text-[#DCBF6F]">§ 4º e seguintes</span>
              </div>

              <div className="mt-5 space-y-4">
                {/* Redutor Setorial CBS/IBS */}
                <div>
                  <label
                    htmlFor="redutor-cbs-ibs"
                    className="block text-xs font-semibold text-[#FAF3E8]"
                  >
                    Redutor de Alíquota Setorial CBS &amp; IBS
                  </label>
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
                        className={`rounded border py-2 px-1 text-center text-xs transition-all ${
                          redutorCbsIbs === item.valor
                            ? 'border-[#DCBF6F] bg-[#1E1B12] text-[#DCBF6F] font-bold shadow-[0_0_8px_rgba(201,162,39,0.2)]'
                            : 'border-[#C9A227]/20 bg-[#101010] text-[#8E8779] hover:text-[#FAF3E8]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#7A7366]">
                    A LC 214/2025 prevê desconto de 60% para produtos agropecuários in natura,
                    sementes e insumos essenciais.
                  </p>
                </div>

                {/* Crédito Presumido do Produtor Rural */}
                <div className="rounded border border-[#C9A227]/20 bg-[#101010] p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF3E8]">
                        Crédito Presumido Agropecuário
                      </span>
                      <span className="block text-[10px] text-[#9E9585]">
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
                      <div className="h-5 w-9 rounded-full bg-[#252525] after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 rounded-full after:bg-[#8E8779] after:transition-all peer-checked:bg-[#C9A227] peer-checked:after:translate-x-full peer-checked:after:bg-[#0A0A0A]" />
                    </label>
                  </div>
                  {temCreditoPresumidoAgro && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#252525] pt-2.5">
                      <label
                        htmlFor="aliq-credito-presumido"
                        className="text-[11px] text-[#C4BBAE]"
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
                          className="w-16 rounded border border-[#C9A227]/30 bg-[#0C0C0C] px-2 py-0.5 text-right font-mono text-xs text-[#FAF3E8]"
                        />
                        <span className="text-xs text-[#DCBF6F]">%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Toggle para Parâmetros Avançados */}
                <button
                  type="button"
                  onClick={() => setMostrarParametrosAvancados(!mostrarParametrosAvancados)}
                  className="flex w-full items-center justify-between rounded border border-[#C9A227]/25 bg-[#121212] px-3.5 py-2.5 text-xs font-semibold text-[#DCBF6F] hover:bg-[#181611] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} />
                    <span>Ajustar Alíquotas Individuais de Referência</span>
                  </span>
                  {mostrarParametrosAvancados ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {mostrarParametrosAvancados && (
                  <div className="space-y-3.5 rounded border border-[#C9A227]/25 bg-[#0C0C0C] p-4 text-xs animate-fade-in">
                    <p className="text-[11px] font-semibold text-[#DCBF6F] uppercase tracking-wider">
                      Alíquotas de Referência Governamentais
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="cbs-ref" className="text-[11px] text-[#A39985]">
                          CBS Federal de Ref. (%)
                        </label>
                        <input
                          id="cbs-ref"
                          type="number"
                          step={0.01}
                          value={aliquotaCbsRef}
                          onChange={(e) => setAliquotaCbsRef(Number(e.target.value))}
                          className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                        />
                      </div>
                      <div>
                        <label htmlFor="ibs-ref" className="text-[11px] text-[#A39985]">
                          IBS Subnacional de Ref. (%)
                        </label>
                        <input
                          id="ibs-ref"
                          type="number"
                          step={0.01}
                          value={aliquotaIbsRef}
                          onChange={(e) => setAliquotaIbsRef(Number(e.target.value))}
                          className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#222] pt-3">
                      <p className="text-[11px] font-semibold text-[#DCBF6F] uppercase tracking-wider">
                        Alíquotas do Sistema Atual em Edição
                      </p>
                      {regime === 'simples_nacional' ? (
                        <div className="mt-2">
                          <label htmlFor="das-efetivo" className="text-[11px] text-[#A39985]">
                            Alíquota Efetiva do DAS (%)
                          </label>
                          <input
                            id="das-efetivo"
                            type="number"
                            step={0.1}
                            value={aliquotaDas}
                            onChange={(e) => setAliquotaDas(Number(e.target.value))}
                            className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <div>
                            <label htmlFor="aliq-pis" className="text-[10px] text-[#A39985]">
                              PIS (%)
                            </label>
                            <input
                              id="aliq-pis"
                              type="number"
                              step={0.05}
                              value={aliquotaPis}
                              onChange={(e) => setAliquotaPis(Number(e.target.value))}
                              className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                            />
                          </div>
                          <div>
                            <label htmlFor="aliq-cofins" className="text-[10px] text-[#A39985]">
                              COFINS (%)
                            </label>
                            <input
                              id="aliq-cofins"
                              type="number"
                              step={0.1}
                              value={aliquotaCofins}
                              onChange={(e) => setAliquotaCofins(Number(e.target.value))}
                              className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                            />
                          </div>
                          <div>
                            <label htmlFor="aliq-icms" className="text-[10px] text-[#A39985]">
                              ICMS (%)
                            </label>
                            <input
                              id="aliq-icms"
                              type="number"
                              step={0.5}
                              value={aliquotaIcms}
                              onChange={(e) => setAliquotaIcms(Number(e.target.value))}
                              className="mt-1 w-full rounded border border-[#C9A227]/30 bg-[#161616] px-2 py-1 font-mono text-xs text-[#FAF3E8]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#222] pt-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="aprov-cred-novo" className="text-[11px] text-[#A39985]">
                          Aproveitamento de Créditos na Entrada (%)
                        </label>
                        <span className="font-mono text-xs text-[#DCBF6F]">
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
                        className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#C9A227] bg-[#222]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AVISO INSTITUCIONAL RÁPIDO */}
            <div className="rounded border border-[#C9A227]/20 bg-[#12110D] p-4 text-xs leading-relaxed text-[#A39985]">
              <span className="font-semibold text-[#DCBF6F]">§ Nota de Conformidade:</span> Os
              cálculos adotam os marcos legais vigentes da LC 214/2025. Alíquotas de referência
              oficiais estimadas em 9,21% para CBS e 18,70% para IBS pelo Ministério da Fazenda.
            </div>
          </div>

          {/* COLUNA DIREITA: RESULTADOS VISUAIS, GRÁFICOS E COMPARATIVOS (7 COLUNAS) */}
          <div className="space-y-8 lg:col-span-7">
            {/* CARDS-RESUMO ESTILO PLACA JURÍDICA */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Card 1: Sistema Atual */}
              <div className="relative rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#161510] to-[#0E0E0E] p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  Sistema Atual (2025)
                </span>
                <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#FAF3E8]">
                  {formatarBRL(resultado.impactoFinal2033.valorAtual)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#252525] pt-2 text-xs">
                  <span className="text-[#8E8779]">Carga Efetiva:</span>
                  <span className="font-mono text-[#DCBF6F] font-bold">
                    {resultado.impactoFinal2033.cargaAtual.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Card 2: Sistema Pleno (2033) */}
              <div className="relative rounded-lg border border-[#C9A227]/40 bg-gradient-to-b from-[#1C1810] to-[#11100C] p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#DCBF6F]">
                  Novo Sistema (2033)
                </span>
                <p className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#FAF3E8]">
                  {formatarBRL(resultado.impactoFinal2033.valor2033)}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#252525] pt-2 text-xs">
                  <span className="text-[#8E8779]">Carga Efetiva:</span>
                  <span className="font-mono text-[#DCBF6F] font-bold">
                    {resultado.impactoFinal2033.carga2033.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Card 3: Variação Líquida */}
              <div
                className={`relative rounded-lg border p-5 shadow-sm ${
                  resultado.impactoFinal2033.economiaOuAumento === 'economia'
                    ? 'border-emerald-600/40 bg-gradient-to-b from-[#0F1A14] to-[#0A100C]'
                    : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                      ? 'border-amber-600/40 bg-gradient-to-b from-[#1C150C] to-[#120E08]'
                      : 'border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAF3E8]">
                    Variação Projetada
                  </span>
                  {resultado.impactoFinal2033.economiaOuAumento === 'economia' ? (
                    <TrendingDown size={16} className="text-emerald-400" />
                  ) : (
                    <TrendingUp size={16} className="text-amber-400" />
                  )}
                </div>

                <p
                  className={`mt-2 font-serif text-2xl font-bold tracking-tight ${
                    resultado.impactoFinal2033.economiaOuAumento === 'economia'
                      ? 'text-emerald-400'
                      : resultado.impactoFinal2033.economiaOuAumento === 'aumento'
                        ? 'text-amber-400'
                        : 'text-[#FAF3E8]'
                  }`}
                >
                  {resultado.impactoFinal2033.diferencaValor > 0 ? '+' : ''}
                  {formatarBRL(resultado.impactoFinal2033.diferencaValor)}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-[#252525] pt-2 text-xs">
                  <span className="text-[#8E8779]">Impacto p.p.:</span>
                  <span
                    className={`font-mono font-bold ${
                      resultado.impactoFinal2033.diferencaPP < 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {resultado.impactoFinal2033.diferencaPP > 0 ? '+' : ''}
                    {resultado.impactoFinal2033.diferencaPP.toFixed(2)} p.p.
                  </span>
                </div>
              </div>
            </div>

            {/* GRÁFICO RECHARTS: EVOLUÇÃO ANO A ANO 2025–2033 */}
            <div className="rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#C9A227]/20 pb-4">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                    Projeção Gráfica 2025–2033
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#FAF3E8]">
                    Trajetória da Carga Tributária Anual (R$)
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#8E8779]" />
                    <span className="text-[#8E8779]">Sistema Antigo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#C9A227]" />
                    <span className="text-[#DCBF6F]">Novo Sistema</span>
                  </div>
                </div>
              </div>

              {/* Contêiner do Gráfico Recharts */}
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosGrafico}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="corNovo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A227" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#C9A227" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="corAtual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#666666" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#666666" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="ano" stroke="#7A7366" fontSize={11} />
                    <YAxis
                      stroke="#7A7366"
                      fontSize={11}
                      tickFormatter={(value: number) => `R$ ${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#12110D',
                        borderColor: '#C9A227',
                        borderRadius: '6px',
                        color: '#FAF3E8',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                      }}
                      formatter={(val: unknown) => [formatarBRL(Number(val) || 0), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="Sistema Atual"
                      stroke="#8E8779"
                      fillOpacity={1}
                      fill="url(#corAtual)"
                      name="Sistema Vigente (Decrescente)"
                    />
                    <Area
                      type="monotone"
                      dataKey="Novo Sistema"
                      stroke="#C9A227"
                      fillOpacity={1}
                      fill="url(#corNovo)"
                      name="Novo Sistema (CBS + IBS)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Destaque do Momento de Virada */}
              <div className="mt-4 flex items-center gap-3 rounded border border-[#C9A227]/25 bg-[#12110D] p-3 text-xs text-[#DCBF6F]">
                <Scale size={18} className="text-[#C9A227] shrink-0" />
                <div>
                  <span className="font-bold text-[#FAF3E8]">Momento de Virada Legal: </span>
                  {resultado.anoVirada ? (
                    <span>
                      A transição ganha tração decisiva a partir do exercício de{' '}
                      <strong className="text-[#FAF3E8]">{resultado.anoVirada}</strong>, com a
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

            {/* TABELA DETALHADA ANO A ANO (2025–2033) */}
            <div className="rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                    Quadro Comparativo Anual
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-[#FAF3E8]">
                    Demonstrativo da Transição 2025 a 2033
                  </h3>
                </div>
                <span className="text-[11px] text-[#7A7366] font-mono">LC 214/2025</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#252525] text-[#9E9585]">
                      <th className="py-2.5 px-2 font-medium">Ano</th>
                      <th className="py-2.5 px-2 font-medium">Fase Legal</th>
                      <th className="py-2.5 px-2 font-medium text-right">Sistema Vigente</th>
                      <th className="py-2.5 px-2 font-medium text-right">CBS + IBS</th>
                      <th className="py-2.5 px-2 font-medium text-right">Total a Recolher</th>
                      <th className="py-2.5 px-2 font-medium text-right">Carga Efetiva</th>
                      <th className="py-2.5 px-2 font-medium text-right">Diferença vs 2025</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {resultado.projecoes.map((p) => {
                      const selecionado = p.ano === anoDetalhado
                      return (
                        <tr
                          key={p.ano}
                          onClick={() => setAnoDetalhado(p.ano)}
                          className={`cursor-pointer transition-colors ${
                            selecionado
                              ? 'bg-[#1D1A12] text-[#FAF3E8]'
                              : 'hover:bg-[#151515] text-[#C4BBAE]'
                          }`}
                        >
                          <td className="py-3 px-2 font-mono font-bold text-[#DCBF6F] whitespace-nowrap">
                            {p.ano}
                            {p.ano === 2026 && (
                              <span className="ml-1.5 rounded bg-[#C9A227]/20 px-1 py-0.5 text-[9px] text-[#DCBF6F]">
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
                          <td className="py-3 px-2 text-right font-mono text-[#8E8779]">
                            {formatarBRL(p.totalAtual)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-[#DCBF6F]">
                            {formatarBRL(p.totalNovoSistema)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-semibold text-[#FAF3E8]">
                            {formatarBRL(p.totalEfetivoAno)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono">
                            {p.cargaEfetivaTotalAno.toFixed(2)}%
                          </td>
                          <td
                            className={`py-3 px-2 text-right font-mono font-medium ${
                              p.diferencaValor < -100
                                ? 'text-emerald-400'
                                : p.diferencaValor > 100
                                  ? 'text-amber-400'
                                  : 'text-[#8E8779]'
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

              <div className="mt-4 flex items-center justify-between text-[11px] text-[#7A7366] border-t border-[#222] pt-3">
                <span>
                  * Clique em uma linha da tabela para abrir o desdobramento do exercício.
                </span>
                <span>
                  Exibindo exercício de: <strong className="text-[#DCBF6F]">{anoDetalhado}</strong>
                </span>
              </div>
            </div>

            {/* BREAKDOWN DETALHADO DO ANO SELECIONADO */}
            <div className="rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#C9A227]/20 pb-3">
                <div>
                  <span className="font-serif text-xs font-semibold tracking-widest text-[#C9A227] uppercase">
                    Desdobramento por Tributo · Exercício {projecaoSelecionada.ano}
                  </span>
                  <h4 className="font-serif text-base font-semibold text-[#FAF3E8]">
                    {projecaoSelecionada.fase}
                  </h4>
                </div>
                <span className="text-xs text-[#DCBF6F] font-mono">
                  {projecaoSelecionada.artigoLegal}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#B8AF9F]">
                {projecaoSelecionada.descricaoLegal}
              </p>

              {projecaoSelecionada.notaEspecial && (
                <div className="mt-3 rounded border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-300">
                  ⚠️ <strong>Regra Especial do Ano-Teste (Art. 348, LC 214/2025):</strong>{' '}
                  {projecaoSelecionada.notaEspecial}. O montante recolhido a título de CBS (0,9%) e
                  IBS (0,1%) é simultaneamente deduzido do PIS e da COFINS devidos, resultando em
                  impacto líquido financeiro nulo.
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Lado A: Tributos do Novo Sistema */}
                <div className="rounded border border-[#C9A227]/20 bg-[#101010] p-4 text-xs">
                  <p className="font-semibold text-[#DCBF6F] uppercase tracking-wider text-[11px] border-b border-[#252525] pb-2">
                    Novo Sistema (CBS + IBS)
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">
                        CBS Líquida (Ref. {projecaoSelecionada.cbsAliquotaNominal}% com redutor):
                      </span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.cbsLiquida)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">
                        IBS Líquido (Ref. {projecaoSelecionada.ibsAliquotaNominal.toFixed(2)}% com
                        redutor):
                      </span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.ibsLiquida)}
                      </span>
                    </div>
                    {projecaoSelecionada.creditoPresumidoAgro > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Crédito Presumido Agro (Dedução):</span>
                        <span className="font-mono">
                          - {formatarBRL(projecaoSelecionada.creditoPresumidoAgro)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#252525] pt-2 font-bold text-[#DCBF6F]">
                      <span>Total Novo Sistema:</span>
                      <span className="font-mono">
                        {formatarBRL(projecaoSelecionada.totalNovoSistema)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lado B: Tributos Remanescentes do Sistema Vigente */}
                <div className="rounded border border-[#C9A227]/20 bg-[#101010] p-4 text-xs">
                  <p className="font-semibold text-[#8E8779] uppercase tracking-wider text-[11px] border-b border-[#252525] pb-2">
                    Sistema Atual Remanescente no Ano
                  </p>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">PIS Efetivo:</span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.pisEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">COFINS Efetivo:</span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.cofinsEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">
                        ICMS ({Math.round(projecaoSelecionada.fatorTransicaoAtualIcmsIss * 100)}% da
                        base):
                      </span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.icmsEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9E9585]">
                        ISS ({Math.round(projecaoSelecionada.fatorTransicaoAtualIcmsIss * 100)}% da
                        base):
                      </span>
                      <span className="font-mono text-[#FAF3E8]">
                        {formatarBRL(projecaoSelecionada.issEfetivo)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#252525] pt-2 font-bold text-[#FAF3E8]">
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

      {/* CRONOGRAMA INSTITUCIONAL DA REFORMA (LINHA DO TEMPO ELEGANTE 2025–2033) */}
      <section className="border-t border-[#C9A227]/20 bg-[#080808] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
              <Calendar size={14} />
              <span>Cronograma Institucional · LC 214/2025</span>
            </span>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-[#FAF3E8] sm:text-4xl">
              Os Marcos Jurídicos da Transição Tributária
            </h2>
            <p className="mt-4 font-sans text-sm leading-relaxed text-[#B8AF9F]">
              Linha do tempo oficial estabelecida pela Emenda Constitucional nº 132/2023 e
              regulamentada pela Lei Complementar nº 214/2025, com aplicação direta aos produtores,
              cooperativas e agroindústrias brasileiras.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {CRONOGRAMA_EVENTOS.map((evento, idx) => (
              <div
                key={evento.ano}
                className="relative rounded-lg border border-[#C9A227]/25 bg-gradient-to-b from-[#13120E] to-[#0D0D0D] p-5 shadow-sm transition-all duration-300 hover:border-[#C9A227]/60 hover:-translate-y-1"
              >
                {/* Numeral romano sutil */}
                <span className="absolute top-4 right-4 font-serif text-[11px] font-semibold text-[#C9A227]/40">
                  {['I', 'II', 'III', 'IV', 'V'][idx]}
                </span>

                <div className="font-mono text-xl font-bold text-[#DCBF6F]">{evento.ano}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#C9A227]">
                  {evento.fase}
                </div>
                <div className="mt-2 text-[10px] font-mono text-[#8E8779]">{evento.artigo}</div>
                <p className="mt-3 text-xs leading-relaxed text-[#B8AF9F]">{evento.resumo}</p>

                <div className="mt-4 inline-block rounded border border-[#C9A227]/30 bg-[#181610] px-2 py-0.5 text-[10px] font-mono text-[#DCBF6F]">
                  {evento.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVISO LEGAL OBRIGATÓRIO & CHAMADA INSTITUCIONAL DE CONSULTORIA */}
      <section className="border-t border-[#C9A227]/20 bg-gradient-to-b from-[#0D0D0D] to-[#070707] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-lg border border-[#C9A227]/40 bg-gradient-to-r from-[#14120D] via-[#181610] to-[#14120D] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            {/* Cantoneiras de luxo no banner */}
            <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-[#C9A227]" />
            <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-[#C9A227]" />
            <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#C9A227]" />
            <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#C9A227]" />

            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
                  <Scale size={14} />
                  <span>Moura e Medeiros Advogados Associados</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight text-[#FAF3E8] sm:text-3xl">
                  Precisa de um Diagnóstico Tributário Individualizado para sua Operação?
                </h3>
                <p className="mt-4 text-xs leading-relaxed text-[#C4BBAE] sm:text-sm">
                  Esta calculadora é uma ferramenta demonstrativa e educativa para modelagem de
                  cenários. Cada cadeia do agronegócio possui particularidades contratuais, regimes
                  de crédito presumido, diferimento estadual de ICMS e estruturas societárias que
                  exigem avaliação jurídica pormenorizada.
                </p>

                {/* Aviso legal formal com § */}
                <div className="mt-6 rounded border border-[#C9A227]/30 bg-[#100F0A] p-4 text-[11px] leading-relaxed text-[#A39985]">
                  <strong className="text-[#DCBF6F]">§ Aviso Legal Obrigatório:</strong> As
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
                  className="group relative inline-flex items-center gap-3 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] shadow-[0_4px_25px_rgba(201,162,39,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                >
                  <PhoneCall size={16} />
                  <span>Solicitar Diagnóstico Estratégico</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#9E9585]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
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
