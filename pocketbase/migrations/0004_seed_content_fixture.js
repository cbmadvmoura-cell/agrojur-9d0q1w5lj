// F1-T02 · SPEC-1-001 · CA-1-005 — fixture editorial sintética que percorre o
// fluxo principal: nasce DRAFT, entra em revisão com fonte e revisor, é
// aprovada e fica pronta para publicação (a publicação em si é prova da
// CA-1-004 e será executada pelo publisher sintético nos testes/roteiro).
// Idempotente: só cria se o slug não existir.
migrate(
  (app) => {
    let author
    let reviewer
    try {
      author = app.findAuthRecordByEmail('_pb_users_auth_', 'operator@agrojur.local')
    } catch (_) {
      throw new Error('fixture author ausente: rode 0003 antes')
    }
    try {
      reviewer = app.findAuthRecordByEmail('_pb_users_auth_', 'reviewer@agrojur.local')
    } catch (_) {
      throw new Error('fixture reviewer ausente: rode 0003 antes')
    }
    try {
      app.findFirstRecordByData('contents', 'slug', 'conteudo-demonstrativo-f1t02')
      return // já existe
    } catch (_) {}
    const col = app.findCollectionByNameOrId('contents')
    const record = new Record(col)
    record.set('slug', 'conteudo-demonstrativo-f1t02')
    record.set('title', 'Conteúdo demonstrativo — não é orientação jurídica')
    record.set(
      'summary',
      'Fixture sintética para validar o fluxo editorial DRAFT → IN_REVIEW → APPROVED no ambiente de teste.',
    )
    record.set(
      'body',
      '<p>Texto demonstrativo criado para validar a máquina de estados editorial. <strong>Não é orientação jurídica.</strong></p>',
    )
    record.set('cluster', 'demonstracao')
    record.set('author_id', author.id)
    record.set('reviewer_id', reviewer.id)
    record.set('status', 'DRAFT')
    record.set(
      'sources',
      JSON.stringify([{ label: 'Fonte demonstrativa', url: 'https://example.com/fixture' }]),
    )
    record.set('version', 1)
    app.save(record)
  },
  (app) => {
    try {
      app.delete(app.findFirstRecordByData('contents', 'slug', 'conteudo-demonstrativo-f1t02'))
    } catch (_) {}
  },
)
