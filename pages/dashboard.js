import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAllOrders, getProducts, getExpenses, addExpense } from '../lib/firebase'
import { useAuth, useToast } from '../components/Layout'

const StatCard = ({ label, value, sub, accent }) => (
  <div className="stat-card">
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ash)', marginBottom: 12 }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: accent || 'var(--gold-shine)', letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--smoke)', marginTop: 8, letterSpacing: '0.1em' }}>{sub}</div>}
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

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (!user.is_admin) { router.push('/'); return }
    loadData()
  }, [user])

  const loadData = async () => {
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

  const handleAddExpense = async (e) => {
    e.preventDefault()
    const { error } = await addExpense({ title: expForm.title, amount: parseFloat(expForm.amount), category: expForm.category, date: expForm.date || new Date().toISOString().split('T')[0] })
    if (error) { showToast('Failed', 'error'); return }
    showToast('Expense added', 'success')
    setExpForm({ title: '', amount: '', category: '', date: '' })
    loadData()
  }

  if (!user || !user.is_admin) return null
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: 32, height: 32 }}/>
    </div>
  )

  const TABS = ['overview', 'orders', 'products', 'expenses']

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">
        <div className="section-label">◆ Admin</div>
        <h1 className="section-title" style={{ marginBottom: 40 }}>Dashboard</h1>

        <div style={{ display: 'flex', gap: 0, marginBottom: 40, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent', color: tab === t ? 'var(--gold-mid)' : 'var(--ash)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '12px 24px', cursor: 'pointer', marginBottom: -1 }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div className="grid-4" style={{ marginBottom: 40 }}>
              <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(0)}`} sub={`${paidOrders.length} paid orders`} />
              <StatCard label="Total Expenses" value={`$${totalExpenses.toFixed(0)}`} accent="var(--crimson)" />
              <StatCard label="Net Profit" value={`$${netProfit.toFixed(0)}`} accent={netProfit >= 0 ? '#66cc66' : 'var(--ember)'} />
              <StatCard label="Total Orders" value={orders.length} sub={`${paidOrders.length} completed`} />
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td style={{ color: 'var(--gold-dim)' }}>{order.id?.slice(0, 8).toUpperCase()}</td>
                    <td style={{ color: 'var(--gold-shine)', fontFamily: 'var(--font-display)' }}>${order.total?.toFixed(2)}</td>
                    <td><span className={`status status-${order.status}`}>{order.status}</span></td>
                    <td style={{ color: 'var(--smoke)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'products' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Product</th><th>Price</th><th>Sales</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td style={{ color: 'var(--gold-shine)' }}>${p.price}</td>
                    <td>{p.total_sales || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'expenses' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
            <table className="table">
              <thead><tr><th>Title</th><th>Amount</th><th>Date</th></tr></thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.title}</td>
                    <td style={{ color: 'var(--ember)' }}>-${exp.amount}</td>
                    <td style={{ color: 'var(--smoke)' }}>{exp.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}>Add Expense</h3>
              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="inp-wrap"><label className="inp-label">Title</label><input className="inp" value={expForm.title} onChange={e => setExpForm({...expForm, title: e.target.value})} required/></div>
                <div className="inp-wrap"><label className="inp-label">Amount</label><input className="inp" type="number" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} required/></div>
                <div className="inp-wrap"><label className="inp-label">Category</label><input className="inp" value={expForm.category} onChange={e => setExpForm({...expForm, category: e.target.value})}/></div>
                <button type="submit" className="btn btn-danger btn-full">+ Add</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
