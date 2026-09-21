// F1-T02 · SPEC-1-001 · RN-107 — alteração de papel somente por admin e nunca no próprio usuário.
onRecordUpdateRequest((e) => {
  const body = e.requestInfo().body || {}
  const existing = e.record
  const requestedRole = body.role

  if (requestedRole !== undefined && requestedRole !== existing.getString('role')) {
    if (!e.auth || e.auth.getString('role') !== 'admin') {
      throw e.forbiddenError('Somente admin pode atribuir papéis.')
    }
    if (e.auth.id === existing.id) {
      throw e.forbiddenError('Admin não pode alterar o próprio papel.')
    }
  }

  return e.next()
}, 'users')
