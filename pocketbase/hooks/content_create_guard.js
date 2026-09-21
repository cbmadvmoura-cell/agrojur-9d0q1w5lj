// F1-T02 · CA-1-003..005 — conteúdo novo sempre nasce como rascunho.
onRecordCreate((e) => {
  const record = e.record

  if (record.getString('status') !== 'DRAFT') {
    throw new BadRequestError('Conteúdo novo deve nascer como DRAFT.')
  }
  if (record.getString('author_id') === '') {
    throw new BadRequestError('Conteúdo novo precisa de autor.')
  }

  record.set('version', 1)
  record.set('reviewed_at', '')
  record.set('published_at', '')
  return e.next()
}, 'contents')
