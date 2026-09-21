// F1-T02 · CA-1-003 — histórico persistido após cada atualização/transição.
onRecordAfterUpdateSuccess((e) => {
  e.next()

  try {
    const record = e.record
    const previousStatus = record.original().getString('status')
    const currentStatus = record.getString('status')
    const transition =
      previousStatus === currentStatus ? 'EDITED' : previousStatus + '->' + currentStatus
    const history = new Record($app.findCollectionByNameOrId('content_versions'))
    history.set('content_id', record.id)
    history.set('version', Number(record.getString('version')) || 1)
    history.set('status', currentStatus)
    history.set('transition', transition)
    const changedBy = record.getString('reviewer_id') || record.getString('author_id')
    if (changedBy !== '') history.set('changed_by', changedBy)
    history.set(
      'snapshot',
      JSON.stringify({
        slug: record.getString('slug'),
        title: record.getString('title'),
        summary: record.getString('summary'),
        body: record.getString('body'),
        cluster: record.getString('cluster'),
        author_id: record.getString('author_id'),
        reviewer_id: record.getString('reviewer_id'),
        status: currentStatus,
        sources: record.get('sources'),
        reviewed_at: record.getString('reviewed_at'),
        published_at: record.getString('published_at'),
        version: Number(record.getString('version')) || 1,
      }),
    )
    $app.save(history)
  } catch (error) {
    $app
      .logger()
      .error('editorial history update failed', 'content_id', e.record.id, 'error', String(error))
  }
}, 'contents')
