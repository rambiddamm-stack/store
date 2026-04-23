// ─── pages/orders.js ───────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getUserOrders } from '../lib/firebase'
import { useAuth } from '../components/Layout'

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login?redirect=/orders'); return }
    getUserOrders(user.id || user.uid).then(({ data }) => {
      setOrders((data || []).slice().reverse())
      setLoading(false)
    })
  }, [user])

  if (!user) return null

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 28, height: 28 }}/>
    </div>
  )

  if (orders.length === 0) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, background: 'var(--bg)' }}>
      <div>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>📦</div>
        <h2 style={{ marginBottom: 8 }}>No orders yet</h2>
        <p style={{ color: 'var(--ink-4)', marginBottom: 28, fontSize: '1.0625rem' }}>Your purchases will show up here.</p>
        <button className="btn btn-primary-dark btn-lg" onClick={() => router.push('/store')}>Browse Products →</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', background: 'var(--bg)', padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Account</div>
          <h1 style={{ marginBottom: 6 }}>My Orders</h1>
          <p style={{ color: 'var(--ink-4)', fontSize: '1.0625rem' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} — all purchases instantly accessible.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(order => (
            <div key={order.id} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              transition: 'var(--trans)',
            }}>
              {/* Order header */}
              <div style={{
                padding: '16px 22px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 10,
                background: 'var(--bg)',
              }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ink-5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2, fontWeight: 600 }}>Order</div>
                    <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--ink-3)' }}>
                      #{order.id?.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ink-5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2, fontWeight: 600 }}>Date</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className={`status status-${order.status}`}>{order.status}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                    ${order.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '8px 0' }}>
                {(order.items || order.order_items || []).map((item, i) => (
                  <div key={item.id || i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 22px',
                    borderBottom: i < (order.items || order.order_items || []).length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9,
                        background: 'linear-gradient(145deg,#e8f0fe,#d0e3ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {item.icon || '📦'}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                        {item.name || item.product_name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                        ${item.price}
                      </span>
                      {order.status === 'paid' && (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: 'var(--blue-soft)', color: 'var(--blue)',
                            borderRadius: 'var(--radius-full)',
                          }}
                          onClick={() => window.open(item.download_url || '#', '_blank')}
                        >
                          ↓ Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
