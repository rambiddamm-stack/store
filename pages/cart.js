// ─── pages/cart.js ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth, useCart, useToast } from '../components/Layout'
import { createOrder } from '../lib/firebase'

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { cart, removeFromCart, clearCart } = useCart()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0)

  const handleCheckout = async () => {
    if (!user) { router.push('/login?redirect=/cart'); return }
    setLoading(true)
    const { error } = await createOrder(user.id || user.uid, cart, total)
    if (error) {
      showToast('Checkout failed. Please try again.', 'error')
      setLoading(false)
      return
    }
    clearCart()
    showToast('Order placed! Instant access granted.', 'success')
    router.push('/orders')
  }

  if (cart.length === 0) return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-h))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 24, background: 'var(--bg)',
    }}>
      <div>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 36,
        }}>🛍</div>
        <h2 style={{ marginBottom: 8, fontSize: '1.5rem' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--ink-4)', marginBottom: 28, fontSize: '1.0625rem' }}>
          Browse the store to find something great.
        </p>
        <button className="btn btn-primary-dark btn-lg" onClick={() => router.push('/store')}>
          Browse Products →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', background: 'var(--bg)', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 880 }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Checkout</div>
          <h1>Your Cart</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cart.map(item => {
              const coverColors = {
                Automation: 'linear-gradient(145deg,#e8f0fe,#d0e3ff)',
                'AI Tools':  'linear-gradient(145deg,#f3e8ff,#e5d0ff)',
                Business:   'linear-gradient(145deg,#fff0e0,#ffe0b8)',
                Analytics:  'linear-gradient(145deg,#e0fae8,#c8f0d8)',
                Templates:  'linear-gradient(145deg,#fce8e8,#ffd5d5)',
              }
              const coverBg = coverColors[item.categories?.name] || 'linear-gradient(145deg,#f0f0f2,#e5e5e7)'

              return (
                <div key={item.id} style={{
                  background: 'var(--white)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)', padding: '18px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'var(--trans)',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                    background: coverBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    {item.icon || item.name[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', marginBottom: 3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--ink-4)' }}>
                      Digital Product · Instant Access
                    </div>
                  </div>

                  {/* Price + remove */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 6 }}>
                      ${item.price}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none', border: 'none',
                        fontSize: '0.8125rem', color: 'var(--ink-5)',
                        cursor: 'pointer', transition: 'var(--trans)',
                        fontFamily: 'var(--font-ui)', fontWeight: 500,
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--red)'}
                      onMouseLeave={e => e.target.style.color = 'var(--ink-5)'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 24,
            position: 'sticky', top: 'calc(var(--nav-h) + 20px)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Order Summary
            </h3>

            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.875rem', marginBottom: 10,
                color: 'var(--ink-3)',
              }}>
                <span style={{ flex: 1, marginRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>${item.price}</span>
              </div>
            ))}

            <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--ink-3)' }}>Delivery</span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1875rem', fontWeight: 700, letterSpacing: '-0.02em', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {!user && (
              <div style={{
                marginTop: 16, padding: '10px 13px',
                background: 'rgba(0,113,227,0.06)', border: '1px solid var(--blue-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem', color: 'var(--ink-3)',
                display: 'flex', gap: 7, alignItems: 'flex-start',
              }}>
                <span>🔒</span>
                <span>Sign in to complete your purchase.</span>
              </div>
            )}

            <button
              className="btn btn-primary-dark btn-full btn-lg"
              onClick={handleCheckout}
              disabled={loading}
              style={{ marginTop: 16, borderRadius: 'var(--radius-md)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}/>
                  Processing…
                </span>
              ) : user
                ? `Pay $${total.toFixed(2)} — Instant Access`
                : 'Sign In to Checkout'
              }
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
              {['🔒 Secure', '⚡ Instant', '♾️ Lifetime'].map(t => (
                <span key={t} style={{ fontSize: '0.6875rem', color: 'var(--ink-5)', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
