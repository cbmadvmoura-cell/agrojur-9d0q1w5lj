// F1-T02 · SPEC-1-001 · CA-1-003 — collection `contents` com o contrato editorial:
// id, slug, title, summary, body, cluster, author_id, reviewer_id, status,
// sources[], reviewed_at, published_at, version. Slug único (CA-1-003).
//
// Regras server-side (fail-closed):
// - list/view públicos: somente status = "PUBLISHED" (RN-102/CA-1-005);
// - list/view autenticados: autor, revisor e admin veem tudo; demais papéis
//   veem apenas registros em que participam;
// - create: autenticado, nasce DRAFT (RN-106) — status DRAFT é imposto pela
//   regra, nunca aceito do corpo da requisição;
// - update: autor edita DRAFT; revisor transita DRAFT→IN_REVIEW→APPROVED
//   (exigindo fonte e revisor); publisher só publica APPROVED e arquiva
//   PUBLISHED (CA-1-004/RN-103); admin mantém tudo; alteração de status por
//   quem não tem alçada é recusada pelo próprio filtro da regra;
// - delete: somente admin (histórico editorial é preservado; despublicar é
//   transição para ARCHIVED, não delete).
migrate(
  (app) => {
    const collection = new Collection({
      name: 'contents',
      type: 'base',
      listRule:
        "(status = 'PUBLISHED') || (@request.auth.id != '' && (author_id = @request.auth.id || reviewer_id = @request.auth.id || @request.auth.role = 'admin'))",
      viewRule:
        "(status = 'PUBLISHED') || (@request.auth.id != '' && (author_id = @request.auth.id || reviewer_id = @request.auth.id || @request.auth.role = 'admin'))",
      createRule:
        "@request.auth.id != '' && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id",
      updateRule:
        "@request.auth.id != '' && (\n" +
        "  (@request.auth.role = 'admin') ||\n" +
        "  (author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') ||\n" +
        "  (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW') ||\n" +
        "  (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && @request.body.status = 'IN_REVIEW' && sources != '' && reviewer_id != '') ||\n" +
        "  (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && @request.body.status = 'APPROVED' && sources != '' && reviewer_id != '') ||\n" +
        "  (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && @request.body.status = 'DRAFT') ||\n" +
        "  (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED') ||\n" +
        "  (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED')\n" +
        ')',
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          min: 3,
          max: 120,
          pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
        },
        { name: 'title', type: 'text', required: true, min: 3, max: 200 },
        { name: 'summary', type: 'text', required: true, min: 3, max: 500 },
        { name: 'body', type: 'editor', required: true, maxSize: 500000 },
        { name: 'cluster', type: 'text', required: true, min: 2, max: 80 },
        {
          name: 'author_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'reviewer_id',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
          maxSelect: 1,
        },
        { name: 'sources', type: 'json', maxSize: 20000 },
        { name: 'reviewed_at', type: 'date' },
        { name: 'published_at', type: 'date' },
        { name: 'version', type: 'number', onlyInt: true, min: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_contents_slug ON contents (slug)',
        'CREATE INDEX idx_contents_status ON contents (status)',
        'CREATE INDEX idx_contents_cluster ON contents (cluster)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('contents'))
  },
)
