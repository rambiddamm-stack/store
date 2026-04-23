import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { auth, getProfile, logOut } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export const CartContext = createContext({})
export const useCart = () => useContext(CartContext)

export const ToastContext = createContext({})
export const useToast = () => useContext(ToastContext)

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3800)
    return () => clearTimeout(t)
  }, [])

  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  return (
    <div className={`toast ${type}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
      }}>{icons[type] || icons.info}</span>
      <span style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.45 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)',
        cursor: 'pointer', fontSize: '1rem', padding: '0 2px',
        lineHeight: 1, flexShrink: 0
      }}>×</button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
const Navbar = ({ user, cart }) => {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Store' },
    ...(user ? [{ href: '/orders', label: 'My Orders' }] : []),
    ...(user?.is_admin ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  const isActive = (href) => router.pathname === href

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-h)',
      background: scrolled ? 'rgba(245,245,247,0.92)' : 'rgba(245,245,247,0.72)',
      backdropFilter: 'saturate(180%) blur(24px)',
      WebkitBackdropFilter: 'saturate(180%) blur(24px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.1)' : 'transparent'}`,
      transition: 'all 0.28s var(--ease)',
    }}>
      <div className="container" style={{
        height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 1080,
      }}>
        {/* Logo */}
        <div
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9"/>
              <path d="M7 4.5L10 6.25V9.75L7 11.5L4 9.75V6.25L7 4.5Z" fill="#1d1d1f"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.9375rem',
            fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em',
          }}>Vault</span>
        </div>

        {/* Nav Links */}
        <div className="hide-sm" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {links.map(l => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              style={{
                background: isActive(l.href) ? 'rgba(0,0,0,0.06)' : 'transparent',
                border: 'none',
                color: isActive(l.href) ? 'var(--ink)' : 'var(--ink-3)',
                fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 500,
                padding: '5px 12px', borderRadius: 'var(--radius-full)',
                cursor: 'pointer', transition: 'var(--trans)',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (!isActive(l.href)) e.target.style.background = 'rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { if (!isActive(l.href)) e.target.style.background = 'transparent' }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Cart */}
          <button
            onClick={() => router.push('/cart')}
            style={{
              position: 'relative', background: 'none', border: 'none',
              padding: '6px 8px', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', transition: 'var(--trans)',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                background: 'var(--blue)', color: '#fff',
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.625rem', fontWeight: 700,
                border: '1.5px solid var(--bg)',
              }}>{cartCount}</span>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: '0.8125rem',
                  fontWeight: 600, color: '#fff',
                  transition: 'var(--trans)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--white)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)', padding: '6px',
                  minWidth: 180, boxShadow: 'var(--shadow-xl)',
                  animation: 'fadeIn 0.18s ease',
                }}>
                  <div style={{
                    padding: '10px 12px 10px',
                    borderBottom: '1px solid var(--border)',
                    marginBottom: 4,
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 1 }}>
                      {user.name || 'Account'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>
                      {user.email}
                    </div>
                  </div>
                  {[
                    { label: 'My Orders', href: '/orders' },
                    ...(user.is_admin ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
                  ].map(item => (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); setProfileOpen(false) }}
                      style={{
                        width: '100%', background: 'none', border: 'none',
                        textAlign: 'left', padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
                        color: 'var(--ink-2)', cursor: 'pointer',
                        transition: 'var(--trans)',
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      {item.label}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                    <button
                      onClick={() => { logOut().then(() => router.push('/')); setProfileOpen(false) }}
                      style={{
                        width: '100%', background: 'none', border: 'none',
                        textAlign: 'left', padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-ui)', fontSize: '0.875rem',
                        color: 'var(--red)', cursor: 'pointer', transition: 'var(--trans)',
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--red-soft)'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-primary-dark btn-sm"
              onClick={() => router.push('/login')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => {
  const router = useRouter()

  const cols = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', href: '/store' },
        { label: 'Automation', href: '/store' },
        { label: 'AI Tools', href: '/store' },
        { label: 'Templates', href: '/store' },
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In', href: '/login' },
        { label: 'Create Account', href: '/signup' },
        { label: 'My Orders', href: '/orders' },
        { label: 'Downloads', href: '/orders' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/' },
        { label: 'Refund Policy', href: '/' },
        { label: 'Privacy Policy', href: '/' },
        { label: 'Terms of Use', href: '/' },
      ]
    }
  ]

  return (
    <footer style={{
      background: 'var(--ink)',
      padding: '64px 0 32px',
      marginTop: 0,
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
          gap: 48, marginBottom: 52,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }} onClick={() => router.push('/')}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.85"/>
                  <path d="M7 4.5L10 6.25V9.75L7 11.5L4 9.75V6.25L7 4.5Z" fill="rgba(0,0,0,0.4)"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>Vault</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, maxWidth: 240 }}>
              Premium digital products marketplace. Instant delivery, lifetime access.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
              {['⚡ Instant', '🔒 Secure', '♾️ Lifetime'].map(t => (
                <span key={t} style={{
                  fontSize: '0.6875rem', color: 'rgba(255,255,255,0.35)',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'var(--radius-full)', padding: '4px 10px',
                  fontWeight: 500,
                }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{
                fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                marginBottom: 18,
              }}>{col.title}</div>
              {col.links.map(l => (
                <div
                  key={l.label}
                  onClick={() => router.push(l.href)}
                  style={{
                    fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)',
                    marginBottom: 12, cursor: 'pointer',
                    transition: 'var(--trans)',
                  }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >
                  {l.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.28)' }}>
            © {new Date().getFullYear()} Vault Digital Store
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.28)' }}>
            Crafted with precision
          </span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   LAYOUT
───────────────────────────────────────────── */
export default function Layout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { data: profile } = await getProfile(firebaseUser.uid)
        setUser({ ...firebaseUser, ...profile })
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    try {
      const saved = localStorage.getItem('vault_cart')
      if (saved) setCart(JSON.parse(saved))
    } catch {}
    return () => unsub()
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      const updated = exists
        ? prev.map(i => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i)
        : [...prev, { ...product, qty: 1 }]
      try { localStorage.setItem('vault_cart', JSON.stringify(updated)) } catch {}
      return updated
    })
    showToast(`${product.name} added to cart`, 'success')
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id)
      try { localStorage.setItem('vault_cart', JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const clearCart = () => {
    setCart([])
    try { localStorage.removeItem('vault_cart') } catch {}
  }

  const showToast = (message, type = 'info') => setToast({ message, type })

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <div className="spinner" style={{ margin: '0 auto' }}/>
      </div>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
        <ToastContext.Provider value={{ showToast }}>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} cart={cart} />
            <main style={{ paddingTop: 'var(--nav-h)', flex: 1 }}>{children}</main>
            <Footer />
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
          </div>
        </ToastContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}
