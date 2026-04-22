import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import { auth, getProfile, logOut } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

export const CartContext = createContext({})
export const useCart = () => useContext(CartContext)

export const ToastContext = createContext({})
export const useToast = () => useContext(ToastContext)

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`toast ${type}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span>{type === 'success' ? '◆' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ash)', cursor: 'pointer', fontSize: '1rem' }}>×</button>
    </div>
  )
}

const Navbar = ({ user, cart }) => {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/store', label: 'Store' },
    ...(user ? [{ href: '/orders', label: 'Orders' }] : []),
    ...(user?.is_admin ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--nav-height)',
      background: scrolled ? 'rgba(3,3,3,0.97)' : 'rgba(3,3,3,0.85)',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      backdropFilter: 'blur(20px)',
      transition: 'all 0.3s',
    }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="url(#g)" strokeWidth="1.5"/>
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="url(#g2)" opacity="0.6"/>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b0000"/><stop offset="100%" stopColor="#d4af37"/>
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7a0000" stopOpacity="0.5"/><stop offset="100%" stopColor="#b8960c" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.3em', color: 'var(--gold-shine)', lineHeight: 1 }}>VAULT</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--smoke)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>digital mart</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }} className="hide-sm">
          {links.map(l => (
            <span key={l.href} onClick={() => router.push(l.href)} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: router.pathname === l.href ? 'var(--gold-mid)' : 'var(--ash)',
              cursor: 'pointer', transition: 'color 0.2s',
              borderBottom: router.pathname === l.href ? '1px solid var(--gold-dim)' : '1px solid transparent',
              paddingBottom: 2,
            }}>{l.label}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div onClick={() => router.push('/cart')} style={{ position: 'relative', cursor: 'pointer', padding: '8px 10px', border: '1px solid var(--border-dim)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--crimson)', color: 'white', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontFamily: 'var(--font-mono)' }}>{cartCount}</span>
            )}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div onClick={() => router.push('/profile')} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blood), var(--gold-dim))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--cream)', cursor: 'pointer' }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span onClick={() => logOut().then(() => router.push('/'))} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--smoke)', cursor: 'pointer', letterSpacing: '0.1em' }} className="hide-sm">EXIT</span>
            </div>
          ) : (
            <button className="btn btn-gold btn-sm" onClick={() => router.push('/login')}>Sign In</button>
          )}
        </div>
      </div>
    </nav>
  )
}

const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border-dim)', padding: '48px 0 32px', marginTop: 80 }}>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', letterSpacing: '0.3em', color: 'var(--gold-shine)' }}>VAULT</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--smoke)', fontStyle: 'italic', marginTop: 4 }}>Premium Digital Marketplace</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--smoke)', letterSpacing: '0.15em' }}>
          © {new Date().getFullYear()} VAULT. All rights reserved.
        </div>
      </div>
      <hr className="divider" style={{ marginTop: 32 }}/>
      <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--fog)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Built different. Priced right. Delivered instantly.
      </p>
    </div>
  </footer>
)

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
    const saved = localStorage.getItem('vault_cart')
    if (saved) setCart(JSON.parse(saved))
    return () => unsub()
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      const updated = exists ? prev.map(i => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i) : [...prev, { ...product, qty: 1 }]
      localStorage.setItem('vault_cart', JSON.stringify(updated))
      return updated
    })
    showToast(`${product.name} added to cart`, 'success')
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id)
      localStorage.setItem('vault_cart', JSON.stringify(updated))
      return updated
    })
  }

  const clearCart = () => { setCart([]); localStorage.removeItem('vault_cart') }
  const showToast = (message, type = 'info') => setToast({ message, type })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 16px' }}/>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--smoke)', letterSpacing: '0.2em' }}>LOADING VAULT...</div>
      </div>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
        <ToastContext.Provider value={{ showToast }}>
          <div style={{ minHeight: '100vh' }}>
            <Navbar user={user} cart={cart} />
            <main style={{ paddingTop: 'var(--nav-height)' }}>{children}</main>
            <Footer />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
          </div>
        </ToastContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  )
}
