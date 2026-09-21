// F1-T02 · CA-1-003..005 — máquina de estados e campos protegidos no servidor.
onRecordUpdate((e) => {
  const record = e.record
  const original = record.original()
  const previousStatus = original.getString('status')
  const nextStatus = record.getString('status')
  const previousSlug = original.getString('slug')
  const nextSlug = record.getString('slug')
  const reviewerId = record.getString('reviewer_id')
  const sourcesValue = record.get('sources')
  const sourceCount = Number(record.getString('source_count'))

  if (previousSlug !== nextSlug) {
    throw new BadRequestError('O slug não pode ser alterado depois da criação.')
  }

  const hasSources = (() => {
    if (Number.isFinite(sourceCount) && sourceCount > 0) return true
    if (Array.isArray(sourcesValue)) return sourcesValue.length > 0
    if (typeof sourcesValue === 'string') {
      if (sourcesValue.trim() === '' || sourcesValue.trim() === '[]') return false
      try {
        const parsed = JSON.parse(sourcesValue)
        return Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed)
      } catch (_) {
        return false
      }
    }
    if (sourcesValue && typeof sourcesValue === 'object') {
      try {
        const parsed = JSON.parse(JSON.stringify(sourcesValue))
        return Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0
      } catch (_) {
        return false
      }
    }
    return false
  })()
=======
<<<<<<< SEARCH
  if (
    (nextStatus === 'APPROVED' || nextStatus === 'PUBLISHED') &&
    (!hasSources || reviewerId === '')
  ) {
=======
  if (
    (nextStatus === 'APPROVED' || nextStatus === 'PUBLISHED') &&
    (!hasSources || reviewerId === '')
  ) {

  const validTransitions = {
    DRAFT: ['DRAFT', 'IN_REVIEW'],
    IN_REVIEW: ['IN_REVIEW', 'APPROVED', 'DRAFT'],
    APPROVED: ['APPROVED', 'PUBLISHED'],
    PUBLISHED: ['PUBLISHED', 'ARCHIVED'],
    ARCHIVED: ['ARCHIVED'],
  }

  if (!validTransitions[previousStatus] || !validTransitions[previousStatus].includes(nextStatus)) {
    throw new BadRequestError('Transição editorial inválida.')
  }

  if (nextStatus === 'IN_REVIEW' && reviewerId === '') {
    throw new BadRequestError('Conteúdo em revisão precisa de revisor.')
  }
  if (
    (nextStatus === 'APPROVED' || nextStatus === 'PUBLISHED') &&
    (!hasSources || reviewerId === '')
  ) {
    throw new BadRequestError('Conteúdo aprovado precisa de fonte e revisor.')
  }

  const previousVersion = Number(original.getString('version'))
  record.set(
    'version',
    Number.isFinite(previousVersion) && previousVersion > 0 ? previousVersion + 1 : 1,
  )

  if (nextStatus === 'APPROVED' && previousStatus !== 'APPROVED') {
    record.set('reviewed_at', new Date().toISOString())
  }
  if (nextStatus === 'PUBLISHED' && previousStatus !== 'PUBLISHED') {
    record.set('published_at', new Date().toISOString())
  }

  return e.next()
}, 'contents')
