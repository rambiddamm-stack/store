// ─── pages/login.js ───────────────────────────────────────────────────────────
import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from '../lib/firebase'
import { useToast } from '../components/Layout'

export default function LoginPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(form.email, form.password)
    if (error) {
      const msg = error.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : error.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : 'Something went wrong. Try again.'
      setError(msg)
      setLoading(false)
      return
    }
    showToast('Welcome back!', 'success')
    router.push(router.query.redirect || '/store')
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1.5px solid transparent',
    borderRadius: 'var(--radius-md)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-ui)',
    fontSize: '1rem',
    padding: '12px 14px',
    outline: 'none',
    transition: 'var(--trans)',
    WebkitAppearance: 'none',
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-h))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'var(--bg)',
    }}>
      {/* Subtle bg pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,113,227,0.06) 0%, transparent 70%)',
      }}/>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            onClick={() => router.push('/')}
            style={{
              width: 48, height: 48, borderRadius: 13,
              background: 'var(--ink)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', marginBottom: 14,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.92"/>
              <path d="M7 4.5L10 6.25V9.75L7 11.5L4 9.75V6.25L7 4.5Z" fill="rgba(0,0,0,0.35)"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Sign in to Vault
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--ink-4)', marginTop: 6 }}>
            Access your purchases and downloads
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: '32px 32px 28px',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: 'var(--ink-2)', marginBottom: 7,
              }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' }}
                onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: 'var(--ink-2)', marginBottom: 7,
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' }}
                  onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-4)', fontSize: '0.8125rem', fontWeight: 500,
                  }}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--red-soft)', border: '1px solid rgba(255,59,48,0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '0.875rem', color: 'var(--red)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary-dark btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 4, borderRadius: 'var(--radius-md)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}/>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--ink-4)' }}>
              No account?{' '}
              <span
                onClick={() => router.push('/signup')}
                style={{ color: 'var(--blue)', fontWeight: 500, cursor: 'pointer' }}
              >
                Create one free →
              </span>
            </span>
          </div>
        </div>

        {/* Trust */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
          {['🔒 Secure', '⚡ Instant access', '♾️ Lifetime'].map(t => (
            <span key={t} style={{ fontSize: '0.75rem', color: 'var(--ink-5)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
