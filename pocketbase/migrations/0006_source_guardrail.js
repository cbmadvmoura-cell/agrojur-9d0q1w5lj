// F1-T02 · CA-1-005 — fonte obrigatória na aprovação/publicação, com RLS server-side.
migrate(
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    if (!contents.fields.getByName('source_count')) {
      contents.fields.add(
        new NumberField({
          name: 'source_count',
          required: false,
          onlyInt: true,
          min: 0,
        }),
      )
      app.save(contents)
    }

    // Backfill sem app.save(record): evita executar hooks sobre registros antigos.
    app
      .db()
      .newQuery(
        "UPDATE contents SET source_count = CASE WHEN sources IS NULL OR sources = '' OR sources = '[]' THEN 0 ELSE 1 END",
      )
      .execute()
    app
      .db()
      .newQuery(
        "UPDATE contents SET status = 'DRAFT', reviewed_at = '', published_at = '' WHERE source_count = 0 AND status IN ('APPROVED', 'PUBLISHED')",
      )
      .execute()

    const sourceCount = contents.fields.getByName('source_count')
    sourceCount.required = true
    contents.listRule =
      "(status = 'PUBLISHED') || (@request.auth.id != '' && ((author_id = @request.auth.id) || (reviewer_id = @request.auth.id) || (@request.auth.role = 'admin') || (@request.auth.role = 'reviewer' && status != 'PUBLISHED') || (@request.auth.role = 'publisher' && (status = 'APPROVED' || status = 'PUBLISHED'))))"
    contents.viewRule = contents.listRule
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id && @request.body.source_count >= 0"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && @request.body.source_count > 0) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && @request.body.source_count > 0) || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    contents.deleteRule = null
    app.save(contents)
  },
  (app) => {
    const contents = app.findCollectionByNameOrId('contents')
    contents.fields.removeByName('source_count')
    contents.listRule =
      "(status = 'PUBLISHED') || (@request.auth.id != '' && ((author_id = @request.auth.id) || (reviewer_id = @request.auth.id) || (@request.auth.role = 'admin') || (@request.auth.role = 'reviewer' && status != 'PUBLISHED') || (@request.auth.role = 'publisher' && (status = 'APPROVED' || status = 'PUBLISHED'))))"
    contents.viewRule = contents.listRule
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED') || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED') || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
    contents.deleteRule = null
    app.save(contents)
  },
)
