import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProducts } from '../lib/firebase'
import { useAuth, useCart } from '../components/Layout'

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(({ data }) => {
      const all = data || []
      const top = all.filter(p => p.is_featured || p.badge === 'BESTSELLER' || p.badge === 'HOT').slice(0, 3)
      setFeatured(top.length ? top : all.slice(0, 3))
      setLoading(false)
    })
  }, [])

  const coverMap = {
    Automation: { bg: 'linear-gradient(145deg,#deeaff,#c4d9ff)', emoji: '⚡' },
    'AI Tools':  { bg: 'linear-gradient(145deg,#eddeff,#dcc8ff)', emoji: '🧠' },
    Business:   { bg: 'linear-gradient(145deg,#ffecd6,#ffd9a8)', emoji: '📈' },
    Analytics:  { bg: 'linear-gradient(145deg,#d6f5e3,#b8edcc)', emoji: '📊' },
    Templates:  { bg: 'linear-gradient(145deg,#fde8e8,#fccaca)', emoji: '🎨' },
  }

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'var(--ink)',
        padding: '96px 24px 88px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,113,227,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', bottom: -60, right: '10%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191,90,242,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          {/* Live pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.11)',
            borderRadius: 'var(--radius-full)', padding: '6px 16px',
            marginBottom: 32,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#34c759', boxShadow: '0 0 8px #34c759',
              animation: 'heroPulse 2s ease-in-out infinite',
            }}/>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.02em' }}>
              New arrivals this week
            </span>
          </div>

          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(2.6rem, 6.5vw, 4.75rem)',
            fontWeight: 700, letterSpacing: '-0.045em',
            lineHeight: 1.03, marginBottom: 22,
          }}>
            Digital tools that<br/>
            <span style={{
              background: 'linear-gradient(95deg, #60a5fa 0%, #a78bfa 50%, #60a5fa 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradShift 5s linear infinite',
            }}>actually work.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            color: 'rgba(255,255,255,0.48)',
            lineHeight: 1.7, maxWidth: 460, margin: '0 auto 40px',
          }}>
            Premium automation flows, AI templates, and business tools.
            Instant delivery. Lifetime access.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/store')}
              style={{
                background: '#fff', color: 'var(--ink)',
                fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 600,
                padding: '13px 30px', border: 'none',
                borderRadius: 'var(--radius-full)', cursor: 'pointer',
                transition: 'var(--trans)', letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              Browse Products →
            </button>
            {!user && (
              <button
                onClick={() => router.push('/signup')}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  color: 'rgba(255,255,255,0.82)',
                  fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 500,
                  padding: '13px 26px', borderRadius: 'var(--radius-full)',
                  cursor: 'pointer', transition: 'var(--trans)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >
                Create Free Account
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 56px)',
            marginTop: 56, flexWrap: 'wrap',
            paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {[['50K+', 'Happy customers'], ['200+', 'Products'], ['4.9', 'Avg rating'], ['< 5s', 'Delivery time']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '13px 24px' }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(16px, 4vw, 44px)', flexWrap: 'wrap',
        }}>
          {[['⚡','Instant delivery'], ['♾️','Lifetime access'], ['🔒','Secure checkout'], ['↩','7-day refund'], ['⭐','4.9 avg rating']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.875rem' }}>{icon}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-3)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ padding: '72px 24px 64px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Featured</div>
              <h2 style={{ letterSpacing: '-0.03em' }}>Top picks this week</h2>
            </div>
            <button
              onClick={() => router.push('/store')}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer', padding: '4px 0' }}
            >
              See all →
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="spinner" style={{ margin: '0 auto' }}/>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {featured.map((p, i) => {
                const cover = coverMap[p.categories?.name] || { bg: 'linear-gradient(145deg,#f0f0f2,#e5e5e7)', emoji: '📦' }
                const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : null
                return (
                  <div
                    key={p.id}
                    className="card card-hover"
                    onClick={() => router.push(`/product/${p.slug}`)}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', animationDelay: `${i * 0.08}s` }}
                  >
                    <div style={{
                      height: 160, background: cover.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                      position: 'relative', fontSize: 48,
                    }}>
                      {p.icon || cover.emoji}
                      {discount && (
                        <span style={{
                          position: 'absolute', top: 12, right: 12,
                          background: 'var(--green-soft)', color: '#1a7a32',
                          fontSize: '0.6875rem', fontWeight: 700,
                          padding: '3px 9px', borderRadius: 'var(--radius-full)',
                        }}>{discount}% off</span>
                      )}
                    </div>
                    <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {p.categories?.name && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>{p.categories.name}</div>
                      )}
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--ink-3)', lineHeight: 1.55, flex: 1, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                        <div>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em' }}>${p.price}</span>
                          {p.original_price && <span style={{ fontSize: '0.875rem', color: 'var(--ink-5)', textDecoration: 'line-through', marginLeft: 6 }}>${p.original_price}</span>}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); addToCart(p) }}
                          style={{
                            background: 'var(--blue-soft)', color: 'var(--blue)',
                            border: 'none', borderRadius: 'var(--radius-full)',
                            fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 600,
                            padding: '7px 16px', cursor: 'pointer', transition: 'var(--trans)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = '#fff' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue-soft)'; e.currentTarget.style.color = 'var(--blue)' }}
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button
              onClick={() => router.push('/store')}
              className="btn btn-secondary"
              style={{ borderRadius: 'var(--radius-full)', padding: '11px 28px' }}
            >
              View all products →
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY VAULT ── */}
      <section style={{ padding: '64px 24px', background: 'var(--white)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Why Vault</div>
            <h2 style={{ letterSpacing: '-0.03em', marginBottom: 10 }}>Built different</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: '1.0625rem', maxWidth: 400, margin: '0 auto' }}>
              Everything you need. Nothing you don't.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Instant Delivery', desc: 'Download within seconds. No waiting, no emails, no friction.' },
              { icon: '♾️', title: 'Lifetime Access', desc: 'Buy once, own forever. All future updates are always free.' },
              { icon: '🔒', title: 'Secure Checkout', desc: 'Your payment and data are protected end-to-end, always.' },
              { icon: '↩', title: '7-Day Refund', desc: 'Not happy? Full refund within 7 days, zero questions asked.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '24px 22px',
                transition: 'var(--trans)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-med)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink)', marginBottom: 7, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--ink-4)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '72px 24px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Reviews</div>
            <h2 style={{ letterSpacing: '-0.03em' }}>What customers say</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { name: 'Rahul M.', role: 'SaaS Founder', text: 'The automation bundle saved me 15+ hours a week. Worth every rupee, no exaggeration.', stars: 5 },
              { name: 'Priya S.', role: 'Freelance Designer', text: 'Best UI templates I have bought anywhere. Clean, minimal, instantly usable.', stars: 5 },
              { name: 'Arjun K.', role: 'Digital Marketer', text: 'The AI prompt kit completely changed how I write copy. Insane ROI for the price.', stars: 5 },
            ].map(t => (
              <div key={t.name} style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '24px',
                transition: 'var(--trans)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                  {[...Array(t.stars)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 12 12">
                      <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.8 2.7,10.5 3.5,7 1,4.8 4.5,4.5" fill="#ff9f0a"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 18, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div className="container">
          <div style={{
            background: 'var(--ink)', borderRadius: 'var(--radius-2xl)',
            padding: 'clamp(40px, 6vw, 64px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 500, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff', letterSpacing: '-0.03em', marginBottom: 12, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>
                Ready to level up?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.0625rem', marginBottom: 32, maxWidth: 380, margin: '0 auto 32px' }}>
                Join 50,000+ customers who use Vault to work smarter every day.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => router.push('/store')}
                  style={{
                    background: '#fff', color: 'var(--ink)',
                    fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 600,
                    padding: '13px 28px', border: 'none', borderRadius: 'var(--radius-full)',
                    cursor: 'pointer', transition: 'var(--trans)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  Browse Products →
                </button>
                {!user && (
                  <button
                    onClick={() => router.push('/signup')}
                    style={{
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)',
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 500,
                      padding: '13px 24px', borderRadius: 'var(--radius-full)',
                      cursor: 'pointer', transition: 'var(--trans)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  >
                    Sign Up Free
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keyframes */}
      <style>{`
        @keyframes heroPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #34c759; }
          50% { opacity: 0.5; box-shadow: 0 0 3px #34c759; }
        }
        @keyframes gradShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  )
}
