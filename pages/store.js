import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getProducts } from '../lib/firebase'
import { useAuth, useCart } from '../components/Layout'

const CATEGORIES = ['All', 'Automation', 'AI Tools', 'Business', 'Analytics', 'Templates']

const BADGE_STYLE = {
  BESTSELLER: { bg: 'rgba(255,159,10,0.12)', color: '#8a5200', label: 'Bestseller' },
  HOT:        { bg: 'rgba(255,59,48,0.09)',  color: '#c0392b', label: 'Hot'        },
  PREMIUM:    { bg: 'rgba(191,90,242,0.1)',  color: '#7b2fbe', label: 'Premium'    },
  NEW:        { bg: 'rgba(52,199,89,0.1)',   color: '#1a7a32', label: 'New'        },
  ELITE:      { bg: 'rgba(0,113,227,0.09)',  color: '#004a9e', label: 'Elite'      },
}

const StarRating = ({ rating, count }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12">
          <polygon
            points="6,1 7.5,4.5 11,4.8 8.5,7 9.3,10.5 6,8.8 2.7,10.5 3.5,7 1,4.8 4.5,4.5"
            fill={i <= Math.round(rating) ? '#ff9f0a' : '#e5e5e7'}
          />
        </svg>
      ))}
    </div>
    <span style={{ fontSize: '0.75rem', color: 'var(--ink-4)', fontWeight: 500 }}>
      {rating} {count ? `(${count.toLocaleString()})` : ''}
    </span>
  </div>
)

const ProductCard = ({ product, onAdd }) => {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const badge = product.badge ? BADGE_STYLE[product.badge] : null
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  const coverColors = {
    Automation: { bg: 'linear-gradient(145deg,#e8f0fe,#d0e3ff)', emoji: '⚡' },
    'AI Tools':  { bg: 'linear-gradient(145deg,#f3e8ff,#e5d0ff)', emoji: '🧠' },
    Business:   { bg: 'linear-gradient(145deg,#fff0e0,#ffe0b8)', emoji: '📈' },
    Analytics:  { bg: 'linear-gradient(145deg,#e0fae8,#c8f0d8)', emoji: '📊' },
    Templates:  { bg: 'linear-gradient(145deg,#fce8e8,#ffd5d5)', emoji: '🎨' },
  }
  const cover = coverColors[product.categories?.name] || { bg: 'linear-gradient(145deg,#f0f0f2,#e5e5e7)', emoji: '📦' }

  const handleAdd = async (e) => {
    e.stopPropagation()
    setAdding(true)
    await new Promise(r => setTimeout(r, 380))
    onAdd(product)
    setAdding(false)
  }

  return (
    <div
      className="card card-hover"
      onClick={() => router.push(`/product/${product.slug}`)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Cover */}
      <div style={{
        height: 168, background: cover.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        overflow: 'hidden',
      }}>
        <span style={{
          fontSize: 52,
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.1))',
          transition: 'transform 0.3s var(--ease-spring)',
          display: 'block',
        }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.1) rotate(-3deg)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1) rotate(0)'}
        >
          {product.icon || cover.emoji}
        </span>

        {badge && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: badge.bg, color: badge.color,
            fontSize: '0.6875rem', fontWeight: 600,
            padding: '3px 9px', borderRadius: 'var(--radius-full)',
          }}>{badge.label}</span>
        )}

        {discount && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--green-soft)', color: '#1a7a32',
            fontSize: '0.6875rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: 'var(--radius-full)',
          }}>{discount}% off</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.categories?.name && (
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.02em', marginBottom: 6 }}>
            {product.categories.name}
          </div>
        )}

        <h3 style={{
          fontFamily: 'var(--font-ui)', fontSize: '1.0625rem',
          fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em',
          marginBottom: 8, lineHeight: 1.3,
        }}>
          {product.name}
        </h3>

        <p style={{
          fontSize: '0.875rem', color: 'var(--ink-3)', lineHeight: 1.55,
          marginBottom: 14, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.description}
        </p>

        {/* Features */}
        {product.features?.slice(0, 2).map(f => (
          <div key={f} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: '0.8125rem', color: 'var(--ink-4)',
            marginBottom: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="var(--border-med)"/>
              <path d="M3.5 6l2 2 3-3" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {f}
          </div>
        ))}

        <hr className="divider" style={{ margin: '14px 0' }}/>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '1.3125rem', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                ${product.price}
              </span>
              {product.original_price && (
                <span style={{ fontSize: '0.875rem', color: 'var(--ink-5)', textDecoration: 'line-through' }}>
                  ${product.original_price}
                </span>
              )}
            </div>
            {product.rating && (
              <StarRating rating={product.rating} count={product.total_sales} />
            )}
          </div>

          <button
            className="btn btn-sm"
            onClick={handleAdd}
            style={{
              background: adding ? 'var(--green-soft)' : 'var(--blue-soft)',
              color: adding ? '#1a7a32' : 'var(--blue)',
              borderRadius: 'var(--radius-full)',
              minWidth: 72,
              transition: 'all 0.25s var(--ease-spring)',
            }}
          >
            {adding ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Added
              </span>
            ) : 'Add +'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StorePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(({ data }) => {
      setProducts(data || [])
      setFiltered(data || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = [...products]
    if (category !== 'All') result = result.filter(p => p.categories?.name === category)
    if (search) result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
    else if (sort === 'popular') result.sort((a, b) => b.total_sales - a.total_sales)
    else result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    setFiltered(result)
  }, [products, category, search, sort])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Page Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '40px 0 32px' }}>
        <div className="container">
          <div className="anim-fade-up">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Browse
            </div>
            <h1 style={{ marginBottom: 8 }}>The Store</h1>
            <p style={{ fontSize: '1.0625rem', color: 'var(--ink-3)', maxWidth: 480 }}>
              Premium digital tools. Instant delivery. Everything you need to move faster.
            </p>
          </div>

          {/* Guest notice */}
          {!user && (
            <div style={{
              marginTop: 20, padding: '12px 16px',
              background: 'rgba(0,113,227,0.05)',
              border: '1px solid var(--blue-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: 10,
              maxWidth: 520,
            }}>
              <span style={{ fontSize: '1rem' }}>🔒</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--ink-3)', flex: 1 }}>
                Browse freely — <span style={{ fontWeight: 600, color: 'var(--ink)' }}>sign in</span> to purchase and access downloads.
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => router.push('/login')}>
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px' }}>

        {/* Controls */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20,
          alignItems: 'center', flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--ink-5)" strokeWidth="1.4"/>
              <path d="M11 11l2.5 2.5" stroke="var(--ink-5)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              className="inp"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 36,
                borderRadius: 'var(--radius-full)',
                background: 'var(--white)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', color: 'var(--ink)',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
              padding: '10px 16px', outline: 'none', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="featured">Featured</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Top Rated</option>
            <option value="price-asc">Price: Low–High</option>
            <option value="price-desc">Price: High–Low</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                background: category === cat ? 'var(--ink)' : 'var(--white)',
                color: category === cat ? '#fff' : 'var(--ink-3)',
                border: `1px solid ${category === cat ? 'var(--ink)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 500,
                padding: '7px 16px', cursor: 'pointer',
                transition: 'var(--trans)',
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-4)', marginBottom: 22, fontWeight: 500 }}>
          {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 16px' }}/>
            <div style={{ fontSize: '0.875rem', color: 'var(--ink-4)' }}>Loading products…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8, fontWeight: 600 }}>Nothing found</h3>
            <p style={{ color: 'var(--ink-4)', fontSize: '0.9375rem' }}>
              Try a different search or category
            </p>
          </div>
        ) : (
          <div className="grid-products">
            {filtered.map((p, i) => (
              <div key={p.id} className={`anim-fade-up anim-d${Math.min(i + 1, 4)}`}>
                <ProductCard product={p} onAdd={addToCart} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
