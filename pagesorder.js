import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getUserOrders } from '../lib/supabase'
import { useAuth, useToast } from '../components/Layout'

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/orders'); return }
    getUserOrders(user.id).then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [user])

  if (!user) return null

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
    </div>
  )

  if (orders.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 20, opacity: 0.4 }}>◇</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 12 }}>No Orders Yet</h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ash)', fontStyle: 'italic', marginBottom: 32 }}>
          Your purchase history will appear here.
        </p>
        <button className="btn btn-gold" onClick={() => router.push('/store')}>Shop Now</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">
        <div className="section-label">◆ Account</div>
        <h1 className="section-title" style={{ marginBottom: 8 }}>My Orders</h1>
        <p style={{
          fontFamily: 'var(--font-body)', color: 'var(--ash)',
          fontStyle: 'italic', marginBottom: 40,
        }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} — all purchases available for instant download.
        </p>

        {orders.map(order => (
          <div key={order.id} className="card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                  color: 'var(--smoke)', letterSpacing: '0.15em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: 'var(--ash)',
                }}>
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span className={`status status-${order.status}`}>{order.status}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--gold-shine)',
                }}>
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            <hr className="divider" style={{ margin: '0 0 20px' }}/>

            {order.order_items?.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid var(--border-dim)',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ color: 'var(--gold-dim)', fontSize: '0.6rem' }}>◆</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>
                    {item.product_name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ash)',
                  }}>${item.price}</span>
                  {order.status === 'paid' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => showToast('Download starting...', 'success')}
                    >
                      ↓ Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
