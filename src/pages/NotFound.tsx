/* 404 Page - Displays when a user attempts to access a non-existent route */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF8] px-4 text-[#15271E]">
      <div className="relative max-w-md rounded-2xl border border-[#E2EBE5] bg-white p-8 text-center shadow-[0_12px_36px_rgba(30,67,49,0.08)]">
        <div className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#784D34]" />
        <div className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#784D34]" />
        <div className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#784D34]" />
        <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#784D34]" />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#784D34]">Erro 404</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-[#15271E]">
          Página não encontrada
        </h1>
        <p className="mt-4 font-sans text-xs leading-relaxed text-[#5A7567]">
          O endereço solicitado não existe ou não está acessível no preview controlado do Agrojur.
        </p>
        <div className="mt-7">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E4331] bg-[#1E4331] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#15271E] hover:shadow-md"
          >
            Retornar ao início
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
