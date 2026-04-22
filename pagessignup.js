import { useState } from 'react'
import { useRouter } from 'next/router'
import { signUp } from '../lib/supabase'
import { useToast } from '../components/Layout'

export default function SignupPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await signUp(form.email, form.password, form.name)
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    showToast('Account created! Check your email.', 'success')
  }

  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: 24,
    }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>✉️</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem',
          marginBottom: 12, letterSpacing: '0.05em',
        }}>Check Your Email</h2>
        <p style={{
          fontFamily: 'var(--font-body)', color: 'var(--ash)',
          fontStyle: 'italic', lineHeight: 1.8, marginBottom: 32,
        }}>
          We sent a confirmation link to <strong style={{ color: 'var(--gold-mid)' }}>{form.email}</strong>.
          Confirm your email then sign in.
        </p>
        <button className="btn btn-gold" onClick={() => router.push('/login')}>
          Go to Sign In
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(184,150,12,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(184,150,12,0.02) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }}/>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '2.5rem',
            letterSpacing: '0.3em',
          }} className="text-gold-shine">VAULT</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
            color: 'var(--smoke)', letterSpacing: '0.3em', marginTop: 4,
          }}>DIGITAL MART</div>
        </div>

        <div className="card" style={{ padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.08em', marginBottom: 8 }}>
              Create Account
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ash)', fontStyle: 'italic' }}>
              Free to join. Pay only for what you buy.
            </p>
          </div>

          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="inp-wrap">
              <label className="inp-label">Full Name</label>
              <input className="inp" type="text" placeholder="Your Name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required/>
            </div>
            <div className="inp-wrap">
              <label className="inp-label">Email</label>
              <input className="inp" type="email" placeholder="your@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required/>
            </div>
            <div className="inp-wrap">
              <label className="inp-label">Password</label>
              <input className="inp" type="password" placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required/>
            </div>
            <div className="inp-wrap">
              <label className="inp-label">Confirm Password</label>
              <input className="inp" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required/>
            </div>

            {error && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--ember)', padding: '10px 14px',
                border: '1px solid var(--blood)', background: 'rgba(122,0,0,0.1)',
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }}/> Creating...</> : 'Join the Vault'}
            </button>
          </form>

          <hr className="divider" style={{ margin: '28px 0' }}/>
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ash)', letterSpacing: '0.08em' }}>
            Already a member?{' '}
            <span onClick={() => router.push('/login')} style={{ color: 'var(--gold-mid)', cursor: 'pointer' }}>
              Sign in →
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
