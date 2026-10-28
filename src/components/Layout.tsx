import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react'

const navigation = [
  { to: '/', label: 'Início', end: true },
  { to: '/temas', label: 'Temas' },
  { to: '/blog', label: 'Blog' },
  { to: '/diagnostico', label: 'Diagnóstico' },
  { to: '/calculadora', label: 'Calculadora' },
]

export default function Layout() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Detecta rolagem para contrair e tornar a barra sólida/compacta (padrão UX de navegação premium)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fecha o menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#15271E] selection:bg-[#1E4331]/15 selection:text-[#1E4331] font-sans antialiased">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded border border-[#1E4331] bg-white px-4 py-2 text-xs font-bold tracking-wider text-[#1E4331] uppercase shadow-md focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir direto para o conteúdo
      </a>

      {/* Top bar institucional: Verde Floresta Profundo & Terracota Nobre */}
      <div className="border-b border-[#E2EBE5] bg-[#1E4331] py-1.5 text-[11px] font-medium tracking-wider text-[#E2EBE5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#689F82]" />
            <span className="font-medium tracking-wide">
              Advocacia &amp; Inteligência Estratégica do Agronegócio
            </span>
          </div>
          <div className="hidden items-center gap-4 md:flex text-[#C5D8CD] text-[11px]">
            <span>Moura e Medeiros Advogados Associados</span>
            <span className="text-[#3D8562]">|</span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#E2EBE5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CBB29E]" />
              PREVIEW CONTROLADO
            </span>
          </div>
        </div>
      </div>

      {/* Header Sticky com transição suave para compacto ao rolar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'border-b border-[#E2EBE5] bg-white/95 py-2.5 shadow-[0_4px_24px_rgba(30,67,49,0.06)] backdrop-blur-md'
            : 'border-b border-[#E2EBE5]/80 bg-white/90 py-4 shadow-[0_1px_3px_rgba(30,67,49,0.03)] backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Jurídico Agro com Monograma Nobre */}
          <Link
            to="/"
            className="group flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331] rounded-md p-1 -m-1"
            aria-label="Agrojur, página inicial"
          >
            <div
              className={`relative flex items-center justify-center rounded-lg border border-[#1E4331]/20 bg-gradient-to-br from-[#1E4331] to-[#15271E] text-white shadow-sm transition-all duration-300 group-hover:border-[#1E4331] group-hover:shadow-[0_4px_16px_rgba(30,67,49,0.2)] ${
                isScrolled ? 'h-9 w-9' : 'h-11 w-11'
              }`}
            >
              <span
                className={`font-serif italic font-bold tracking-wider text-white ${
                  isScrolled ? 'text-lg' : 'text-2xl'
                }`}
              >
                A
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rotate-45 bg-[#784D34]" />
              <span className="absolute -top-0.5 -left-0.5 h-1.5 w-1.5 rotate-45 bg-[#784D34]" />
            </div>
            <div>
              <span
                className={`block font-serif font-semibold tracking-tight text-[#15271E] transition-colors group-hover:text-[#1E4331] ${
                  isScrolled ? 'text-xl leading-none' : 'text-2xl leading-tight'
                }`}
              >
                Agrojur
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#523422]">
                Moura &amp; Medeiros
              </span>
            </div>
          </Link>

          {/* Navegação Desktop limpa, com espaçamento 8pt e indicador refinado */}
          <div className="hidden lg:flex items-center gap-8">
            <nav aria-label="Navegação principal">
              <ul className="flex items-center gap-1">
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `relative inline-flex items-center px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331] ${
                          isActive
                            ? 'text-[#1E4331] font-bold bg-[#EBF0EC]/80 after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-0.5 after:bg-[#1E4331] after:rounded-full'
                            : 'text-[#425A4E] hover:text-[#15271E] hover:bg-[#F4F7F4]'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="h-5 w-[1px] bg-[#E2EBE5]" />

            {/* Ações da direita: Tag de preview e CTA editorial elegante */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2EBE5] bg-[#F4F7F4] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[#523422]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1E4331]" />
                noindex
              </span>

              <Link
                to="/editorial"
                className="group inline-flex items-center gap-2 rounded-lg border border-[#1E4331] bg-[#1E4331] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-[#15271E] hover:shadow-[0_4px_14px_rgba(30,67,49,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
              >
                <span>Área Editorial</span>
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>

          {/* Botão de Menu Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/editorial"
              className="inline-flex items-center rounded-md border border-[#1E4331] bg-[#1E4331] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white"
            >
              Editorial
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] p-2 text-[#1E4331] hover:bg-[#EBF0EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4331]"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Retrátil e Elegante */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2EBE5] bg-white px-4 pt-3 pb-6 shadow-xl animate-fade-in-down">
            <nav aria-label="Navegação mobile" className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors ${
                      isActive
                        ? 'bg-[#1E4331] text-white font-bold'
                        : 'text-[#2F4238] hover:bg-[#F4F7F4]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                  <ChevronRight size={14} className="opacity-60" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-[#E2EBE5] flex flex-col gap-3">
              <div className="flex items-center justify-between px-2 text-xs text-[#523422]">
                <span className="font-serif italic">Moura e Medeiros Advogados</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#689F82]">
                  Preview Seguro
                </span>
              </div>
              <Link
                to="/editorial"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#784D34] bg-[#784D34] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm"
              >
                <span>Acessar Área Editorial</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo principal sobre fundo branco/creme suave agro */}
      <main id="conteudo" className="min-h-[calc(100vh-210px)] relative">
        <Outlet />
      </main>

      {/* Footer elegante, institucional e sóbrio */}
      <footer className="border-t border-[#E2EBE5] bg-white">
        <div className="agro-divider" />
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-semibold tracking-wide text-[#1E4331]">
                Agrojur · Moura e Medeiros Advogados Associados
              </span>
            </div>
            <p className="text-xs text-[#5A7567]">
              Assessoria jurídica integrada ao produtor rural, cooperativas e agroindústrias.
            </p>
            <p className="text-[11px] text-[#784D34]">
              Ambiente demonstrativo de desenvolvimento e homologação jurídica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#E2EBE5] bg-[#F4F7F4] px-3.5 py-2 text-xs text-[#24523C]">
              <ShieldCheck size={14} className="text-[#1E4331]" />
              <span>Conteúdo demonstrativo — não substitui parecer profissional.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
