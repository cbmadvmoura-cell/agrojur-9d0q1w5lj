// F1-T02 · CA-1-005 — rascunhos podem existir sem fonte; aprovação/publicação não.
migrate(
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    const sourceCount = contents.fields.getByName('source_count')
    sourceCount.required = false
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && @request.body.source_count > 0) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    app.save(contents)
  },
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    const sourceCount = contents.fields.getByName('source_count')
    sourceCount.required = true
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id && @request.body.source_count >= 0"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && @request.body.source_count > 0) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    app.save(contents)
  },
)
