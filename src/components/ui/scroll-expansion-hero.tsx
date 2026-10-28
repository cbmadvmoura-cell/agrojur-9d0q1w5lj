import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image'
  mediaSrc: string
  posterSrc?: string
  bgImageSrc: string
  title?: string
  date?: string
  scrollToExpand?: string
  textBlend?: boolean
  children?: ReactNode
  className?: string
}

export const ScrollExpandMedia = ({
  mediaType = 'image',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand = 'Role para revelar',
  textBlend = false,
  children,
  className,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const [showContent, setShowContent] = useState<boolean>(false)
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false)
  const [touchStartY, setTouchStartY] = useState<number>(0)
  const [isMobileState, setIsMobileState] = useState<boolean>(false)

  const sectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setScrollProgress(0)
    setShowContent(false)
    setMediaFullyExpanded(false)
  }, [mediaType])

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollDelta = e.deltaY * 0.0012
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setTouchStartY(e.touches[0].clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartY || !e.touches || !e.touches[0]) return

      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false)
        e.preventDefault()
      } else if (!mediaFullyExpanded) {
        e.preventDefault()
        const scrollFactor = deltaY < 0 ? 0.008 : 0.005
        const scrollDelta = deltaY * scrollFactor
        const newProgress = Math.min(Math.max(scrollProgress + scrollDelta, 0), 1)
        setScrollProgress(newProgress)

        if (newProgress >= 1) {
          setMediaFullyExpanded(true)
          setShowContent(true)
        } else if (newProgress < 0.75) {
          setShowContent(false)
        }

        setTouchStartY(touchY)
      }
    }

    const handleTouchEnd = (): void => {
      setTouchStartY(0)
    }

    const handleScroll = (): void => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [scrollProgress, mediaFullyExpanded, touchStartY])

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const mediaWidth = 320 + scrollProgress * (isMobileState ? 650 : 1250)
  const mediaHeight = 420 + scrollProgress * (isMobileState ? 220 : 420)
  const textTranslateX = scrollProgress * (isMobileState ? 160 : 140)

  const firstWord = title ? title.split(' ')[0] : ''
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : ''

  return (
    <div
      ref={sectionRef}
      className={cn(
        'transition-colors duration-700 ease-in-out overflow-x-hidden bg-[#0A0A0A]',
        className,
      )}
    >
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Fundo com transição de opacidade ao expandir */}
          <motion.div
            className="absolute inset-0 z-0 h-full pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.15 }}
          >
            <img
              src={bgImageSrc}
              alt="Cenário de fundo agronegócio"
              className="w-full h-full object-cover object-center filter brightness-50 contrast-105"
              loading="eager"
            />
            {/* Vinheta escura clássica Moura e Medeiros */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/85 via-[#0A0A0A]/60 to-[#0A0A0A]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0A0A0A_95%)]" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10 w-full px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center w-full min-h-[100dvh] relative py-12">
              {/* Moldura central de mídia que expande */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-none rounded-2xl overflow-hidden border border-[#C9A227]/40 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(201,162,39,0.25)]"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '96vw',
                  maxHeight: '88vh',
                }}
              >
                {mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        width="100%"
                        height="100%"
                        src={
                          mediaSrc.includes('embed')
                            ? `${mediaSrc}${mediaSrc.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                            : `${mediaSrc.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=${
                                mediaSrc.split('v=')[1]
                              }`
                        }
                        className="w-full h-full rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={title || 'Vídeo institucional'}
                      />
                      <div className="absolute inset-0 z-10 pointer-events-none" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full pointer-events-none">
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-xl"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <div className="absolute inset-0 z-10 pointer-events-none" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40 rounded-xl"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaSrc}
                      alt={title || 'Moura e Medeiros Agronegócio'}
                      className="w-full h-full object-cover object-center rounded-xl"
                      loading="eager"
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-black/35 to-black/40 rounded-xl"
                      initial={{ opacity: 0.65 }}
                      animate={{ opacity: Math.max(0.4 - scrollProgress * 0.25, 0.15) }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Cantoneiras douradas clássicas no frame expansivo */}
                <div className="pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-[#E7D397]/70" />
                <div className="pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-[#E7D397]/70" />
                <div className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#E7D397]/70" />
                <div className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#E7D397]/70" />
              </div>

              {/* Tag / subtítulo superior */}
              <div className="flex flex-col items-center text-center relative z-10 mb-6 transition-none">
                {date && (
                  <p
                    className="font-serif italic text-lg sm:text-2xl font-medium tracking-wide text-[#E7D397] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                    style={{ transform: `translateX(-${textTranslateX}vw)` }}
                  >
                    {date}
                  </p>
                )}
                {scrollToExpand && (
                  <div
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#14120C]/85 px-4 py-1.5 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    style={{ transform: `translateX(${textTranslateX}vw)` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#DCBF6F] animate-pulse" />
                    <span className="font-sans text-xs font-semibold tracking-widest uppercase text-[#F5F1E8]">
                      {scrollToExpand}
                    </span>
                    <span className="font-mono text-xs text-[#DCBF6F] animate-bounce">↓</span>
                  </div>
                )}
              </div>

              {/* Título com tipografia serifada de alto luxo em tom ouro/champagne */}
              <div
                className={cn(
                  'flex items-center justify-center text-center gap-2 sm:gap-4 w-full relative z-10 transition-none flex-col',
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal',
                )}
              >
                <motion.h2
                  className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[#FAF3E8] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-none"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAF3E8] via-[#F5E6C8] to-[#DCBF6F]">
                    {firstWord}
                  </span>
                </motion.h2>
                <motion.h2
                  className="font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-center tracking-tight text-[#DCBF6F] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] transition-none"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            {/* Conteúdo que é revelado após expansão completa */}
            <motion.section
              className="flex flex-col w-full py-8 md:py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ScrollExpandMedia
