// F1-T02 · SPEC-1-001 · CA-1-003..005 — modelo editorial + RBAC server-side.
// Papéis dos usuários: operator | reviewer | publisher | admin.
// Regra RN-107: ninguém altera o próprio papel — a alteração de `role` só é
// aceita quando quem edita NÃO é o próprio registro (server-side).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['operator', 'reviewer', 'publisher', 'admin'],
          maxSelect: 1,
          required: true,
        }),
      )
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    app.save(users)
  },
)
