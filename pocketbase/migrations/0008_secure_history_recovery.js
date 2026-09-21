// F1-T03 · SPEC-1-001 · CA-1-006 — restringe histórico e habilita recuperação segura.
migrate(
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && @request.body.source_count > 0) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'ARCHIVED' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    app.save(contents)

    const history = app.findCollectionByNameOrId('content_versions')
    // Acesso direto ao histórico fica fechado para usuários comuns. A leitura
    // passa pela rota autenticada, que aplica escopo por papel e conteúdo.
    history.listRule = null
    history.viewRule = null
    app.save(history)
  },
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && @request.body.source_count > 0) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    app.save(contents)

    const history = app.findCollectionByNameOrId('content_versions')
    history.listRule = "@request.auth.id != ''"
    history.viewRule = "@request.auth.id != ''"
    app.save(history)
  },
)
