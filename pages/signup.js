import { useState } from 'react'
import { useRouter } from 'next/router'
import { signUp } from '../lib/firebase'
import { useToast } from '../components/Layout'

export default function SignupPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const passwordStrength = (p) => {
    if (!p) return { score: 0, label: '', color: '' }
    const has = { len: p.length >= 8, upper: /[A-Z]/.test(p), num: /[0-9]/.test(p), sym: /[^A-Za-z0-9]/.test(p) }
    const score = Object.values(has).filter(Boolean).length
    if (score <= 1) return { score, label: 'Weak', color: 'var(--red)' }
    if (score === 2) return { score, label: 'Fair', color: 'var(--orange)' }
    if (score === 3) return { score, label: 'Good', color: '#0071e3' }
    return { score, label: 'Strong', color: 'var(--green)' }
  }

  const strength = passwordStrength(form.password)

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords don\'t match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    const { error } = await signUp(form.email, form.password, form.name)
    if (error) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : 'Something went wrong. Please try again.'
      setError(msg); setLoading(false); return
    }
    setDone(true)
    showToast('Account created!', 'success')
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg-input)',
    border: '1.5px solid transparent', borderRadius: 'var(--radius-md)',
    color: 'var(--ink)', fontFamily: 'var(--font-ui)',
    fontSize: '1rem', padding: '12px 14px',
    outline: 'none', transition: 'var(--trans)', WebkitAppearance: 'none',
  }

  if (done) return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-h))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--green-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 32,
        }}>✉️</div>
        <h2 style={{ marginBottom: 10, fontSize: '1.75rem' }}>Check your email</h2>
        <p style={{ color: 'var(--ink-4)', lineHeight: 1.65, marginBottom: 28, fontSize: '1.0625rem' }}>
          We sent a confirmation link to{' '}
          <strong style={{ color: 'var(--ink)' }}>{form.email}</strong>.
          Confirm it and you're in.
        </p>
        <button className="btn btn-primary-dark btn-lg" onClick={() => router.push('/login')}>
          Go to Sign In →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--nav-h))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg)',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,113,227,0.06) 0%, transparent 70%)',
      }}/>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div onClick={() => router.push('/')} style={{
            width: 48, height: 48, borderRadius: 13, background: 'var(--ink)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', marginBottom: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}>
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.92"/>
              <path d="M7 4.5L10 6.25V9.75L7 11.5L4 9.75V6.25L7 4.5Z" fill="rgba(0,0,0,0.35)"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Create your account
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--ink-4)', marginTop: 6 }}>
            Free to join — pay only for what you buy.
          </div>
        </div>

        <div style={{
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)', padding: '32px 32px 28px',
          boxShadow: 'var(--shadow-xl)',
        }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {[
              { key: 'name', label: 'Full Name', type: 'text', ph: 'Your name' },
              { key: 'email', label: 'Email', type: 'email', ph: 'you@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: 7 }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.ph} value={form[f.key]} required
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' }}
                  onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            ))}

            {/* Password with strength meter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' }}
                  onBlur={e => { e.target.style.background = 'var(--bg-input)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: '0.8125rem', fontWeight: 500 }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'var(--border-med)',
                        transition: 'background 0.2s',
                      }}/>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink-2)', marginBottom: 7 }}>Confirm Password</label>
              <input
                type="password" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                required style={{
                  ...inputStyle,
                  borderColor: form.confirm && form.confirm !== form.password ? 'var(--red)' : 'transparent',
                }}
                onFocus={e => { e.target.style.background = '#fff'; if (!form.confirm || form.confirm === form.password) { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-soft)' } }}
                onBlur={e => { e.target.style.background = 'var(--bg-input)'; if (!form.confirm || form.confirm !== form.password) { e.target.style.boxShadow = 'none' } }}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-soft)', border: '1px solid rgba(255,59,48,0.2)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                fontSize: '0.875rem', color: 'var(--red)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit" className="btn btn-primary-dark btn-full btn-lg"
              disabled={loading} style={{ marginTop: 6, borderRadius: 'var(--radius-md)' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}/>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--ink-4)' }}>
              Already a member?{' '}
              <span onClick={() => router.push('/login')} style={{ color: 'var(--blue)', fontWeight: 500, cursor: 'pointer' }}>
                Sign in →
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
