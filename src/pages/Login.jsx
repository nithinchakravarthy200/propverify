import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [mode, setMode] = useState('password') // 'password' | 'otp'
  const [step, setStep] = useState('form')     // 'form' | 'otp'
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // ── PASSWORD MODE ─────────────────────────────────────────
  const handlePassword = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    setLoading(true)
    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) setError(error.message)
      else {
        setMessage('Account created! Check your email to confirm, then sign in below.')
        setIsSignup(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) setError(error.message)
      else navigate('/')
    }
    setLoading(false)
  }

  // ── OTP MODE ──────────────────────────────────────────────
  const [countdown, setCountdown] = useState(0)

  const sendOtp = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true }
    })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      setMessage('Code sent — check your inbox and spam folder.')
      setCountdown(60)
      const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0 } return c - 1 }), 1000)
    }
    setLoading(false)
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email'
    })
    if (error) setError(error.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-logo-dot"></span>PropVerify
        </div>
        <h1 className="login-tagline">
          Find your home with <em>verified data,</em> not brochures.
        </h1>
        <div className="login-features">
          {['RERA-linked listings','Builder Trust Index','Legal Score on every property','Zero spam — consent-first'].map(f => (
            <div key={f} className="login-feature"><span>✓</span>{f}</div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-card">

          {/* SUCCESS MESSAGE */}
          {message && <div className="login-success">✅ {message}</div>}

          {/* ── PASSWORD MODE ── */}
          {mode === 'password' && (
            <form onSubmit={handlePassword} className="login-form">
              <div className="login-card-header">
                <h2>{isSignup ? 'Create Account' : 'Sign In'}</h2>
                <p>{isSignup ? 'Sign up with email and password' : 'Sign in to your account'}</p>
              </div>
              <div className="email-input-wrap">
                <span className="email-icon">✉️</span>
                <input
                  className="email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              <div className="email-input-wrap">
                <span className="email-icon">🔒</span>
                <input
                  className="email-input"
                  type="password"
                  placeholder={isSignup ? 'Create a password (min 6 chars)' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              {error && <div className="login-error">⚠️ {error}</div>}
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner"></span> : isSignup ? 'Create Account' : 'Sign In'}
              </button>
              <div className="login-toggle-mode">
                {isSignup ? (
                  <>Already have an account? <button type="button" className="toggle-link" onClick={() => { setIsSignup(false); setError(''); setMessage('') }}>Sign In</button></>
                ) : (
                  <>New here? <button type="button" className="toggle-link" onClick={() => { setIsSignup(true); setError(''); setMessage('') }}>Create Account</button></>
                )}
              </div>
            </form>
          )}

          {/* ── OTP MODE ── */}
          {mode === 'otp' && step === 'form' && (
            <form onSubmit={sendOtp} className="login-form">
              <div className="login-card-header">
                <h2>Sign In with OTP</h2>
                <p>We'll email you a 6-digit code. No password needed.</p>
              </div>
              <div className="email-input-wrap">
                <span className="email-icon">✉️</span>
                <input
                  className="email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required autoFocus
                />
              </div>
              {error && <div className="login-error">⚠️ {error}</div>}
              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Send OTP'}
              </button>
              <div className="login-consent">
                Check spam if you don't see the email within 1 minute.
              </div>
            </form>
          )}

          {mode === 'otp' && step === 'otp' && (
            <form onSubmit={verifyOtp} className="login-form">
              <div className="login-card-header">
                <h2>Enter the Code</h2>
                <p>Sent to <strong>{email}</strong></p>
              </div>
              <div className="otp-sent-msg">
                <button type="button" className="change-num" onClick={() => { setStep('form'); setOtp('') }}>← Change email</button>
              </div>
              <input
                className="otp-input"
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required autoFocus
              />
              {error && <div className="login-error">⚠️ {error}</div>}
              <button className="login-btn" type="submit" disabled={loading || otp.length < 6}>
                {loading ? <span className="spinner"></span> : 'Verify & Sign In'}
              </button>
              <div className="resend-row">
                {countdown > 0
                  ? <span>Resend in {countdown}s</span>
                  : <button type="button" className="resend-btn" onClick={sendOtp}>Resend Code</button>}
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
