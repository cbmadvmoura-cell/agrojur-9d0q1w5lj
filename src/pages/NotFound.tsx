/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4 text-[#F5F1E8]">
      <div className="relative max-w-md rounded-lg border border-[#C9A227]/30 bg-gradient-to-b from-[#141414] to-[#0E0E0E] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#C9A227]/60" />
        <div className="absolute top-2 right-2 h-3 w-3 border-t border-r border-[#C9A227]/60" />
        <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#C9A227]/60" />
        <div className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#C9A227]/60" />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A227]">Erro 404</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-[#FAF3E8]">
          Página não encontrada
        </h1>
        <p className="mt-4 font-sans text-xs leading-relaxed text-[#A39985]">
          O endereço solicitado não existe ou não está acessível no preview controlado do Agrojur.
        </p>
        <div className="mt-7">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded border border-[#DCBF6F] bg-gradient-to-r from-[#C9A227] via-[#DCBF6F] to-[#B28E1D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C0C0C] transition hover:brightness-110"
          >
            Retornar ao início
          </a>
        </div>
      </div>
    </div>
  )
}

export default NotFound
