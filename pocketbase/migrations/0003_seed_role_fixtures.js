// F1-T02 · SPEC-1-001 — fixtures sintéticas por papel (nenhum dado pessoal real).
// Senhas são de demonstração, em ambiente de preview noindex, e serão trocadas
// na operação real. Seeds idempotentes (try/catch nos finders que lançam erro).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const fixtures = [
      { email: 'operator@agrojur.local', name: 'Operador Sintético', role: 'operator' },
      { email: 'reviewer@agrojur.local', name: 'Revisor Sintético', role: 'reviewer' },
      { email: 'publisher@agrojur.local', name: 'Publisher Sintético', role: 'publisher' },
      { email: 'admin@agrojur.local', name: 'Admin Sintético', role: 'admin' },
    ]
    for (const f of fixtures) {
      try {
        app.findAuthRecordByEmail('_pb_users_auth_', f.email)
        continue // já existe: seed idempotente
      } catch (_) {}
      const record = new Record(users)
      record.setEmail(f.email)
      record.setPassword('Agrojur@Preview1')
      record.setVerified(true)
      record.set('name', f.name)
      record.set('role', f.role)
      app.save(record)
    }
  },
  (app) => {
    for (const email of [
      'operator@agrojur.local',
      'reviewer@agrojur.local',
      'publisher@agrojur.local',
      'admin@agrojur.local',
    ]) {
      try {
        app.delete(app.findAuthRecordByEmail('_pb_users_auth_', email))
      } catch (_) {}
    }
  },
)
