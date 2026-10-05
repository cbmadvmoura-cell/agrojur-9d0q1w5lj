/**
 * Motor de Cálculo Tributário - Reforma Tributária (LC 214/2025 e EC 132/2023)
 * Modelagem e projeção comparativa 2025–2033 com foco no Agronegócio
 * Agrojur · Moura e Medeiros Advogados Associados
 */

export type RegimeTributario = 'lucro_real' | 'lucro_presumido' | 'simples_nacional'

export type SetorPresetKey = 'soja_graos' | 'pecuaria' | 'insumos_agro' | 'agro_geral' | 'outros'

export interface SetorPreset {
  id: SetorPresetKey
  nome: string
  descricao: string
  redutorCbsIbs: number // ex: 60 (para 60% de redução LC 214/2025)
  creditoPresumidoAgro: boolean
  percentualCreditoPresumido: number // % sobre insumos adquiridos de produtor rural PF
  pisPadrao: number
  cofinsPadrao: number
  icmsPadrao: number
  issPadrao: number
  ipiPadrao: number
  aliquotaDasPadrao?: number
  aproveitamentoCreditoPadrao: number // 100%
  baseInsumosPercentual: number // % da receita bruta padrão
}

export const SETORES_PRESETS: Record<SetorPresetKey, SetorPreset> = {
  soja_graos: {
    id: 'soja_graos',
    nome: 'Produção de Soja & Grãos',
    descricao:
      'Redução de 60% na LC 214/2025, crédito presumido agropecuário na aquisição e desoneração de insumos.',
    redutorCbsIbs: 60,
    creditoPresumidoAgro: true,
    percentualCreditoPresumido: 4.5,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6,
    icmsPadrao: 12.0,
    issPadrao: 0.0,
    ipiPadrao: 0.0,
    aproveitamentoCreditoPadrao: 95,
    baseInsumosPercentual: 60,
  },
  pecuaria: {
    id: 'pecuaria',
    nome: 'Pecuária de Corte e Leite',
    descricao:
      'Redução de 60% em CBS/IBS (cesta básica estendida/insumos agropecuários) e forte cadeia de crédito cumulativo.',
    redutorCbsIbs: 60,
    creditoPresumidoAgro: true,
    percentualCreditoPresumido: 5.0,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6,
    icmsPadrao: 7.0,
    issPadrao: 0.0,
    ipiPadrao: 0.0,
    aproveitamentoCreditoPadrao: 90,
    baseInsumosPercentual: 65,
  },
  insumos_agro: {
    id: 'insumos_agro',
    nome: 'Revenda & Indústria de Insumos / Fertilizantes',
    descricao:
      'Fertilizantes, defensivos e sementes com previsão de alíquota reduzida de 60% (art. 129 da LC 214/2025).',
    redutorCbsIbs: 60,
    creditoPresumidoAgro: false,
    percentualCreditoPresumido: 0,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6,
    icmsPadrao: 4.0, // Convênio ICMS 100/97
    issPadrao: 0.0,
    ipiPadrao: 0.0,
    aproveitamentoCreditoPadrao: 100,
    baseInsumosPercentual: 75,
  },
  agro_geral: {
    id: 'agro_geral',
    nome: 'Agronegócio Geral & Agroindústria',
    descricao:
      'Atividades agroindustriais com regime geral mitigado e aproveitamento amplo de créditos da não-cumulatividade plena.',
    redutorCbsIbs: 60,
    creditoPresumidoAgro: true,
    percentualCreditoPresumido: 3.5,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6,
    icmsPadrao: 12.0,
    issPadrao: 2.0,
    ipiPadrao: 3.0,
    aproveitamentoCreditoPadrao: 90,
    baseInsumosPercentual: 60,
  },
  outros: {
    id: 'outros',
    nome: 'Comércio / Serviços / Indústria Geral',
    descricao:
      'Regime de alíquota cheia de referência, sem o redutor específico de 60% da agropecuária.',
    redutorCbsIbs: 0,
    creditoPresumidoAgro: false,
    percentualCreditoPresumido: 0,
    pisPadrao: 1.65,
    cofinsPadrao: 7.6,
    icmsPadrao: 18.0,
    issPadrao: 5.0,
    ipiPadrao: 5.0,
    aproveitamentoCreditoPadrao: 90,
    baseInsumosPercentual: 50,
  },
}

export interface ParametrosCalculadora {
  // Seção I: Faturamento e Insumos
  receitaBrutaAnual: number
  comprasInsumosAnual: number
  regime: RegimeTributario
  setor: SetorPresetKey

  // Seção II: Alíquotas atuais
  aliquotaPis: number // %
  aliquotaCofins: number // %
  aliquotaIcms: number // %
  aliquotaIss: number // %
  aliquotaIpi: number // %
  aliquotaDasEfetiva: number // % (para Simples Nacional)
  aproveitamentoCreditoAtual: number // % (crédito PIS/COFINS e ICMS em Lucro Real)

  // Seção III: Parâmetros da Reforma (LC 214/2025)
  aliquotaCbsReferencia: number // padrão: 9.21%
  aliquotaIbsReferencia: number // padrão: 18.70%
  redutorCbsIbs: number // 0, 30, 60, 100
  aproveitamentoCreditoNovo: number // % (padrão 100%)
  temCreditoPresumidoAgro: boolean
  aliquotaCreditoPresumido: number // % sobre insumos elegíveis
  impostoSeletivoAliquota: number // % (se aplicável, default 0%)
}

export interface ProjecaoAno {
  ano: number
  fase: string
  descricaoLegal: string
  artigoLegal: string

  // Sistema Atual no Ano
  fatorTransicaoAtualIcmsIss: number // 100% até 2028, 90% em 2029, 80% em 2030, 70% em 2031, 60% em 2032, 0% em 2033
  fatorTransicaoAtualPisCofins: number // 100% até 2026, 0% a partir de 2027
  fatorTransicaoAtualIpi: number // 100% até 2026, 0% a partir de 2027

  pisEfetivo: number
  cofinsEfetivo: number
  icmsEfetivo: number
  issEfetivo: number
  ipiEfetivo: number
  totalAtual: number
  cargaEfetivaAtual: number // %

  // Novo Sistema no Ano (CBS + IBS)
  cbsAliquotaNominal: number
  ibsAliquotaNominal: number
  cbsAliquotaComRedutor: number
  ibsAliquotaComRedutor: number

  cbsDebito: number
  ibsDebito: number
  cbsCredito: number
  ibsCredito: number
  creditoPresumidoAgro: number

  cbsLiquida: number
  ibsLiquida: number
  impostoSeletivo: number
  totalNovoSistema: number
  cargaEfetivaNovo: number // %

  // Total a Recolher Efetivo no Ano (Sistema Vigente misto de transição)
  totalEfetivoAno: number
  cargaEfetivaTotalAno: number

  // Comparação vs Sistema Atual Baseline (2025)
  diferencaValor: number // totalEfetivoAno - totalAtualBaseline
  diferencaPontosPercentuais: number
  diferencaPercentual: number // % de variação no desembolso

  // Nota de destaque (ex: 2026 ano-teste)
  notaEspecial?: string
}

export interface ResultadoCalculo {
  projecoes: ProjecaoAno[]
  anoVirada: number | null // primeiro ano onde novo sistema fica mais favorável ou menos oneroso
  impactoFinal2033: {
    valorAtual: number
    valor2033: number
    diferencaValor: number
    diferencaPP: number
    diferencaPercentual: number
    cargaAtual: number
    carga2033: number
    economiaOuAumento: 'economia' | 'aumento' | 'neutro'
  }
  breakdown2033: {
    cbsDebito: number
    cbsCredito: number
    cbsLiquida: number
    ibsDebito: number
    ibsCredito: number
    ibsLiquida: number
    creditoPresumido: number
    totalFinal: number
  }
  breakdownAtual: {
    pis: number
    cofins: number
    icms: number
    iss: number
    ipi: number
    total: number
  }
}

/**
 * Executa a projeção tributária 2025–2033 de acordo com o cronograma da LC 214/2025
 */
export function calcularTransicaoTributaria(p: ParametrosCalculadora): ResultadoCalculo {
  const receita = Math.max(0, p.receitaBrutaAnual)
  const insumos = Math.max(0, p.comprasInsumosAnual)

  // 1. Cálculo Baseline do Sistema Atual (Regras vigentes 2025)
  let pisBase = 0
  let cofinsBase = 0
  let icmsBase = 0
  let issBase = 0
  let ipiBase = 0

  if (p.regime === 'simples_nacional') {
    // No Simples Nacional, o DAS engloba os tributos
    const totalDas = receita * (p.aliquotaDasEfetiva / 100)
    // Decomposição aproximada do DAS comércio/agro
    pisBase = totalDas * 0.12
    cofinsBase = totalDas * 0.28
    icmsBase = totalDas * 0.4
    issBase = totalDas * 0.1
    ipiBase = totalDas * 0.1
  } else if (p.regime === 'lucro_presumido') {
    // Regime Cumulativo típico: PIS 0.65%, COFINS 3.00%, ICMS cheio s/ créditos de entrada
    pisBase = receita * (p.aliquotaPis / 100)
    cofinsBase = receita * (p.aliquotaCofins / 100)
    icmsBase = receita * (p.aliquotaIcms / 100)
    issBase = receita * (p.aliquotaIss / 100)
    ipiBase = receita * (p.aliquotaIpi / 100)
  } else {
    // Lucro Real: Não-cumulativo. PIS 1.65%, COFINS 7.6% com crédito sobre insumos
    const fatorCredito = p.aproveitamentoCreditoAtual / 100
    const debitoPis = receita * (p.aliquotaPis / 100)
    const creditoPis = insumos * (p.aliquotaPis / 100) * fatorCredito
    pisBase = Math.max(0, debitoPis - creditoPis)

    const debitoCofins = receita * (p.aliquotaCofins / 100)
    const creditoCofins = insumos * (p.aliquotaCofins / 100) * fatorCredito
    cofinsBase = Math.max(0, debitoCofins - creditoCofins)

    const debitoIcms = receita * (p.aliquotaIcms / 100)
    const creditoIcms = insumos * (p.aliquotaIcms / 100) * (p.aproveitamentoCreditoAtual / 100)
    icmsBase = Math.max(0, debitoIcms - creditoIcms)

    issBase = receita * (p.aliquotaIss / 100)
    ipiBase = Math.max(0, (receita - insumos * 0.5) * (p.aliquotaIpi / 100))
  }

  const totalAtualBaseline = pisBase + cofinsBase + icmsBase + issBase + ipiBase

  // Fator redutor de CBS/IBS (ex: 60% de redução => paga 40%)
  const multiplicadorRedutor = Math.max(0, (100 - p.redutorCbsIbs) / 100)
  const aproveitamentoCredito = Math.max(0, Math.min(100, p.aproveitamentoCreditoNovo)) / 100

  // 2. Projeção Ano a Ano
  const projecoes: ProjecaoAno[] = []

  const cronogramaAnos = [
    {
      ano: 2025,
      fase: 'Sistema Atual Pleno',
      descricaoLegal:
        'Vigência integral do sistema tributário atual (PIS, COFINS, ICMS, ISS, IPI).',
      artigoLegal: 'Constituição Federal de 1988 (pré-reforma)',
      fatorPisCofins: 1.0,
      fatorIpi: 1.0,
      fatorIcmsIss: 1.0,
      cbsNominal: 0.0,
      ibsNominal: 0.0,
      anoTeste: false,
    },
    {
      ano: 2026,
      fase: 'Ano-Teste Piloto (LC 214/2025)',
      descricaoLegal:
        'Alíquotas de teste CBS 0,9% e IBS 0,1%, totalmente compensáveis com PIS/COFINS. Sem aumento de carga.',
      artigoLegal: 'Art. 348, § 1º, da LC 214/2025',
      fatorPisCofins: 1.0,
      fatorIpi: 1.0,
      fatorIcmsIss: 1.0,
      cbsNominal: 0.9,
      ibsNominal: 0.1,
      anoTeste: true,
      notaEspecial: 'Compensável integralmente via PIS/COFINS para contribuintes adimplentes',
    },
    {
      ano: 2027,
      fase: 'Entrada Plena da CBS & Extinção PIS/COFINS',
      descricaoLegal:
        'PIS e COFINS formalmente extintos. IPI zerado (exceto Zona Franca de Manaus). CBS em alíquota plena (~9,21%). IBS a 0,1%.',
      artigoLegal: 'Art. 349 da LC 214/2025 e EC 132/2023',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 1.0,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: 0.1,
      anoTeste: false,
    },
    {
      ano: 2028,
      fase: 'Consolidação Federal e Preparação Subnacional',
      descricaoLegal:
        'CBS plena em regime não-cumulativo amplo. IBS continua em alíquota teste 0,1%. ICMS e ISS em cobrança plena.',
      artigoLegal: 'Art. 349, § 2º, LC 214/2025',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 1.0,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: 0.1,
      anoTeste: false,
    },
    {
      ano: 2029,
      fase: 'Início da Transição Subnacional (1/10 IBS)',
      descricaoLegal:
        'ICMS e ISS reduzidos a 90% de suas alíquotas. IBS passa a cobrar 10% de sua alíquota de referência (~1,87%).',
      artigoLegal: 'Art. 350 da LC 214/2025',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 0.9,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: p.aliquotaIbsReferencia * 0.1,
      anoTeste: false,
    },
    {
      ano: 2030,
      fase: 'Transição Subnacional (2/10 IBS)',
      descricaoLegal: 'ICMS e ISS reduzidos a 80%. IBS sobe para 20% da referência (~3,74%).',
      artigoLegal: 'Art. 350, II, da LC 214/2025',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 0.8,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: p.aliquotaIbsReferencia * 0.2,
      anoTeste: false,
    },
    {
      ano: 2031,
      fase: 'Transição Subnacional (3/10 IBS)',
      descricaoLegal: 'ICMS e ISS caem para 70%. IBS sobe para 30% da referência (~5,61%).',
      artigoLegal: 'Art. 350, III, da LC 214/2025',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 0.7,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: p.aliquotaIbsReferencia * 0.3,
      anoTeste: false,
    },
    {
      ano: 2032,
      fase: 'Transição Subnacional (4/10 IBS)',
      descricaoLegal:
        'ICMS e ISS em 60%. IBS sobe para 40% da referência (~7,48%). Último ano do sistema misto.',
      artigoLegal: 'Art. 350, IV, da LC 214/2025',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 0.6,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: p.aliquotaIbsReferencia * 0.4,
      anoTeste: false,
    },
    {
      ano: 2033,
      fase: 'Sistema Pleno Reforma Tributária',
      descricaoLegal:
        'Extinção definitiva de ICMS, ISS e IPI. Vigência plena e exclusiva do IVA Dual (CBS + IBS).',
      artigoLegal: 'Art. 351 da LC 214/2025 & Art. 156-A CF',
      fatorPisCofins: 0.0,
      fatorIpi: 0.0,
      fatorIcmsIss: 0.0,
      cbsNominal: p.aliquotaCbsReferencia,
      ibsNominal: p.aliquotaIbsReferencia,
      anoTeste: false,
    },
  ]

  for (const c of cronogramaAnos) {
    // Alíquotas nominais e com redutor setorial (ex: agro 60%)
    const cbsNominal = c.cbsNominal
    const ibsNominal = c.ibsNominal
    const cbsAliquotaEfetiva = cbsNominal * multiplicadorRedutor
    const ibsAliquotaEfetiva = ibsNominal * multiplicadorRedutor

    // Cálculos do Novo Sistema (Débitos e Créditos não-cumulativos plenos)
    const cbsDebito = receita * (cbsAliquotaEfetiva / 100)
    const ibsDebito = receita * (ibsAliquotaEfetiva / 100)

    // Crédito sobre insumos de entrada
    const cbsCredito = insumos * (cbsAliquotaEfetiva / 100) * aproveitamentoCredito
    const ibsCredito = insumos * (ibsAliquotaEfetiva / 100) * aproveitamentoCredito

    // Crédito presumido do produtor agropecuário (LC 214/2025 para aquisições de pessoa física rural)
    let creditoPresumidoAgro = 0
    if (p.temCreditoPresumidoAgro && (cbsNominal > 0 || ibsNominal > 0)) {
      creditoPresumidoAgro = insumos * (p.aliquotaCreditoPresumido / 100)
    }

    // Em 2026, ano-teste: CBS (0,9%) e IBS (0,1%) são recolhidos mas compensáveis integralmente com PIS/COFINS
    let cbsLiquida = Math.max(0, cbsDebito - cbsCredito)
    let ibsLiquida = Math.max(0, ibsDebito - ibsCredito)

    // Abate crédito presumido agro proporcionalmente entre CBS e IBS
    if (creditoPresumidoAgro > 0) {
      const somaLiquida = cbsLiquida + ibsLiquida
      if (somaLiquida > 0) {
        const proporcaoCbs = cbsLiquida / somaLiquida
        const abateCbs = Math.min(cbsLiquida, creditoPresumidoAgro * proporcaoCbs)
        const abateIbs = Math.min(ibsLiquida, creditoPresumidoAgro * (1 - proporcaoCbs))
        cbsLiquida -= abateCbs
        ibsLiquida -= abateIbs
      }
    }

    // Imposto Seletivo (se aplicável ao setor em 2027+)
    const impostoSeletivo = c.ano >= 2027 ? receita * (p.impostoSeletivoAliquota / 100) : 0

    // Componentes do Sistema Antigo restantes no ano
    let pisAno = pisBase * c.fatorPisCofins
    let cofinsAno = cofinsBase * c.fatorPisCofins
    const icmsAno = icmsBase * c.fatorIcmsIss
    const issAno = issBase * c.fatorIcmsIss
    const ipiAno = ipiBase * c.fatorIpi

    let totalNovoSistema = cbsLiquida + ibsLiquida + impostoSeletivo

    // Em 2026, por força do art. 348, § 1º LC 214/2025, o teste CBS 0,9% + IBS 0,1% compensa PIS/COFINS
    // Logo, o contribuinte não tem recolhimento efetivo adicional além do PIS/COFINS original
    if (c.anoTeste) {
      const valorTeste = cbsLiquida + ibsLiquida
      // Abate o teste recolhido do PIS/COFINS devido no mesmo ano
      const abatimentoPis = Math.min(pisAno, valorTeste * 0.5)
      pisAno -= abatimentoPis
      const abatimentoCofins = Math.min(cofinsAno, valorTeste - abatimentoPis)
      cofinsAno -= abatimentoCofins
    }

    const totalAtualAno = pisAno + cofinsAno + icmsAno + issAno + ipiAno
    const totalEfetivoAno = totalAtualAno + totalNovoSistema

    const cargaEfetivaTotalAno = receita > 0 ? (totalEfetivoAno / receita) * 100 : 0
    const cargaEfetivaAtual = receita > 0 ? (totalAtualBaseline / receita) * 100 : 0
    const cargaEfetivaNovo = receita > 0 ? (totalNovoSistema / receita) * 100 : 0

    const diferencaValor = totalEfetivoAno - totalAtualBaseline
    const diferencaPP = cargaEfetivaTotalAno - cargaEfetivaAtual
    const diferencaPercentual =
      totalAtualBaseline > 0
        ? ((totalEfetivoAno - totalAtualBaseline) / totalAtualBaseline) * 100
        : 0

    projecoes.push({
      ano: c.ano,
      fase: c.fase,
      descricaoLegal: c.descricaoLegal,
      artigoLegal: c.artigoLegal,
      fatorTransicaoAtualIcmsIss: c.fatorIcmsIss,
      fatorTransicaoAtualPisCofins: c.fatorPisCofins,
      fatorTransicaoAtualIpi: c.fatorIpi,
      pisEfetivo: pisAno,
      cofinsEfetivo: cofinsAno,
      icmsEfetivo: icmsAno,
      issEfetivo: issAno,
      ipiEfetivo: ipiAno,
      totalAtual: totalAtualAno,
      cargaEfetivaAtual,
      cbsAliquotaNominal: cbsNominal,
      ibsAliquotaNominal: ibsNominal,
      cbsAliquotaComRedutor: cbsAliquotaEfetiva,
      ibsAliquotaComRedutor: ibsAliquotaEfetiva,
      cbsDebito,
      ibsDebito,
      cbsCredito,
      ibsCredito,
      creditoPresumidoAgro,
      cbsLiquida,
      ibsLiquida,
      impostoSeletivo,
      totalNovoSistema,
      cargaEfetivaNovo,
      totalEfetivoAno,
      cargaEfetivaTotalAno,
      diferencaValor,
      diferencaPontosPercentuais: diferencaPP,
      diferencaPercentual,
      notaEspecial: c.notaEspecial,
    })
  }

  // Identificação do Ano de Virada (primeiro ano com transição onde carga fica menor ou maior)
  let anoVirada: number | null = null
  for (const proj of projecoes) {
    if (proj.ano >= 2026 && Math.abs(proj.diferencaValor) > 100) {
      if (anoVirada === null) {
        anoVirada = proj.ano
      }
    }
  }

  const proj2033 = projecoes[projecoes.length - 1]
  const diffFinal = proj2033.totalEfetivoAno - totalAtualBaseline
  const economiaOuAumento = diffFinal < -10 ? 'economia' : diffFinal > 10 ? 'aumento' : 'neutro'

  return {
    projecoes,
    anoVirada,
    impactoFinal2033: {
      valorAtual: totalAtualBaseline,
      valor2033: proj2033.totalEfetivoAno,
      diferencaValor: diffFinal,
      diferencaPP:
        proj2033.cargaEfetivaTotalAno - (receita > 0 ? (totalAtualBaseline / receita) * 100 : 0),
      diferencaPercentual: totalAtualBaseline > 0 ? (diffFinal / totalAtualBaseline) * 100 : 0,
      cargaAtual: receita > 0 ? (totalAtualBaseline / receita) * 100 : 0,
      carga2033: proj2033.cargaEfetivaTotalAno,
      economiaOuAumento,
    },
    breakdown2033: {
      cbsDebito: proj2033.cbsDebito,
      cbsCredito: proj2033.cbsCredito,
      cbsLiquida: proj2033.cbsLiquida,
      ibsDebito: proj2033.ibsDebito,
      ibsCredito: proj2033.ibsCredito,
      ibsLiquida: proj2033.ibsLiquida,
      creditoPresumido: proj2033.creditoPresumidoAgro,
      totalFinal: proj2033.totalEfetivoAno,
    },
    breakdownAtual: {
      pis: pisBase,
      cofins: cofinsBase,
      icms: icmsBase,
      iss: issBase,
      ipi: ipiBase,
      total: totalAtualBaseline,
    },
  }
}

/**
 * Utilitários de formatação em moeda BRL e percentual
 */
export function formatarBRL(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatarBRLCentavos(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor / 100)
}
