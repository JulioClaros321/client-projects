'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralSource, setReferralSource] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    
    const cleanedFirstName = firstName.trim()
    const cleanedLastName = lastName.trim()
    const cleanedPhone = phone.trim()
    const cleanedEmail = email.trim().toLowerCase()
    const cleanedReferralSource = referralSource.trim()

    const { data, error } = await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        data: {
          first_name: cleanedFirstName,
          last_name: cleanedLastName,
          phone: cleanedPhone,
          email: cleanedEmail,
          referral_source: cleanedReferralSource,
          validated: false,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: cleanedFirstName,
        last_name: cleanedLastName,
        phone: cleanedPhone,
        email: cleanedEmail,
        referral_source: cleanedReferralSource,
        validated: false,
      })

      if (profileError) {
        setMessage(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    setShowConfirmationScreen(true)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const cleanedEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setMessage('User not found.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('validated')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      setMessage(profileError.message)
      setLoading(false)
      return
    }

    if (!profile?.validated) {
      await supabase.auth.signOut()
      router.push('/pending-approval')
      return
    }

    setLoading(false)
    router.push('/dashboard')
    router.refresh()
  }

  async function handleResendConfirmation() {
    if (!email) {
      setMessage('Enter your email first, then resend confirmation.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Confirmation email resent. Please check your inbox.')
    }

    setLoading(false)
  }

  return (
    <main className="auth-page-wrapper">
      <header className="top-bar auth-top-bar">
        <nav className="top-right-nav">
          <Link href="/" className="nav-btn">
            Home
          </Link>

          <Link href="/about" className="nav-btn">
            About Us
          </Link>

          <Link href="/auth" className="nav-btn">
            Login / Register
          </Link>
        </nav>

        <details className="mobile-menu">
          <summary>☰</summary>

          <div className="mobile-menu-panel">
            <Link href="/" className="mobile-menu-link">
              Home
            </Link>

            <Link href="/about" className="mobile-menu-link">
              About Us
            </Link>

            <Link href="/auth" className="mobile-menu-link">
              Login / Register
            </Link>
          </div>
        </details>
      </header>

      <section className="auth-layout">
        <div className="auth-brand-panel">
          <p className="auth-kicker">Matchmaking with intention</p>

          <h1>Find something real.</h1>

          <p className="auth-subtext">
            A softer, more intentional way to meet people looking for connection,
            chemistry, and something worth celebrating.
          </p>
        </div>

        <div className="auth-card">
          {showConfirmationScreen ? (
            <>
              <p className="auth-kicker">Almost there</p>

              <h1>Check your email</h1>

              <p className="auth-subtext">
                We sent a confirmation link to <strong>{email}</strong>.
              </p>

              <button
                type="button"
                className="submit-btn"
                onClick={() => {
                  setMode('login')
                  setShowConfirmationScreen(false)
                }}
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <p className="auth-kicker">
                {mode === 'login' ? 'Welcome back' : 'Start your story'}
              </p>

              <h1>{mode === 'login' ? 'Login' : 'Create Account'}</h1>

              <div className="auth-switch">
                <button
                  type="button"
                  className={mode === 'login' ? 'primary-btn' : 'secondary-btn'}
                  onClick={() => {
                    setMode('login')
                    setMessage('')
                  }}
                >
                  Login
                </button>

                <button
                  type="button"
                  className={mode === 'register' ? 'primary-btn' : 'secondary-btn'}
                  onClick={() => {
                    setMode('register')
                    setMessage('')
                  }}
                >
                  Register
                </button>
              </div>

              <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                {mode === 'register' && (
                  <>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={50}
                      autoComplete="given-name"
                    />

                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      maxLength={50}
                      autoComplete="family-name"
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      maxLength={25}
                      autoComplete="tel"
                    />
                  </>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="email"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete={
                    mode === 'login'
                      ? 'current-password'
                      : 'new-password'
                  }
                />

                {mode === 'register' && (
                  <input
                    type="text"
                    placeholder="Referral Source"
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    required
                    maxLength={100}
                  />
                )}

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading
                    ? 'Loading...'
                    : mode === 'login'
                      ? 'Login'
                      : 'Create Account'}
                </button>
              </form>

              {mode === 'login' && (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendConfirmation}
                  disabled={loading}
                >
                  Resend confirmation email
                </button>
              )}

              {message && <p className="message">{message}</p>}
            </>
          )}
        </div>
      </section>
    </main>
  )
}