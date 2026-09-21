// F1-T02 · SPEC-1-001 · CA-1-003..005
// Migration aditiva: histórico de versões e regras fail-closed para o modelo editorial.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.role = 'admin')"
    users.viewRule = users.listRule
    users.createRule = null
    users.updateRule =
      "@request.auth.id != '' && ((id = @request.auth.id && @request.body.role:isset = false) || (@request.auth.role = 'admin' && id != @request.auth.id))"
    users.deleteRule = null
    app.save(users)

    const contents = app.findCollectionByNameOrId('contents')
    contents.listRule =
      "(status = 'PUBLISHED') || (@request.auth.id != '' && ((author_id = @request.auth.id) || (reviewer_id = @request.auth.id) || (@request.auth.role = 'admin') || (@request.auth.role = 'reviewer' && status != 'PUBLISHED') || (@request.auth.role = 'publisher' && (status = 'APPROVED' || status = 'PUBLISHED'))))"
    contents.viewRule = contents.listRule
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED') || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED') || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    contents.deleteRule = null
    const version = contents.fields.getByName('version')
    version.required = true
    app.save(contents)

    const history = new Collection({
      name: 'content_versions',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'content_id',
          type: 'relation',
          required: true,
          collectionId: contents.id,
          maxSelect: 1,
        },
        { name: 'version', type: 'number', required: true, onlyInt: true, min: 1 },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'],
          maxSelect: 1,
        },
        { name: 'transition', type: 'text', required: true, min: 1, max: 80 },
        {
          name: 'changed_by',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'snapshot', type: 'json', required: true, maxSize: 500000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_content_versions_content_version ON content_versions (content_id, version)',
        'CREATE INDEX idx_content_versions_content ON content_versions (content_id)',
      ],
    })
    app.save(history)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('content_versions'))

    const contents = app.findCollectionByNameOrId('contents')
    contents.listRule =
      "(status = 'PUBLISHED') || (@request.auth.id != '' && (author_id = @request.auth.id || reviewer_id = @request.auth.id || @request.auth.role = 'admin'))"
    contents.viewRule = contents.listRule
    contents.createRule =
      "@request.auth.id != '' && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW') || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && @request.body.status = 'APPROVED') || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED') || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    contents.deleteRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    const version = contents.fields.getByName('version')
    version.required = false
    app.save(contents)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.createRule = ''
    users.updateRule = 'id = @request.auth.id'
    users.deleteRule = 'id = @request.auth.id'
    app.save(users)
  },
)
