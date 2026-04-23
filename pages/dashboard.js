import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAllOrders, getProducts, getExpenses, addExpense } from '../lib/firebase'
import { useAuth, useToast } from '../components/Layout'

/* ── Mini Bar Chart ─────────────────────────── */
const BarChart = ({ data, color = 'var(--blue)' }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            title={`${d.label}: $${d.value}`}
            style={{
              width: '100%', borderRadius: '4px 4px 0 0',
              height: `${Math.max((d.value / max) * 72, 3)}px`,
              background: i === data.length - 1
                ? color
                : `${color}55`,
              transition: 'height 0.4s var(--ease)',
              cursor: 'default',
            }}
          />
          <span style={{ fontSize: '0.5625rem', color: 'var(--ink-5)', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Stat Card ──────────────────────────────── */
const StatCard = ({ label, value, sub, accent, icon, delta }) => (
  <div style={{
    background: 'var(--white)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '22px 20px',
    transition: 'var(--trans)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '0.01em' }}>{label}</span>
      {icon && <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{icon}</span>}
    </div>
    <div style={{
      fontFamily: 'var(--font-ui)', fontSize: '1.75rem',
      fontWeight: 700, letterSpacing: '-0.04em',
      color: accent || 'var(--ink)', lineHeight: 1, marginBottom: 6,
    }}>{value}</div>
    {(sub || delta != null) && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {delta != null && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600,
            color: delta >= 0 ? '#1a7a32' : 'var(--red)',
            background: delta >= 0 ? 'var(--green-soft)' : 'var(--red-soft)',
            padding: '2px 6px', borderRadius: 4,
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
        {sub && <span style={{ fontSize: '0.75rem', color: 'var(--ink-4)' }}>{sub}</span>}
      </div>
    )}
  </div>
)

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [expForm, setExpForm] = useState({ title: '', amount: '', category: '', date: '' })
  const [addingExp, setAddingExp] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!user.is_admin) { router.push('/'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [o, p, e] = await Promise.all([getAllOrders(), getProducts(), getExpenses()])
    setOrders(o.data || [])
    setProducts(p.data || [])
    setExpenses(e.data || [])
    setLoading(false)
  }

  const paidOrders = orders.filter(o => o.status === 'paid')
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Build monthly data for chart (last 6 months)
  const monthlyRevenue = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const rev = paidOrders
        .filter(o => {
          const od = new Date(o.created_at)
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
        })
        .reduce((s, o) => s + o.total, 0)
      return { label: months[d.getMonth()], value: rev }
    })
  })()

  const handleAddExpense = async (e) => {
    e.preventDefault()
    setAddingExp(true)
    const { error } = await addExpense({
      title: expForm.title,
      amount: parseFloat(expForm.amount),
      category: expForm.category,
      date: expForm.date || new Date().toISOString().split('T')[0],
    })
    setAddingExp(false)
    if (error) { showToast('Failed to add expense.', 'error'); return }
    showToast('Expense recorded.', 'success')
    setExpForm({ title: '', amount: '', category: '', date: '' })
    loadData()
  }

  if (!user || !user.is_admin) return null

  if (loading) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner" style={{ width: 28, height: 28 }}/>
    </div>
  )

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'products', label: 'Products' },
    { key: 'expenses', label: 'Expenses' },
  ]

  const inputStyle = {
    width: '100%', background: 'var(--bg-input)',
    border: '1.5px solid transparent', borderRadius: 'var(--radius-md)',
    color: 'var(--ink)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem',
    padding: '10px 13px', outline: 'none', transition: 'var(--trans)',
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', background: 'var(--bg)', padding: '40px 0 80px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Admin</div>
            <h1>Dashboard</h1>
          </div>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M11.5 6.5A5 5 0 116.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M9 1.5h2.5V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', gap: 3,
          background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)',
          padding: 4, marginBottom: 28,
        }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? 'var(--white)' : 'transparent',
              border: 'none',
              color: tab === t.key ? 'var(--ink)' : 'var(--ink-4)',
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: tab === t.key ? 600 : 500,
              padding: '7px 16px', borderRadius: 10,
              cursor: 'pointer', transition: 'var(--trans)',
              boxShadow: tab === t.key ? 'var(--shadow-xs)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div>
            <div className="grid-4" style={{ marginBottom: 24 }}>
              <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} sub={`${paidOrders.length} paid orders`} icon="💰" delta={12} />
              <StatCard label="Expenses" value={`$${totalExpenses.toFixed(0)}`} accent="var(--red)" icon="📉" sub={`${expenses.length} entries`} />
              <StatCard label="Net Profit" value={`$${netProfit.toFixed(0)}`} accent={netProfit >= 0 ? 'var(--green)' : 'var(--red)'} icon="📈" delta={netProfit >= 0 ? 8 : -3} />
              <StatCard label="Orders" value={orders.length} sub={`${paidOrders.length} completed`} icon="🛒" />
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '24px 24px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginBottom: 2, fontWeight: 500 }}>Revenue</div>
                    <div style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
                      ${totalRevenue.toFixed(0)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, color: '#1a7a32',
                    background: 'var(--green-soft)', padding: '3px 8px', borderRadius: 4,
                  }}>↑ 12% this month</span>
                </div>
                <BarChart data={monthlyRevenue} color="var(--blue)" />
              </div>

              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)', padding: '24px 24px 16px',
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-4)', marginBottom: 2, fontWeight: 500 }}>Top Products</div>
                  <div style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{products.length} total</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...products].sort((a, b) => (b.total_sales || 0) - (a.total_sales || 0)).slice(0, 4).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--ink-4)', flexShrink: 0 }}>{p.total_sales || 0} sales</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)', flexShrink: 0 }}>${p.price}</div>
                    </div>
                  ))}
                  {products.length === 0 && <div style={{ fontSize: '0.875rem', color: 'var(--ink-5)' }}>No products yet</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>All Orders</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-4)', fontWeight: 500 }}>{orders.length} total</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-4)' }}>No orders yet</td></tr>
                  ) : orders.slice().reverse().map(order => (
                    <tr key={order.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--ink-3)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 5 }}>
                          #{(order.id || '').slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td><span style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>${order.total?.toFixed(2)}</span></td>
                      <td><span style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>{order.items?.length || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}</span></td>
                      <td><span className={`status status-${order.status}`}>{order.status}</span></td>
                      <td style={{ color: 'var(--ink-4)', fontSize: '0.875rem' }}>
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Products</h3>
              <span style={{ fontSize: '0.8125rem', color: 'var(--ink-4)', fontWeight: 500 }}>{products.length} products</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-4)' }}>No products yet</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                      <td><span style={{ fontSize: '0.8125rem', color: 'var(--ink-3)' }}>{p.categories?.name || '—'}</span></td>
                      <td><span style={{ fontWeight: 600 }}>${p.price}</span></td>
                      <td><span style={{ color: 'var(--ink-3)' }}>{p.total_sales || 0}</span></td>
                      <td><span style={{ fontWeight: 600, color: 'var(--green)' }}>${((p.total_sales || 0) * p.price).toFixed(0)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EXPENSES ── */}
        {tab === 'expenses' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
            {/* Table */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Expenses</h3>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--red)' }}>-${totalExpenses.toFixed(2)}</span>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--ink-4)' }}>No expenses recorded</td></tr>
                  ) : expenses.slice().reverse().map(exp => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 500 }}>{exp.title}</td>
                      <td><span style={{ fontSize: '0.8125rem', color: 'var(--ink-3)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{exp.category || '—'}</span></td>
                      <td><span style={{ fontWeight: 600, color: 'var(--red)' }}>-${exp.amount}</span></td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--ink-4)' }}>{exp.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Expense Form */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 20 }}>Record Expense</h3>
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'title', label: 'Title', type: 'text', ph: 'e.g. Hosting fee' },
                  { key: 'amount', label: 'Amount ($)', type: 'number', ph: '0.00' },
                  { key: 'category', label: 'Category', type: 'text', ph: 'e.g. Infrastructure' },
                  { key: 'date', label: 'Date', type: 'date', ph: '' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 }}>{f.label}</label>
                    <input
                      type={f.type} placeholder={f.ph}
                      value={expForm[f.key]}
                      onChange={e => setExpForm({ ...expForm, [f.key]: e.target.value })}
                      required={['title','amount'].includes(f.key)}
                      style={inputStyle}
                      onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' }}
                      onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                ))}
                <button
                  type="submit" className="btn btn-primary btn-full"
                  disabled={addingExp}
                  style={{ marginTop: 4, borderRadius: 'var(--radius-md)' }}
                >
                  {addingExp ? 'Saving…' : '+ Record Expense'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
