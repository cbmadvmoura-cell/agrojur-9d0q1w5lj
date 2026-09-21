// F1-T02 · CA-1-003 — histórico persistido após cada criação.
onRecordAfterCreateSuccess((e) => {
  e.next()

  try {
    const record = e.record
    const history = new Record($app.findCollectionByNameOrId('content_versions'))
    history.set('content_id', record.id)
    history.set('version', Number(record.getString('version')) || 1)
    history.set('status', record.getString('status'))
    history.set('transition', 'CREATED')
    if (record.getString('author_id') !== '')
      history.set('changed_by', record.getString('author_id'))
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
        status: record.getString('status'),
        sources: record.get('sources'),
        version: Number(record.getString('version')) || 1,
      }),
    )
    $app.save(history)
  } catch (error) {
    $app
      .logger()
      .error('editorial history create failed', 'content_id', e.record.id, 'error', String(error))
  }
}, 'contents')
