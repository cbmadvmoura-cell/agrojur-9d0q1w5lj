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

    const records = app.findRecordsByFilter('contents', '', '-created', 5000, 0)
    for (const record of records) {
      const value = record.get('sources')
      let count = 0
      if (Array.isArray(value)) {
        count = value.length
      } else if (typeof value === 'string' && value.trim() !== '') {
        try {
          const parsed = JSON.parse(value)
          count = Array.isArray(parsed) ? parsed.length : parsed ? 1 : 0
        } catch (_) {
          count = 0
        }
      } else if (value) {
        count = 1
      }
      record.set('source_count', count)
      if (
        (record.getString('status') === 'APPROVED' || record.getString('status') === 'PUBLISHED') &&
        count === 0
      ) {
        record.set('status', 'DRAFT')
        record.set('reviewed_at', '')
        record.set('published_at', '')
      }
      app.save(record)
    }

    const version = contents.fields.getByName('source_count')
    version.required = true
    contents.listRule =
      "(status = 'PUBLISHED') || (@request.auth.id != '' && ((author_id = @request.auth.id) || (reviewer_id = @request.auth.id) || (@request.auth.role = 'admin') || (@request.auth.role = 'reviewer' && status != 'PUBLISHED') || (@request.auth.role = 'publisher' && (status = 'APPROVED' || status = 'PUBLISHED'))))"
    contents.viewRule = contents.listRule
    contents.createRule =
      "@request.auth.id != '' && (@request.auth.role = 'operator' || @request.auth.role = 'admin') && @request.body.status = 'DRAFT' && @request.body.author_id = @request.auth.id && @request.body.source_count >= 0"
    contents.updateRule =
      "@request.auth.id != '' && ((@request.auth.role = 'admin') || (@request.auth.role = 'operator' && author_id = @request.auth.id && status = 'DRAFT' && @request.body.status = 'DRAFT') || (@request.auth.role = 'reviewer' && status = 'DRAFT' && @request.body.status = 'IN_REVIEW' && @request.body.reviewer_id = @request.auth.id) || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'APPROVED' && source_count > 0 && sources != '' && sources != '[]') || (@request.auth.role = 'reviewer' && status = 'IN_REVIEW' && reviewer_id = @request.auth.id && @request.body.reviewer_id = @request.auth.id && @request.body.status = 'DRAFT') || (@request.auth.role = 'publisher' && status = 'APPROVED' && @request.body.status = 'PUBLISHED' && source_count > 0 && sources != '' && sources != '[]') || (@request.auth.role = 'publisher' && status = 'PUBLISHED' && @request.body.status = 'ARCHIVED'))"
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
