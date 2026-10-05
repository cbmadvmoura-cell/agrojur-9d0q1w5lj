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
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F1E8] selection:bg-[#C9A227]/30 selection:text-[#FAF3E8]">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded border border-[#C9A227] bg-[#111111] px-4 py-2 text-xs font-bold tracking-wider text-[#C9A227] uppercase focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir direto para o conteúdo
      </a>

      {/* Top bar jurídica de discrição e prestígio */}
      <div className="border-b border-[#C9A227]/15 bg-[#070707] py-1.5 text-[11px] tracking-widest text-[#C9A227]/70 uppercase">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
            <span>Advocacia &amp; Inteligência Estratégica do Agronegócio</span>
          </div>
          <div className="hidden items-center gap-4 md:flex text-[#A39985]">
            <span>Moura e Medeiros Advogados Associados</span>
            <span className="text-[#C9A227]/40">|</span>
            <span className="font-mono text-[10px] text-[#C9A227]">PREVIEW CONTROLADO</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#C9A227]/20 bg-[#0C0C0C]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo Jurídico Nobre com Monograma */}
          <Link
            to="/"
            className="group flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            aria-label="Agrojur, página inicial"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded border border-[#C9A227]/40 bg-gradient-to-br from-[#1A1710] to-[#0A0A0A] shadow-[inset_0_1px_1px_rgba(201,162,39,0.3)] transition-all duration-300 group-hover:border-[#C9A227] group-hover:shadow-[0_0_15px_rgba(201,162,39,0.3)]">
              <span className="font-serif text-2xl font-bold italic tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-[#FAF3E8] via-[#DCBF6F] to-[#C9A227]">
                A
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
              <span className="absolute -top-0.5 -left-0.5 h-1.5 w-1.5 rotate-45 bg-[#C9A227]" />
            </div>
            <div>
              <span className="block font-serif text-2xl font-semibold tracking-tight text-[#FAF3E8] transition-colors group-hover:text-[#DCBF6F]">
                Agrojur
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C9A227]">
                Portal Jurídico Demonstrativo
              </span>
            </div>
          </Link>

          {/* Badge noindex jurídico */}
          <span className="order-3 inline-flex items-center gap-1.5 rounded border border-[#C9A227]/30 bg-[#16140E] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E7D397] shadow-sm sm:order-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227] animate-pulse" />
            Preview • noindex
          </span>

          {/* Navegação refinada */}
          <div className="order-2 flex w-full items-center justify-center gap-3 sm:order-3 sm:w-auto sm:justify-end">
            <nav aria-label="Navegação principal">
              <ul className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `relative inline-flex items-center px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227] ${
                          isActive
                            ? 'text-[#DCBF6F] font-bold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-[#C9A227] after:to-transparent'
                            : 'text-[#B8AF9F] hover:text-[#FAF3E8] hover:bg-[#181818]/70'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="h-4 w-[1px] bg-[#C9A227]/30 hidden sm:block" />
            <Link
              to="/editorial"
              className="group relative inline-flex items-center overflow-hidden rounded border border-[#C9A227]/60 bg-gradient-to-r from-[#181610] to-[#121212] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#FAF3E8] transition-all duration-300 hover:border-[#C9A227] hover:shadow-[0_0_15px_rgba(201,162,39,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              <span className="relative z-10 flex items-center gap-1.5 text-[#DCBF6F] group-hover:text-[#FAF3E8]">
                <span>Área editorial</span>
                <span className="text-xs transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo" className="min-h-[calc(100vh-210px)] relative">
        <Outlet />
      </main>

      {/* Footer elegante e institucional */}
      <footer className="border-t border-[#C9A227]/20 bg-[#080808]">
        <div className="gold-divider" />
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-[#9E9585] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <p className="font-serif text-sm tracking-wide text-[#E8DFD0]">
              Agrojur · Moura e Medeiros Advogados Associados
            </p>
            <p className="text-[11px] text-[#7A7366]">
              Ambiente controlado de desenvolvimento e homologação jurídica.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded border border-[#C9A227]/20 bg-[#12110D] px-3 py-1.5 text-xs text-[#DCBF6F]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A227]" />
            <span>Conteúdo demonstrativo — não é orientação jurídica.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
