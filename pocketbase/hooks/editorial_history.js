// F1-T03 · SPEC-1-001 · CA-1-006 — histórico com escopo server-side.
routerAdd(
  'GET',
  '/backend/v1/editorial/contents/{id}/history',
  (e) => {
    if (!e.auth) return e.unauthorizedError('Autenticação necessária.')

    const id = e.request.pathValue('id')
    if (!/^[a-z0-9]{15}$/.test(id)) return e.notFoundError('Conteúdo não encontrado.')

    let content
    try {
      content = $app.findRecordById('contents', id)
    } catch (_) {
      return e.notFoundError('Conteúdo não encontrado.')
    }

    const role = e.auth.getString('role')
    const isAdmin = role === 'admin'
    const isAuthor = content.getString('author_id') === e.auth.id
    const isReviewer = content.getString('reviewer_id') === e.auth.id
    const publisherCanAudit =
      role === 'publisher' &&
      ['APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(content.getString('status'))

    if (!isAdmin && !isAuthor && !isReviewer && !publisherCanAudit) {
      return e.forbiddenError('Sem permissão para consultar este histórico.')
    }

    const records = $app.findRecordsByFilter(
      'content_versions',
      'content_id = "' + id + '"',
      '-version',
      100,
      0,
    )
    const items = []
    for (const record of records) {
      items.push({
        id: record.id,
        content_id: record.getString('content_id'),
        version: Number(record.getString('version')) || 0,
        status: record.getString('status'),
        transition: record.getString('transition'),
        changed_by: record.getString('changed_by'),
        created: record.getString('created'),
      })
    }

    return e.json(200, { items })
  },
  $apis.requireAuth(),
)
