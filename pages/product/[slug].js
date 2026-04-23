import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProduct, checkPurchased } from '../../lib/firebase'
import { useAuth, useCart, useToast } from '../../components/Layout'

export default function ProductPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()
  const { cart, addToCart } = useCart()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchased, setPurchased] = useState(false)
  const [inCart, setInCart] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!slug) return
    getProduct(slug).then(async ({ data }) => {
      setProduct(data)
      setLoading(false)
      if (data && user) {
        const bought = await checkPurchased(user.id || user.uid, data.id)
        setPurchased(bought)
      }
    })
  }, [slug, user])

  useEffect(() => {
    if (product) setInCart(cart.some(i => i.id === product.id))
  }, [cart, product])

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    setAdding(true)
    await new Promise(r => setTimeout(r, 300))
    addToCart(product)
    setAdding(false)
  }

  const handleBuyNow = () => {
    if (!user) { router.push('/login'); return }
    addToCart(product)
    router.push('/cart')
  }

  const coverMap = {
    Automation: { bg: 'linear-gradient(145deg,#deeaff,#c4d9ff)', emoji: '⚡' },
    'AI Tools':  { bg: 'linear-gradient(145deg,#eddeff,#dcc8ff)', emoji: '🧠' },
    Business:   { bg: 'linear-gradient(145deg,#ffecd6,#ffd9a8)', emoji: '📈' },
    Analytics:  { bg: 'linear-gradient(145deg,#d6f5e3,#b8edcc)', emoji: '📊' },
    Templates:  { bg: 'linear-gradient(145deg,#fde8e8,#fccaca)', emoji: '🎨' },
  }

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 28, height: 28 }}/>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, background: 'var(--bg)' }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 10 }}>Product not found</h2>
        <p style={{ color: 'var(--ink-4)', marginBottom: 24 }}>This product may have been removed.</p>
        <button className="btn btn-primary-dark" onClick={() => router.push('/store')}>Back to Store</button>
      </div>
    </div>
  )

  const cover = coverMap[product.categories?.name] || { bg: 'linear-gradient(145deg,#f0f0f2,#e5e5e7)', emoji: '📦' }
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - var(--nav-h))' }}>

      {/* Breadcrumb */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8125rem', color: 'var(--ink-4)' }}>
            <span onClick={() => router.push('/')} style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 500 }}>Home</span>
            <span>›</span>
            <span onClick={() => router.push('/store')} style={{ cursor: 'pointer', color: 'var(--blue)', fontWeight: 500 }}>Store</span>
            <span>›</span>
            <span style={{ color: 'var(--ink-3)' }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>

          {/* ── LEFT: Product Info ── */}
          <div>
            {/* Cover image */}
            <div style={{
              background: cover.bg, borderRadius: 'var(--radius-2xl)',
              height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 88, marginBottom: 32,
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              {product.icon || cover.emoji}
            </div>

            {/* Category + badge */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              {product.categories?.name && (
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.04em' }}>
                  {product.categories.name}
                </span>
              )}
              {product.badge && (
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  background: 'var(--blue-soft)', color: 'var(--blue)',
                  padding: '2px 9px', borderRadius: 'var(--radius-full)',
                }}>
                  {product.badge}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', letterSpacing: '-0.035em', marginBottom: 14, lineHeight: 1.15 }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="14" height="14" viewBox="0 0 12 12">
                      <polygon points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.8 2.7,10.5 3.5,7 1,4.8 4.5,4.5" fill={i <= Math.round(product.rating) ? '#ff9f0a' : '#e5e5e7'}/>
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)' }}>{product.rating}</span>
                {product.total_sales > 0 && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink-4)' }}>· {product.total_sales.toLocaleString()} sold</span>
                )}
              </div>
            )}

            <hr className="divider"/>

            {/* Description */}
            <p style={{ fontSize: '1.0625rem', color: 'var(--ink-3)', lineHeight: 1.75, marginBottom: 32 }}>
              {product.long_description || product.description}
            </p>

            {/* Features */}
            {product.features?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16, color: 'var(--ink)' }}>
                  What's included
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {product.features.map(f => (
                    <div key={f} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '12px 14px',
                      background: 'var(--white)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--green-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 3.5-4" stroke="#1a7a32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.9375rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview blurred section */}
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: 24,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                Free Preview
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.65 }}>
                Full product unlocks immediately after purchase.
              </p>
              <div style={{ position: 'relative' }}>
                <div style={{
                  filter: purchased ? 'none' : 'blur(5px)',
                  pointerEvents: purchased ? 'auto' : 'none',
                  userSelect: purchased ? 'auto' : 'none',
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                  padding: 16, fontFamily: 'monospace', fontSize: '0.8125rem',
                  color: 'var(--ink-3)', lineHeight: 2,
                }}>
                  <div>Step 1: Open your dashboard...</div>
                  <div>Step 2: Import the bundle files...</div>
                  <div>Step 3: Configure settings...</div>
                  <div>Download: vault-product-bundle.zip</div>
                </div>
                {!purchased && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(2px)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>🔒</div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)' }}>
                      Purchase to unlock
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Buy Card (sticky) ── */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-2xl)', padding: 28,
              boxShadow: 'var(--shadow-lg)',
            }}>
              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
                    ${product.price}
                  </span>
                  {product.original_price && (
                    <span style={{ fontSize: '1.0625rem', color: 'var(--ink-5)', textDecoration: 'line-through' }}>
                      ${product.original_price}
                    </span>
                  )}
                </div>
                {discount && (
                  <span style={{
                    display: 'inline-block', marginTop: 6,
                    background: 'var(--green-soft)', color: '#1a7a32',
                    fontSize: '0.8125rem', fontWeight: 700,
                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    Save {discount}%
                  </span>
                )}
              </div>

              <hr className="divider" style={{ margin: '16px 0' }}/>

              {/* CTA */}
              {purchased ? (
                <div>
                  <div style={{
                    background: 'var(--green-soft)', border: '1px solid rgba(52,199,89,0.2)',
                    borderRadius: 'var(--radius-md)', padding: '12px 16px',
                    textAlign: 'center', marginBottom: 16,
                    fontSize: '0.875rem', fontWeight: 600, color: '#1a7a32',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" stroke="#1a7a32"/>
                      <path d="M4 7l2.5 2.5 3.5-4" stroke="#1a7a32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    You own this product
                  </div>
                  {product.download_url ? (
                    <a href={product.download_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="btn btn-primary btn-full btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
                        ↓ Download Now
                      </button>
                    </a>
                  ) : (
                    <div style={{
                      padding: '14px', textAlign: 'center',
                      background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem', color: 'var(--ink-4)', lineHeight: 1.6,
                    }}>
                      Download link has been sent to your email.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="btn btn-primary-dark btn-full btn-lg"
                    onClick={handleBuyNow}
                    style={{ borderRadius: 'var(--radius-md)' }}
                  >
                    {user ? 'Buy Now — Instant Access' : 'Sign In to Purchase'}
                  </button>
                  {user && (
                    <button
                      className="btn btn-full"
                      onClick={handleAddToCart}
                      disabled={inCart || adding}
                      style={{
                        background: inCart ? 'var(--green-soft)' : 'var(--bg)',
                        color: inCart ? '#1a7a32' : 'var(--ink-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px',
                        fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 500,
                        cursor: inCart ? 'default' : 'pointer',
                        transition: 'var(--trans)',
                      }}
                    >
                      {adding ? 'Adding…' : inCart ? '✓ In Cart' : 'Add to Cart'}
                    </button>
                  )}
                  {!user && (
                    <button
                      className="btn btn-secondary btn-full"
                      onClick={() => router.push('/signup')}
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      Create Free Account
                    </button>
                  )}
                </div>
              )}

              <hr className="divider" style={{ margin: '20px 0' }}/>

              {/* Trust items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['⚡', 'Instant delivery after purchase'],
                  ['♾️', 'Lifetime access included'],
                  ['🔒', 'Secure, encrypted checkout'],
                  ['↩', '7-day money-back guarantee'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.875rem', flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--ink-4)', fontWeight: 500 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .product-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
