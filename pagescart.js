import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth, useCart, useToast } from '../components/Layout'
import { createOrder } from '../lib/supabase'

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
    const { data, error } = await createOrder(user.id, cart, total)
    if (error) {
      showToast('Checkout failed. Try again.', 'error')
      setLoading(false)
      return
    }
    clearCart()
    showToast('Order placed! Instant access granted.', 'success')
    router.push('/orders')
  }

  if (cart.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 20, opacity: 0.4 }}>◇</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 12, letterSpacing: '0.06em' }}>
          Your Cart is Empty
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ash)', fontStyle: 'italic', marginBottom: 32 }}>
          Nothing in the vault yet. Go find something worth buying.
        </p>
        <button className="btn btn-gold" onClick={() => router.push('/store')}>
          Browse the Store
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="section-label">◆ Checkout</div>
        <h1 className="section-title" style={{ marginBottom: 40 }}>Your Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
          {/* Items */}
          <div>
            {cart.map(item => (
              <div key={item.id} className="card" style={{ padding: 24, marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--blood), var(--gold-dim))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)',
                }}>
                  {item.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {item.name}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--smoke)', letterSpacing: '0.1em' }}>
                    Digital Product • Instant Delivery
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-shine)', marginBottom: 8 }}>
                    ${item.price}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: 'none', border: 'none',
                      fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                      color: 'var(--smoke)', cursor: 'pointer', letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 32, position: 'sticky', top: 88 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.1em', marginBottom: 24 }}>
              Order Summary
            </h3>

            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--ash)', marginBottom: 10,
              }}>
                <span>{item.name}</span>
                <span>${item.price}</span>
              </div>
            ))}

            <hr className="divider-gold" style={{ margin: '20px 0' }}/>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-display)', fontSize: '1.4rem',
              color: 'var(--gold-shine)', marginBottom: 28,
            }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {!user && (
              <div style={{
                padding: '12px 14px', marginBottom: 16,
                border: '1px solid var(--gold-dim)',
                background: 'rgba(184,150,12,0.05)',
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: 'var(--gold)', letterSpacing: '0.08em', lineHeight: 1.7,
              }}>
                🔒 Sign in to complete purchase
              </div>
            )}

            <button
              className="btn btn-gold btn-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }}/> Processing...</>
                : user ? `Pay $${total.toFixed(2)} — Instant Access` : 'Sign In to Checkout'
              }
            </button>

            <div style={{
              marginTop: 20,
              fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
              color: 'var(--smoke)', textAlign: 'center', letterSpacing: '0.1em',
              lineHeight: 1.8,
            }}>
              🔒 Secure • ⚡ Instant • ♾️ Lifetime Access
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
