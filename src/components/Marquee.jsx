const items = [
  'Authentic Paratha',
  '✦',
  'Fresh Ingredients',
  '✦',
  'Generations of Love',
  '✦',
  'Handcrafted Daily',
  '✦',
  'Taste the Tradition',
  '✦',
  'Crispy Layers',
  '✦',
  'Made with Heart',
  '✦',
  'Since 1987',
  '✦',
]

export default function Marquee() {
  return (
    <div style={{ background: 'var(--charcoal)', overflow: 'hidden', padding: '15px 0' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee-scroll 35s linear infinite' }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: item === '✦' ? 'inherit' : 'var(--font-display)',
              fontSize: item === '✦' ? 14 : 'clamp(18px, 2.5vw, 28px)',
              fontWeight: item === '✦' ? 400 : 600,
              color: item === '✦' ? 'var(--paprika)' : 'var(--cream)',
              whiteSpace: 'nowrap',
              padding: '0 24px',
              lineHeight: 1.2,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
