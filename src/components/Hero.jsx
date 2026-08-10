import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'phosphor-react'

const PARATHA_URL ='img3.avif'

const ingredients = [
  {
    id: 'chili',
    url: 'chili.avif',
    alt: 'Vibrant spice powders in spoons',
    // label: 'Kashmiri Chilli',
    initX: 5,
    initY: -160,
    initRotate: -10,
    exitX: 0,
    exitY: -280,
    exitRotate: -180,
    size: 100,
    mobileXAdj: 36,
    mobileYAdj: -20,
  },
  {
    id: 'Onion',
    url: 'Onion.avif',
    alt: 'Star anise close-up',
    // label: 'Star Anise',
    initX: 22,
    initY: -80,
    initRotate: 15,
    exitX: 170,
    exitY: -160,
    exitRotate: 220,
    size: 148,
    mobileRAdj: 15,
    mobileXAdj: 0,
    mobileYAdj: 0,
  },
  {
    id: 'coriander',
    url: 'coriander.avif',
    alt: 'Variety of whole spices',
    // label: 'Coriander',
    initX: 22,
    initY: 180,
    initRotate: -8,
    exitX: 170,
    exitY: 160,
    exitRotate: -200,
    size: 156,
    mobileRAdj: 50,
    mobileXAdj: 0,
    mobileYAdj: 0,
  },
  {
    id: 'Cauliflower',
    url: 'flower2.avif',
    alt: 'Spice condiments in spoons',
    // label: 'Turmeric',
    initX: 5,
    initY: 250,
    initRotate: 12,
    exitX: 0,
    exitY: 350,
    exitRotate: 180,
    size: 120,
    mobileRAdj: 90,
    mobileXAdj: 30,
    mobileYAdj: 0,
  },
  {
    id: 'potato',
    url: 'potato.avif',
    alt: 'Row of spice spoons',
    // label: 'Potato',
    initX: -12,
    initY: 150,
    initRotate: -15,
    exitX: -170,
    exitY: 160,
    exitRotate: -220,
    size: 140,
    mobileRAdj: -65,
    mobileXAdj: 0,
    mobileYAdj: 70,
  },
  {
    id: 'Radish',
    url: 'Radish.avif', 
    alt: 'Dried herbs and spices',
    // label: 'Radish',
    initX: -12,
    initY: -50,
    initRotate: 20,
    exitX: -170,
    exitY: -160,
    exitRotate: 210,
    size: 152,
    mobileRAdj: -58,
    mobileXAdj: 0,
    mobileYAdj: -40,
  },
]

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

export default function Hero() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [loadProgress, setLoadProgress] = useState(0)

  const applyProgress = () => {
    const section = sectionRef.current
    if (!section) return
    const sectionPosition = section.getBoundingClientRect()
    const sectionH = section.offsetHeight
    const viewH = window.innerHeight
    const scrolled = -sectionPosition.top
    const scrollable = sectionH - viewH
    const p = Math.min(1, Math.max(0, scrolled / scrollable))
    setProgress(p)
  }

  useEffect(() => {
    const handleScroll = () => applyProgress()
    window.addEventListener('scroll', handleScroll, { passive: true })
    applyProgress()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const duration = 1200
    let rafId
    let start = performance.now()
    const tick = () => {
      const elapsed = (performance.now() - start) / duration
      if (elapsed < 1) {
        setLoadProgress(elapsed)
        rafId = requestAnimationFrame(tick)
      } else {
        setLoadProgress(1)
      }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const ep = easeInOut(progress)
  const entranceEp = easeInOut(loadProgress)
  const displayT = loadProgress < 1 ? (1 - entranceEp) : ep

  const vw = window.innerWidth
  const isMobile = vw < 640
  const mobileScale = isMobile ? Math.min(0.65, vw / 500) : 1

  // Paratha animation
  const parathaRotateZ = lerp(0, 420, displayT)
  const parathaRotateY = lerp(0, 180, displayT)
  const parathaTranslateY = lerp(0, -115, displayT)
  const parathaScale = lerp(1, 0.55, displayT)
  const parathaOpacity = loadProgress < 1
    ? 0.4 + entranceEp * 0.6
    : (ep > 0.75 ? lerp(1, 0, (ep - 0.75) / 0.25) : 1)

  return (
    <div className="hero-wrapper" style={{  minHeight: '100vh', background: 'var(--charcoal)' }}>
      {/* â”€â”€ Scroll-driven section â”€â”€ */}
      <div ref={sectionRef} style={{ position: 'relative', height: isMobile ? '550vh' : '300vh' }}>
        <div
          className="hero-sticky-container"
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: 'var(--charcoal)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
         

          {/* â”€â”€ Hero stage â”€â”€ */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Radial warm glow behind paratha */}
            <div
              style={{
                position: 'absolute',
                width: Math.round(520 * mobileScale),
                height: Math.round(520 * mobileScale),
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(227,160,8,0.18) 0%, rgba(194,65,12,0.07) 55%, transparent 75%)',
                pointerEvents: 'none',
                opacity: 1 - ep * 0.8,
            
              }}
            />

            {/* Ambient ring */}
            <div
              style={{
                position: 'absolute',
                width: Math.round(400 * mobileScale),
                height: Math.round(400 * mobileScale),
                borderRadius: '50%',
                border: '1px solid rgba(194,65,12,0.14)',
                pointerEvents: 'none',
                opacity: 1 - ep,
                
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: Math.round(500 * mobileScale),
                height: Math.round(500 * mobileScale),
                borderRadius: '50%',
                border: '1px dashed rgba(194,65,12,0.08)',
                pointerEvents: 'none',
                opacity: 1 - ep,
                animation: 'spin-slow 30s linear infinite',
                
              }}
            />

            {/* â”€â”€ Ingredient images â”€â”€ */}
            {ingredients.map((ing, i) => {
              const s = isMobile ? mobileScale : 1
              const size = Math.round(ing.size * s)
              let initX = ing.initX, initY = ing.initY
              if (isMobile) {
                const angle = (i / 6) * Math.PI * 2 - Math.PI / 2
                const rAdj = ing.mobileRAdj || 0
                const ringR = Math.min(vw * 0.45, 170) + rAdj
                const xOff = (ing.mobileXAdj || 0) / vw * 100
                const yOff = ing.mobileYAdj || 0
                initX = Math.cos(angle) * ringR / vw * 100 + xOff
                initY = Math.sin(angle) * ringR + 50 + yOff
              }
              const ox = lerp(initX, ing.exitX * (isMobile ? 2.5 : 1), displayT)
              const oy = lerp(initY * s, ing.exitY * (isMobile ? 2.2 : 1) * s, displayT)
              const rot = lerp(ing.initRotate, ing.exitRotate, displayT)
              const opacity = loadProgress < 1
                ? 0.4 + entranceEp * 0.6
                : (ep > 0.5 ? lerp(1, 0, (ep - 0.5) / 0.35) : 1)

              const floatDuration = 3 + (i % 3) * 0.7

              return (
                <div
                  key={ing.id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: size,
                    height: size,
                    transform: `translate(calc(-50% + ${ox}vw - ${size / 2}px), calc(-50% + ${oy - 50}px)) rotate(${rot}deg)`,
                    opacity,
                    transition: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      animation: `float ${floatDuration}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={ing.url}
                        alt={ing.alt}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          mixBlendMode: 'multiply',
                          display: 'block',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: isMobile ? -16 : -22,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: isMobile ? '0.55rem' : '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ink-soft)',
                        whiteSpace: 'nowrap',
                        opacity: 1 - displayT * 2,
                      }}
                    >
                      
                    </div>
                  </div>
                </div>
              )
            })}

            {/* â”€â”€ Paratha â”€â”€ */}
            <div
              style={{
                position: 'relative',
                zIndex: 20,
                transform: `
                  perspective(800px)
                  translateY(${parathaTranslateY}vh)
                  rotateZ(${parathaRotateZ}deg)
                  rotateY(${parathaRotateY}deg)
                  scale(${parathaScale})
                `,
                opacity: parathaOpacity,
              }}
            >
              <div
                style={{
                  width: Math.round(320 * mobileScale),
                  height: Math.round(320 * mobileScale),
                }}
              >
<img
                src={PARATHA_URL}
                alt="Fresh paratha flatbread"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              </div>
            </div>

            {/* â”€â”€ Video background (appears with headline) â”€â”€ */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: ep > 0.65 ? Math.min(1, (ep - 0.65) / 0.3) : 0,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src="6221661-uhd_2160_3840_24fps.mp4" type="video/mp4" />
              </video>
            </div>

            {/* â”€â”€ Headline text (appears centered after paratha exits) â”€â”€ */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                maxWidth: isMobile ? '100%' : 'none',
                padding: isMobile ? '0 20px' : 0,
                boxSizing: 'border-box',
                opacity: ep > 0.65 ? Math.min(1, (ep - 0.65) / 0.3) : 0,
                pointerEvents: ep > 0.65 ? 'auto' : 'none',
                zIndex: 10,
              }}
            >
              <h1
                className="hero-headline"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: isMobile ? 'clamp(1.5rem, 7vw, 2.3rem)' : 'clamp(2.8rem, 5.5vw, 4.5rem)',
                  letterSpacing: isMobile ? '-0.005em' : '-0.03em',
                  lineHeight: isMobile ? 1.18 : 1.08,
                  color: 'var(--cream)',
                  margin: 0,
                  padding: 0,
                  maxWidth: '100%',
                }}
              >
                Handcrafted with 
                <br />
                <span style={{ color: 'var(--paprika)' }}>Generations of Love</span>
              </h1>
              <p
                className="hero-tagline"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 400,
                  fontSize: isMobile ? 'clamp(0.75rem, 3.5vw, 0.875rem)' : '1rem',
                  color: 'var(--ink)',
                  marginTop: isMobile ? 10 : 16,
                  lineHeight: isMobile ? 1.4 : 1.5,
                  letterSpacing: '0.02em',
                  padding: isMobile ? '0 20px' : 0,
                }}
              >
                Authentic paratha crafted fresh â€” every layer tells a story.
              </p>
              <div style={{ display: 'flex', gap: isMobile ? 10 : 16, justifyContent: 'center', alignItems: 'center', marginTop: isMobile ? 20 : 32, padding: isMobile ? '0 20px' : 0 }}>
                <Link
                  to="/menu"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: isMobile ? '14px 32px' : '14px 26px',
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: isMobile ? 13.5 : 14.5,
                    border: 'none',
                    transition: 'transform .18s ease, box-shadow .18s ease, background .18s ease',
                    whiteSpace: 'nowrap',
                    background: 'var(--paprika)',
                    color: '#fff7ec',
                    boxShadow: '0 8px 20px rgba(194,65,12,.32)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (isMobile) return
                    const el = e.target
                    el.style.background = 'var(--paprika-dark)'
                    el.style.transform = 'translateY(-2px)'
                    el.style.boxShadow = '0 12px 28px rgba(194,65,12,.45)'
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile) return
                    const el = e.target
                    el.style.background = 'var(--paprika)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = '0 8px 20px rgba(194,65,12,.32)'
                  }}
                >
                  Order Now <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </div>

           
          </div>
        </div>
      </div>


    

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes grow-line {
          0%   { transform: mobileScaleY(0); transform-origin: top; opacity: 0; }
          40%  { transform: mobileScaleY(1); opacity: 0.35; }
          100% { transform: mobileScaleY(1); transform-origin: bottom; opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1.5deg); }
        }
        @media (max-width: 639px) {
          .hero-wrapper {
            min-height: 100vh;
          }
          .hero-sticky-container {
            height: 100vh !important;
          }
          .hero-stage {
            overflow: hidden;
          }
        }
        @media (max-width: 860px) {
          .hero-headline {
            font-size: clamp(1.5rem, 6.5vw, 2.3rem) !important;
            letter-spacing: -0.005em !important;
            line-height: 1.18 !important;
            padding: 0 16px !important;
          }
          .hero-tagline {
            font-size: clamp(0.8rem, 3.5vw, 0.95rem) !important;
            padding: 0 28px !important;
          }
        }
      `}</style>
    </div>
  )
}
