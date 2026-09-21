import { Link, NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Início', end: true },
  { to: '/temas', label: 'Temas' },
  { to: '/blog', label: 'Blog' },
  { to: '/diagnostico', label: 'Diagnóstico' },
  { to: '/calculadora', label: 'Calculadora' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-emerald-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir direto para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
            aria-label="Agrojur, página inicial"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-black text-white shadow-sm transition group-hover:bg-emerald-800">
              A
            </span>
            <span>
              <span className="block font-display text-lg font-bold tracking-tight text-slate-950">
                Agrojur
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Portal demonstrativo
              </span>
            </span>
          </Link>

          <span className="order-3 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800 sm:order-2">
            Preview • noindex
          </span>

          <div className="order-2 flex w-full items-center justify-center gap-2 sm:order-3 sm:w-auto sm:justify-end">
            <nav aria-label="Navegação principal">
              <ul className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `inline-flex rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              to="/editorial"
              className="inline-flex rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              Área editorial
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo" className="min-h-[calc(100vh-190px)]">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Agrojur · ambiente de construção controlado</p>
          <p className="font-medium text-amber-800">
            Conteúdo demonstrativo — não é orientação jurídica.
          </p>
        </div>
      </footer>
    </div>
  )
}
