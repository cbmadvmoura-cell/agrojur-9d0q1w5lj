// F1-T02 · SPEC-1-001 · CA-1-003..005 — modelo editorial + RBAC server-side.
// Papéis dos usuários: operator | reviewer | publisher | admin.
// Regra RN-107: ninguém altera papel — nem o próprio, nem o de terceiros.
// A alteração de `role` fica exclusivamente com superusuário (operação/admin),
// via PocketBase Admin UI ou hook futuro; nenhum usuário autenticado comum
// pode escrever `role` (a regra de update recusa qualquer PATCH que contenha
// mudança de `role`; a regra de create é fechada para auto-registro).
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
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    // Update: o usuário pode editar o próprio perfil, mas qualquer tentativa de
    // escrever `role` (mesmo com o mesmo valor) é recusada server-side.
    users.updateRule =
      "@request.auth.id != '' && id = @request.auth.id && @request.body.role:isset = false"
    users.createRule = null
    users.deleteRule = null
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.updateRule = 'id = @request.auth.id'
    users.createRule = ''
    users.deleteRule = 'id = @request.auth.id'
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.fields.removeByName('role')
    app.save(users)
  },
)
