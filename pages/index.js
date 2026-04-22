import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProducts } from '../lib/supabase'
import { useCart } from '../components/Layout'

const StarRating = ({ rating }) => (
  <span style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: 2 }}>
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span style={{ color: 'var(--ash)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', marginLeft: 6 }}>
      {rating}
    </span>
  </span>
)

const ProductCard = ({ product, onClick }) => {
  const badgeMap = {
    BESTSELLER: 'badge-gold', HOT: 'badge-red',
    PREMIUM: 'badge-elite', NEW: 'badge-gold', ELITE: 'badge-elite',
  }

  return (
    <div
      className="card"
      onClick={() => onClick(product.slug)}
      style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
    >
      {/* Color bar */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, var(--blood), var(--gold-dim))`,
      }}/>

      <div style={{ padding: 28 }}>
        {/* Badge + category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
            color: 'var(--smoke)', letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            {product.categories?.icon} {product.categories?.name}
          </span>
          {product.badge && (
            <span className={`badge ${badgeMap[product.badge] || 'badge-ash'}`}>
              {product.badge}
            </span>
          )}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.15rem',
          color: 'var(--cream)', marginBottom: 10, letterSpacing: '0.05em',
        }}>{product.name}</h3>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          color: 'var(--ash)', lineHeight: 1.6, marginBottom: 20,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{product.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem',
              color: 'var(--gold-shine)', letterSpacing: '0.05em',
            }}>
              ${product.price}
              {product.original_price && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: 'var(--smoke)', textDecoration: 'line-through', marginLeft: 8,
                }}>${product.original_price}</span>
              )}
            </div>
            <div style={{ marginTop: 4 }}>
              <StarRating rating={product.rating} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: 'var(--smoke)', letterSpacing: '0.1em', textAlign: 'right',
          }}>
            {product.total_sales}+ sold
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    getProducts().then(({ data }) => {
      if (data) setProducts(data.filter(p => p.is_featured).slice(0, 3))
    })
  }, [])

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '100px 24px 80px',
        textAlign: 'center',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(184,150,12,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184,150,12,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}/>

        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(122,0,0,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Vertical accent lines */}
        {[15, 35, 65, 85].map(p => (
          <div key={p} style={{
            position: 'absolute', top: 0, left: `${p}%`,
            width: 1, height: '35%',
            background: 'linear-gradient(180deg, transparent, rgba(122,0,0,0.25), transparent)',
            pointerEvents: 'none',
          }}/>
        ))}

        <div style={{
          position: 'relative', zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
          maxWidth: 780,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'var(--crimson)', marginBottom: 28,
            border: '1px solid var(--blood)',
            display: 'inline-block', padding: '6px 20px',
          }}>
            ◆ Premium Digital Marketplace ◆
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3.5rem, 12vw, 8rem)',
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            marginBottom: 32,
          }}>
            <span className="text-gold-shine">VAULT</span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            fontStyle: 'italic',
            color: 'var(--ash)',
            maxWidth: 520, margin: '0 auto 48px',
            lineHeight: 1.85,
          }}>
            Where automation becomes empire. Premium AI tools, workflows &amp; systems — built for those who operate differently.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-gold btn-lg"
              onClick={() => router.push('/store')}
            >
              Enter the Vault
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => router.push('/login')}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute', bottom: 48, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 56, flexWrap: 'wrap', justifyContent: 'center',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1s ease 0.6s',
        }}>
          {[['1,200+', 'Customers'], ['$240K+', 'Revenue'], ['6', 'Products'], ['98%', 'Satisfaction']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                color: 'var(--gold-mid)', letterSpacing: '0.05em',
              }}>{val}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                color: 'var(--smoke)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4,
              }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16,
          }}>
            <div>
              <div className="section-label">◆ Featured</div>
              <h2 className="section-title">Top Sellers</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => router.push('/store')}>
              View All Products →
            </button>
          </div>

          {products.length > 0 ? (
            <div className="grid-products">
              {products.map(p => (
                <ProductCard key={p.id} product={p} onClick={(slug) => router.push(`/product/${slug}`)} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '60px 0',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              color: 'var(--smoke)', letterSpacing: '0.15em',
            }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }}/>
              Loading products...
            </div>
          )}
        </div>
      </section>

      {/* ── WHY VAULT ── */}
      <section style={{
        padding: '80px 0',
        background: 'var(--obsidian)',
        borderTop: '1px solid var(--border-dim)',
        borderBottom: '1px solid var(--border-dim)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">◆ Why Choose</div>
            <h2 className="section-title">The VAULT Difference</h2>
          </div>
          <div className="grid-3">
            {[
              { icon: '⚡', title: 'Instant Delivery', desc: 'Download immediately after purchase. No waiting, no delays.' },
              { icon: '♾️', title: 'Lifetime Updates', desc: 'Every product is updated as tools evolve. Pay once, use forever.' },
              { icon: '🔒', title: 'Secure & Private', desc: 'Your data stays yours. No tracking, no sharing, no compromise.' },
            ].map(f => (
              <div key={f.title} className="stat-card" style={{ textAlign: 'center', padding: 36 }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1rem',
                  letterSpacing: '0.1em', marginBottom: 12,
                }}>{f.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                  color: 'var(--ash)', lineHeight: 1.7, fontStyle: 'italic',
                }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            marginBottom: 20,
          }}>
            Ready to <span className="text-gold-shine">automate</span> your empire?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '1.1rem',
            color: 'var(--ash)', fontStyle: 'italic', marginBottom: 40, lineHeight: 1.8,
          }}>
            Join 1,200+ operators who run smarter systems, close more clients, and work fewer hours.
          </p>
          <button className="btn btn-gold btn-lg" onClick={() => useRouter().push('/store')}>
            Browse the Store
          </button>
        </div>
      </section>
    </div>
  )
}
